import type { PostureError } from "./evaluators/evaluator.types";

export type Phase = "TOP" | "BOTTOM";

export interface RepResult {
  repIndex: number;
  counted: true;        // hoàn tất chu kỳ → luôn đếm (Mục 4.1/4.3)
  correct: boolean;     // chỉ khi 0 lỗi frame VÀ depth/ROM đạt
  minAngle: number;
  errors: PostureError[];
}

/**
 * Mục 6.3 — Hysteresis + Minimum Phase Duration:
 * VÀO BOTTOM khi angle < enterBottom; RA khi angle > exitBottom (2 ngưỡng khác nhau
 * = vùng đệm chống rung). Phải ổn định ≥ stableFrames frame liên tiếp mới đổi trạng thái.
 */
export class RepCounter {
  private phase: Phase = "TOP";
  private candidateFrames = 0;
  private repIndex = 0;
  private minAngle = Infinity;
  private seenErrorTypes = new Set<string>();
  private repErrors: PostureError[] = [];

  // các trường gán trong constructor (viết dài — tương thích erasableSyntaxOnly)
  private readonly enterBottom: number;
  private readonly exitBottom: number;
  private readonly stableFrames: number;
  private readonly depthOkMaxAngle: number;
  private readonly shallowErrorFactory: () => PostureError;

  constructor(
    enterBottom: number,
    exitBottom: number,
    stableFrames: number,
    depthOkMaxAngle: number,
    shallowErrorFactory: () => PostureError,
  ) {
    this.enterBottom = enterBottom;
    this.exitBottom = exitBottom;
    this.stableFrames = stableFrames;
    this.depthOkMaxAngle = depthOkMaxAngle;
    this.shallowErrorFactory = shallowErrorFactory;
  }

  update(angle: number, frameErrors: PostureError[]): RepResult | null {
    let target: Phase = this.phase;
    if (angle < this.enterBottom) target = "BOTTOM";
    else if (angle > this.exitBottom) target = "TOP";
    // vùng [enterBottom, exitBottom] = hysteresis → giữ nguyên trạng thái

    if (target !== this.phase) {
      this.candidateFrames++;
      if (this.candidateFrames >= this.stableFrames) {
        this.phase = target;
        this.candidateFrames = 0;
        if (this.phase === "TOP") return this.completeRep(); // BOTTOM→TOP = +1 rep
      }
    } else {
      this.candidateFrames = 0;
    }

    if (angle < this.minAngle) this.minAngle = angle;
    for (const e of frameErrors) {
      if (!this.seenErrorTypes.has(e.errorType)) {
        this.seenErrorTypes.add(e.errorType);
        this.repErrors.push(e);
      }
    }
    return null;
  }

  get currentPhase(): Phase {
    return this.phase;
  }

  private completeRep(): RepResult {
    this.repIndex++;
    const errors = [...this.repErrors];
    if (this.minAngle > this.depthOkMaxAngle) errors.push(this.shallowErrorFactory());
    const result: RepResult = {
      repIndex: this.repIndex,
      counted: true,
      correct: errors.length === 0,
      minAngle: this.minAngle,
      errors,
    };
    this.minAngle = Infinity;
    this.seenErrorTypes.clear();
    this.repErrors = [];
    return result;
  }
}

/** Ngưỡng theo bài — Phase 3 đọc từ ExerciseRules (versioned). Plank = hold, không đếm. */
export function createRepCounter(exerciseId: string): RepCounter | null {
  if (exerciseId === "squat") {
    return new RepCounter(140, 155, 3, 90, () => ({
      errorType: "ShallowDepth", severity: 2, message: "Squat deeper please",
    }));
  }
  if (exerciseId === "pushup") {
    return new RepCounter(145, 155, 3, 90, () => ({
      errorType: "InsufficientROM", severity: 2, message: "Lower your chest more",
    }));
  }
  return null;
}