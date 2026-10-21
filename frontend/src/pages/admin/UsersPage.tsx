import { useState } from "react";
import AdminShell from "../../components/AdminShell";
import { Card, GoldButton } from "../../components/ui";
import { MOCK_USERS } from "../../data/mock";

export default function UsersPage({ onNav, onLogout }: { onNav: (s: string) => void; onLogout: () => void }) {
  const [q, setQ] = useState(""); const [role, setRole] = useState("all");
  const rows = MOCK_USERS.filter((u) =>
    (role === "all" || u.role === role) && (u.name + u.email).toLowerCase().includes(q.toLowerCase()));
  return (
    <AdminShell active="admin-users" title="Users" onNav={onNav} onLogout={onLogout}>
      <div className="flex items-center gap-3">
        <input placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)}
          className="rounded-lg border border-tan px-3 py-2 text-sm" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border border-tan px-3 py-2 text-sm">
          <option value="all">All roles</option><option>Trainee</option><option>Admin</option>
        </select>
        <GoldButton className="ml-auto">Add user</GoldButton>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-charcoal text-left text-xs uppercase text-cream">
            {["No.", "Full name", "Email", "Role", "Created", "Action"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
          <tbody>{rows.map((u, i) => (
            <tr key={u.id} className="border-b border-tan/50">
              <td className="px-3 py-2">{i + 1}</td><td className="px-3 py-2">{u.name}</td><td className="px-3 py-2">{u.email}</td>
              <td className="px-3 py-2">{u.role}</td><td className="px-3 py-2">{u.created}</td>
              <td className="space-x-2 px-3 py-2">
                <button className="rounded border border-gold px-2 py-0.5 text-xs text-gold">Edit</button>
                <button className="rounded bg-error-tint px-2 py-0.5 text-xs text-error">Delete</button>
              </td>
            </tr>))}</tbody>
        </table>
        <div className="p-3 text-right text-xs text-muted">‹ 1 2 3 ›</div>
      </Card>
    </AdminShell>
  );
}