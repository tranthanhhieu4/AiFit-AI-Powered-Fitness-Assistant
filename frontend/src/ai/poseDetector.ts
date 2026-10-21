import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

const WASM_PATH = "/mediapipe-wasm";
const MODEL_PATH = "/models/pose_landmarker_lite.task";

let instancePromise: Promise<PoseLandmarker> | null = null;

export function getPoseLandmarker(): Promise<PoseLandmarker> {
  instancePromise ??= createWithFallback();
  return instancePromise;
}

async function createWithFallback(): Promise<PoseLandmarker> {
  try {
    return await create("GPU");
  } catch (e) {
    console.warn("[PoseDetector] GPU delegate thất bại → fallback CPU:", e);
    return create("CPU");
  }
}

async function create(delegate: "GPU" | "CPU"): Promise<PoseLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
  return PoseLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_PATH, delegate },
    runningMode: "VIDEO",
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputSegmentationMasks: false,
  });
}
/** Web Worker factory — Mục 6.6: chạy MediaPipe ngoài main thread */
export function createPoseWorker(): Worker {
  const worker = new Worker(new URL("../workers/pose.worker.ts", import.meta.url), {
    type: "module",
  });
  return worker;
}

export const WORKER_WASM_URL = "/mediapipe-wasm";
export const WORKER_MODEL_URL = "/models/pose_landmarker_lite.task";