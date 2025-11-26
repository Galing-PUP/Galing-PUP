import type { UserRole } from "@/types/users";

type RoleBadgeProps = {
  role: UserRole;
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const styles = {
    Admin: "bg-red-800 text-white",
    Member: "bg-gray-200 text-gray-800",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[role]}`}
    >
      {role}
    </span>
  );
}
