import type { LandmarkPoint } from "../landmarks";
import type { IPostureEvaluator, PostureResult } from "./evaluator.types";
import { SquatEvaluator } from "./SquatEvaluator";
import { PlankEvaluator } from "./PlankEvaluator";
import { PushupEvaluator } from "./PushupEvaluator";

/** Mục 6.2: thêm bài tập mới = thêm 1 class + 1 dòng đăng ký (Open/Closed) */
export class PostureAnalyzer {
  private evaluators = new Map<string, IPostureEvaluator>([
    ["squat", new SquatEvaluator()],
    ["plank", new PlankEvaluator()],
    ["pushup", new PushupEvaluator()],
  ]);

  evaluate(exerciseId: string, landmarks: LandmarkPoint[]): PostureResult {
    const evaluator = this.evaluators.get(exerciseId);
    if (!evaluator) throw new Error(`No evaluator for exercise: ${exerciseId}`);
    return evaluator.evaluate(landmarks);
  }
}