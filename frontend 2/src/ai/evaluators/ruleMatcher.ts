import type { ExerciseRule, MetricEvaluation, RuleClassification } from "./types";

/**
 * Decision Logic (Proposal 5.5): compares one computed metric value against
 * every rule row that applies to it, and returns the matching row. Several
 * rows can share a metric (e.g. Squat "kneeFlexionDepth" has shallow /
 * medium / full bands) - the first row whose [min, max) range contains the
 * value wins. A missing min/max means "open" on that side.
 */
export function evaluateMetric(
  rules: ExerciseRule[],
  metric: string,
  value: number,
): MetricEvaluation {
  const candidates = rules.filter((r) => r.metric === metric);
  const match = candidates.find((r) => isWithinRange(value, r.min, r.max));

  return {
    metric,
    value,
    rule: match ?? null,
    classification: match ? match.classification : "unknown",
    label: match ? match.label : "No matching rule",
  };
}

function isWithinRange(value: number, min: number | null, max: number | null): boolean {
  if (min !== null && value < min) return false;
  if (max !== null && value >= max) return false;
  return true;
}

/**
 * Worst-case classification across a frame's metrics: one "error" makes the
 * whole frame INCORRECT (IDD UI-05, control #2), matching the Proposal's
 * per-frame Correct/Incorrect decision.
 */
export function overallClassification(evaluations: MetricEvaluation[]): RuleClassification | "unknown" {
  if (evaluations.some((e) => e.classification === "error")) return "error";
  if (evaluations.every((e) => e.classification === "correct")) return "correct";
  return "unknown";
}
