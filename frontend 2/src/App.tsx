import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { TopNav } from "./components/TopNav";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { HomePage } from "./pages/HomePage";
import { ExerciseGuidePage } from "./pages/ExerciseGuidePage";
import { LiveWorkoutPage } from "./pages/LiveWorkoutPage";
import { WorkoutSummaryPage } from "./pages/WorkoutSummaryPage";
import { ProgressHistoryPage } from "./pages/ProgressHistoryPage";
import { ProfilePage } from "./pages/ProfilePage";
import { DevSystemMessagesPage } from "./pages/DevSystemMessagesPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { ManageUsersPage } from "./pages/admin/ManageUsersPage";
import { ManageExercisesPage } from "./pages/admin/ManageExercisesPage";
import { ManageExerciseRulesPage } from "./pages/admin/ManageExerciseRulesPage";
import { AddEditRulePage } from "./pages/admin/AddEditRulePage";
import { SystemLogsPage } from "./pages/admin/SystemLogsPage";
import { getToken } from "./services/httpClient";
import { getCurrentUser } from "./services/authService";

/**
 * Full router for all 15 IDD screens. Trainee screens (UI-01..UI-09) share
 * the TopNav chrome; Admin screens (UI-10..UI-15) render their own
 * AdminLayout (sidebar) instead and are additionally gated by role, per
 * Architecture Design 3.4 "Authorization" (JWT role claim -> route guard).
 */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Admin screens: own layout (AdminLayout/AdminSidebar), no TopNav wrapper. */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminDashboardPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RequireAdmin>
            <ManageUsersPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/exercises"
        element={
          <RequireAdmin>
            <ManageExercisesPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/rules"
        element={
          <RequireAdmin>
            <ManageExerciseRulesPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/rules/new"
        element={
          <RequireAdmin>
            <AddEditRulePage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/rules/:ruleId/edit"
        element={
          <RequireAdmin>
            <AddEditRulePage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/logs"
        element={
          <RequireAdmin>
            <SystemLogsPage />
          </RequireAdmin>
        }
      />

      {/* Trainee screens: TopNav chrome. */}
      <Route
        path="/*"
        element={
          <RequireAuth>
            <div className="mx-auto max-w-6xl p-4">
              <TopNav />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/exercise/:exerciseId" element={<ExerciseGuidePage />} />
                <Route path="/workout/:exerciseId" element={<LiveWorkoutPage />} />
                <Route path="/workout/:exerciseId/summary" element={<WorkoutSummaryPage />} />
                <Route path="/history" element={<ProgressHistoryPage />} />
                <Route path="/history/:sessionId" element={<WorkoutSummaryPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/dev/system-messages" element={<DevSystemMessagesPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </RequireAuth>
        }
      />
    </Routes>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  const user = getCurrentUser();
  if (user?.role !== "Admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}
