import type { ReactNode } from "react";
import { OutlineButton } from "./ui";

const ITEMS = [
  ["admin-dashboard", "Dashboard"], ["admin-users", "Users"], ["admin-exercises", "Exercises"],
  ["admin-rules", "Exercise Rules"], ["admin-logs", "System Logs"],
] as const;

export default function AdminShell({ active, title, children, onNav, onLogout }: {
  active: string; title: string; children: ReactNode;
  onNav: (s: string) => void; onLogout: () => void;
}) {
  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="w-56 shrink-0 bg-sidebar p-4 text-cream">
        <div className="mb-8 text-lg font-bold">AIFit Admin</div>
        <nav className="space-y-1">
          {ITEMS.map(([id, label]) => (
            <button key={id} onClick={() => onNav(id)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${active === id ? "bg-gold font-semibold text-white" : "text-cream/80 hover:bg-white/10"}`}>
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-end gap-3 border-b border-tan bg-surface px-6 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-tint text-xs font-bold text-gold">AD</div>
          <span className="text-sm text-charcoal">Admin</span>
          <OutlineButton className="!px-4 !py-1.5 text-xs" onClick={onLogout}>Logout</OutlineButton>
        </header>
        <main className="space-y-5 p-6">
          <h1 className="text-xl font-bold text-charcoal">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}