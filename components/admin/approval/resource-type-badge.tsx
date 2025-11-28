import type { ResourceType } from "@/types/content";

type ResourceTypeBadgeProps = {
  type: ResourceType;
};

export function ResourceTypeBadge({ type }: ResourceTypeBadgeProps) {
  // You can expand this with different colors for different types
  const style = "bg-red-800 text-white";

  return (
    <span className={`rounded-full px-4 py-1.5 text-xs font-semibold ${style}`}>
      {type}
    </span>
  );
}
