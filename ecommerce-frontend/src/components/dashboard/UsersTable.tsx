import { User, Role } from "@/types";

export default function UsersTable({
  users,
  onRoleChange,
  onToggleActive,
}: {
  users: User[];
  onRoleChange: (id: string, role: Role) => void;
  onToggleActive: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded border border-line bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-line bg-paper text-left text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {users.map((u) => (
            <tr key={u._id}>
              <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
              <td className="px-4 py-3 text-muted">{u.email}</td>
              <td className="px-4 py-3">
                <select
                  className="input w-28"
                  value={u.role}
                  onChange={(e) => onRoleChange(u._id, e.target.value as Role)}
                >
                  <option value="user">user</option>
                  <option value="seller">seller</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    u.isActive ? "bg-forest-light text-forest-dark" : "bg-red-50 text-red-700"
                  }`}
                >
                  {u.isActive ? "Active" : "Deactivated"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button onClick={() => onToggleActive(u._id)} className="text-sm text-forest hover:underline">
                  {u.isActive ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
