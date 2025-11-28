// File: app/admin/users/page.tsx

import { UserStats } from "@/components/admin/users/user-stats";
import { UserManagementHeader } from "@/components/admin/users/user-management-header";
import { UserToolbar } from "@/components/admin/users/user-toolbar";
import { UsersTable } from "@/components/admin/users/users-table";
import { mockUsers } from "@/data/mockUsers";

export default function UserManagementPage() {
  const users = mockUsers;

  return (
    <div className="space-y-8">
      <UserStats />

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <UserManagementHeader />
        <UserToolbar />
        <UsersTable users={users} />

        {/* Table Footer */}
        <div className="mt-6 text-sm text-gray-500">
          Showing {users.length} of 1,247 users
        </div>
      </div>
    </div>
  );
}
