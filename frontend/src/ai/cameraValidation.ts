import { LM, type LandmarkPoint } from "./landmarks";

export interface ValidationCheck {
  id: string;
  label: string;
  ok: boolean;
}

export interface ValidationReport {
  allOk: boolean;
  checks: ValidationCheck[];
}

/**
 * Camera Validation — Mục 4.7 v4.1:
 * Camera → Person detected? → Body visible? → Distance? → Full body? → START WORKOUT
 */
export function validateCameraFrame(lms: LandmarkPoint[] | null): ValidationReport {
  const checks: ValidationCheck[] = [];

  // 1) Person detected?
  const personOk = !!lms && lms.length === 33;
  checks.push({ id: "person", label: "Phát hiện người trong khung", ok: personOk });
  if (!personOk) return { allOk: false, checks };

  // 2) Body visible? — khớp then chốt phải có visibility ≥ 0.5 (cho phép tối đa 2 điểm kém)
  const key = [
    LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER,
    LM.LEFT_HIP, LM.RIGHT_HIP,
    LM.LEFT_KNEE, LM.RIGHT_KNEE,
    LM.LEFT_ANKLE, LM.RIGHT_ANKLE,
  ];
  const lowCount = key.filter((i) => (lms[i]?.visibility ?? 0) < 0.5).length;
  checks.push({ id: "body", label: "Cơ thể hiển thị đủ", ok: lowCount <= 2 });

  // 3) Distance? — độ rộng vai trong khung (tọa độ chuẩn hóa 0–1)
  const shoulderW = Math.abs(lms[LM.LEFT_SHOULDER].x - lms[LM.RIGHT_SHOULDER].x);
  checks.push({
    id: "distance",
    label: "Khoảng cách hợp lý (~2–2.5m)",
    ok: shoulderW >= 0.06 && shoulderW <= 0.45,
  });

  // 4) Full body? — đầu và chân nằm trong khung
  const headY = lms[LM.NOSE]?.y ?? 1;
  const feetY = Math.max(lms[LM.LEFT_FOOT]?.y ?? 1, lms[LM.RIGHT_FOOT]?.y ?? 1);
  checks.push({ id: "framing", label: "Toàn thân trong khung (đầu → chân)", ok: headY > 0.02 && feetY < 0.98 });

  return { allOk: checks.every((c) => c.ok), checks };
}