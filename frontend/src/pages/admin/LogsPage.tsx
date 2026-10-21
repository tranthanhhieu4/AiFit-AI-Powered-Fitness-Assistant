import AdminShell from "../../components/AdminShell";
import { Card, OutlineButton } from "../../components/ui";
import { MOCK_LOGS } from "../../data/mock";

export default function LogsPage({ onNav, onLogout }: { onNav: (s: string) => void; onLogout: () => void }) {
  const exportCsv = () => {
    const csv = ["Time,User,Exercise,Type,Message", ...MOCK_LOGS.map((l) => `${l.time},${l.user},${l.exercise},${l.type},"${l.message}"`)].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "aifit-logs.csv"; a.click();
  };
  return (
    <AdminShell active="admin-logs" title="System Logs" onNav={onNav} onLogout={onLogout}>
      <div className="flex items-center gap-3">
        <select className="rounded-lg border border-tan px-3 py-2 text-sm"><option>Last 7 days</option><option>Last 30 days</option></select>
        <select className="rounded-lg border border-tan px-3 py-2 text-sm"><option>All types</option><option>Camera denied</option><option>Body lost</option><option>Sync failed</option><option>API error</option></select>
        <OutlineButton className="ml-auto text-xs" onClick={exportCsv}>Export logs</OutlineButton>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-charcoal text-left text-xs uppercase text-cream">
            {["Time", "User", "Exercise", "Type", "Message"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
          <tbody>{MOCK_LOGS.map((l, i) => (
            <tr key={i} className="border-b border-tan/50">
              <td className="px-3 py-2">{l.time}</td><td className="px-3 py-2">{l.user}</td>
              <td className="px-3 py-2">{l.exercise}</td><td className="px-3 py-2">{l.type}</td><td className="px-3 py-2">{l.message}</td>
            </tr>))}</tbody>
        </table>
        <div className="p-3 text-right text-xs text-muted">‹ 1 2 3 ›</div>
      </Card>
    </AdminShell>
  );
}