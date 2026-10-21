import { useEffect, useState, type FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Table, Th, Td } from "../../components/table";
import { TextField, SelectField } from "../../components/FormField";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { formatDate } from "../../lib/format";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  type AdminUser,
  type CreateUserInput,
} from "../../services/adminService";

const ROLE_OPTIONS = [
  { value: "all", label: "All roles" },
  { value: "Trainee", label: "Trainee" },
  { value: "Admin", label: "Admin" },
];

const EMPTY_FORM: CreateUserInput = { fullName: "", email: "", password: "", role: "Trainee" };

/** IDD UI-11 "Manage Users": search/filter, create, edit role/name, delete. */
export function ManageUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"Trainee" | "Admin" | "all">("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<CreateUserInput>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);

  const load = () => {
    setLoading(true);
    listUsers({ search, role: roleFilter })
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [search, roleFilter]);

  const openCreate = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditingUser(user);
    setForm({ fullName: user.fullName, email: user.email, password: "", role: user.role });
    setFormError(null);
    setFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, { fullName: form.fullName, role: form.role });
      } else {
        await createUser(form);
      }
      setFormOpen(false);
      load();
    } catch {
      setFormError("Could not save this user. Check the details and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteUser(pendingDelete.id);
      load();
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <AdminLayout title="Manage Users" action={<Button onClick={openCreate}>+ New user</Button>}>
      <Card>
        <div className="mb-4 flex flex-wrap gap-3">
          <TextField
            label=""
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-0 w-64"
          />
          <SelectField
            label=""
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
            options={ROLE_OPTIONS}
            className="mt-0 w-40"
          />
        </div>

        {loading ? (
          <p className="text-sm text-muted">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted">No users match this filter.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Joined</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <Td className="font-medium">{u.fullName}</Td>
                  <Td>{u.email}</Td>
                  <Td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        u.role === "Admin" ? "bg-gold-light text-gold" : "bg-border/60 text-ink"
                      }`}
                    >
                      {u.role}
                    </span>
                  </Td>
                  <Td>{formatDate(u.createdAt)}</Td>
                  <Td>
                    <div className="flex gap-3">
                      <button className="font-semibold text-gold" onClick={() => openEdit(u)}>
                        Edit
                      </button>
                      <button className="font-semibold text-danger" onClick={() => setPendingDelete(u)}>
                        Delete
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-card border border-border bg-white p-6">
            <h3 className="text-lg font-bold">{editingUser ? "Edit user" : "New user"}</h3>
            <div className="mt-4 flex flex-col gap-3">
              <TextField
                label="Full name"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
              <TextField
                label="Email"
                type="email"
                required
                disabled={!!editingUser}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {!editingUser && (
                <TextField
                  label="Temporary password"
                  type="password"
                  minLength={8}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              )}
              <SelectField
                label="Role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as CreateUserInput["role"] })}
                options={[
                  { value: "Trainee", label: "Trainee" },
                  { value: "Admin", label: "Admin" },
                ]}
              />
            </div>
            {formError && <p className="mt-3 text-sm font-medium text-danger">{formError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete user"
        message={`Remove ${pendingDelete?.fullName ?? "this user"}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </AdminLayout>
  );
}
