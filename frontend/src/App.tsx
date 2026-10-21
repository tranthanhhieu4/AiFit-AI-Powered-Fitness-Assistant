import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import GuidePage from "./pages/GuidePage";
import WorkoutPage from "./pages/WorkoutPage";
import SummaryPage from "./pages/SummaryPage";
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/admin/DashboardPage";
import UsersPage from "./pages/admin/UsersPage";
import ExercisesPage from "./pages/admin/ExercisesPage";
import RulesPage from "./pages/admin/RulesPage";
import LogsPage from "./pages/admin/LogsPage";
import { MOCK_SESSIONS, type SessionRow } from "./data/mock";

type Auth = { name: string; email: string; role: "trainee" | "admin" };
type Screen =
  | "login" | "signup" | "home" | "guide" | "workout" | "summary" | "history" | "profile"
  | "admin-dashboard" | "admin-users" | "admin-exercises" | "admin-rules" | "admin-logs";

export default function App() {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [screen, setScreen] = useState<Screen>("login");
  const [exId, setExId] = useState("squat");
  const [sessions, setSessions] = useState<SessionRow[]>(MOCK_SESSIONS);
  const [lastResult, setLastResult] = useState<SessionRow | null>(null);

  const login = (email: string) => setAuth({
    name: email.split("@")[0].replace(/^\w/, (c) => c.toUpperCase()),
    email, role: email.startsWith("admin") ? "admin" : "trainee",
  });
  const logout = () => { setAuth(null); setScreen("login"); };

  const go = (s: string) => setScreen(s as Screen);
  const traineeNav = (s: "home" | "history" | "profile") => setScreen(s);

  if (!auth) return screen === "signup"
    ? <SignupPage onSignup={(name) => { login("user@example.com"); setAuth({ name, email: "user@example.com", role: "trainee" }); setScreen("home"); }} onLogin={() => setScreen("login")} />
    : <LoginPage onLogin={(email) => { login(email); setScreen(email.startsWith("admin") ? "admin-dashboard" : "home"); }} onSignup={() => setScreen("signup")} />;

  if (auth.role === "admin" && screen.startsWith("admin")) {
    const props = { onNav: go, onLogout: logout };
    if (screen === "admin-users") return <UsersPage {...props} />;
    if (screen === "admin-exercises") return <ExercisesPage {...props} />;
    if (screen === "admin-rules") return <RulesPage {...props} />;
    if (screen === "admin-logs") return <LogsPage {...props} />;
    return <DashboardPage {...props} />;
  }

  switch (screen) {
    case "guide": return <GuidePage exerciseId={exId} name={auth.name} onNav={traineeNav} onStart={() => setScreen("workout")} onBack={() => setScreen("home")} onLogout={logout} />;
    case "workout":
      return <WorkoutPage exerciseId={exId} name={auth.name} onNav={traineeNav} onLogout={logout}
        onQuit={() => setScreen("guide")}
        onFinish={(r) => {
          const row: SessionRow = { id: Date.now(), date: new Date().toISOString().slice(0, 10), ...r };
          setLastResult(row); setSessions((p) => [row, ...p]); setScreen("summary");
        }} />;
    case "summary":
      return lastResult
        ? <SummaryPage session={lastResult} name={auth.name} onNav={traineeNav} onLogout={logout} onAgain={(id) => { setExId(id); setScreen("workout"); }} />
        : <HomePage name={auth.name} lastSession={null} sessions={sessions} onNav={traineeNav} onSelect={setExId} onLogout={logout} />;
    case "history":
      return <HistoryPage name={auth.name} sessions={sessions} onNav={traineeNav} onLogout={logout} onView={(s) => { setLastResult(s); setScreen("summary"); }} />;
    case "profile":
      return <ProfilePage auth={auth} onNav={traineeNav} onLogout={logout} onRename={(name) => setAuth({ ...auth, name })} />;
    default:
      return <HomePage name={auth.name} lastSession={sessions[0] ?? null} sessions={sessions} onNav={traineeNav} onSelect={(id) => { setExId(id); setScreen("guide"); }} onLogout={logout} />;
  }
}