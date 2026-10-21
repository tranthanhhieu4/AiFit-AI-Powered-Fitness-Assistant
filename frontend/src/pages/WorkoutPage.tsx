import { useCallback, useEffect, useRef, useState } from "react";
import type { NormalizedLandmark, PoseLandmarker } from "@mediapipe/tasks-vision";
import { getPoseLandmarker, createPoseWorker, WORKER_WASM_URL, WORKER_MODEL_URL } from "../ai/poseDetector";
import { drawSkeleton } from "../ai/drawSkeleton";
import { LM } from "../ai/landmarks";
import { calculateAngle, averageVisibility } from "../ai/geometry/angleCalculator";
import { downloadMock } from "../ai/mockRecorder";
import { PostureAnalyzer } from "../ai/evaluators/PostureAnalyzer";
import { createRepCounter } from "../ai/RepCounter";
import { validateCameraFrame, type ValidationReport } from "../ai/cameraValidation";
import { useCamera } from "../hooks/useCamera";
import { Card, OutlineButton, GoldButton, fmtDur } from "../components/ui";
import { EXERCISES } from "../data/exercises";
import type { SessionRow } from "../data/mock";

const KEY_LANDMARKS = [11, 12, 23, 24, 25, 26, 27, 28];
const BUFFER_MS = 10_000;
type Mode = "idle" | "validating" | "working";

export default function WorkoutPage({ exerciseId, name, onFinish, onQuit, onNav, onLogout }: {
  exerciseId: string; name: string;
  onFinish: (r: Omit<SessionRow, "id" | "date">) => void;
  onQuit: () => void; onNav: (s: "home" | "history" | "profile") => void; onLogout: () => void;
}) {
  const ex = EXERCISES.find((e) => e.id === exerciseId)!;
  const isPlank = exerciseId === "plank";
  const { videoRef, status, error, start, stop } = useCamera();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const latestLmsRef = useRef<NormalizedLandmark[] | null>(null);
  const bufferRef = useRef<{ t: number; lms: NormalizedLandmark[]; knee: number; elbow: number; bodyline: number }[]>([]);
  const analyzerRef = useRef(new PostureAnalyzer());
  const repCounterRef = useRef<ReturnType<typeof createRepCounter>>(null);
  const holdStartRef = useRef<number | null>(null);
  const holdSecsRef = useRef(0);
  const modeRef = useRef<Mode>("idle");
  const valTimerRef = useRef<number | null>(null);
  const valPassRef = useRef(0);
  const workerRef = useRef<Worker | null>(null);
  const useWorkerRef = useRef(false);
  const workerBusyRef = useRef(false);
  const startedAtRef = useRef(0);
  const pausedAtRef = useRef(0);
  const pausedTotalRef = useRef(0);
  const pausedRef = useRef(false);
  const lastMsgRef = useRef("");
  const frameIdxRef = useRef(0);

  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [validation, setValidation] = useState<ValidationReport | null>(null);
  const [fps, setFps] = useState(0);
  const [bodyDetected, setBodyDetected] = useState(false);
  const [lowConf, setLowConf] = useState(false);
  const [liveCorrect, setLiveCorrect] = useState(true);
  const [repLog, setRepLog] = useState<{ index: number; correct: boolean; errors: string[] }[]>([]);
  const [holdSeconds, setHoldSeconds] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [feedback, setFeedback] = useState("");

  const setModeBoth = (m: Mode) => { modeRef.current = m; setMode(m); };

  const processLandmarks = useCallback((lms: NormalizedLandmark[] | null) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (lms && lms.length === 33) {
      latestLmsRef.current = lms;
      setBodyDetected(true);
      const analysis = analyzerRef.current.evaluate(exerciseId, lms);
      const knee = calculateAngle(lms[LM.LEFT_HIP], lms[LM.LEFT_KNEE], lms[LM.LEFT_ANKLE]);
      const elbow = calculateAngle(lms[LM.LEFT_SHOULDER], lms[LM.LEFT_ELBOW], lms[LM.LEFT_WRIST]);
      const bodyline = calculateAngle(lms[LM.LEFT_SHOULDER], lms[LM.LEFT_HIP], lms[LM.LEFT_ANKLE]);
      const conf = averageVisibility(lms, KEY_LANDMARKS);
      const movementAngle = exerciseId === "pushup" ? elbow : knee;

      if (modeRef.current === "working" && !pausedRef.current) {
        const rep = repCounterRef.current?.update(movementAngle, analysis.errors);
        if (rep) setRepLog((p) => [...p, { index: rep.repIndex, correct: rep.correct, errors: rep.errors.map((e) => e.errorType) }]);
        if (isPlank) {
          if (analysis.isCorrect) holdStartRef.current ??= performance.now(); else holdStartRef.current = null;
          const s = holdStartRef.current ? Math.floor((performance.now() - holdStartRef.current) / 1000) : 0;
          if (s !== holdSecsRef.current) { holdSecsRef.current = s; setHoldSeconds(s); }
        }
      }

      const msg = analysis.errors[0]?.message ?? "";
      if (msg !== lastMsgRef.current) { lastMsgRef.current = msg; setFeedback(msg); }

      drawSkeleton(ctx, lms, canvas.width, canvas.height, analysis.isCorrect ? "#438459" : "#B54C3D");

      frameIdxRef.current++;
      if (frameIdxRef.current % 5 === 0) {
        setLiveCorrect(analysis.isCorrect);
        setLowConfidenceSafe(conf);
      }

      bufferRef.current.push({ t: performance.now(), lms, knee, elbow, bodyline });
      const cut = performance.now() - BUFFER_MS;
      while (bufferRef.current.length && bufferRef.current[0].t < cut) bufferRef.current.shift();
    } else {
      latestLmsRef.current = null;
      holdStartRef.current = null;
      setBodyDetected((p) => (p ? false : p));
    }
  }, [exerciseId, isPlank]);

  const processLmsRef = useRef(processLandmarks);
  useEffect(() => { processLmsRef.current = processLandmarks; }, [processLandmarks]);
  function setLowConfidenceSafe(conf: number) { setLowConf((p) => (p ? conf < 0.55 : conf < 0.45)); }

  const startPipeline = useCallback(async () => {
    await start();
    repCounterRef.current = createRepCounter(exerciseId);
    holdStartRef.current = null; holdSecsRef.current = 0;
    setRepLog([]); setHoldSeconds(0); bufferRef.current = [];
    startedAtRef.current = performance.now(); pausedTotalRef.current = 0;

    let landmarker: PoseLandmarker | null = null;
    try {
      await new Promise<void>((res, rej) => {
        const to = setTimeout(() => rej(new Error("timeout")), 15_000);
        const w = createPoseWorker(); workerRef.current = w;
        w.onmessage = (e: MessageEvent) => {
          const d = e.data;
          if (d.type === "ready") { clearTimeout(to); res(); }
          else if (d.type === "error") { clearTimeout(to); rej(new Error(String(d.message))); }
          else if (d.type === "landmarks") {
            workerBusyRef.current = false;
            processLmsRef.current((d.payload ?? null) as NormalizedLandmark[] | null);
          }
        };
        w.onerror = (ev) => { clearTimeout(to); rej(new Error(ev.message || "worker")); };
        w.postMessage({ type: "init", wasmUrl: WORKER_WASM_URL, modelUrl: WORKER_MODEL_URL });
      });
      useWorkerRef.current = true;
    } catch {
      if (workerRef.current) { workerRef.current.terminate(); workerRef.current = null; }
      useWorkerRef.current = false;
      landmarker = await getPoseLandmarker();
    }

    setModeBoth("validating"); valPassRef.current = 0;
    if (valTimerRef.current) clearInterval(valTimerRef.current);
    valTimerRef.current = window.setInterval(() => {
      const report = validateCameraFrame(latestLmsRef.current);
      setValidation((prev) => {
        const same = prev?.allOk === report.allOk && prev?.checks.every((c, i) => c.ok === report.checks[i]?.ok);
        return same ? prev : report;
      });
      if (report.allOk) { valPassRef.current++;
        if (valPassRef.current >= 3) { if (valTimerRef.current) clearInterval(valTimerRef.current); setModeBoth("working"); } }
      else valPassRef.current = 0;
    }, 400);

    let lastVideoTime = -1, frames = 0, fpsStart = performance.now();

    const loop = () => {
      const video = videoRef.current, canvas = canvasRef.current;
      if (!video || !canvas) return;
      if (video.videoWidth > 0 && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      }
      if (modeRef.current === "working" && !pausedRef.current) {
        const s = Math.floor((performance.now() - startedAtRef.current - pausedTotalRef.current) / 1000);
        setElapsed(s);
      }

      if (video.readyState >= 2 && video.currentTime !== lastVideoTime && !pausedRef.current) {
        lastVideoTime = video.currentTime;

        if (useWorkerRef.current && workerRef.current && !workerBusyRef.current) {
          workerBusyRef.current = true;
          createImageBitmap(video).then((b) => workerRef.current?.postMessage(
            { type: "detect", bitmap: b, timestamp: performance.now(), videoTime: lastVideoTime }, [b])).catch(() => { workerBusyRef.current = false; });
        } else if (landmarker) {
          const result = landmarker.detectForVideo(video, performance.now());
          processLmsRef.current((result.landmarks?.[0] ?? null) as NormalizedLandmark[] | null);
        }
      }

      frames++; const now = performance.now();
      if (now - fpsStart >= 1000) { setFps(Math.round((frames * 1000) / (now - fpsStart))); frames = 0; fpsStart = now; }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    setRunning(true);
  }, [exerciseId, start, videoRef]);

  useEffect(() => { startPipeline(); return () => { cancelAnimationFrame(rafRef.current); workerRef.current?.terminate(); }; }, []);

  const togglePause = () => {
    const video = videoRef.current;
    if (!pausedRef.current) {
      pausedAtRef.current = performance.now();
      pausedRef.current = true;
      video?.pause();
      setPaused(true);
    } else {
      pausedTotalRef.current += performance.now() - pausedAtRef.current;
      pausedRef.current = false;
      video?.play();
      setPaused(false);
    }
  };

  const stopWorkout = () => {
    cancelAnimationFrame(rafRef.current); workerRef.current?.terminate();
    if (valTimerRef.current) clearInterval(valTimerRef.current);
    stop();
    const total = isPlank ? 1 : repLog.length;
    const correct = isPlank ? (holdSeconds > 0 ? 1 : 0) : repLog.filter((r) => r.correct).length;
    onFinish({
      exerciseId, durationSec: elapsed, total, correct, incorrect: total - correct,
      accuracy: total ? Math.round((correct / total) * 100) : 0,
      reps: isPlank ? [{ index: 1, correct: correct === 1 }] : repLog.map((r) => ({ index: r.index, correct: r.correct })),
      errors: [...new Set(repLog.flatMap((r) => r.errors))].map((e) => ({ label: e, count: repLog.filter((r) => r.errors.includes(e)).length })),
    });
  };

  const snapshot = () => {
    const label = window.prompt("Nhãn mock (vd: squat_correct_bottom):"); if (!label) return;
    const buf = bufferRef.current; if (!buf.length) return;
    let chosen = buf[buf.length - 1];
    if (label.startsWith("squat")) chosen = buf.reduce((a, b) => (b.knee < a.knee ? b : a));
    else if (label.startsWith("pushup")) chosen = buf.reduce((a, b) => (b.elbow < a.elbow ? b : a));
    else if (label.startsWith("plank")) chosen = buf.reduce((a, b) => (b.bodyline < a.bodyline ? b : a));
    downloadMock(chosen.lms, label, name.split(" ")[0].toLowerCase() || "member1");
  };

  const total = isPlank ? 1 : repLog.length;
  const correct = isPlank ? (holdSeconds > 0 ? 1 : 0) : repLog.filter((r) => r.correct).length;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-cream p-6">
      <main className="mx-auto max-w-5xl">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 border-b border-tan px-5 py-3">
            <span className="text-gold">〰</span>
            <h1 className="font-bold text-charcoal">{ex.name} - Live Workout</h1>
            <span className="ml-auto rounded bg-black/60 px-2 py-0.5 font-mono text-xs text-white">FPS: {fps}</span>
          </div>

          <div className="grid gap-5 p-5 lg:grid-cols-[1fr_260px]">
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-xl border border-tan bg-black">
                <video ref={videoRef} playsInline muted className="w-full -scale-x-100" />
                <canvas ref={canvasRef} className="absolute inset-0 h-full w-full -scale-x-100" />

                <div className="absolute left-3 top-3 rounded bg-black/60 px-2 py-1 text-xs text-white">
                  📷 Camera + skeleton overlay (Canvas)
                </div>
                {mode === "working" && bodyDetected && (
                  <div className={`absolute right-3 top-3 rounded px-3 py-1 text-xs font-bold text-white ${liveCorrect ? "bg-success" : "bg-error"}`}>
                    {liveCorrect ? "CORRECT" : "INCORRECT"}
                  </div>
                )}
                {mode === "working" && !bodyDetected && (
                  <div className="absolute inset-x-0 top-0 bg-warning/90 px-3 py-2 text-center text-sm font-semibold text-white">
                    Body not detected — Step back so your whole body is visible
                  </div>
                )}
                {lowConf && (
                  <div className="absolute inset-x-3 top-12 rounded-lg bg-warning/85 px-3 py-2 text-center text-sm font-medium text-white">
                    ⚠️ Please adjust position — landmark not reliable
                  </div>
                )}
                {paused && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xl font-bold text-white">PAUSED</div>
                )}

                {status === "denied" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error text-xl font-bold text-white">!</div>
                    <p className="font-bold text-white">Camera access denied</p>
                    <p className="max-w-xs text-xs text-white/70">AIFit needs your camera to analyze your posture. Allow camera access in your browser settings, then try again.</p>
                    <GoldButton onClick={startPipeline}>Try again</GoldButton>
                    <button onClick={onQuit} className="text-xs font-semibold text-gold">‹ Back to exercises</button>
                  </div>
                )}
                {status === "error" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/75">
                    <p className="text-sm text-error">Camera error: {error}</p>
                    <GoldButton onClick={startPipeline}>Try again</GoldButton>
                  </div>
                )}

                {mode === "validating" && validation && status === "ready" && (
                  <div className="absolute inset-x-3 bottom-3 rounded-lg bg-black/85 p-3 text-sm">
                    <p className="mb-1 font-semibold text-white">📷 Kiểm tra camera trước khi tập…</p>
                    <ul className="space-y-0.5">
                      {validation.checks.map((c) => (
                        <li key={c.id} className={c.ok ? "text-success-tint" : "text-error-tint"}>{c.ok ? "✓" : "✗"} {c.label}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${feedback ? "bg-gold-tint text-charcoal" : "bg-gold-tint/50 text-muted"}`}>
                🔊 {feedback || "Waiting for movement…"}
              </div>

              <div className="flex gap-3">
                <OutlineButton onClick={togglePause} disabled={mode !== "working"}>{paused ? "Resume" : "Pause"}</OutlineButton>
                <OutlineButton onClick={() => setVoiceOn(!voiceOn)}>Voice: {voiceOn ? "On" : "Off"}</OutlineButton>
                <button onClick={stopWorkout} disabled={mode !== "working"}
                  className="rounded-lg bg-error px-5 py-2.5 font-semibold text-white hover:opacity-90 disabled:opacity-50">Stop</button>
                <button onClick={snapshot} className="ml-auto rounded border border-tan px-2 py-1 text-xs text-muted" title="Phase 5 mock collection">📸 Mock</button>
              </div>
            </div>

            <div className="space-y-3">
              {isPlank ? (
                <Card className="p-4 text-center"><div className="text-xs uppercase text-muted">Hold</div><div className="text-5xl font-bold text-gold">{holdSeconds}s</div></Card>
              ) : (
                <Card className="p-4 text-center"><div className="text-xs uppercase text-muted">Reps</div><div className="text-5xl font-bold text-charcoal">{total}</div></Card>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-success-tint p-3 text-center">
                  <div className="text-[11px] uppercase text-success">{isPlank ? "Correct hold" : "Correct"}</div>
                  <div className="text-2xl font-bold text-success">{correct}</div>
                </div>
                <div className="rounded-xl bg-error-tint p-3 text-center">
                  <div className="text-[11px] uppercase text-error">{isPlank ? "Broken hold" : "Incorrect"}</div>
                  <div className="text-2xl font-bold text-error">{total - correct}</div>
                </div>
              </div>
              <Card className="p-4 text-center"><div className="text-xs uppercase text-muted">Accuracy</div><div className="text-3xl font-bold text-gold">{accuracy}%</div></Card>
              <Card className="p-4 text-center"><div className="text-xs uppercase text-muted">Time</div><div className="text-3xl font-bold text-charcoal">{fmtDur(elapsed)}</div></Card>
            </div>
          </div>
        </Card>
        <button onClick={onQuit} className="mt-3 text-xs text-muted hover:text-gold">← Cancel workout</button>
      </main>
    </div>
  );
}