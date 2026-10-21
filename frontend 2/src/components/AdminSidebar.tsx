import { NavLink } from "react-router-dom";
import { logout } from "../services/authService";

const ITEMS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/exercises", label: "Exercises" },
  { to: "/admin/rules", label: "Exercise Rules" },
  { to: "/admin/logs", label: "System Logs" },
];

/** Dark sidebar shared by every Admin screen (IDD UI-10..UI-15). */
export function AdminSidebar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col bg-sidebar px-3 py-6 text-white/80">
      <span className="mb-6 px-3 text-lg font-bold text-white">AIFit Admin</span>
      <nav className="flex flex-col gap-1">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2.5 text-sm font-semibold ${
                isActive ? "bg-gold text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={logout}
        className="mt-auto rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
      >
        Logout
      </button>
    </aside>
  );
}
