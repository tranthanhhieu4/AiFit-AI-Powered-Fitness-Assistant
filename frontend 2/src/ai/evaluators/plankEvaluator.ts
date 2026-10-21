import { jointAngleDegrees } from "../geometry/vector";
import { hasRequiredJoints, resolveBodySide, type RawLandmark, type ResolvedBodySide } from "../geometry/landmarks";
import { evaluateMetric, overallClassification } from "./ruleMatcher";
import type { ExerciseRule, FrameEvaluation } from "./types";

/**
 * Plank evaluator (Proposal 5.3): whole-body alignment via the
 * Shoulder -> Hip -> Ankle angle. Plank is a static hold, so AIFit reports
 * a single alignment metric every frame rather than counting repetitions
 * (see useWorkoutSession.ts, which swaps rep counting for a hold timer).
 */
export function evaluatePlank(landmarks: RawLandmark[], rules: ExerciseRule[]): FrameEvaluation {
  const side = resolveBodySide(landmarks);
  const required = ["shoulder", "hip", "ankle"] as const;

  if (!hasRequiredJoints(side, [...required])) {
    return { exercise: "plank", bodyDetected: false, metrics: [], overall: "unknown", tooltips: [] };
  }

  const { shoulder, hip, ankle } = side as ResolvedBodySide;
  const bodyAlignmentAngle = jointAngleDegrees(shoulder, hip, ankle);
  if (bodyAlignmentAngle === null) {
    return { exercise: "plank", bodyDetected: false, metrics: [], overall: "unknown", tooltips: [] };
  }

  const metrics = [evaluateMetric(rules, "bodyAlignmentAngle", bodyAlignmentAngle)];

  return {
    exercise: "plank",
    bodyDetected: true,
    metrics,
    overall: overallClassification(metrics),
    tooltips: [
      {
        joint: "hip",
        text: `Body alignment: ${Math.round(bodyAlignmentAngle)} deg`,
        flagged: metrics[0].classification === "error",
      },
    ],
  };
}
