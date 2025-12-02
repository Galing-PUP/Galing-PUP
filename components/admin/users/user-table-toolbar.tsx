import { Button } from "@/components/button";
import { Trash2 } from "lucide-react";

type UserTableToolbarProps = {
  selectedCount: number;
  onDelete: () => void;
};

export function UserTableToolbar({ selectedCount, onDelete }: UserTableToolbarProps) {
  return (
    <div className="my-4 flex items-center justify-between rounded-lg bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-800">
        {selectedCount} {selectedCount === 1 ? "user" : "users"} selected
      </p>
      <Button
        variant="primary"
        size="sm"
        shape="rounded"
        icon={<Trash2 className="h-4 w-4" />}
        onClick={onDelete}
        className="bg-red-600 hover:bg-red-700"
      >
        Delete all
      </Button>
    </div>
  );
}
