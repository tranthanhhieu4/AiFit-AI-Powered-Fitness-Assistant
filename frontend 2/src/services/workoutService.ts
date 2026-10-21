import { httpClient } from "./httpClient";
import type { ExerciseId } from "../ai/evaluators/types";
import type { WorkoutSessionResult } from "../hooks/useWorkoutSession";

export interface WorkoutHistoryItem {
  id: string;
  exercise: ExerciseId;
  date: string;
  durationSeconds: number;
  totalReps: number;
  correctReps: number;
  incorrectReps: number;
  accuracy: number;
  /** Present once the backend persists per-rep detail (UI-06/UI-07 detail view). */
  repHistory?: ("correct" | "incorrect")[];
  errorBreakdown?: { label: string; count: number }[];
}

/**
 * IDD UI-06 control #9 "Session saved to server" / Architecture Design
 * "Session Controller / Session Service". Only the summary metadata is
 * sent - no video or image ever leaves the browser (Proposal 5.6 Privacy
 * Constraint, NFR02). Queues to localStorage and retries if offline
 * (IDD UI-09(c) "Offline" / NFR04 Reliability).
 */
export async function saveWorkoutSession(result: WorkoutSessionResult): Promise<void> {
  try {
    await httpClient.post("/workout-sessions", result);
  } catch {
    queueForRetry(result);
    throw new Error("offline");
  }
}

const QUEUE_KEY = "aifit.pendingSessions";

function queueForRetry(result: WorkoutSessionResult): void {
  const queue: WorkoutSessionResult[] = JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]");
  queue.push(result);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/** IDD UI-09(c) "Retry sync" button. */
export async function retryQueuedSessions(): Promise<void> {
  const queue: WorkoutSessionResult[] = JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]");
  if (!queue.length) return;
  const remaining: WorkoutSessionResult[] = [];
  for (const item of queue) {
    try {
      await httpClient.post("/workout-sessions", item);
    } catch {
      remaining.push(item);
    }
  }
  localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
}

/** IDD UI-07 "Progress & History" table. */
export async function getWorkoutHistory(params: { exercise?: ExerciseId; days?: number } = {}) {
  const { data } = await httpClient.get<WorkoutHistoryItem[]>("/workout-sessions", { params });
  return data;
}

/** IDD UI-07 control #7 "View the detail of a session (same layout as UI-06, read-only)". */
export async function getWorkoutSessionById(id: string): Promise<WorkoutHistoryItem> {
  const { data } = await httpClient.get<WorkoutHistoryItem>(`/workout-sessions/${id}`);
  return data;
}
