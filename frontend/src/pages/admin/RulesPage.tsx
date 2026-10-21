import { useState } from "react";
import AdminShell from "../../components/AdminShell";
import { Card, Field, GoldButton, OutlineButton } from "../../components/ui";
import { EXERCISES } from "../../data/exercises";

const SEED = [
  { ex: "Squat", joint: "Hip › Knee › Ankle", metric: "Trunk-tibia angle", range: "-10° to +10°", label: "Neutral bias (normal)", ref: "3.1", type: "Correct" },
  { ex: "Squat", joint: "Hip › Knee › Ankle", metric: "Knee-flexion depth", range: "90° - 110°", label: "Medium depth (target)", ref: "3.3", type: "Correct" },
  { ex: "Squat", joint: "Hip › Knee › Ankle", metric: "Knee-flexion depth", range: "0° - 90°", label: "Shallow depth (error)", ref: "3.3", type: "Error" },
  { ex: "Plank", joint: "Shoulder › Hip › Ankle", metric: "Body alignment", range: "165° - 180°", label: "Correct posture", ref: "3.4", type: "Correct" },
  { ex: "Plank", joint: "Shoulder › Hip › Ankle", metric: "Body alignment", range: "< 165°", label: "Hips sagging", ref: "3.4", type: "Error" },
  { ex: "Push-up", joint: "Shoulder › Elbow › Wrist", metric: "Elbow-flexion ROM", range: "180° → ≤ 90°", label: "Valid repetition", ref: "3.5", type: "Correct" },
  { ex: "Push-up", joint: "Torso › Shoulder › Elbow", metric: "Elbow-flare angle", range: "> 75° - 90°", label: "Excessive elbow flare", ref: "3.5", type: "Error" },
];

export default function RulesPage({ onNav, onLogout }: { onNav: (s: string) => void; onLogout: () => void }) {
  const [rules, setRules] = useState(SEED);
  const [editing, setEditing] = useState<typeof SEED[0] | null>(null);
  const [form, setForm] = useState({ ex: "Squat", joint: "", metric: "", min: "", max: "", type: "Error", ref: "3.3", label: "", voice: "" });
  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  return (
    <AdminShell active="admin-rules" title="Exercise Rules" onNav={onNav} onLogout={onLogout}>
      <div className="flex items-center justify-between">
        <select className="rounded-lg border border-tan px-3 py-2 text-sm"><option>All exercises</option>{EXERCISES.map((e) => <option key={e.id}>{e.name}</option>)}</select>
        <GoldButton onClick={() => { setEditing(null); setForm({ ...form, label: "", voice: "" }); }}>Add rule</GoldButton>
      </div>

      {editing === null && (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-charcoal text-left text-xs uppercase text-cream">
              {["Exercise", "Joint set / phase", "Metric", "Threshold", "Label / classification", "Ref", "Action"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
            <tbody>{rules.map((r, i) => (
              <tr key={i} className="border-b border-tan/50">
                <td className="px-3 py-2">{r.ex}</td><td className="px-3 py-2">{r.joint}</td><td className="px-3 py-2">{r.metric}</td>
                <td className="px-3 py-2">{r.range}</td><td className="px-3 py-2">{r.label}</td><td className="px-3 py-2">{r.ref}</td>
                <td className="space-x-2 px-3 py-2">
                  <button onClick={() => { setEditing(r); setForm({ ...form, ex: r.ex, joint: r.joint, metric: r.metric, label: r.label, ref: r.ref, type: r.type }); }}
                    className="rounded border border-gold px-2 py-0.5 text-xs text-gold">Edit</button>
                  <button className="rounded bg-error-tint px-2 py-0.5 text-xs text-error">Delete</button>
                </td>
              </tr>))}</tbody>
          </table>
          <p className="p-3 text-[11px] text-muted">Rules are loaded by the client at workout start; each angle is compared frame-by-frame against the active version.</p>
        </Card>
      )}

      {editing !== null && (
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-bold text-charcoal">Add / Edit rule</h2>
          <div className="grid grid-cols-3 gap-3">
            <label className="block"><span className="mb-1 block text-xs font-semibold text-charcoal">Exercise</span>
              <select value={form.ex} onChange={set("ex")} className="w-full rounded-lg border border-tan px-3 py-2 text-sm">{EXERCISES.map((e) => <option key={e.id}>{e.name}</option>)}</select></label>
            <Field label="Joint set / phase" placeholder="e.g. Hip › Knee › Ankle" value={form.joint} onChange={set("joint")} />
            <Field label="Metric" placeholder="e.g. Knee-flexion depth" value={form.metric} onChange={set("metric")} />
            <Field label="Min angle" type="number" value={form.min} onChange={set("min")} />
            <Field label="Max angle" type="number" value={form.max} onChange={set("max")} />
            <label className="block"><span className="mb-1 block text-xs font-semibold text-charcoal">Rule type</span>
              <select value={form.type} onChange={set("type")} className="w-full rounded-lg border border-tan px-3 py-2 text-sm"><option>Correct</option><option>Error</option></select></label>
            <Field label="Reference no." value={form.ref} onChange={set("ref")} />
          </div>
          <Field label="Classification / error label" className="mt-3" placeholder="e.g. Shallow depth" value={form.label} onChange={set("label")} />
          <Field label="Voice alert message" className="mt-3" placeholder="e.g. Lower your hips" value={form.voice} onChange={set("voice")} />
          <p className="mt-2 text-[11px] text-muted">A frame is Correct when theta falls inside the range; otherwise the error label is shown on screen and the alert message is spoken (with cooldown).</p>
          <div className="mt-3 flex gap-3">
            <GoldButton onClick={() => {
              setRules((p) => editing ? p.map((r, i) => (i === p.indexOf(editing) ? { ...form, range: `${form.min}° - ${form.max}°` } as any : r)) : [...p, { ...form, range: `${form.min}° - ${form.max}°` } as any]);
              setEditing(null);
            }}>Save</GoldButton>
            <OutlineButton onClick={() => setEditing(null)}>Cancel</OutlineButton>
          </div>
        </Card>
      )}
    </AdminShell>
  );
}