import type { LandmarkPoint } from "../landmarks";

export function calculateAngle(a: LandmarkPoint, b: LandmarkPoint, c: LandmarkPoint): number {
  const v1x = a.x - b.x, v1y = a.y - b.y;
  const v2x = c.x - b.x, v2y = c.y - b.y;
  const dot = v1x * v2x + v1y * v2y;
  const mag = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y);
  if (mag === 0) return 0;
  const cos = Math.min(1, Math.max(-1, dot / mag));
  return (Math.acos(cos) * 180) / Math.PI;
}

export function averageVisibility(lms: LandmarkPoint[], indices: number[]): number {
  let sum = 0;
  for (const i of indices) sum += lms[i]?.visibility ?? 0;
  return sum / indices.length;
}
/** Góc CÓ DẤU giữa 2 vector (độ) — dùng cho Trunk–Tibia bias (Mục 4.1) */
export function signedAngleBetween(v1: { x: number; y: number }, v2: { x: number; y: number }): number {
  const dot = v1.x * v2.x + v1.y * v2.y;
  const cross = v1.x * v2.y - v1.y * v2.x;
  return (Math.atan2(cross, dot) * 180) / Math.PI;
}