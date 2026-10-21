import { LM, type LandmarkPoint } from "../landmarks";
import { calculateAngle } from "../geometry/angleCalculator";
import type { IPostureEvaluator, PostureError, PostureResult } from "./evaluator.types";

/** v4.1 Mục 4.3: Flare > 90° → lỗi. Bodyline < 165° → SaggingBack. ROM ở RepCounter. */
const ALIGNMENT_MIN = 165;
const FLARE_MAX = 90;

export class PushupEvaluator implements IPostureEvaluator {
  evaluate(lms: LandmarkPoint[]): PostureResult {
    const errors: PostureError[] = [];

    const elbowAngle = calculateAngle(lms[LM.LEFT_SHOULDER], lms[LM.LEFT_ELBOW], lms[LM.LEFT_WRIST]);
    const bodyline = calculateAngle(lms[LM.LEFT_SHOULDER], lms[LM.LEFT_HIP], lms[LM.LEFT_ANKLE]);
    const flare = calculateAngle(lms[LM.LEFT_HIP], lms[LM.LEFT_SHOULDER], lms[LM.LEFT_ELBOW]);

    if (bodyline < ALIGNMENT_MIN) {
      errors.push({ errorType: "SaggingBack", severity: 1, message: "Keep your body straight" });
    }
    if (flare > FLARE_MAX) {
      errors.push({ errorType: "ElbowFlare", severity: 2, message: "Tuck your elbows" });
    }

    return { isCorrect: errors.length === 0, errors, primaryAngle: elbowAngle, secondaryAngle: bodyline };
  }
}