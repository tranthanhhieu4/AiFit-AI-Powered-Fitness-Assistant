import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/AdminLayout";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Table, Th, Td } from "../../components/table";
import { SelectField } from "../../components/FormField";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { listAllExerciseRules, deleteExerciseRule } from "../../services/exerciseService";
import { EXERCISE_META, EXERCISE_IDS } from "../../lib/exerciseMeta";
import type { ExerciseId, ExerciseRule } from "../../ai/evaluators/types";

/**
 * IDD UI-13 "Manage Exercise Rules": the full ExerciseRules reference table
 * (Proposal 5.4) an Admin calibrates without touching code (NFR06). Add/Edit
 * opens UI-14.
 */
export function ManageExerciseRulesPage() {
  const [rules, setRules] = useState<ExerciseRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [exerciseFilter, setExerciseFilter] = useState<ExerciseId | "all">("all");
  const [pendingDelete, setPendingDelete] = useState<ExerciseRule | null>(null);

  const load = () => {
    setLoading(true);
    listAllExerciseRules(exerciseFilter)
      .then(setRules)
      .catch(() => setRules([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [exerciseFilter]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteExerciseRule(pendingDelete.id);
      load();
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <AdminLayout
      title="Manage Exercise Rules"
      action={
        <Link to="/admin/rules/new">
          <Button>+ New rule</Button>
        </Link>
      }
    >
      <Card>
        <div className="mb-4">
          <SelectField
            label=""
            value={exerciseFilter}
            onChange={(e) => setExerciseFilter(e.target.value as ExerciseId | "all")}
            options={[
              { value: "all", label: "All exercises" },
              ...EXERCISE_IDS.map((id) => ({ value: id, label: EXERCISE_META[id].name })),
            ]}
            className="mt-0 w-48"
          />
        </div>

        {loading ? (
          <p className="text-sm text-muted">Loading rules...</p>
        ) : rules.length === 0 ? (
          <p className="text-sm text-muted">No rules for this filter yet.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Exercise</Th>
                <Th>Phase</Th>
                <Th>Metric</Th>
                <Th>Range</Th>
                <Th>Classification</Th>
                <Th>Label</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id}>
                  <Td>{EXERCISE_META[r.exercise]?.name ?? r.exercise}</Td>
                  <Td>{r.jointSetPhase}</Td>
                  <Td className="font-mono text-xs">{r.metric}</Td>
                  <Td className="font-mono text-xs">
                    {r.min ?? "-inf"} .. {r.max ?? "+inf"}
                  </Td>
                  <Td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        r.classification === "correct" ? "bg-success-light text-success" : "bg-danger-light text-danger"
                      }`}
                    >
                      {r.classification}
                    </span>
                  </Td>
                  <Td>{r.label}</Td>
                  <Td>
                    <div className="flex gap-3">
                      <Link to={`/admin/rules/${r.id}/edit`} className="font-semibold text-gold">
                        Edit
                      </Link>
                      <button className="font-semibold text-danger" onClick={() => setPendingDelete(r)}>
                        Delete
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete rule"
        message={`Remove the "${pendingDelete?.label ?? ""}" rule? Trainees using this exercise will stop seeing this check immediately.`}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </AdminLayout>
  );
}
