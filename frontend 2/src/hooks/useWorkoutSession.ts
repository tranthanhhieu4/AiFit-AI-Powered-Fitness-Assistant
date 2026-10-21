import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { usePoseLandmarker } from "./usePoseLandmarker";
import { useSpeechFeedback } from "./useSpeechFeedback";
import { PostureWorkerClient } from "../workers/postureWorkerClient";
import { RepCounter, REP_COUNTER_PRESETS } from "../ai/evaluators/repCounter";
import { DEFAULT_EXERCISE_RULES } from "../ai/evaluators/exerciseRules";
import type { ExerciseId, ExerciseRule, FrameEvaluation } from "../ai/evaluators/types";

/**
 * Orchestrates the full "closed loop" described in the Proposal (section
 * 1.3 Expected Results):
 *   Camera -> MediaPipe Pose -> Joint Extraction -> Vector Angle Calculation
 *   -> Posture Evaluation -> Audio Alert -> Result Storage -> Statistics
 *
 * This hook owns the per-frame render loop and exposes exactly the state
 * IDD UI-05 "Live Workout" needs (reps, correct/incorrect, accuracy, timer,
 * feedback message, pause, voice toggle) plus the current FrameEvaluation
 * for the SkeletonOverlay to draw.
 */

const HOLD_EXERCISES: ExerciseId[] = ["plank"];

export interface ErrorBreakdownEntry {
  label: string;
  count: number;
}

export interface WorkoutSessionResult {
  exercise: ExerciseId;
  durationSeconds: number;
  totalReps: number;
  correctReps: number;
  incorrectReps: number;
  accuracy: number; // 0..1
  /** UI-06 control #8 "Result of every repetition in order". */
  repHistory: ("correct" | "incorrect")[];
  /** UI-06 control #7 "Detected error types ... and number of repetitions affected". */
  errorBreakdown: ErrorBreakdownEntry[];
}

export function useWorkoutSession(
  exercise: ExerciseId,
  videoRef: RefObject<HTMLVideoElement>,
  modelUrl: string,
  rules: ExerciseRule[] = DEFAULT_EXERCISE_RULES,
) {
  const { status: poseStatus, detect } = usePoseLandmarker(modelUrl);
  const speech = useSpeechFeedback();

  const workerRef = useRef<PostureWorkerClient | null>(null);
  const repCounterRef = useRef(new RepCounter(REP_COUNTER_PRESETS[exercise as "squat" | "pushup"]));
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const pausedAccumRef = useRef(0);
  const pausedAtRef = useRef<number | null>(null);
  const busyRef = useRef(false); // true while a worker request is in flight
  /**
   * Latest raw landmarks, updated every rendered frame (not via setState) so
   * SkeletonOverlay.tsx can redraw at full camera frame rate in its own
   * rAF loop without waiting on the (slower) worker round-trip or causing
   * a React re-render per frame - keeps NFR01's 20-30 FPS target.
   */
  const landmarksRef = useRef<ReturnType<typeof detect>>(null);
  /** UI-06 "result of every repetition in order" - appended to as each rep closes. */
  const repHistoryRef = useRef<("correct" | "incorrect")[]>([]);
  /** UI-06 "detected error types ... and number of repetitions affected" - keyed by rule label. */
  const errorCountsRef = useRef<Map<string, number>>(new Map());

  const [isPaused, setPaused] = useState(false);
  const [bodyDetected, setBodyDetected] = useState(false);
  const [evaluation, setEvaluation] = useState<FrameEvaluation | null>(null);
  const [reps, setReps] = useState({ total: 0, correct: 0, incorrect: 0 });
  const [holdSeconds, setHoldSeconds] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // --- lifecycle: worker + rep counter ---
  useEffect(() => {
    workerRef.current = new PostureWorkerClient();
    repCounterRef.current = new RepCounter(REP_COUNTER_PRESETS[exercise as "squat" | "pushup"]);
    startedAtRef.current = performance.now();
    pausedAccumRef.current = 0;
    repHistoryRef.current = [];
    errorCountsRef.current = new Map();
    return () => workerRef.current?.terminate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise]);

  // --- elapsed-time ticker (independent of the detection loop) ---
  useEffect(() => {
    const id = window.setInterval(() => {
      if (isPaused || startedAtRef.current === null) return;
      const elapsedMs = performance.now() - startedAtRef.current - pausedAccumRef.current;
      setElapsedSeconds(Math.max(0, Math.floor(elapsedMs / 1000)));
    }, 250);
    return () => window.clearInterval(id);
  }, [isPaused]);

  // Applies one resolved FrameEvaluation to component state: feedback text
  // + voice alert, then either the Plank hold timer or the rep counter.
  // Declared before the detection effect below (which depends on it) so
  // toggling voice - which changes `speech` and therefore recreates this
  // callback - restarts that effect with a fresh closure instead of
  // silently keeping a stale one (a classic stale-closure bug that would
  // otherwise make "Voice: Off" fail to actually stop speech mid-session).
  const applyEvaluation = useCallback(
    (result: FrameEvaluation) => {
      setEvaluation(result);
      setBodyDetected(result.bodyDetected);
      if (!result.bodyDetected) return;

      // Speak + show the first error label this frame, if any.
      const errorMetric = result.metrics.find((m) => m.classification === "error");
      const rule = errorMetric?.rule ?? null;
      setFeedbackMessage(rule?.label ?? null);
      if (rule?.voiceMessage) speech.speak(rule.voiceMessage);
      if (rule?.label) {
        errorCountsRef.current.set(rule.label, (errorCountsRef.current.get(rule.label) ?? 0) + 1);
      }

      if (HOLD_EXERCISES.includes(exercise)) {
        if (result.overall === "correct") setHoldSeconds((s) => s + 1 / 30); // ~1 frame worth, smoothed by rAF cadence
        return;
      }

      // Rep-based exercises: feed the primary depth metric into the counter.
      const primary = result.metrics.find((m) =>
        exercise === "squat" ? m.metric === "kneeFlexionDepth" : m.metric === "elbowFlexionAngle",
      );
      if (!primary) return;
      const depthValue = exercise === "pushup" ? 180 - primary.value : primary.value;
      const before = repCounterRef.current.getState();
      repCounterRef.current.update(depthValue, result.overall);
      const state = repCounterRef.current.getState();
      // A rep just closed if the total went up - record which bucket grew.
      if (state.totalReps > before.totalReps) {
        repHistoryRef.current.push(state.correctReps > before.correctReps ? "correct" : "incorrect");
      }
      setReps({ total: state.totalReps, correct: state.correctReps, incorrect: state.incorrectReps });
    },
    [exercise, speech],
  );

  // --- per-frame detection + evaluation loop ---
  useEffect(() => {
    if (poseStatus !== "ready") return;

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      const video = videoRef.current;
      const worker = workerRef.current;
      if (!video || !worker || isPaused || busyRef.current) return;

      const landmarks = detect(video, performance.now());
      landmarksRef.current = landmarks;
      if (!landmarks) {
        setBodyDetected(false);
        return;
      }

      busyRef.current = true;
      worker
        .evaluate(exercise, landmarks, rules)
        .then((result) => {
          busyRef.current = false;
          applyEvaluation(result);
        })
        .catch(() => {
          busyRef.current = false;
        });
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [poseStatus, isPaused, exercise, rules, applyEvaluation]);

  const togglePause = useCallback(() => {
    setPaused((prev) => {
      if (!prev) {
        pausedAtRef.current = performance.now();
      } else if (pausedAtRef.current !== null) {
        pausedAccumRef.current += performance.now() - pausedAtRef.current;
      }
      return !prev;
    });
  }, []);

  const accuracy = reps.total > 0 ? reps.correct / reps.total : 0;

  const stop = useCallback((): WorkoutSessionResult => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    const errorBreakdown: ErrorBreakdownEntry[] = Array.from(errorCountsRef.current.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
    return {
      exercise,
      durationSeconds: elapsedSeconds,
      totalReps: reps.total,
      correctReps: reps.correct,
      incorrectReps: reps.incorrect,
      accuracy,
      repHistory: [...repHistoryRef.current],
      errorBreakdown,
    };
  }, [exercise, elapsedSeconds, reps, accuracy]);

  return {
    poseStatus,
    bodyDetected,
    evaluation,
    /** Read by SkeletonOverlay.tsx in its own rAF loop - see landmarksRef above. */
    landmarksRef,
    reps,
    accuracy,
    holdSeconds: Math.floor(holdSeconds),
    elapsedSeconds,
    feedbackMessage,
    isPaused,
    togglePause,
    voice: speech,
    stop,
  };
}
