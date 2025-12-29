import type { UserRole } from "@/types/users";

type RoleBadgeProps = {
  role: UserRole;
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const styles: Record<UserRole, string> = {
    "Super Admin": "bg-pup-gold-light text-pup-maroon font-bold",
    Admin: "bg-pup-maroon text-white",
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
