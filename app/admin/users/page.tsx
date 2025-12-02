"use client";

import { useState } from "react";
import type { User } from "@/types/users";
import { UserStats } from "@/components/admin/users/user-stats";
import { UserManagementHeader } from "@/components/admin/users/user-management-header";
import { UserToolbar } from "@/components/admin/users/user-toolbar";
import { UsersTable } from "@/components/admin/users/users-table";
import { UserTableToolbar } from "@/components/admin/users/user-table-toolbar";
import { UserFormModal } from "@/components/admin/users/user-form-modal";
import { mockUsers } from "@/data/mockUsers";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUserIds(selectedUserIds.length === users.length ? [] : users.map((u) => u.id));
  };

  const handleDeleteSelected = () => {
    alert(`Deleting users: ${selectedUserIds.join(", ")}`);
    setUsers((prev) => prev.filter((u) => !selectedUserIds.includes(u.id)));
    setSelectedUserIds([]);
  };

  const handleSaveUser = (updatedUser: User) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    alert(`Saved user: ${updatedUser.name}`);
    setEditingUser(null);
  };

  return (
    <div className="space-y-8">
      <UserStats />

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <UserManagementHeader />
        <UserToolbar />

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
          onEditUser={(user) => setEditingUser(user)}
        />

        <div className="mt-6 text-sm text-gray-500">
          Showing {users.length} of 1,247 users
        </div>
      </div>

      <UserFormModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveUser}
        user={editingUser}
      />
    </div>
  );
}
