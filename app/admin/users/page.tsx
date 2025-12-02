"use client";

import { useState, useMemo } from "react";
import type { User, UserStatus, UserRole } from "@/types/users";
import { UserStats } from "@/components/admin/users/user-stats";
import { UserManagementHeader } from "@/components/admin/users/user-management-header";
import { UserToolbar } from "@/components/admin/users/user-toolbar";
import { UsersTable } from "@/components/admin/users/users-table";
import { UserTableToolbar } from "@/components/admin/users/user-table-toolbar";
import { UserFormModal } from "@/components/admin/users/user-form-modal";
import { mockUsers } from "@/data/mockUsers";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<UserStatus[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({ isOpen: false, user: null });

  // Filter users based on selected statuses, roles, and search query
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const statusMatch =
        selectedStatuses.length === 0 || selectedStatuses.includes(user.status);
      const roleMatch =
        selectedRoles.length === 0 || selectedRoles.includes(user.role);
      const searchMatch =
        searchQuery === "" ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && roleMatch && searchMatch;
    });
  }, [users, selectedStatuses, selectedRoles, searchQuery]);

  const handleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUserIds(selectedUserIds.length === filteredUsers.length ? [] : filteredUsers.map((u) => u.id));
  };

  const handleDeleteSelected = () => {
    alert(`Deleting users: ${selectedUserIds.join(", ")}`);
    setUsers((prev) => prev.filter((u) => !selectedUserIds.includes(u.id)));
    setSelectedUserIds([]);
  };

  const handleSaveUser = (userToSave: User) => {
    if (modalState.user) {
      setUsers((prev) => prev.map((u) => (u.id === userToSave.id ? userToSave : u)));
      alert(`Updated user: ${userToSave.name}`);
    } else {
      setUsers((prev) => [userToSave, ...prev]);
      alert(`Added new user: ${userToSave.name}`);
    }
    setModalState({ isOpen: false, user: null });
  };

  const confirmDeleteUser = () => {
    if (!deletingUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    setSelectedUserIds((prev) => prev.filter((id) => id !== deletingUser.id));
    alert(`User "${deletingUser.name}" has been deleted.`);
    setDeletingUser(null);
  };

  return (
    <div className="space-y-8">
      <UserStats />

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <UserManagementHeader onAddNewUser={() => setModalState({ isOpen: true, user: null })} />
        <UserToolbar
          selectedStatuses={selectedStatuses}
          selectedRoles={selectedRoles}
          onStatusChange={setSelectedStatuses}
          onRoleChange={setSelectedRoles}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {selectedUserIds.length > 0 && (
          <UserTableToolbar
            selectedCount={selectedUserIds.length}
            onDelete={handleDeleteSelected}
          />
        )}

        <UsersTable
          users={filteredUsers}
          selectedUserIds={selectedUserIds}
          onSelectAll={handleSelectAll}
          onSelectUser={handleSelectUser}
          onEditUser={(user) => setModalState({ isOpen: true, user })}
          onDeleteUser={(user) => setDeletingUser(user)}
        />

        <div className="mt-6 text-sm text-gray-500">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      <UserFormModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, user: null })}
        onSave={handleSaveUser}
        user={modalState.user}
      />

      <AlertDialog
        open={!!deletingUser}
        onOpenChange={(isOpen) => !isOpen && setDeletingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              The chosen user will be permanently deleted from the database. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteUser}
              className="bg-[#6b0504] hover:bg-[#4a0403]"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
