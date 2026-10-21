import type { Point3D } from "./vector";

/**
 * Index map for the 33 landmarks returned by Google MediaPipe Pose
 * Landmarker (Proposal 3.1 / 3.4). Only the joints AIFit actually uses for
 * Squat, Plank and Push-up (Proposal 5.3-5.4) are named here; the rest stay
 * accessible by raw index if a future exercise needs them (NFR06).
 */
export const LANDMARK = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

export type LandmarkName = keyof typeof LANDMARK;

/** One raw landmark as returned by @mediapipe/tasks-vision (normalized 0..1). */
export interface RawLandmark extends Point3D {
  visibility?: number;
}

const MIN_VISIBILITY = 0.5;

/**
 * Picks the more visible side (left/right) for a bilateral joint pair -
 * AIFit analyzes a single person from the side (Proposal 5.7 "Camera &
 * Environment Constraint"), so one side is usually turned away from the
 * camera and reports low visibility.
 */
export function pickVisibleSide(
  landmarks: RawLandmark[],
  leftIndex: number,
  rightIndex: number,
): RawLandmark | null {
  const left = landmarks[leftIndex];
  const right = landmarks[rightIndex];
  const leftVis = left?.visibility ?? 0;
  const rightVis = right?.visibility ?? 0;
  if (leftVis < MIN_VISIBILITY && rightVis < MIN_VISIBILITY) return null;
  return leftVis >= rightVis ? left : right;
}

/** Convenience bundle of the side-picked joints every evaluator needs. */
export interface BodySide {
  shoulder: RawLandmark | null;
  elbow: RawLandmark | null;
  wrist: RawLandmark | null;
  hip: RawLandmark | null;
  knee: RawLandmark | null;
  ankle: RawLandmark | null;
}

export function resolveBodySide(landmarks: RawLandmark[]): BodySide {
  return {
    shoulder: pickVisibleSide(landmarks, LANDMARK.LEFT_SHOULDER, LANDMARK.RIGHT_SHOULDER),
    elbow: pickVisibleSide(landmarks, LANDMARK.LEFT_ELBOW, LANDMARK.RIGHT_ELBOW),
    wrist: pickVisibleSide(landmarks, LANDMARK.LEFT_WRIST, LANDMARK.RIGHT_WRIST),
    hip: pickVisibleSide(landmarks, LANDMARK.LEFT_HIP, LANDMARK.RIGHT_HIP),
    knee: pickVisibleSide(landmarks, LANDMARK.LEFT_KNEE, LANDMARK.RIGHT_KNEE),
    ankle: pickVisibleSide(landmarks, LANDMARK.LEFT_ANKLE, LANDMARK.RIGHT_ANKLE),
  };
}

/** True when every joint a given exercise needs was detected with confidence. */
export function hasRequiredJoints(side: BodySide, required: (keyof BodySide)[]): boolean {
  return required.every((key) => side[key] !== null);
}

/**
 * BodySide with every requested joint narrowed from `RawLandmark | null` to
 * `RawLandmark`. Evaluators cast to this (instead of `Required<BodySide>`,
 * which only strips `undefined`, not `null`) right after hasRequiredJoints()
 * confirms those joints are present.
 */
export type ResolvedBodySide = { [K in keyof BodySide]: RawLandmark };
