import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCamera } from "../hooks/useCamera";
import { useWorkoutSession } from "../hooks/useWorkoutSession";
import { SkeletonOverlay } from "../components/SkeletonOverlay";
import { StatCard } from "../components/StatCard";
import { FeedbackBar } from "../components/FeedbackBar";
import { Button } from "../components/Button";
import { getExerciseRules } from "../services/exerciseService";
import { saveWorkoutSession } from "../services/workoutService";
import { CameraPermissionDenied, BodyNotDetectedBanner } from "../components/SystemMessages";
import type { ExerciseId, ExerciseRule } from "../ai/evaluators/types";
import { DEFAULT_EXERCISE_RULES } from "../ai/evaluators/exerciseRules";

const EXERCISE_TITLE: Record<ExerciseId, string> = {
  squat: "Squat",
  plank: "Plank",
  pushup: "Push-up",
};

const MODEL_URL = import.meta.env.VITE_POSE_MODEL_URL ?? "/models/pose_landmarker_lite.task";

/**
 * IDD UI-05 "Live Workout". Mirrors the Architecture Design sequence
 * "3.3.3 Live Workout - Real-Time Posture Analysis": camera permission is
 * requested, MediaPipe loads, then every frame flows through the posture
 * worker until the trainee presses Stop, at which point only the summary
 * (no video) is sent to the backend.
 */
export function LiveWorkoutPage() {
  const { exerciseId = "squat" } = useParams<{ exerciseId: ExerciseId }>();
  const exercise = exerciseId as ExerciseId;
  const navigate = useNavigate();

  const { videoRef, status: cameraStatus, start: startCamera } = useCamera();
  const [rules, setRules] = useState<ExerciseRule[]>(
    DEFAULT_EXERCISE_RULES.filter((r) => r.exercise === exercise),
  );

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  useEffect(() => {
    getExerciseRules(exercise).then(setRules);
  }, [exercise]);

  const session = useWorkoutSession(exercise, videoRef, MODEL_URL, rules);
  const isHoldExercise = exercise === "plank";

  const handleStop = async () => {
    const result = session.stop();
    try {
      await saveWorkoutSession(result);
    } catch {
      // IDD UI-09(c): queued locally by workoutService, surfaced on UI-06.
    }
    navigate(`/workout/${exercise}/summary`, { state: result });
  };

  if (cameraStatus === "denied" || cameraStatus === "error") {
    return <CameraPermissionDenied onRetry={startCamera} onBack={() => navigate("/")} />;
  }

  return (
    <div className="rounded-card border border-border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">{EXERCISE_TITLE[exercise]} - Live Workout</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3">
          <div className="relative overflow-hidden rounded-card bg-black">
            <video ref={videoRef} muted playsInline className="block w-full -scale-x-100" />
            <SkeletonOverlay videoRef={videoRef} landmarksRef={session.landmarksRef} evaluation={session.evaluation} />

            <div className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
              📷 Camera + skeleton overlay (Canvas)
            </div>

            {session.evaluation && (
              <div
                className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white ${
                  session.evaluation.overall === "error" ? "bg-danger" : "bg-success"
                }`}
              >
                {session.evaluation.overall === "error" ? "INCORRECT" : "CORRECT"}
              </div>
            )}

            {!session.bodyDetected && <BodyNotDetectedBanner />}
          </div>

          <FeedbackBar message={session.feedbackMessage} />

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={session.togglePause}>
              {session.isPaused ? "Resume" : "Pause"}
            </Button>
            <Button variant="outline" className="flex-1" onClick={session.voice.toggle}>
              Voice: {session.voice.enabled ? "On" : "Off"}
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleStop}>
              Stop
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          {isHoldExercise ? (
            <StatCard label="Hold time" value={formatTime(session.holdSeconds)} />
          ) : (
            <StatCard label="Reps" value={session.reps.total} />
          )}
          <div className="col-span-2 grid grid-cols-2 gap-3 lg:col-span-1">
            <StatCard label="Correct" value={session.reps.correct} tone="success" />
            <StatCard label="Incorrect" value={session.reps.incorrect} tone="danger" />
          </div>
          <StatCard label="Accuracy" value={`${Math.round(session.accuracy * 100)}%`} tone="gold" />
          <StatCard label="Time" value={formatTime(session.elapsedSeconds)} />
        </div>
      </div>
    </div>
  );
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}
