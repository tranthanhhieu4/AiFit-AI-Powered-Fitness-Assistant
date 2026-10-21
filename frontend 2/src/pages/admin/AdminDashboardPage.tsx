import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/AdminLayout";
import { Card } from "../../components/Card";
import { StatCard } from "../../components/StatCard";
import { Table, Th, Td } from "../../components/table";
import { BarChart } from "../../components/charts/BarChart";
import { getDashboardStats, type DashboardStats } from "../../services/adminService";
import { formatPercent, formatDateTime } from "../../lib/format";

/**
 * IDD UI-10 "Admin Dashboard": a system-wide snapshot - active users,
 * session volume, average accuracy, detection quality per exercise, and
 * the most recent system errors (also the full log on UI-15).
 */
export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => setStats(EMPTY_STATS))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <p className="text-sm text-muted">Loading dashboard...</p>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total users" value={stats!.totalUsers} />
            <StatCard label="Sessions (7d)" value={stats!.sessionsLast7Days} />
            <StatCard label="Avg. accuracy" value={formatPercent(stats!.averageAccuracy)} tone="gold" />
            <StatCard
              label="System errors (24h)"
              value={stats!.systemErrorsLast24h}
              tone={stats!.systemErrorsLast24h > 0 ? "danger" : "success"}
            />
          </div>

          <Card title="Sessions per day">
            <BarChart
              bars={stats!.sessionsPerDay.map((d) => [{ value: d.count, color: "#BF8E2D" }])}
              labels={stats!.sessionsPerDay.map((d) => d.date.slice(5))}
            />
          </Card>

          <Card title="Detection quality by exercise">
            {stats!.detectionQuality.length === 0 ? (
              <p className="text-sm text-muted">No sessions recorded yet.</p>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Exercise</Th>
                    <Th>Avg. visibility</Th>
                    <Th>Avg. FPS</Th>
                    <Th>Body-lost events</Th>
                  </tr>
                </thead>
                <tbody>
                  {stats!.detectionQuality.map((row) => (
                    <tr key={row.exercise}>
                      <Td className="font-medium">{row.exercise}</Td>
                      <Td>{formatPercent(row.avgVisibility)}</Td>
                      <Td>{row.avgFps.toFixed(1)}</Td>
                      <Td>{row.bodyLostEvents}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>

          <Card title="Recent system errors" action={<Link to="/admin/logs" className="text-sm font-semibold text-gold">View all logs</Link>}>
            {stats!.recentErrors.length === 0 ? (
              <p className="text-sm text-muted">No recent errors.</p>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Time</Th>
                    <Th>User</Th>
                    <Th>Exercise</Th>
                    <Th>Type</Th>
                    <Th>Message</Th>
                  </tr>
                </thead>
                <tbody>
                  {stats!.recentErrors.map((e) => (
                    <tr key={e.id}>
                      <Td>{formatDateTime(e.timestamp)}</Td>
                      <Td>{e.user}</Td>
                      <Td>{e.exercise}</Td>
                      <Td>
                        <span className="rounded-full bg-danger-light px-2 py-0.5 text-xs font-semibold text-danger">
                          {e.type}
                        </span>
                      </Td>
                      <Td className="text-muted">{e.message}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}

const EMPTY_STATS: DashboardStats = {
  totalUsers: 0,
  sessionsLast7Days: 0,
  averageAccuracy: 0,
  systemErrorsLast24h: 0,
  sessionsPerDay: [],
  detectionQuality: [],
  recentErrors: [],
};
