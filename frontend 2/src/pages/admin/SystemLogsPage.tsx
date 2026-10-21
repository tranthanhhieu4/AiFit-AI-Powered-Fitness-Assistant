import { useEffect, useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Table, Th, Td } from "../../components/table";
import { SelectField } from "../../components/FormField";
import { formatDateTime } from "../../lib/format";
import { getSystemLogs, exportSystemLogsCsv, type SystemLogEntry, type SystemLogType } from "../../services/adminService";

const TYPE_OPTIONS: { value: SystemLogType | "all"; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "Camera denied", label: "Camera denied" },
  { value: "Body lost", label: "Body lost" },
  { value: "Sync failed", label: "Sync failed" },
  { value: "API error", label: "API error" },
];

const TYPE_TONE: Record<SystemLogType, string> = {
  "Camera denied": "bg-danger-light text-danger",
  "Body lost": "bg-warning-light text-warning",
  "Sync failed": "bg-warning-light text-warning",
  "API error": "bg-danger-light text-danger",
};

/** IDD UI-15 "System Logs": the full error log behind UI-10's "Recent errors" and NFR04 reliability tracking. */
export function SystemLogsPage() {
  const [logs, setLogs] = useState<SystemLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<SystemLogType | "all">("all");
  const [daysFilter, setDaysFilter] = useState("7");

  const load = () => {
    setLoading(true);
    getSystemLogs({ days: Number(daysFilter), type: typeFilter })
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [typeFilter, daysFilter]);

  return (
    <AdminLayout
      title="System Logs"
      action={
        <Button variant="outline" onClick={() => exportSystemLogsCsv(logs)} disabled={logs.length === 0}>
          Export CSV
        </Button>
      }
    >
      <Card>
        <div className="mb-4 flex flex-wrap gap-3">
          <SelectField
            label=""
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as SystemLogType | "all")}
            options={TYPE_OPTIONS}
            className="mt-0 w-44"
          />
          <SelectField
            label=""
            value={daysFilter}
            onChange={(e) => setDaysFilter(e.target.value)}
            options={[
              { value: "1", label: "Last 24 hours" },
              { value: "7", label: "Last 7 days" },
              { value: "30", label: "Last 30 days" },
            ]}
            className="mt-0 w-36"
          />
        </div>

        {loading ? (
          <p className="text-sm text-muted">Loading logs...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted">No log entries for this filter.</p>
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
              {logs.map((log) => (
                <tr key={log.id}>
                  <Td className="whitespace-nowrap">{formatDateTime(log.timestamp)}</Td>
                  <Td>{log.user}</Td>
                  <Td>{log.exercise}</Td>
                  <Td>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_TONE[log.type]}`}>
                      {log.type}
                    </span>
                  </Td>
                  <Td className="text-muted">{log.message}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </AdminLayout>
  );
}
