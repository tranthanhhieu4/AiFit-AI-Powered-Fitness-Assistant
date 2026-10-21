interface StatCardProps {
  label: string;
  value: string | number;
  tone?: "default" | "success" | "danger" | "gold";
}

const TONE_CLASSES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-white border-border text-ink",
  success: "bg-success-light border-success text-success",
  danger: "bg-danger-light border-danger text-danger",
  gold: "bg-white border-border text-gold",
};

/** Reusable stat tile used across UI-05, UI-06, UI-07, UI-10. */
export function StatCard({ label, value, tone = "default" }: StatCardProps) {
  return (
    <div className={`rounded-card border p-4 ${TONE_CLASSES[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
