import type { User } from "@/types/users";
import { RoleBadge } from "./role-badge";
import { StatusBadge } from "./status-badge";
import { Pencil, Trash2 } from "lucide-react";

type UserTableRowProps = {
  user: User;
};

export function UserTableRow({ user }: UserTableRowProps) {
  return (
    <div className="grid grid-cols-12 items-center gap-3 rounded-lg bg-white px-4 py-3 hover:bg-gray-50">
      <div className="col-span-1 flex items-center">
        <input type="checkbox" className="h-4 w-4 rounded border-gray-400 text-red-800 focus:ring-red-800" />
      </div>
      <div className="col-span-1 text-sm text-gray-700">{user.id}</div>
      <div className="col-span-2 text-sm font-medium text-gray-800">{user.name}</div>
      <div className="col-span-3 text-sm text-gray-600">{user.email}</div>
      <div className="col-span-2">
        <RoleBadge role={user.role} />
      </div>
      <div className="col-span-1">
        <StatusBadge status={user.status} />
      </div>
      <div className="col-span-2 flex items-center space-x-2">
        <button className="rounded-full p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-800">
          <Pencil className="h-5 w-5" />
        </button>
        <button className="rounded-full p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-800">
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
