import { useCallback, useEffect, useRef, useState } from "react";
import { FilesetResolver, PoseLandmarker, type PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import type { RawLandmark } from "../ai/geometry/landmarks";

/**
 * Loads Google MediaPipe Pose Landmarker (Proposal 3.1/3.4) and exposes a
 * `detect(videoEl)` function that returns the 33 landmarks for the current
 * video frame. Runs entirely client-side via WebAssembly/WebGL - no frame is
 * ever sent to the backend (NFR02 Security / Privacy Constraint 5.6).
 */
export type PoseLandmarkerStatus = "loading" | "ready" | "error";

const WASM_BASE_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

export function usePoseLandmarker(modelUrl: string) {
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const [status, setStatus] = useState<PoseLandmarkerStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const files = await FilesetResolver.forVisionTasks(WASM_BASE_URL);
        const landmarker = await PoseLandmarker.createFromOptions(files, {
          baseOptions: { modelAssetPath: modelUrl, delegate: "GPU" },
          runningMode: "VIDEO",
          numPoses: 1, // Proposal 5.2 "Scope Constraint": single-person mode
        });
        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, [modelUrl]);

  const detect = useCallback((video: HTMLVideoElement, timestampMs: number): RawLandmark[] | null => {
    const landmarker = landmarkerRef.current;
    if (!landmarker) return null;
    const result: PoseLandmarkerResult = landmarker.detectForVideo(video, timestampMs);
    const landmarks = result.landmarks[0];
    return landmarks ? landmarks.map((l) => ({ x: l.x, y: l.y, z: l.z, visibility: l.visibility })) : null;
  }, []);

  return { status, detect };
}
