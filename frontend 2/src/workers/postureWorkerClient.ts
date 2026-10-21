import type { ExerciseId, ExerciseRule, FrameEvaluation } from "../ai/evaluators/types";
import type { RawLandmark } from "../ai/geometry/landmarks";
import type { PostureWorkerRequest, PostureWorkerResponse } from "./postureWorker";

/**
 * Promise-based wrapper around postureWorker.ts. Only ever keeps the latest
 * in-flight request's resolver - if a new frame arrives before the worker
 * replies to the previous one, the previous promise is simply left
 * unresolved and garbage collected (older frames are not useful once a
 * newer one exists; see usePoseLandmarker.ts's render loop).
 */
export class PostureWorkerClient {
  private readonly worker: Worker;
  private nextRequestId = 0;
  private pending = new Map<number, (evaluation: FrameEvaluation) => void>();

  constructor() {
    this.worker = new Worker(new URL("./postureWorker.ts", import.meta.url), { type: "module" });
    this.worker.onmessage = (event: MessageEvent<PostureWorkerResponse>) => {
      const resolve = this.pending.get(event.data.requestId);
      if (resolve) {
        resolve(event.data.evaluation);
        this.pending.delete(event.data.requestId);
      }
    };
  }

  evaluate(exercise: ExerciseId, landmarks: RawLandmark[], rules: ExerciseRule[]): Promise<FrameEvaluation> {
    const requestId = this.nextRequestId++;
    const message: PostureWorkerRequest = { requestId, exercise, landmarks, rules };
    return new Promise((resolve) => {
      this.pending.set(requestId, resolve);
      this.worker.postMessage(message);
    });
  }

  terminate(): void {
    this.worker.terminate();
    this.pending.clear();
  }
}
