import type { UserRole } from "@/types/users";

type RoleBadgeProps = {
  role: UserRole;
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const styles: Record<UserRole, string> = {
    "Super Admin": "bg-yellow-400 text-yellow-900 font-bold",
    Admin: "bg-red-800 text-white",
    User: "bg-gray-200 text-gray-800",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[role]}`}
    >
      {role}
    </span>
  );
}
