import type { ContentStatus } from "@/types/content";

type StatusBadgeProps = {
  status: ContentStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    Pending: "bg-yellow-500 text-white",
    Flagged: "bg-red-600 text-white",
    Accepted: "bg-green-600 text-white",
    Rejected: "bg-red-600 text-white",
    Deleted: "bg-gray-600 text-white",
  };

  return (
    <span
      className={`rounded-full px-4 py-1.5 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}
