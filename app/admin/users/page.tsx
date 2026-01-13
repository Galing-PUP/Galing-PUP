"use client";

import { colleges } from "@/data/collegeCourses";
import { getCurrentUser } from "@/lib/actions";

import { useState, useMemo, useEffect } from "react";
import type { User, UserStatus, UserRole } from "@/types/users";
import { UserStats, type Stats } from "@/components/admin/users/user-stats";
import { UserManagementHeader } from "@/components/admin/users/user-management-header";
import { UserToolbar } from "@/components/admin/users/user-toolbar";
import { UsersTable } from "@/components/admin/users/users-table";
import { UserTableToolbar } from "@/components/admin/users/user-table-toolbar";
import { AdminUserFormModal } from "@/components/admin/users/admin-user-form-modal";
import { RegisteredUserFormModal } from "@/components/admin/users/registered-user-form-modal";
import { AddUserModal } from "@/components/admin/users/add-user-modal";

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
import { toast } from "sonner";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [currentUser, setCurrentUser] = useState<{ role: string } | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<UserStatus[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({ isOpen: false, user: null });

  const [addUserModalOpen, setAddUserModalOpen] = useState(false);

  const [duplicateWarning, setDuplicateWarning] = useState<{
    isOpen: boolean;
    message: string;
  }>({ isOpen: false, message: "" });



  // Fetch users and stats from API
  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/users/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser({ role: user.role });
        }
      } catch (error) {
        console.error("Error loading current user:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users");
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };

    fetchCurrentUser();
    fetchUsers();
    fetchStats();
  }, []);

  /**
   * Refetches users and stats after adding a new user
   */
  const handleUserAdded = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
      await fetchStats();
    } catch (error) {
      console.error("Error reloading users:", error);
    }
  };

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

  const handleDeleteSelected = async () => {
    if (selectedUserIds.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedUserIds.length} users?`)) {
      return;
    }

    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedUserIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Failed to delete users");
      }

      setUsers((prev) => prev.filter((u) => !selectedUserIds.includes(u.id)));
      setSelectedUserIds([]);
      fetchStats(); // Update stats
      toast.success("Selected users have been deleted successfully.");
    } catch (error: any) {
      console.error("Error deleting users:", error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleSaveUser = async (userToSave: User, file?: File | null) => {
    try {
      // Prepare FormData (used for both Create and Edit to support file upload)
      const formData = new FormData();
      formData.append("name", userToSave.name);
      formData.append("email", userToSave.email);
      formData.append("role", userToSave.role.toUpperCase());
      formData.append("status", userToSave.status);
      if (userToSave.subscriptionTier) formData.append("subscriptionTier", userToSave.subscriptionTier.toString());
      if (userToSave.collegeId) formData.append("collegeId", userToSave.collegeId.toString());
      if (userToSave.password) formData.append("password", userToSave.password);
      if (file) formData.append("idImage", file);

      if (modalState.user) {
        // Edit existing user
        const response = await fetch(`/api/admin/users/${userToSave.id}`, {
          method: "PATCH",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 409) {
            setDuplicateWarning({
              isOpen: true,
              message: errorData.error || "User already exists",
            });
            return;
          }
          throw new Error(errorData.error || "Failed to update user");
        }

        const updatedUser = await response.json();
        setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
        fetchStats(); // Update stats in case status changed
        toast.success(`Updated user: ${updatedUser.name}`);
      }
      setModalState({ isOpen: false, user: null });
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast.error(error.message || "Failed to save user changes.");
    }
  };

  const confirmDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setSelectedUserIds((prev) => prev.filter((id) => id !== deletingUser.id));
      fetchStats();
      toast.success(`User "${deletingUser.name}" has been deleted.`);
      setDeletingUser(null);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <div className="space-y-8">
      <UserStats stats={stats} />

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <UserManagementHeader 
          onAddNewUser={() => setAddUserModalOpen(true)}
          showAddButton={currentUser?.role === "OWNER"}
        />
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

      {modalState.user && (modalState.user.role === "Admin" || modalState.user.role === "Superadmin" || modalState.user.role === "ADMIN" || modalState.user.role === "SUPERADMIN") ? (
        <AdminUserFormModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ isOpen: false, user: null })}
          onSave={handleSaveUser}
          user={modalState.user}
          colleges={colleges}
        />
      ) : (
        <RegisteredUserFormModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ isOpen: false, user: null })}
          onSave={handleSaveUser}
          user={modalState.user}
        />
      )}

      <AddUserModal
        isOpen={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
        onUserAdded={handleUserAdded}
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
              className="bg-pup-maroon hover:bg-pup-maroon/80 focus:ring-pup-maroon"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={duplicateWarning.isOpen}
        onOpenChange={(isOpen) => !isOpen && setDuplicateWarning(prev => ({ ...prev, isOpen: false }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Entry</AlertDialogTitle>
            <AlertDialogDescription>
              {duplicateWarning.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setDuplicateWarning(prev => ({ ...prev, isOpen: false }))}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
