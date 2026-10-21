import { useState } from "react";
import TraineeNav from "../components/TraineeNav";
import { Card, StatCard, OutlineButton } from "../components/ui";
import { EXERCISES } from "../data/exercises";
import type { SessionRow } from "../data/mock";

function LineChart({ points }: { points: number[] }) {
  if (points.length < 2) return <div className="p-6 text-center text-xs text-muted">Not enough data</div>;
  const w = 300, h = 90;
  const pts = points.map((v, i) => `${(i / (points.length - 1)) * w},${h - ((v - 50) / 50) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <polyline points={pts} fill="none" stroke="#BF8E2D" strokeWidth="2" />
      {points.map((v, i) => <circle key={i} cx={(i / (points.length - 1)) * w} cy={h - ((v - 50) / 50) * h} r="3" fill="#BF8E2D" />)}
    </svg>
  );
}

export default function HistoryPage({ name, sessions, onNav, onView, onLogout }: {
  name: string; sessions: SessionRow[];
  onNav: (s: "home" | "history" | "profile") => void;
  onView: (s: SessionRow) => void; onLogout: () => void;
}) {
  const [exFilter, setExFilter] = useState("all");
  const [period, setPeriod] = useState(30);
  const filtered = sessions.filter((s) =>
    (exFilter === "all" || s.exerciseId === exFilter) &&
    Date.now() - new Date(s.date).getTime() <= period * 86400000);
  const totalReps = filtered.reduce((a, s) => a + s.total, 0);
  const avgAcc = filtered.length ? Math.round(filtered.reduce((a, s) => a + s.accuracy, 0) / filtered.length) : 0;

  return (
    <div className="min-h-screen bg-cream">
      <TraineeNav active="history" name={name} onNav={onNav} onLogout={onLogout} />
      <main className="mx-auto max-w-5xl space-y-5 p-6">
        <div className="flex gap-3">
          <select value={exFilter} onChange={(e) => setExFilter(e.target.value)} className="rounded-lg border border-tan bg-surface px-3 py-2 text-sm">
            <option value="all">All exercises</option>
            {EXERCISES.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <select value={period} onChange={(e) => setPeriod(Number(e.target.value))} className="rounded-lg border border-tan bg-surface px-3 py-2 text-sm">
            <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={3650}>All</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total sessions" value={filtered.length} />
          <StatCard label="Total reps" value={totalReps} />
          <StatCard label="Average accuracy" value={`${avgAcc}%`} tone="gold" />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Card className="p-4"><h2 className="mb-2 text-sm font-bold text-charcoal">Accuracy over time (%)</h2><LineChart points={filtered.map((s) => s.accuracy)} /></Card>
          <Card className="p-4">
            <h2 className="mb-2 text-sm font-bold text-charcoal">Correct vs incorrect reps per session</h2>
            <div className="flex items-end gap-2">
              {filtered.map((s) => (
                <div key={s.id} className="flex w-full flex-col justify-end" style={{ height: 90 }}>
                  <div className="w-full rounded-t bg-error" style={{ height: `${(s.incorrect / Math.max(s.total, 1)) * 100}%` }} />
                  <div className="w-full bg-success" style={{ height: `${(s.correct / Math.max(s.total, 1)) * 100}%` }} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-charcoal text-left text-xs uppercase text-cream">
              {["Date", "Exercise", "Duration", "Reps", "Correct", "Incorrect", "Accuracy", "Action"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-tan/50">
                  <td className="px-3 py-2">{s.date}</td>
                  <td className="px-3 py-2">{EXERCISES.find((e) => e.id === s.exerciseId)?.name}</td>
                  <td className="px-3 py-2">{String(Math.floor(s.durationSec / 60)).padStart(2, "0")}:{String(s.durationSec % 60).padStart(2, "0")}</td>
                  <td className="px-3 py-2">{s.total}</td><td className="px-3 py-2">{s.correct}</td>
                  <td className="px-3 py-2">{s.incorrect}</td><td className="px-3 py-2 font-semibold text-gold">{s.accuracy}%</td>
                  <td className="px-3 py-2"><OutlineButton className="!px-3 !py-1 text-xs" onClick={() => onView(s)}>View</OutlineButton></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </main>
    </div>
  );
}