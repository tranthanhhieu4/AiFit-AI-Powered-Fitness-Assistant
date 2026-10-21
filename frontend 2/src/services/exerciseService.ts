import { httpClient } from "./httpClient";
import { DEFAULT_EXERCISE_RULES } from "../ai/evaluators/exerciseRules";
import type { ExerciseId, ExerciseRule, RuleClassification } from "../ai/evaluators/types";

export interface ExerciseSummary {
  id: ExerciseId;
  name: string;
  jointSet: string;
  description: string;
  active: boolean;
}

/** IDD UI-03 exercise cards / UI-12 table: list the exercise catalog. */
export async function listExercises(): Promise<ExerciseSummary[]> {
  const { data } = await httpClient.get<ExerciseSummary[]>("/exercises");
  return data;
}

/**
 * IDD UI-13/UI-14: rules are managed by an Admin and must be loaded fresh
 * at the start of every workout (Proposal 5.5 Decision Logic) rather than
 * hard-coded, so a threshold calibration takes effect immediately
 * (NFR06 Maintainability). Falls back to the bundled defaults if the
 * request fails, so a workout can still start offline (NFR04 Reliability).
 */
export async function getExerciseRules(exercise: ExerciseId): Promise<ExerciseRule[]> {
  try {
    const { data } = await httpClient.get<ExerciseRule[]>("/exercise-rules", { params: { exercise } });
    return data.length ? data : DEFAULT_EXERCISE_RULES.filter((r) => r.exercise === exercise);
  } catch {
    return DEFAULT_EXERCISE_RULES.filter((r) => r.exercise === exercise);
  }
}

// ---------------------------------------------------------------------------
// Admin: Exercise catalog CRUD (IDD UI-12 "Manage Exercises")
// ---------------------------------------------------------------------------

export interface ExerciseInput {
  name: string;
  jointSet: string;
  description: string;
  active: boolean;
}

export async function createExercise(input: ExerciseInput): Promise<ExerciseSummary> {
  const { data } = await httpClient.post<ExerciseSummary>("/admin/exercises", input);
  return data;
}

export async function updateExercise(id: ExerciseId, input: Partial<ExerciseInput>): Promise<ExerciseSummary> {
  const { data } = await httpClient.put<ExerciseSummary>(`/admin/exercises/${id}`, input);
  return data;
}

export async function deleteExercise(id: ExerciseId): Promise<void> {
  await httpClient.delete(`/admin/exercises/${id}`);
}

// ---------------------------------------------------------------------------
// Admin: Exercise rule CRUD (IDD UI-13 "Manage Exercise Rules" / UI-14 "Add / Edit Rule")
// ---------------------------------------------------------------------------

export interface ExerciseRuleInput {
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

/** List every rule across all exercises, for the UI-13 table (optionally filtered). */
export async function listAllExerciseRules(exercise?: ExerciseId | "all"): Promise<ExerciseRule[]> {
  try {
    const { data } = await httpClient.get<ExerciseRule[]>("/admin/exercise-rules", {
      params: exercise && exercise !== "all" ? { exercise } : undefined,
    });
    return data;
  } catch {
    return exercise && exercise !== "all"
      ? DEFAULT_EXERCISE_RULES.filter((r) => r.exercise === exercise)
      : DEFAULT_EXERCISE_RULES;
  }
}

export async function getExerciseRuleById(id: string): Promise<ExerciseRule | null> {
  try {
    const { data } = await httpClient.get<ExerciseRule>(`/admin/exercise-rules/${id}`);
    return data;
  } catch {
    return DEFAULT_EXERCISE_RULES.find((r) => r.id === id) ?? null;
  }
}

export async function createExerciseRule(input: ExerciseRuleInput): Promise<ExerciseRule> {
  const { data } = await httpClient.post<ExerciseRule>("/admin/exercise-rules", input);
  return data;
}

export async function updateExerciseRule(id: string, input: ExerciseRuleInput): Promise<ExerciseRule> {
  const { data } = await httpClient.put<ExerciseRule>(`/admin/exercise-rules/${id}`, input);
  return data;
}

export async function deleteExerciseRule(id: string): Promise<void> {
  await httpClient.delete(`/admin/exercise-rules/${id}`);
}
