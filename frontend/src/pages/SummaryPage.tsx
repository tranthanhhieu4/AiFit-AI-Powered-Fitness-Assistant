import TraineeNav from "../components/TraineeNav";
import { Card, StatCard, GoldButton, OutlineButton, fmtDate, fmtDur } from "../components/ui";
import { EXERCISES } from "../data/exercises";
import type { SessionRow } from "../data/mock";

export default function SummaryPage({ session, name, onNav, onAgain, onLogout }: {
  session: SessionRow; name: string;
  onNav: (s: "home" | "history" | "profile") => void;
  onAgain: (exerciseId: string) => void; onLogout: () => void;
}) {
  const ex = EXERCISES.find((e) => e.id === session.exerciseId)!;
  return (
    <div className="min-h-screen bg-cream">
      <TraineeNav active="home" name={name} onNav={onNav} onLogout={onLogout} />
      <main className="mx-auto max-w-5xl space-y-5 p-6">
        <div>
          <h1 className="text-xl font-bold text-charcoal">Workout Summary - {ex.name}</h1>
          <p className="text-xs text-muted">{fmtDate(session.date)}</p>
        </div>

        <div className="grid grid-cols-5 gap-3">
         <StatCard label="Duration" value={fmtDur(session.durationSec)} />
         <StatCard label="Total reps" value={session.total} />
         <StatCard label="Correct" value={session.correct} tone="success" />
         <StatCard label="Incorrect" value={session.incorrect} tone="error" />
          <StatCard label="Accuracy" value={`${session.accuracy}%`} tone="gold" big />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-bold text-charcoal">Detected errors</h2>
            {session.errors.length === 0
              ? <p className="text-sm text-success">Perfect form — no errors detected. 💪</p>
              : session.errors.map((e) => (
                <div key={e.label} className="mb-2">
                  <div className="flex justify-between text-xs text-charcoal"><span>{e.label}</span><span>{e.count}</span></div>
                  <div className="h-2 rounded bg-error-tint"><div className="h-2 rounded bg-error" style={{ width: `${Math.min(100, e.count * 20)}%` }} /></div>
                </div>))}
            <p className="mt-3 text-[11px] text-muted">Errors are per-session (validated reps).</p>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-bold text-charcoal">Repetitions (correct / incorrect)</h2>
            <div className="flex items-end gap-1.5">
              {session.reps.map((r) => (
                <div key={r.index} className="flex-1 text-center">
                  <div className={`w-full rounded-t ${r.correct ? "bg-success" : "bg-error"}`} style={{ height: `${40 + r.index * 3}px` }} />
                  <div className="text-[9px] text-muted">{r.index}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex items-center gap-2 text-xs text-success">🟢 Session saved locally — backend sync coming in Phase 3</div>

        <div className="flex justify-end gap-3">
          <GoldButton onClick={() => onAgain(session.exerciseId)}>Workout Again</GoldButton>
          <OutlineButton onClick={() => onNav("history")}>View History</OutlineButton>
        </div>
      </main>
    </div>
  );
}