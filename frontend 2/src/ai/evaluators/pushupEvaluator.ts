import { jointAngleDegrees } from "../geometry/vector";
import { hasRequiredJoints, resolveBodySide, type RawLandmark, type ResolvedBodySide } from "../geometry/landmarks";
import { evaluateMetric, overallClassification } from "./ruleMatcher";
import type { ExerciseRule, FrameEvaluation } from "./types";

/**
 * Push-up evaluator (Proposal 5.3): dual joint-set analysis -
 *  (1) elbow flexion range of motion (Shoulder>Elbow>Wrist) and elbow flare
 *      (Torso>Shoulder>Elbow, approximated here as Hip>Shoulder>Elbow), and
 *  (2) whole-body alignment (Shoulder>Hip>Ankle), same metric as Plank.
 */
export function evaluatePushup(landmarks: RawLandmark[], rules: ExerciseRule[]): FrameEvaluation {
  const side = resolveBodySide(landmarks);
  const required = ["shoulder", "elbow", "wrist", "hip", "ankle"] as const;

  if (!hasRequiredJoints(side, [...required])) {
    return { exercise: "pushup", bodyDetected: false, metrics: [], overall: "unknown", tooltips: [] };
  }

  const { shoulder, elbow, wrist, hip, ankle } = side as ResolvedBodySide;

  const elbowFlexionAngle = jointAngleDegrees(shoulder, elbow, wrist);
  const elbowFlareAngle = jointAngleDegrees(hip, shoulder, elbow);
  const bodyAlignmentAngle = jointAngleDegrees(shoulder, hip, ankle);

  const metrics = [
    elbowFlexionAngle !== null ? evaluateMetric(rules, "elbowFlexionAngle", elbowFlexionAngle) : null,
    elbowFlareAngle !== null ? evaluateMetric(rules, "elbowFlareAngle", elbowFlareAngle) : null,
    bodyAlignmentAngle !== null ? evaluateMetric(rules, "bodyAlignmentAngle", bodyAlignmentAngle) : null,
  ].filter((m): m is NonNullable<typeof m> => m !== null);

  return {
    exercise: "pushup",
    bodyDetected: true,
    metrics,
    overall: overallClassification(metrics),
    tooltips: [
      {
        joint: "elbow",
        text: elbowFlexionAngle !== null ? `Elbow: ${Math.round(elbowFlexionAngle)} deg` : "Elbow: n/a",
        flagged: metrics.some((m) => m.metric === "elbowFlareAngle" && m.classification === "error"),
      },
    ],
  };
}
