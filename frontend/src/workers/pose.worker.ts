/// <reference lib="webworker" />

// ════════════════════════════════════════════════════════════
// SHIM bắt buộc cho MODULE worker:
// MediaPipe gọi importScripts() để load WASM glue — bị cấm trong
// module worker. Thay bằng XHR đồng bộ (hợp lệ trong Worker) + eval.
// ════════════════════════════════════════════════════════════
(self as unknown as { importScripts: unknown }).importScripts = (...urls: string[]) => {
  for (const u of urls) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", u, false); // sync — CHỈ hợp lệ trong Worker
    xhr.send(null);
    if (xhr.status !== 200 && xhr.status !== 0) {
      throw new Error(`importScripts failed: ${u} (status ${xhr.status})`);
    }
    (0, eval)(xhr.responseText);
  }
};

import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

let landmarker: PoseLandmarker | null = null;
let lastVideoTime = -1;
let lastTs = 0; // ⭐ clamp timestamp tăng đơn điệu — fix "Packet timestamp mismatch"

interface InitMsg { type: "init"; wasmUrl: string; modelUrl: string; }
interface DetectMsg { type: "detect"; bitmap: ImageBitmap; timestamp: number; videoTime: number; }
type Incoming = InitMsg | DetectMsg;

async function createLandmarker(wasmUrl: string, modelUrl: string): Promise<PoseLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(wasmUrl);
  try {
    return await PoseLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: modelUrl, delegate: "GPU" },
      runningMode: "VIDEO",
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      outputSegmentationMasks: false,
    });
  } catch {
    return await PoseLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: modelUrl, delegate: "CPU" },
      runningMode: "VIDEO",
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      outputSegmentationMasks: false,
    });
  }
}

self.onmessage = async (e: MessageEvent<Incoming>) => {
  const msg = e.data;

  if (msg.type === "init") {
    try {
      landmarker = await createLandmarker(msg.wasmUrl, msg.modelUrl);
      lastVideoTime = -1;
      lastTs = 0;
      self.postMessage({ type: "ready" });
    } catch (err) {
      self.postMessage({ type: "error", message: String(err) });
    }
    return;
  }

  if (msg.type === "detect" && landmarker) {
    // Trùng frame cũ → bỏ
    if (msg.videoTime === lastVideoTime) {
      msg.bitmap.close();
      return;
    }
    lastVideoTime = msg.videoTime;

    // ⭐ FIX: đảm bảo timestamp LUÔN lớn hơn lần trước ≥ 1ms
    // (main thread có thể gửi lệch thứ tự do createImageBitmap async)
    const ts = Math.max(msg.timestamp, lastTs + 1);
    lastTs = ts;

    const result = landmarker.detectForVideo(msg.bitmap, ts);
    msg.bitmap.close(); // giải phóng bắt buộc

    const lms = result.landmarks?.[0] ?? null;
    
    self.postMessage({ type: "landmarks", payload: lms });
  }
};