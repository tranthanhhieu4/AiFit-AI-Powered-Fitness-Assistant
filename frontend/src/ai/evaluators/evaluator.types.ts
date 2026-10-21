import type { LandmarkPoint } from "../landmarks";

/** Mục 6.4: 1 = an toàn/chấn thương · 2 = kỹ thuật · 3 = thẩm mỹ */
export type Severity = 1 | 2 | 3;

export interface PostureError {
  errorType: string;
  severity: Severity;
  message: string;
}

export interface PostureResult {
  isCorrect: boolean;        // correct ⟺ KHÔNG có lỗi nào (Mục 4.4)
  errors: PostureError[];
  primaryAngle: number;
  secondaryAngle?: number;
}

/** Strategy Pattern — Mục 6.2 v4.1 */
export interface IPostureEvaluator {
  evaluate(landmarks: LandmarkPoint[]): PostureResult;
}