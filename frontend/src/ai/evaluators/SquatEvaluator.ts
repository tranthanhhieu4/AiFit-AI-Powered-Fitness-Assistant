import { LM, type LandmarkPoint } from "../landmarks";
import { calculateAngle, signedAngleBetween } from "../geometry/angleCalculator";
import type { IPostureEvaluator, PostureError, PostureResult } from "./evaluator.types";

/**
 * v4.1 Mục 4.1: θ = Hip→Knee→Ankle (đứng ≈180°), flexion = 180 − θ.
 * Đủ depth khi flexion ≥ 90° (θ ≤ 90°). flexion > 135° → ExcessiveDepth.
 * ShallowDepth đánh giá ở REP-LEVEL trong RepCounter (counted vs correct).
 */
const EXCESSIVE_FLEXION = 135;

export class SquatEvaluator implements IPostureEvaluator {
  evaluate(lms: LandmarkPoint[]): PostureResult {
    const errors: PostureError[] = [];

    const kneeJoint = calculateAngle(lms[LM.LEFT_HIP], lms[LM.LEFT_KNEE], lms[LM.LEFT_ANKLE]);
    const flexion = 180 - kneeJoint;

    if (flexion > EXCESSIVE_FLEXION) {
      errors.push({ errorType: "ExcessiveDepth", severity: 2, message: "Very deep squat — monitor your load" });
    }

    const trunk = { x: lms[LM.LEFT_HIP].x - lms[LM.LEFT_SHOULDER].x, y: lms[LM.LEFT_HIP].y - lms[LM.LEFT_SHOULDER].y };
    const tibia = { x: lms[LM.LEFT_ANKLE].x - lms[LM.LEFT_KNEE].x, y: lms[LM.LEFT_ANKLE].y - lms[LM.LEFT_KNEE].y };

    return { isCorrect: errors.length === 0, errors, primaryAngle: kneeJoint, secondaryAngle: signedAngleBetween(trunk, tibia) };
  }
}