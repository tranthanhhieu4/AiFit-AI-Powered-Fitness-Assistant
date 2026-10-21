export interface ExerciseInfo {
  id: string;
  name: string;
  jointSet: string;
  description: string;
  instructions: string[];
  cameraGuidance: string;
  videoUrl: string;
  imageUrl: string;
}

export const EXERCISES: ExerciseInfo[] = [
  {
    id: "squat",
    name: "Squat",
    jointSet: "Hip › Knee › Ankle",
    description: "Trunk-lumbo angle and depth.",
    instructions: [
      "Feet shoulder-width apart",
      "Keep the back neutral, chest up",
      "Lower until knee flexion is in the target range",
      "Push through the heels to stand",
    ],
    cameraGuidance: "Side view, camera at hip height, ~2m away, whole body visible.",
    videoUrl: "/videos/squat.mp4",
    imageUrl: "/images/squat.jpg",
  },
  {
    id: "plank",
    name: "Plank",
    jointSet: "Shoulder › Hip › Ankle",
    description: "Whole-body alignment.",
    instructions: [
      "Forearms under shoulders",
      "Straight line shoulder → hip → ankle",
      "No sagging or piking hips",
      "Breathe evenly, hold 20–60s",
    ],
    cameraGuidance: "Side view at hip height, whole body in frame.",
    videoUrl: "/videos/plank.mp4",
    imageUrl: "/images/plank.jpg",
  },
  {
    id: "pushup",
    name: "Push-up",
    jointSet: "Shoulder › Elbow › Wrist",
    description: "Elbow ROM, flare, alignment.",
    instructions: [
      "Hands slightly wider than shoulders",
      "Lower until elbows ≤ 90°",
      "Elbows back at 45°, not flared",
      "Push up straight, body rigid",
    ],
    cameraGuidance: "Low side view at ~30–60° to see elbow flare.",
    videoUrl: "/videos/pushup.mp4",
    imageUrl: "/images/pushup.jpg",
  },
];