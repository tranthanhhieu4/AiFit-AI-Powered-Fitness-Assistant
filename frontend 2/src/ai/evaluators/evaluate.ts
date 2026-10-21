import type { RawLandmark } from "../geometry/landmarks";
import { evaluateSquat } from "./squatEvaluator";
import { evaluatePlank } from "./plankEvaluator";
import { evaluatePushup } from "./pushupEvaluator";
import type { ExerciseId, ExerciseRule, FrameEvaluation } from "./types";

/**
 * Single entry point the rest of the app calls - picks the right evaluator
 * for the active exercise. Adding a 4th exercise later (Proposal/Architecture
 * ATAM "Modifiability" scenario) means adding one new evaluator file plus one
 * case here, without touching vector.ts, ruleMatcher.ts or the hooks.
 */
export function evaluateFrame(
  exercise: ExerciseId,
  landmarks: RawLandmark[],
  rules: ExerciseRule[],
): FrameEvaluation {
  switch (exercise) {
    case "squat":
      return evaluateSquat(landmarks, rules);
    case "plank":
      return evaluatePlank(landmarks, rules);
    case "pushup":
      return evaluatePushup(landmarks, rules);
    default:
      return { exercise, bodyDetected: false, metrics: [], overall: "unknown", tooltips: [] };
  }
}
