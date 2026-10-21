import { describe, it, expect } from "vitest";
import { createRepCounter } from "./RepCounter";
import type { PostureError } from "./evaluators/evaluator.types";

function feed(rc: NonNullable<ReturnType<typeof createRepCounter>>, angles: number[], frameErrors: PostureError[] = []) {
  const reps = [];
  for (const a of angles) {
    const r = rc.update(a, frameErrors);
    if (r) reps.push(r);
  }
  return reps;
}

describe("RepCounter — squat (enter 140 / exit 155 / stable 3)", () => {
  const make = () => createRepCounter("squat")!;

  it("1 rep chuẩn (θ_min 85) → counted + correct", () => {
    const reps = feed(make(), [172, 172, 172, 120, 100, 85, 85, 85, 120, 150, 160, 165, 170, 170, 170]);
    expect(reps).toHaveLength(1);
    expect(reps[0].correct).toBe(true);
    expect(reps[0].minAngle).toBe(85);
  });

  it("shallow rep (θ_min 135) → counted NHƯNG incorrect + ShallowDepth (TC19)", () => {
    const reps = feed(make(), [172, 172, 172, 135, 135, 135, 150, 160, 165, 170, 170, 170]);
    expect(reps).toHaveLength(1);
    expect(reps[0].counted).toBe(true);
    expect(reps[0].correct).toBe(false);
    expect(reps[0].errors.map((e) => e.errorType)).toContain("ShallowDepth");
  });

  it("jitter quanh ngưỡng không tạo rep giả (hysteresis)", () => {
    expect(feed(make(), [172, 138, 143, 138, 143, 138, 172, 172, 172])).toHaveLength(0);
  });

  it("debounce: cần 3 frame liên tiếp mới đổi trạng thái", () => {
    const rc = make();
    rc.update(139, []); rc.update(139, []);
    expect(rc.currentPhase).toBe("TOP");
    rc.update(139, []);
    expect(rc.currentPhase).toBe("BOTTOM");
  });

  it("5 rep (3 đúng, 2 shallow) — như TC26", () => {
    const reps = feed(make(), [
      172, 172, 172, 85, 85, 85, 170, 170, 170,
      172, 172, 172, 130, 130, 130, 170, 170, 170,
      172, 172, 172, 80, 80, 80, 170, 170, 170,
      172, 172, 172, 132, 132, 132, 170, 170, 170,
      172, 172, 172, 70, 70, 70, 170, 170, 170,
    ]);
    expect(reps).toHaveLength(5);
    expect(reps.filter((r) => r.correct)).toHaveLength(3);
    expect(reps.filter((r) => !r.correct)).toHaveLength(2);
  });

  it("lỗi frame trong rep → rep đó incorrect (Mục 4.4)", () => {
    const err: PostureError = { errorType: "ExcessiveDepth", severity: 2, message: "x" };
    const reps = feed(make(), [172, 172, 172, 85, 85, 85, 170, 170, 170], [err]);
    expect(reps[0].correct).toBe(false);
    expect(reps[0].errors.map((e) => e.errorType)).toContain("ExcessiveDepth");
  });
});

describe("RepCounter — pushup (TC25)", () => {
  it("ROM đủ (88°) → correct; thiếu (135°) → counted nhưng InsufficientROM", () => {
    const rc = createRepCounter("pushup")!;
    const full = feed(rc, [170, 170, 170, 120, 100, 88, 88, 88, 120, 150, 158, 165, 168, 168, 168]);
    expect(full[0].correct).toBe(true);

    const partial = feed(rc, [170, 170, 170, 135, 135, 135, 150, 158, 165, 168, 168, 168]);
    expect(partial[0].counted).toBe(true);
    expect(partial[0].correct).toBe(false);
    expect(partial[0].errors.map((e) => e.errorType)).toContain("InsufficientROM");
  });

  it("plank → không có RepCounter", () => {
    expect(createRepCounter("plank")).toBeNull();
  });
});