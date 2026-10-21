import type { ReactNode, InputHTMLAttributes, ButtonHTMLAttributes } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-tan bg-surface ${className}`}>{children}</div>;
}

export function StatCard({ label, value, tone = "plain", big = false }: {
  label: string; value: ReactNode; tone?: "plain" | "gold" | "success" | "error"; big?: boolean;
}) {
  const toneCls = {
    plain: "bg-surface text-charcoal", gold: "bg-gold-tint text-gold",
    success: "bg-success-tint text-success", error: "bg-error-tint text-error",
  }[tone];
  return (
    <div className={`rounded-xl border border-tan px-4 py-3 text-center ${toneCls}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</div>
      <div className={`font-bold ${big ? "text-4xl" : "text-2xl"}`}>{value}</div>
    </div>
  );
}

export function GoldButton({ children, ...p }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...p} className={`rounded-lg bg-gold px-5 py-2.5 font-semibold text-white hover:bg-gold-dark disabled:opacity-50 ${p.className ?? ""}`}>{children}</button>;
}

export function OutlineButton({ children, ...p }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...p} className={`rounded-lg border border-gold bg-surface px-5 py-2.5 font-semibold text-gold hover:bg-gold-tint ${p.className ?? ""}`}>{children}</button>;
}

export function Field({ label, hint, ...p }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-charcoal">{label}</span>
      <input {...p} className="w-full rounded-lg border border-tan bg-surface px-3 py-2 text-sm text-charcoal outline-none focus:border-gold" />
      {hint && <span className="mt-0.5 block text-[11px] text-error">{hint}</span>}
    </label>
  );
}

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-6">
      <Card className="w-full max-w-[460px] p-8 text-center">
        <div className="text-3xl font-bold text-gold">AIFit</div>
        <div className="mb-6 text-xs uppercase tracking-wide text-muted">AI-Powered Fitness Assistant</div>
        {children}
      </Card>
    </div>
  );
}

export function fmtDur(sec: number): string {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
export function fmtDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-GB");
}