import { httpClient } from "./httpClient";
import type { AuthUser } from "./authService";

/**
 * Admin-only endpoints (Architecture Design 3.2 "Admin Controller /
 * Reporting Service"): user management (UI-11), the dashboard's activity
 * figures (UI-10) and the system error log (UI-15).
 */

// ---------------------------------------------------------------------------
// UI-11 Manage Users
// ---------------------------------------------------------------------------

export interface AdminUser extends AuthUser {
  createdAt: string;
}

export async function listUsers(params: { search?: string; role?: "Trainee" | "Admin" | "all" } = {}): Promise<AdminUser[]> {
  const { data } = await httpClient.get<AdminUser[]>("/admin/users", {
    params: { search: params.search || undefined, role: params.role && params.role !== "all" ? params.role : undefined },
  });
  return data;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
  role: "Trainee" | "Admin";
}

export async function createUser(input: CreateUserInput): Promise<AdminUser> {
  const { data } = await httpClient.post<AdminUser>("/admin/users", input);
  return data;
}

export async function updateUser(id: string, input: { fullName: string; role: "Trainee" | "Admin" }): Promise<AdminUser> {
  const { data } = await httpClient.put<AdminUser>(`/admin/users/${id}`, input);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  await httpClient.delete(`/admin/users/${id}`);
}

// ---------------------------------------------------------------------------
// UI-10 Admin Dashboard
// ---------------------------------------------------------------------------

export interface DashboardStats {
  totalUsers: number;
  sessionsLast7Days: number;
  averageAccuracy: number; // 0..1
  systemErrorsLast24h: number;
  sessionsPerDay: { date: string; count: number }[];
  detectionQuality: { exercise: string; avgVisibility: number; avgFps: number; bodyLostEvents: number }[];
  recentErrors: SystemLogEntry[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await httpClient.get<DashboardStats>("/admin/dashboard");
  return data;
}

// ---------------------------------------------------------------------------
// UI-15 System Logs
// ---------------------------------------------------------------------------

export type SystemLogType = "Camera denied" | "Body lost" | "Sync failed" | "API error";

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  user: string;
  exercise: string;
  type: SystemLogType;
  message: string;
}

export async function getSystemLogs(params: { days?: number; type?: SystemLogType | "all" } = {}): Promise<SystemLogEntry[]> {
  const { data } = await httpClient.get<SystemLogEntry[]>("/admin/logs", {
    params: { days: params.days, type: params.type && params.type !== "all" ? params.type : undefined },
  });
  return data;
}

/** IDD UI-15 "Export logs" - downloads the filtered set as a CSV file. */
export function exportSystemLogsCsv(logs: SystemLogEntry[]): void {
  const header = "Time,User,Exercise,Type,Message";
  const rows = logs.map((l) => [l.timestamp, l.user, l.exercise, l.type, l.message].map(csvEscape).join(","));
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `aifit-system-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
