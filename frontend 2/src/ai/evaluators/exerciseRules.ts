import type { ExerciseRule } from "./types";

/**
 * Local fallback copy of the ExerciseRules seed data (Proposal 5.4). The app
 * should normally load rules from GET /api/exercise-rules (see
 * services/exerciseService.ts) so an Admin's edits in UI-13/UI-14 take
 * effect without a redeploy; this constant is only used:
 *   - on first paint, before the API response arrives, and
 *   - as an offline fallback if the request fails (NFR04 Reliability).
 */
export const DEFAULT_EXERCISE_RULES: ExerciseRule[] = [
  // --- Squat (Proposal 5.3 / 5.4) ---
  {
    id: "squat-trunk-tibia-hip-bias",
    exercise: "squat",
    jointSetPhase: "Hip>Knee>Ankle & Trunk-Tibia, at peak knee flexion",
    metric: "trunkTibiaAngle",
    min: 10,
    max: null,
    classification: "correct",
    label: "Hip-extensor bias (normal)",
    voiceMessage: null,
    reference: "3.1, 3.2",
  },
  {
    id: "squat-trunk-tibia-neutral",
    exercise: "squat",
    jointSetPhase: "Hip>Knee>Ankle & Trunk-Tibia, at peak knee flexion",
    metric: "trunkTibiaAngle",
    min: -10,
    max: 10,
    classification: "correct",
    label: "Neutral bias (normal)",
    voiceMessage: null,
    reference: "3.1, 3.2",
  },
  {
    id: "squat-trunk-tibia-knee-bias",
    exercise: "squat",
    jointSetPhase: "Hip>Knee>Ankle & Trunk-Tibia, at peak knee flexion",
    metric: "trunkTibiaAngle",
    min: null,
    max: -10,
    classification: "correct",
    label: "Knee-extensor bias (normal, coaching cue)",
    voiceMessage: null,
    reference: "3.1, 3.2",
  },
  {
    id: "squat-depth-shallow",
    exercise: "squat",
    jointSetPhase: "Hip>Knee>Ankle",
    metric: "kneeFlexionDepth",
    min: 0,
    max: 90,
    classification: "error",
    label: "Shallow depth",
    voiceMessage: "Insufficient squat depth - lower your hips",
    reference: "3.3",
  },
  {
    id: "squat-depth-medium",
    exercise: "squat",
    jointSetPhase: "Hip>Knee>Ankle",
    metric: "kneeFlexionDepth",
    min: 90,
    max: 110,
    classification: "correct",
    label: "Medium depth (target range)",
    voiceMessage: null,
    reference: "3.3",
  },
  {
    id: "squat-depth-full",
    exercise: "squat",
    jointSetPhase: "Hip>Knee>Ankle",
    metric: "kneeFlexionDepth",
    min: 110,
    max: 135,
    classification: "correct",
    label: "Full depth (monitor joint load)",
    voiceMessage: null,
    reference: "3.3",
  },

  // --- Plank (Proposal 5.3 / 5.4) ---
  {
    id: "plank-aligned",
    exercise: "plank",
    jointSetPhase: "Shoulder>Hip>Ankle",
    metric: "bodyAlignmentAngle",
    min: 165,
    max: 180,
    classification: "correct",
    label: "Correct / neutral",
    voiceMessage: null,
    reference: "3.4",
  },
  {
    id: "plank-sagging",
    exercise: "plank",
    jointSetPhase: "Shoulder>Hip>Ankle",
    metric: "bodyAlignmentAngle",
    min: null,
    max: 165,
    classification: "error",
    label: "Hips sagging",
    voiceMessage: "Lift your hips - keep your body in a straight line",
    reference: "3.4",
  },

  // --- Push-up (Proposal 5.3 / 5.4) ---
  {
    id: "pushup-rom",
    exercise: "pushup",
    jointSetPhase: "Shoulder>Elbow>Wrist",
    metric: "elbowFlexionAngle",
    min: null,
    max: 90,
    classification: "correct",
    label: "Valid repetition range (bottom)",
    voiceMessage: null,
    reference: "3.5",
  },
  {
    id: "pushup-elbow-flare",
    exercise: "pushup",
    jointSetPhase: "Torso>Shoulder>Elbow",
    metric: "elbowFlareAngle",
    min: 75,
    max: null,
    classification: "error",
    label: "Excessive elbow flare",
    voiceMessage: "Keep your elbows closer to your body",
    reference: "3.5",
  },
  {
    id: "pushup-alignment",
    exercise: "pushup",
    jointSetPhase: "Shoulder>Hip>Ankle",
    metric: "bodyAlignmentAngle",
    min: 165,
    max: 180,
    classification: "correct",
    label: "Correct / neutral",
    voiceMessage: null,
    reference: "3.4, 3.5",
  },
  {
    id: "pushup-alignment-error",
    exercise: "pushup",
    jointSetPhase: "Shoulder>Hip>Ankle",
    metric: "bodyAlignmentAngle",
    min: null,
    max: 165,
    classification: "error",
    label: "Hips sagging",
    voiceMessage: "Keep your back straight",
    reference: "3.4, 3.5",
  },
];

export function rulesForExercise(rules: ExerciseRule[], exercise: string): ExerciseRule[] {
  return rules.filter((r) => r.exercise === exercise);
}
