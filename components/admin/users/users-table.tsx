"use client";

import type { User } from "@/types/users";
import { UserTableRow } from "./user-table-row";
import { useRef, useEffect } from "react";

type UsersTableProps = {
  users: User[];
  selectedUserIds: string[];
  onSelectAll: () => void;
  onSelectUser: (userId: string) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
};

export function UsersTable({
  users,
  selectedUserIds,
  onSelectAll,
  onSelectUser,
  onEditUser,
  onDeleteUser,
}: UsersTableProps) {
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (headerCheckboxRef.current) {
      const numSelected = selectedUserIds.length;
      const numUsers = users.length;
      headerCheckboxRef.current.checked = numSelected === numUsers && numUsers > 0;
      headerCheckboxRef.current.indeterminate =
        numSelected > 0 && numSelected < numUsers;
    }
  }, [selectedUserIds, users.length]);

  return (
    <div className="mt-4 flow-root">
      <div className="-mx-6 -my-2 overflow-x-auto">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="mb-2 rounded-lg bg-gray-100 px-4 py-3">
            <div className="grid grid-cols-12 items-center gap-3 text-left text-sm font-semibold text-gray-600">
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  ref={headerCheckboxRef}
                  onChange={onSelectAll}
                  className="h-4 w-4 rounded border-gray-400 text-red-800 focus:ring-red-800"
                />
              </div>
              <div className="col-span-1">User ID</div>
              <div className="col-span-2">Username</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2">Actions</div>
            </div>
          </div>
          <div className="space-y-2">
            {users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                isSelected={selectedUserIds.includes(user.id)}
                onSelect={() => onSelectUser(user.id)}
                onEdit={() => onEditUser(user)}
                onDelete={() => onDeleteUser(user)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
