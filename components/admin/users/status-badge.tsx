import type { UserStatus } from "@/types/users";

type StatusBadgeProps = {
  status: UserStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<UserStatus, string> = {
    Accepted: "bg-green-100 text-green-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Delete: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}
