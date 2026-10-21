import type { RuleClassification } from "./types";

/**
 * Repetition-counting state machine (Proposal "Decision Logic" 5.5 and
 * Project Plan Sprint 4 task "Finalize the rep-counting cycle algorithm").
 *
 * A rep is one full top -> bottom -> top cycle of the primary depth metric
 * (knee-flexion depth for Squat, elbow-flexion angle for Push-up). Plank has
 * no reps; useWorkoutSession.ts uses a hold timer for it instead.
 *
 * Each completed rep is classified "correct" only if every frame recorded
 * during that rep's bottom phase was "correct" (IDD UI-05 controls #4/#5).
 */
export type RepPhase = "top" | "descending" | "bottom" | "ascending";

export interface RepCounterConfig {
  /** Metric value (0..~135 for depth, 0..180 for elbow angle) that counts as "top". */
  topThreshold: number;
  /** Metric value that counts as having reached "bottom". */
  bottomThreshold: number;
  /** Ignore direction reversals smaller than this (reduces false triggers from jitter). */
  hysteresis: number;
}

export interface RepCounterState {
  phase: RepPhase;
  totalReps: number;
  correctReps: number;
  incorrectReps: number;
  /** Whether every frame since entering "bottom" has been correct so far. */
  currentRepCorrect: boolean;
}

const DEFAULT_CONFIG: RepCounterConfig = {
  topThreshold: 20,
  bottomThreshold: 90,
  hysteresis: 5,
};

export class RepCounter {
  private readonly config: RepCounterConfig;
  private state: RepCounterState = {
    phase: "top",
    totalReps: 0,
    correctReps: 0,
    incorrectReps: 0,
    currentRepCorrect: true,
  };

  constructor(config: Partial<RepCounterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  getState(): RepCounterState {
    return { ...this.state };
  }

  reset(): void {
    this.state = { phase: "top", totalReps: 0, correctReps: 0, incorrectReps: 0, currentRepCorrect: true };
  }

  /**
   * Feed one frame's primary depth metric and its correct/incorrect
   * classification. Returns true exactly on the frame a rep completes.
   */
  update(depthValue: number, classification: RuleClassification | "unknown"): boolean {
    const { topThreshold, bottomThreshold, hysteresis } = this.config;
    let repCompleted = false;

    if (classification === "error") this.state.currentRepCorrect = false;

    switch (this.state.phase) {
      case "top":
        if (depthValue > topThreshold + hysteresis) this.state.phase = "descending";
        break;
      case "descending":
        if (depthValue >= bottomThreshold) this.state.phase = "bottom";
        else if (depthValue < topThreshold) this.state.phase = "top"; // aborted rep
        break;
      case "bottom":
        if (depthValue < bottomThreshold - hysteresis) this.state.phase = "ascending";
        break;
      case "ascending":
        if (depthValue <= topThreshold) {
          this.state.totalReps += 1;
          if (this.state.currentRepCorrect) this.state.correctReps += 1;
          else this.state.incorrectReps += 1;
          this.state.currentRepCorrect = true;
          this.state.phase = "top";
          repCompleted = true;
        } else if (depthValue >= bottomThreshold) {
          this.state.phase = "bottom"; // bounced back down
        }
        break;
    }

    return repCompleted;
  }
}

/** Per-exercise default thresholds, tuned from the Proposal 5.4 bands. */
export const REP_COUNTER_PRESETS: Record<"squat" | "pushup", Partial<RepCounterConfig>> = {
  squat: { topThreshold: 20, bottomThreshold: 90, hysteresis: 5 },
  // Push-up uses elbow angle directly (180 = top/extended, <=90 = bottom),
  // so it is inverted relative to "depth" - see useWorkoutSession.ts, which
  // passes `180 - elbowFlexionAngle` in as the depth value for this counter.
  pushup: { topThreshold: 10, bottomThreshold: 90, hysteresis: 5 },
};
