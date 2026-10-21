import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/Card";
import { Table, Th, Td } from "../components/table";
import { SelectField } from "../components/FormField";
import { LineChart } from "../components/charts/LineChart";
import { EXERCISE_META, EXERCISE_IDS } from "../lib/exerciseMeta";
import { formatDate, formatDuration, formatPercent } from "../lib/format";
import { getWorkoutHistory, type WorkoutHistoryItem } from "../services/workoutService";
import type { ExerciseId } from "../ai/evaluators/types";

/** IDD UI-07 "Progress & History": accuracy trend plus a filterable session table. */
export function ProgressHistoryPage() {
  const [sessions, setSessions] = useState<WorkoutHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exerciseFilter, setExerciseFilter] = useState<ExerciseId | "all">("all");
  const [daysFilter, setDaysFilter] = useState("30");

  useEffect(() => {
    setLoading(true);
    getWorkoutHistory({
      exercise: exerciseFilter === "all" ? undefined : exerciseFilter,
      days: Number(daysFilter),
    })
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [exerciseFilter, daysFilter]);

  const chronological = useMemo(() => [...sessions].reverse(), [sessions]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Progress & History</h1>
        <div className="flex gap-3">
          <SelectField
            label=""
            value={exerciseFilter}
            onChange={(e) => setExerciseFilter(e.target.value as ExerciseId | "all")}
            options={[
              { value: "all", label: "All exercises" },
              ...EXERCISE_IDS.map((id) => ({ value: id, label: EXERCISE_META[id].name })),
            ]}
            className="mt-0 w-40"
          />
          <SelectField
            label=""
            value={daysFilter}
            onChange={(e) => setDaysFilter(e.target.value)}
            options={[
              { value: "7", label: "Last 7 days" },
              { value: "30", label: "Last 30 days" },
              { value: "90", label: "Last 90 days" },
              { value: "3650", label: "All time" },
            ]}
            className="mt-0 w-36"
          />
        </div>
      </div>

      <Card title="Accuracy trend">
        <LineChart
          values={chronological.map((s) => s.accuracy)}
          labels={chronological.map((s) => formatDate(s.date))}
        />
      </Card>

      <Card title="Sessions">
        {loading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted">No sessions in this range yet.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Exercise</Th>
                <Th>Duration</Th>
                <Th>Reps</Th>
                <Th>Correct</Th>
                <Th>Incorrect</Th>
                <Th>Accuracy</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <Td>{formatDate(s.date)}</Td>
                  <Td>{EXERCISE_META[s.exercise]?.name ?? s.exercise}</Td>
                  <Td>{formatDuration(s.durationSeconds)}</Td>
                  <Td>{s.totalReps}</Td>
                  <Td className="text-success">{s.correctReps}</Td>
                  <Td className="text-danger">{s.incorrectReps}</Td>
                  <Td className="font-semibold">{formatPercent(s.accuracy)}</Td>
                  <Td>
                    <Link to={`/history/${s.id}`} className="font-semibold text-gold">
                      View
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
