import { NavLink } from "react-router-dom";
import { logout, getCurrentUser } from "../services/authService";

const LINK_CLASS = "text-sm font-semibold";

/** Shared top navigation bar for every trainee screen (IDD UI-03/UI-07/UI-08). */
export function TopNav() {
  const user = getCurrentUser();
  const initial = user?.fullName?.trim()?.[0]?.toUpperCase() ?? "A";

  return (
    <header className="mb-4 flex items-center justify-between rounded-card border border-border bg-white px-5 py-3">
      <span className="text-xl font-bold text-gold">AIFit</span>
      <nav className="flex items-center gap-6">
        <NavLink to="/" end className={({ isActive }) => `${LINK_CLASS} ${isActive ? "text-gold" : "text-ink"}`}>
          Home
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `${LINK_CLASS} ${isActive ? "text-gold" : "text-ink"}`}>
          History
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `${LINK_CLASS} ${isActive ? "text-gold" : "text-ink"}`}>
          Profile
        </NavLink>
        {user?.role === "Admin" && (
          <NavLink to="/admin" className={`${LINK_CLASS} text-ink`}>
            Admin
          </NavLink>
        )}
      </nav>
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-light text-sm font-bold text-gold">
          {initial}
        </span>
        <span className="hidden text-sm font-medium text-ink sm:inline">{user?.fullName}</span>
        <button onClick={logout} className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold">
          Logout
        </button>
      </div>
    </header>
  );
}
