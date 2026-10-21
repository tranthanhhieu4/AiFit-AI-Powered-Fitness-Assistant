import { describe, it, expect } from "vitest";
import { calculateAngle } from "./angleCalculator";
import type { LandmarkPoint } from "../landmarks";

const p = (x: number, y: number): LandmarkPoint => ({ x, y, z: 0, visibility: 1 });

describe("AngleCalculator — vector math", () => {
  it("3 điểm thẳng hàng → 180°", () => {
    expect(calculateAngle(p(0, 0), p(1, 0), p(2, 0))).toBeCloseTo(180);
  });
  it("góc vuông → 90°", () => {
    expect(calculateAngle(p(1, 0), p(0, 0), p(0, 1))).toBeCloseTo(90);
  });
  it("góc 60°", () => {
    expect(calculateAngle(p(1, 0), p(0, 0), p(0.5, Math.sqrt(3) / 2))).toBeCloseTo(60);
  });
  it("2 điểm trùng nhau → 0°, không NaN", () => {
    expect(calculateAngle(p(0, 0), p(0, 0), p(1, 1))).toBe(0);
  });
});
