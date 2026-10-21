/// <reference lib="webworker" />
import { evaluateFrame } from "../ai/evaluators/evaluate";
import type { ExerciseId, ExerciseRule, FrameEvaluation } from "../ai/evaluators/types";
import type { RawLandmark } from "../ai/geometry/landmarks";

/**
 * Runs the vector-angle math and rule matching off the main thread so the
 * camera render loop and the Canvas skeleton overlay stay smooth (Proposal
 * NFR01 "20-30 FPS, response latency under 200ms"; Architecture Design
 * quality scenario "Performance A"). MediaPipe itself still runs on the main
 * thread (it owns the <video>/<canvas> elements), but this worker is where
 * CPU-bound evaluateFrame() work happens so it never blocks a paint.
 */

export interface PostureWorkerRequest {
  requestId: number;
  exercise: ExerciseId;
  landmarks: RawLandmark[];
  rules: ExerciseRule[];
}

export interface PostureWorkerResponse {
  requestId: number;
  evaluation: FrameEvaluation;
}

self.onmessage = (event: MessageEvent<PostureWorkerRequest>) => {
  const { requestId, exercise, landmarks, rules } = event.data;
  const evaluation = evaluateFrame(exercise, landmarks, rules);
  const response: PostureWorkerResponse = { requestId, evaluation };
  (self as unknown as Worker).postMessage(response);
};
