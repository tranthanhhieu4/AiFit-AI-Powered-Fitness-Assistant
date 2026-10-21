import { useEffect, useState, type FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Table, Th, Td } from "../../components/table";
import { TextField } from "../../components/FormField";
import { Toggle } from "../../components/Toggle";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import {
  listExercises,
  createExercise,
  updateExercise,
  deleteExercise,
  type ExerciseSummary,
  type ExerciseInput,
} from "../../services/exerciseService";
import type { ExerciseId } from "../../ai/evaluators/types";

const EMPTY_FORM: ExerciseInput = { name: "", jointSet: "", description: "", active: true };

/**
 * IDD UI-12 "Manage Exercises": the catalog of supported exercises - name,
 * tracked joint set, description and an Active/Inactive toggle (which
 * controls whether it appears on UI-03 Home).
 */
export function ManageExercisesPage() {
  const [exercises, setExercises] = useState<ExerciseSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExerciseSummary | null>(null);
  const [form, setForm] = useState<ExerciseInput>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<ExerciseSummary | null>(null);

  const load = () => {
    setLoading(true);
    listExercises()
      .then(setExercises)
      .catch(() => setExercises([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (ex: ExerciseSummary) => {
    setEditing(ex);
    setForm({ name: ex.name, jointSet: ex.jointSet, description: ex.description, active: ex.active });
    setFormError(null);
    setFormOpen(true);
  };

  const handleToggleActive = async (ex: ExerciseSummary) => {
    setExercises((prev) => prev.map((e) => (e.id === ex.id ? { ...e, active: !e.active } : e)));
    try {
      await updateExercise(ex.id, { active: !ex.active });
    } catch {
      load(); // revert on failure
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await updateExercise(editing.id, form);
      } else {
        await createExercise(form);
      }
      setFormOpen(false);
      load();
    } catch {
      setFormError("Could not save this exercise.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteExercise(pendingDelete.id as ExerciseId);
      load();
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <AdminLayout title="Manage Exercises" action={<Button onClick={openCreate}>+ New exercise</Button>}>
      <Card>
        {loading ? (
          <p className="text-sm text-muted">Loading exercises...</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Joint set</Th>
                <Th>Description</Th>
                <Th>Active</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((ex) => (
                <tr key={ex.id}>
                  <Td className="font-medium">{ex.name}</Td>
                  <Td>{ex.jointSet}</Td>
                  <Td className="max-w-xs text-muted">{ex.description}</Td>
                  <Td>
                    <Toggle checked={ex.active} onChange={() => handleToggleActive(ex)} label={`${ex.name} active`} />
                  </Td>
                  <Td>
                    <div className="flex gap-3">
                      <button className="font-semibold text-gold" onClick={() => openEdit(ex)}>
                        Edit
                      </button>
                      <button className="font-semibold text-danger" onClick={() => setPendingDelete(ex)}>
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

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-card border border-border bg-white p-6">
            <h3 className="text-lg font-bold">{editing ? "Edit exercise" : "New exercise"}</h3>
            <div className="mt-4 flex flex-col gap-3">
              <TextField label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <TextField
                label="Joint set"
                required
                placeholder="e.g. Hip > Knee > Ankle"
                value={form.jointSet}
                onChange={(e) => setForm({ ...form, jointSet: e.target.value })}
              />
              <TextField
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-medium text-muted">Active</span>
                <Toggle checked={form.active} onChange={(next) => setForm({ ...form, active: next })} />
              </div>
            </div>
            {formError && <p className="mt-3 text-sm font-medium text-danger">{formError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete exercise"
        message={`Remove ${pendingDelete?.name ?? "this exercise"}? Existing session history is kept, but it will no longer appear for trainees.`}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </AdminLayout>
  );
}
