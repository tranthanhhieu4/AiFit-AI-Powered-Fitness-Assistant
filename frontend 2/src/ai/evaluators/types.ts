export type ExerciseId = "squat" | "plank" | "pushup";

export type RuleClassification = "correct" | "error";

/**
 * One row of the ExerciseRules table (Proposal 5.4 "ExerciseRules Reference
 * Table"). This is a client-side mirror of the same rows the backend stores
 * in SQL Server and serves from GET /api/exercise-rules?exercise=squat
 * (Architecture Design 3.2, "ExerciseRules Service"); the admin screens
 * (IDD UI-13/UI-14) edit these rows without touching this code (NFR06).
 */
export interface ExerciseRule {
  id: string;
  exercise: ExerciseId;
  jointSetPhase: string;
  metric: string;
  min: number | null;
  max: number | null;
  classification: RuleClassification;
  label: string;
  voiceMessage: string | null;
  reference: string;
}

/** Result of comparing one computed metric against its matching rule. */
export interface MetricEvaluation {
  metric: string;
  value: number;
  rule: ExerciseRule | null;
  classification: RuleClassification | "unknown";
  label: string;
}

/** Everything the UI (UI-05 Live Workout) needs for the current frame. */
export interface FrameEvaluation {
  exercise: ExerciseId;
  bodyDetected: boolean;
  metrics: MetricEvaluation[];
  /** Worst-case classification across all metrics this frame. */
  overall: RuleClassification | "unknown";
  /** Angle/metric readouts to draw as overlay tooltips, keyed by joint. */
  tooltips: { joint: "shoulder" | "elbow" | "wrist" | "hip" | "knee" | "ankle"; text: string; flagged: boolean }[];
}
