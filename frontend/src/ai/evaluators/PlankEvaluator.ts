import { LM, type LandmarkPoint } from "../landmarks";
import { calculateAngle } from "../geometry/angleCalculator";
import type { IPostureEvaluator, PostureError, PostureResult } from "./evaluator.types";

/**
 * v4.1 Mục 4.2: Bodyline Sh→Hip→Ankle 165–180° = Correct.
 * Sagging/Piking phân biệt bằng lệch hip khỏi đường nối shoulder–ankle:
 * > +0.04 Sagging · < −0.04 Piking.
 */
const ALIGNMENT_MIN = 165;
const DEVIATION_THRESHOLD = 0.04;

export class PlankEvaluator implements IPostureEvaluator {
  evaluate(lms: LandmarkPoint[]): PostureResult {
    const errors: PostureError[] = [];

    const bodyline = calculateAngle(lms[LM.LEFT_SHOULDER], lms[LM.LEFT_HIP], lms[LM.LEFT_ANKLE]);

    const spanX = lms[LM.LEFT_ANKLE].x - lms[LM.LEFT_SHOULDER].x;
    const ratio = spanX === 0 ? 0 : (lms[LM.LEFT_HIP].x - lms[LM.LEFT_SHOULDER].x) / spanX;
    const midlineY = lms[LM.LEFT_SHOULDER].y + ratio * (lms[LM.LEFT_ANKLE].y - lms[LM.LEFT_SHOULDER].y);
    const hipDeviation = lms[LM.LEFT_HIP].y - midlineY;

    if (bodyline < ALIGNMENT_MIN) {
      if (hipDeviation > DEVIATION_THRESHOLD) {
        errors.push({ errorType: "HipsSagging", severity: 1, message: "Hips sagging — lift your hips" });
      } else if (hipDeviation < -DEVIATION_THRESHOLD) {
        errors.push({ errorType: "HipsPiking", severity: 1, message: "Hips too high — lower your hips" });
      } else {
        errors.push({ errorType: "AlignmentError", severity: 1, message: "Straighten your body" });
      }
    }

    return { isCorrect: errors.length === 0, errors, primaryAngle: bodyline, secondaryAngle: hipDeviation };
  }
}