import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "../../components/AdminLayout";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { TextField, SelectField } from "../../components/FormField";
import {
  getExerciseRuleById,
  createExerciseRule,
  updateExerciseRule,
  type ExerciseRuleInput,
} from "../../services/exerciseService";
import { EXERCISE_META, EXERCISE_IDS } from "../../lib/exerciseMeta";
import type { ExerciseId } from "../../ai/evaluators/types";

const EMPTY_FORM: ExerciseRuleInput = {
  exercise: "squat",
  jointSetPhase: "",
  metric: "",
  min: null,
  max: null,
  classification: "error",
  label: "",
  voiceMessage: "",
  reference: "",
};

/**
 * IDD UI-14 "Add / Edit Rule": one row of the ExerciseRules table (Proposal
 * 5.4) - the metric/range an Admin calibrates, plus the label and voice
 * message shown/spoken when a frame matches it (Proposal 5.5 Decision Logic).
 */
export function AddEditRulePage() {
  const { ruleId } = useParams<{ ruleId: string }>();
  const navigate = useNavigate();
  const isEdit = !!ruleId;

  const [form, setForm] = useState<ExerciseRuleInput>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ruleId) return;
    getExerciseRuleById(ruleId)
      .then((rule) => {
        if (!rule) {
          setError("Rule not found.");
          return;
        }
        setForm({
          exercise: rule.exercise,
          jointSetPhase: rule.jointSetPhase,
          metric: rule.metric,
          min: rule.min,
          max: rule.max,
          classification: rule.classification,
          label: rule.label,
          voiceMessage: rule.voiceMessage ?? "",
          reference: rule.reference,
        });
      })
      .finally(() => setLoading(false));
  }, [ruleId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: ExerciseRuleInput = { ...form, voiceMessage: form.voiceMessage || null };
      if (isEdit && ruleId) {
        await updateExerciseRule(ruleId, payload);
      } else {
        await createExerciseRule(payload);
      }
      navigate("/admin/rules");
    } catch {
      setError("Could not save this rule. Check the fields and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title={isEdit ? "Edit Rule" : "New Rule"}>
      <Card className="max-w-2xl">
        {loading ? (
          <p className="text-sm text-muted">Loading rule...</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField
                label="Exercise"
                value={form.exercise}
                onChange={(e) => setForm({ ...form, exercise: e.target.value as ExerciseId })}
                options={EXERCISE_IDS.map((id) => ({ value: id, label: EXERCISE_META[id].name }))}
              />
              <TextField
                label="Joint set / phase"
                required
                placeholder="e.g. Hip-Knee-Ankle, descending"
                value={form.jointSetPhase}
                onChange={(e) => setForm({ ...form, jointSetPhase: e.target.value })}
              />
              <TextField
                label="Metric key"
                required
                placeholder="e.g. kneeFlexionDepth"
                hint="Must match a metric name produced by the matching evaluator."
                value={form.metric}
                onChange={(e) => setForm({ ...form, metric: e.target.value })}
              />
              <SelectField
                label="Classification"
                value={form.classification}
                onChange={(e) => setForm({ ...form, classification: e.target.value as "correct" | "error" })}
                options={[
                  { value: "correct", label: "Correct" },
                  { value: "error", label: "Error" },
                ]}
              />
              <TextField
                label="Min (degrees)"
                type="number"
                placeholder="No lower bound"
                value={form.min ?? ""}
                onChange={(e) => setForm({ ...form, min: e.target.value === "" ? null : Number(e.target.value) })}
              />
              <TextField
                label="Max (degrees)"
                type="number"
                placeholder="No upper bound"
                value={form.max ?? ""}
                onChange={(e) => setForm({ ...form, max: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </div>

            <TextField
              label="Feedback label"
              required
              placeholder="e.g. Knees caving in"
              hint="Shown on UI-05's feedback bar and in UI-06's error breakdown."
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
            <TextField
              label="Voice message"
              placeholder="e.g. Push your knees out"
              hint="Spoken aloud when this rule matches, if voice feedback is on. Leave blank for silent rules."
              value={form.voiceMessage ?? ""}
              onChange={(e) => setForm({ ...form, voiceMessage: e.target.value })}
            />
            <TextField
              label="Reference"
              placeholder="e.g. Proposal 5.4, row 3"
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
            />

            {error && <p className="text-sm font-medium text-danger">{error}</p>}

            <div className="mt-2 flex justify-end gap-3">
              <Link to="/admin/rules">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save rule"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </AdminLayout>
  );
}
