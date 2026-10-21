import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { StatCard } from "../components/StatCard";
import { BarChart } from "../components/charts/BarChart";
import { ConnectionLostBanner } from "../components/SystemMessages";
import { EXERCISE_META } from "../lib/exerciseMeta";
import { formatDuration, formatPercent, formatDateTime } from "../lib/format";
import { getWorkoutSessionById, retryQueuedSessions } from "../services/workoutService";
import type { WorkoutSessionResult } from "../hooks/useWorkoutSession";
import type { WorkoutHistoryItem } from "../services/workoutService";
import type { ExerciseId } from "../ai/evaluators/types";

type SummaryData = WorkoutSessionResult | WorkoutHistoryItem;

/**
 * IDD UI-06 "Workout Summary". Two entry points:
 *  - straight after Stop on UI-05, via router state (live result, may still
 *    be queued offline - control #9/#10 and UI-09(c));
 *  - IDD UI-07 control #7 "view the detail of a session" at /history/:id,
 *    read-only, fetched from the server.
 */
export function WorkoutSummaryPage() {
  const { exerciseId, sessionId } = useParams<{ exerciseId?: ExerciseId; sessionId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const liveResult = (location.state as WorkoutSessionResult | null) ?? null;
  const [data, setData] = useState<SummaryData | null>(liveResult);
  const [loadError, setLoadError] = useState(false);
  const [offline, setOffline] = useState(!!liveResult && isQueuedLocally());
  const [retrying, setRetrying] = useState(false);

  const readOnly = !!sessionId;

  useEffect(() => {
    if (!sessionId) return;
    getWorkoutSessionById(sessionId)
      .then(setData)
      .catch(() => setLoadError(true));
  }, [sessionId]);

  if (!data) {
    return (
      <Card>
        <p className="text-sm text-muted">{loadError ? "Could not load this session." : "Loading session..."}</p>
        <Link to="/history" className="mt-3 inline-block text-sm font-semibold text-gold">
          Back to History
        </Link>
      </Card>
    );
  }

  const exercise = (exerciseId as ExerciseId) ?? ("exercise" in data ? data.exercise : "squat");
  const meta = EXERCISE_META[exercise];
  const repHistory = data.repHistory ?? [];
  const errorBreakdown = data.errorBreakdown ?? [];

  const handleRetrySync = async () => {
    setRetrying(true);
    await retryQueuedSessions().finally(() => setRetrying(false));
    setOffline(isQueuedLocally());
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-muted">
            <Link to={readOnly ? "/history" : "/"} className="text-gold">
              {readOnly ? "History" : "Home"}
            </Link>{" "}
            / Workout Summary
          </p>
          <h1 className="text-xl font-bold">
            {meta?.name ?? exercise} - {readOnly ? "Session detail" : "Great work!"}
          </h1>
          {"date" in data && <p className="text-sm text-muted">{formatDateTime(data.date)}</p>}
        </div>
        {!readOnly && <Button onClick={() => navigate("/")}>Done</Button>}
      </div>

      {offline && <ConnectionLostBanner onRetrySync={handleRetrySync} />}
      {retrying && <p className="text-sm text-muted">Retrying sync...</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label={meta?.isHold ? "Hold time" : "Total reps"}
          value={meta?.isHold ? formatDuration(data.durationSeconds) : data.totalReps}
        />
        <StatCard label="Correct" value={data.correctReps} tone="success" />
        <StatCard label="Incorrect" value={data.incorrectReps} tone="danger" />
        <StatCard label="Accuracy" value={formatPercent(data.accuracy)} tone="gold" />
      </div>

      <Card title="Result of every repetition">
        {repHistory.length === 0 ? (
          <p className="text-sm text-muted">No per-repetition detail recorded for this session.</p>
        ) : (
          <>
            <div className="mb-4">
              <BarChart
                bars={repHistory.map((r) => [{ value: 1, color: r === "correct" ? "#438459" : "#B54C3D" }])}
                labels={repHistory.map((_, i) => `${i + 1}`)}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {repHistory.map((r, i) => (
                <span
                  key={i}
                  title={`Rep ${i + 1}: ${r}`}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${
                    r === "correct" ? "bg-success" : "bg-danger"
                  }`}
                >
                  {i + 1}
                </span>
              ))}
            </div>
          </>
        )}
      </Card>

      <Card title="Detected error types">
        {errorBreakdown.length === 0 ? (
          <p className="text-sm text-muted">No posture errors were detected - nice form!</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {errorBreakdown.map((e) => (
              <li
                key={e.label}
                className="flex items-center justify-between rounded-lg border border-border bg-danger-light/40 px-3 py-2 text-sm"
              >
                <span className="font-medium text-ink">{e.label}</span>
                <span className="font-bold text-danger">
                  {e.count} rep{e.count === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {!readOnly && (
        <div className="flex justify-end gap-3">
          <Link to={`/exercise/${exercise}`}>
            <Button variant="outline">View guide</Button>
          </Link>
          <Link to={`/workout/${exercise}`}>
            <Button>Workout again</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function isQueuedLocally(): boolean {
  try {
    const queue = JSON.parse(localStorage.getItem("aifit.pendingSessions") ?? "[]");
    return Array.isArray(queue) && queue.length > 0;
  } catch {
    return false;
  }
}
