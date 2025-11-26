import type { UserStatus } from "@/types/users";

type StatusBadgeProps = {
  status: UserStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    Active: "bg-green-100 text-green-800",
    Inactive: "bg-gray-200 text-gray-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}
