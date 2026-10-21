import { Link, useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { EXERCISE_META } from "../lib/exerciseMeta";
import type { ExerciseId } from "../ai/evaluators/types";

/**
 * IDD UI-04 "Exercise Guide": how to perform the movement and how to set up
 * the camera, shown before the trainee starts UI-05 Live Workout.
 */
export function ExerciseGuidePage() {
  const { exerciseId = "squat" } = useParams<{ exerciseId: ExerciseId }>();
  const exercise = exerciseId as ExerciseId;
  const meta = EXERCISE_META[exercise];
  const navigate = useNavigate();

  if (!meta) {
    return (
      <Card>
        <p className="text-sm text-muted">Unknown exercise.</p>
        <Link to="/" className="mt-3 inline-block text-sm font-semibold text-gold">
          Back to Home
        </Link>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-muted">
            <Link to="/" className="text-gold">
              Home
            </Link>{" "}
            / Exercise Guide
          </p>
          <h1 className="text-xl font-bold">{meta.name}</h1>
          <p className="text-sm text-muted">Tracked joints: {meta.jointSet}</p>
        </div>
        <Button onClick={() => navigate(`/workout/${exercise}`)}>Start workout</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card title="How to perform it">
          <ol className="flex flex-col gap-2.5 text-sm text-ink">
            {meta.guideTips.map((tip, i) => (
              <li key={tip} className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-light text-xs font-bold text-gold">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ol>
        </Card>

        <Card title="Camera setup">
          <ul className="flex flex-col gap-2.5 text-sm text-ink">
            {meta.cameraTips.map((tip) => (
              <li key={tip} className="flex gap-2.5">
                <span className="text-gold">•</span>
                {tip}
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-card border border-dashed border-border bg-bg p-4 text-center text-xs text-muted">
            {meta.isHold
              ? "This is a hold exercise - AIFit times how long you keep correct form."
              : "This is a rep-counted exercise - AIFit counts each correct/incorrect repetition."}
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => navigate(`/workout/${exercise}`)}>Start workout</Button>
      </div>
    </div>
  );
}
