import type { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";

/** Shared chrome for every Admin screen: sidebar + scrollable content area. */
export function AdminLayout({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar />
      <div className="flex-1 overflow-x-hidden">
        <header className="flex items-center justify-between border-b border-border bg-white px-6 py-4">
          <h1 className="text-xl font-bold">{title}</h1>
          <div className="flex items-center gap-3">
            {action}
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-light text-xs font-bold text-gold">
              AD
            </span>
            <span className="text-sm font-semibold text-muted">Admin</span>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
