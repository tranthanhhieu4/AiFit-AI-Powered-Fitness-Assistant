import { jointAngleDegrees, tiltFromVerticalDegrees } from "../geometry/vector";
import { hasRequiredJoints, resolveBodySide, type RawLandmark, type ResolvedBodySide } from "../geometry/landmarks";
import { evaluateMetric, overallClassification } from "./ruleMatcher";
import type { ExerciseRule, FrameEvaluation } from "./types";

/**
 * Squat evaluator (Proposal 5.3): trunk-tibia angle (muscle bias) and
 * knee-flexion depth, both measured at peak knee flexion.
 */
export function evaluateSquat(landmarks: RawLandmark[], rules: ExerciseRule[]): FrameEvaluation {
  const side = resolveBodySide(landmarks);
  const required = ["shoulder", "hip", "knee", "ankle"] as const;

  if (!hasRequiredJoints(side, [...required])) {
    return { exercise: "squat", bodyDetected: false, metrics: [], overall: "unknown", tooltips: [] };
  }

  const { shoulder, hip, knee, ankle } = side as ResolvedBodySide;

  // Knee-flexion depth: angle at the knee (Hip -> Knee -> Ankle).
  const kneeAngle = jointAngleDegrees(hip, knee, ankle);
  // Depth is reported as flexion FROM full extension, i.e. 180 - raw angle,
  // so 0deg = standing and ~135deg = a deep squat (Proposal Table 5.4).
  const kneeFlexionDepth = kneeAngle === null ? null : 180 - kneeAngle;

  // Trunk-tibia bias: tilt of the trunk (shoulder->hip) minus tilt of the
  // tibia/shank (knee->ankle), both measured from vertical.
  const trunkTilt = tiltFromVerticalDegrees(shoulder, hip);
  const tibiaTilt = tiltFromVerticalDegrees(knee, ankle);
  const trunkTibiaAngle = trunkTilt - tibiaTilt;

  const metrics = [
    kneeFlexionDepth !== null ? evaluateMetric(rules, "kneeFlexionDepth", kneeFlexionDepth) : null,
    evaluateMetric(rules, "trunkTibiaAngle", trunkTibiaAngle),
  ].filter((m): m is NonNullable<typeof m> => m !== null);

  return {
    exercise: "squat",
    bodyDetected: true,
    metrics,
    overall: overallClassification(metrics),
    tooltips: [
      {
        joint: "knee",
        text: kneeFlexionDepth !== null ? `Knee flexion: ${Math.round(kneeFlexionDepth)} deg` : "Knee flexion: n/a",
        flagged: metrics.some((m) => m.metric === "kneeFlexionDepth" && m.classification === "error"),
      },
    ],
  };
}
