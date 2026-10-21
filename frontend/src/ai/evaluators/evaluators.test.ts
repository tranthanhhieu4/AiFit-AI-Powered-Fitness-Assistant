import { describe, it, expect } from "vitest";
import { SquatEvaluator } from "./SquatEvaluator";
import { PlankEvaluator } from "./PlankEvaluator";
import { PushupEvaluator } from "./PushupEvaluator";
import type { LandmarkPoint } from "../landmarks";

function makeLms(points: Record<number, [number, number]>): LandmarkPoint[] {
  const arr: LandmarkPoint[] = Array.from({ length: 33 }, () => ({ x: 0, y: 0, z: 0, visibility: 1 }));
  for (const [idx, [x, y]] of Object.entries(points)) arr[Number(idx)] = { x, y, z: 0, visibility: 1 };
  return arr;
}

describe("SquatEvaluator", () => {
  const ev = new SquatEvaluator();

  it("đứng thẳng θ=180° → correct", () => {
    const r = ev.evaluate(makeLms({ 11: [0.5, 0.2], 23: [0.5, 0.4], 25: [0.5, 0.6], 27: [0.5, 0.8] }));
    expect(r.isCorrect).toBe(true);
    expect(r.primaryAngle).toBeCloseTo(180);
  });

  it("squat đủ depth (θ≈90°) → correct", () => {
    const r = ev.evaluate(makeLms({ 11: [0.4, 0.3], 23: [0.3, 0.6], 25: [0.5, 0.6], 27: [0.5, 0.8] }));
    expect(r.isCorrect).toBe(true);
    expect(r.primaryAngle).toBeCloseTo(90, 0);
  });

  it("squat quá sâu (θ≈20°) → ExcessiveDepth", () => {
    const r = ev.evaluate(makeLms({ 11: [0.5, 0.3], 23: [0.57, 0.59], 25: [0.5, 0.6], 27: [0.57, 0.615] }));
    expect(r.errors.some((e) => e.errorType === "ExcessiveDepth")).toBe(true);
  });
});

describe("PlankEvaluator (TC20)", () => {
  const ev = new PlankEvaluator();

  it("thân thẳng → correct", () => {
    expect(ev.evaluate(makeLms({ 11: [0.2, 0.5], 23: [0.5, 0.5], 27: [0.8, 0.5] })).isCorrect).toBe(true);
  });

  it("hông võng → HipsSagging (không nhầm Piking)", () => {
    const r = ev.evaluate(makeLms({ 11: [0.2, 0.5], 23: [0.5, 0.6], 27: [0.8, 0.5] }));
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].errorType).toBe("HipsSagging");
    expect(r.secondaryAngle!).toBeGreaterThan(0);
  });

  it("hông nhô → HipsPiking", () => {
    const r = ev.evaluate(makeLms({ 11: [0.2, 0.5], 23: [0.5, 0.4], 27: [0.8, 0.5] }));
    expect(r.errors[0].errorType).toBe("HipsPiking");
    expect(r.secondaryAngle!).toBeLessThan(0);
  });
});

describe("PushupEvaluator", () => {
  const ev = new PushupEvaluator();

  it("tư thế chuẩn → correct", () => {
    const r = ev.evaluate(makeLms({
      11: [0.3, 0.4], 13: [0.32, 0.6], 15: [0.32, 0.8], 23: [0.42, 0.6], 27: [0.54, 0.78],
    }));
    expect(r.isCorrect).toBe(true);
    expect(r.primaryAngle).toBeGreaterThan(150);
  });

  it("võng lưng → SaggingBack", () => {
    const r = ev.evaluate(makeLms({
      11: [0.3, 0.4], 13: [0.32, 0.6], 15: [0.32, 0.8], 23: [0.42, 0.66], 27: [0.54, 0.78],
    }));
    expect(r.errors[0].errorType).toBe("SaggingBack");
  });

  it("hở khuỷu → ElbowFlare", () => {
    const r = ev.evaluate(makeLms({
      11: [0.3, 0.4], 13: [0.5, 0.38], 15: [0.5, 0.2], 23: [0.3, 0.6], 27: [0.3, 0.8],
    }));
    expect(r.errors.some((e) => e.errorType === "ElbowFlare")).toBe(true);
  });
});