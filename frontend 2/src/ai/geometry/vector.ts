/**
 * Vector geometry module.
 *
 * Implements the dot-product joint-angle formula from the Project Proposal,
 * section 4.4 "Technical Proposed - Posture Analysis Engine":
 *
 *   theta = arccos( (BA . BC) / (|BA| |BC|) )
 *
 * For three consecutive joint points A, B (vertex joint) and C, this returns
 * the angle at B in degrees. This is the only place the formula is
 * implemented - every evaluator in ./evaluators reuses it so the geometry
 * stays correct in one spot (Architecture Design NFR06, Maintainability).
 */

export interface Point3D {
  x: number;
  y: number;
  z?: number;
}

/** Subtract two points: a - b. */
function subtract(a: Point3D, b: Point3D): Point3D {
  return { x: a.x - b.x, y: a.y - b.y, z: (a.z ?? 0) - (b.z ?? 0) };
}

function dot(a: Point3D, b: Point3D): number {
  return a.x * b.x + a.y * b.y + (a.z ?? 0) * (b.z ?? 0);
}

function magnitude(a: Point3D): number {
  return Math.sqrt(a.x * a.x + a.y * a.y + (a.z ?? 0) * (a.z ?? 0));
}

/**
 * Angle at vertex B, formed by rays B->A and B->C, in degrees.
 * Returns null if either ray has ~zero length (landmark not usable).
 */
export function jointAngleDegrees(a: Point3D, b: Point3D, c: Point3D): number | null {
  const ba = subtract(a, b);
  const bc = subtract(c, b);
  const magBA = magnitude(ba);
  const magBC = magnitude(bc);
  if (magBA < 1e-6 || magBC < 1e-6) return null;

  const cosTheta = dot(ba, bc) / (magBA * magBC);
  // Clamp for floating-point safety before arccos.
  const clamped = Math.min(1, Math.max(-1, cosTheta));
  return (Math.acos(clamped) * 180) / Math.PI;
}

/**
 * Signed angle of the segment B->A relative to vertical (the y axis),
 * in degrees. Used for things like the Squat trunk-tibia comparison, where
 * each segment's own tilt (not just the angle between them) matters.
 * Positive = leaning to the right of vertical in image space.
 */
export function tiltFromVerticalDegrees(a: Point3D, b: Point3D): number {
  const seg = subtract(a, b);
  // atan2(x, -y) so that "straight up" (negative y in image space) is 0 deg.
  return (Math.atan2(seg.x, -seg.y) * 180) / Math.PI;
}

/** Simple moving-average smoother to reduce per-frame landmark jitter. */
export class Smoother {
  private readonly windowSize: number;
  private readonly values: number[] = [];

  constructor(windowSize = 5) {
    this.windowSize = windowSize;
  }

  push(value: number | null): number | null {
    if (value === null) return this.values.length ? average(this.values) : null;
    this.values.push(value);
    if (this.values.length > this.windowSize) this.values.shift();
    return average(this.values);
  }

  reset(): void {
    this.values.length = 0;
  }
}

function average(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
