import type { ExerciseId } from "../ai/evaluators/types";

/**
 * Static display metadata for the 3 supported exercises (Proposal 1.2
 * Scope / 5.3). Shared by the Home cards (UI-03), the Exercise Guide
 * (UI-04) and anywhere else an exercise needs a friendly name.
 */
export interface ExerciseMeta {
  id: ExerciseId;
  name: string;
  jointSet: string;
  isHold: boolean;
  guideTips: string[];
  cameraTips: string[];
}

export const EXERCISE_META: Record<ExerciseId, ExerciseMeta> = {
  squat: {
    id: "squat",
    name: "Squat",
    jointSet: "Hip > Knee > Ankle",
    isHold: false,
    guideTips: [
      "Feet shoulder-width apart",
      "Keep the back neutral, chest up",
      "Knees track over the toes",
      "Lower until knee flexion is in the target depth range",
      "Push through the heels to stand",
    ],
    cameraTips: [
      "Side view, camera at hip height",
      "Whole body visible in the frame",
      "Good lighting, avoid loose clothing",
    ],
  },
  plank: {
    id: "plank",
    name: "Plank",
    jointSet: "Shoulder > Hip > Ankle",
    isHold: true,
    guideTips: [
      "Forearms and toes on the ground",
      "Shoulders stacked above the elbows",
      "Keep hips level with the shoulders - don't sag or pike",
      "Brace your core and breathe steadily",
      "Hold the position for the target time",
    ],
    cameraTips: [
      "Side view, camera at hip height",
      "Whole body visible in the frame",
      "Good lighting, avoid loose clothing",
    ],
  },
  pushup: {
    id: "pushup",
    name: "Push-up",
    jointSet: "Shoulder > Elbow > Wrist",
    isHold: false,
    guideTips: [
      "Hands slightly wider than shoulder-width",
      "Keep the body in a straight line from shoulders to ankles",
      "Lower until the elbow reaches about 90 degrees",
      "Keep elbows close to the body, avoid flaring out",
      "Push back up to full extension",
    ],
    cameraTips: [
      "Side view, camera at hip height",
      "Whole body visible in the frame",
      "Good lighting, avoid loose clothing",
    ],
  },
};

export const EXERCISE_IDS: ExerciseId[] = ["squat", "plank", "pushup"];
