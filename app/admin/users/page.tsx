"use client";

import { useState } from "react";
import { UserStats } from "@/components/admin/users/user-stats";
import { UserManagementHeader } from "@/components/admin/users/user-management-header";
import { UserToolbar } from "@/components/admin/users/user-toolbar";
import { UsersTable } from "@/components/admin/users/users-table";
import { UserTableToolbar } from "@/components/admin/users/user-table-toolbar";
import { mockUsers } from "@/data/mockUsers";

export default function UserManagementPage() {
  const users = mockUsers;
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const handleSelectUser = (userId: string) => {
    setSelectedUserIds((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map((user) => user.id));
    }
  };

  const handleDeleteSelected = () => {
    alert(`Deleting users: ${selectedUserIds.join(", ")}`);
    setSelectedUserIds([]);
  };

  return (
    <div className="space-y-8">
      <UserStats />

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <UserManagementHeader />
        <UserToolbar />

        {/* Conditionally render the new toolbar when users are selected */}
        {selectedUserIds.length > 0 && (
          <UserTableToolbar
            selectedCount={selectedUserIds.length}
            onDelete={handleDeleteSelected}
          />
        )}

        <UsersTable
          users={users}
          selectedUserIds={selectedUserIds}
          onSelectAll={handleSelectAll}
          onSelectUser={handleSelectUser}
        />

        <div className="mt-6 text-sm text-gray-500">
          Showing {users.length} of 1,247 users
        </div>
      </div>
    </div>
  );
}
