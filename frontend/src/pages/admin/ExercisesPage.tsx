import { useState } from "react";
import AdminShell from "../../components/AdminShell";
import { Card, Field, GoldButton, OutlineButton } from "../../components/ui";
import { EXERCISES } from "../../data/exercises";

export default function ExercisesPage({ onNav, onLogout }: { onNav: (s: string) => void; onLogout: () => void }) {
  const [rows, setRows] = useState(EXERCISES.map((e) => ({ ...e, active: true })));
  const [form, setForm] = useState({ name: "", jointSet: "", description: "", status: "Active" });
  const toggle = (id: string) => setRows((p) => p.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
  return (
    <AdminShell active="admin-exercises" title="Exercises" onNav={onNav} onLogout={onLogout}>
      <div className="flex justify-end"><GoldButton>Add exercise</GoldButton></div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-charcoal text-left text-xs uppercase text-cream">
            {["No.", "Exercise", "Description", "Joint set", "Status", "Action"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={r.id} className="border-b border-tan/50">
              <td className="px-3 py-2">{i + 1}</td><td className="px-3 py-2 font-semibold">{r.name}</td>
              <td className="px-3 py-2">{r.description}</td><td className="px-3 py-2">{r.jointSet}</td>
              <td className="px-3 py-2">
                <button onClick={() => toggle(r.id)} className={`h-5 w-10 rounded-full p-0.5 ${r.active ? "bg-success" : "bg-tan"}`}>
                  <div className={`h-4 w-4 rounded-full bg-white transition ${r.active ? "translate-x-5" : ""}`} />
                </button>
              </td>
              <td className="space-x-2 px-3 py-2">
                <button className="rounded border border-gold px-2 py-0.5 text-xs text-gold">Edit</button>
                <button className="rounded bg-error-tint px-2 py-0.5 text-xs text-error">Delete</button>
              </td>
            </tr>))}</tbody>
        </table>
      </Card>
      <Card className="p-5">
        <h2 className="mb-3 text-sm font-bold text-charcoal">Add / Edit exercise</h2>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Exercise name" placeholder="e.g. Squat" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Field label="Joint set" placeholder="e.g. Hip › Knee › Ankle" value={form.jointSet} onChange={(e) => setForm({ ...form, jointSet: e.target.value })} />
          <label className="block"><span className="mb-1 block text-xs font-semibold text-charcoal">Status</span>
            <select className="w-full rounded-lg border border-tan px-3 py-2 text-sm"><option>Active</option><option>Inactive</option></select></label>
        </div>
        <Field label="Description" className="mt-3" placeholder="Short description of the exercise" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="mt-3 flex gap-3"><GoldButton>Save</GoldButton><OutlineButton>Cancel</OutlineButton></div>
      </Card>
    </AdminShell>
  );
}