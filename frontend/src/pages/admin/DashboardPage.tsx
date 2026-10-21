import AdminShell from "../../components/AdminShell";
import { Card, StatCard, OutlineButton } from "../../components/ui";
import { MOCK_DETECTION_QUALITY, MOCK_LOGS } from "../../data/mock";

export default function DashboardPage({ onNav, onLogout }: { onNav: (s: string) => void; onLogout: () => void }) {
  const days = [18, 24, 20, 31, 28, 35, 30];
  return (
    <AdminShell active="admin-dashboard" title="Dashboard" onNav={onNav} onLogout={onLogout}>
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total users" value={128} /><StatCard label="Sessions (7 days)" value={342} />
        <StatCard label="Avg. accuracy" value="81%" tone="gold" /><StatCard label="System errors (24h)" value={6} tone="error" />
      </div>
      <div className="flex justify-end"><OutlineButton className="text-xs">Export report</OutlineButton></div>
      <div className="grid grid-cols-2 gap-5">
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-bold text-charcoal">Workout sessions per day</h2>
          <div className="flex h-32 items-end gap-2">
            {days.map((v, i) => <div key={i} className="flex-1 rounded-t bg-gold" style={{ height: `${v * 2.5}px` }} />)}
          </div>
        </Card>
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-bold text-charcoal">Detection quality</h2>
          <table className="w-full text-xs"><thead><tr className="text-left text-muted">
            {["Exercise", "Avg. visibility", "Avg. FPS", "Body-lost"].map((h) => <th key={h} className="pb-2">{h}</th>)}</tr></thead>
            <tbody>{MOCK_DETECTION_QUALITY.map((r) => (
              <tr key={r.exercise} className="border-t border-tan/50"><td className="py-1.5">{r.exercise}</td><td>{r.avgVis}</td><td>{r.avgFps}</td><td>{r.bodyLost}</td></tr>))}</tbody></table>
        </Card>
      </div>
      <Card className="p-4">
        <h2 className="mb-3 text-sm font-bold text-charcoal">Recent system errors</h2>
        <table className="w-full text-xs"><thead><tr className="text-left text-muted">
          {["Time", "Type", "Message"].map((h) => <th key={h} className="pb-2">{h}</th>)}</tr></thead>
          <tbody>{MOCK_LOGS.slice(0, 3).map((l, i) => (
            <tr key={i} className="border-t border-tan/50"><td className="py-1.5">{l.time}</td><td>{l.type}</td><td>{l.message}</td></tr>))}</tbody></table>
      </Card>
    </AdminShell>
  );
}