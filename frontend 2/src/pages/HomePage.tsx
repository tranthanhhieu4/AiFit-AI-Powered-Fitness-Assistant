import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { StatCard } from "../components/StatCard";
import { getCurrentUser } from "../services/authService";
import { listExercises, type ExerciseSummary } from "../services/exerciseService";
import { getWorkoutHistory } from "../services/workoutService";
import { EXERCISE_META, EXERCISE_IDS } from "../lib/exerciseMeta";
import { formatPercent } from "../lib/format";

/**
 * IDD UI-03 "Home". Entry point after login: a quick look at recent
 * performance plus a card per supported exercise to jump into the guide
 * (UI-04) or straight into a workout (UI-05).
 */
export function HomePage() {
  const user = getCurrentUser();
  const [exercises, setExercises] = useState<ExerciseSummary[]>(fallbackExercises());
  const [weeklySessions, setWeeklySessions] = useState<number | null>(null);
  const [weeklyAccuracy, setWeeklyAccuracy] = useState<number | null>(null);

  useEffect(() => {
    listExercises()
      .then((data) => setExercises(data.length ? data : fallbackExercises()))
      .catch(() => setExercises(fallbackExercises()));

    getWorkoutHistory({ days: 7 })
      .then((sessions) => {
        setWeeklySessions(sessions.length);
        if (sessions.length) {
          const avg = sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length;
          setWeeklyAccuracy(avg);
        } else {
          setWeeklyAccuracy(0);
        }
      })
      .catch(() => {
        setWeeklySessions(0);
        setWeeklyAccuracy(0);
      });
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <h1 className="text-xl font-bold">Welcome back{user ? `, ${user.fullName.split(" ")[0]}` : ""}</h1>
        <p className="mt-1 text-sm text-muted">Pick an exercise below and AIFit will watch your form in real time.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:w-80">
          <StatCard label="Sessions this week" value={weeklySessions ?? "..."} />
          <StatCard
            label="Avg. accuracy (7d)"
            value={weeklyAccuracy === null ? "..." : formatPercent(weeklyAccuracy)}
            tone="gold"
          />
        </div>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-bold">Exercises</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exercises.map((ex) => {
            const meta = EXERCISE_META[ex.id];
            return (
              <Card key={ex.id} className="flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold">{ex.name}</h3>
                  {!ex.active && (
                    <span className="rounded-full bg-border px-2 py-0.5 text-xs font-semibold text-muted">
                      Unavailable
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">{ex.jointSet}</p>
                <p className="mt-2 flex-1 text-sm text-ink">{ex.description || meta?.guideTips[0]}</p>
                <div className="mt-4 flex gap-2">
                  <Link to={`/exercise/${ex.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Guide
                    </Button>
                  </Link>
                  <Link to={`/workout/${ex.id}`} className="flex-1">
                    <Button className="w-full" disabled={!ex.active}>
                      Start
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function fallbackExercises(): ExerciseSummary[] {
  return EXERCISE_IDS.map((id) => ({
    id,
    name: EXERCISE_META[id].name,
    jointSet: EXERCISE_META[id].jointSet,
    description: EXERCISE_META[id].guideTips[0],
    active: true,
  }));
}
