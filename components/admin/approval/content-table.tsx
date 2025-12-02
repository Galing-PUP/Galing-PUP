import type { ContentItem } from "@/types/content";
import { Eye, Check, X, Trash2 } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { ResourceTypeBadge } from "./resource-type-badge";

type ContentTableProps = {
  items: ContentItem[];
  onAction: (itemId: string) => void;
  onView: (item: ContentItem) => void;
};

export function ContentTable({ items, onAction, onView }: ContentTableProps) {
  const handleApprove = (id: string) => {
    alert(`Approving item ${id}... (This is a frontend simulation)`);
    onAction(id);
  };

  const handleReject = (id: string) => {
    alert(`Rejecting item ${id}... (This is a frontend simulation)`);
    onAction(id);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item? This is a frontend simulation.")) {
      onAction(id);
    }
  };

  const handleViewClick = (item: ContentItem) => {
    onView(item);
  };

  return (
    <div className="mt-4 flow-root">
      <div className="-mx-6 -my-2 overflow-x-auto">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          {/* Table Header */}
          <div className="mb-2 rounded-lg bg-gray-100 px-4 py-3">
            <div className="grid grid-cols-12 items-center gap-3 text-left text-sm font-semibold text-gray-600">
              <div className="col-span-1">User ID</div>
              <div className="col-span-2">Resource Type</div>
              <div className="col-span-3">Publication Title</div>
              <div className="col-span-2">Author</div>
              <div className="col-span-1">Submitted</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 items-center gap-3 rounded-lg bg-white px-4 py-3 hover:bg-gray-50"
              >
                <div className="col-span-1 text-sm text-gray-700">
                  {item.id}
                </div>
                <div className="col-span-2">
                  <ResourceTypeBadge type={item.resourceType} />
                </div>
                <div className="col-span-3 truncate text-sm font-medium text-gray-800">
                  {item.title}
                </div>
                <div className="col-span-2 text-sm text-gray-600">
                  {item.authors}
                </div>
                <div className="col-span-1 text-sm text-gray-600">
                  {item.submittedDate}
                </div>
                <div className="col-span-1">
                  <StatusBadge status={item.status} />
                </div>
                {/* --- ACTION BUTTONS --- */}
                <div className="col-span-2 flex justify-center space-x-1">
                  <button title="View Details" onClick={() => onView(item)} className="rounded-full p-2 text-blue-600 hover:bg-blue-100 transition-colors">
                    <Eye className="h-5 w-5" />
                  </button>
                  <button title="Approve" onClick={() => handleApprove(item.id)} className="rounded-full p-2 text-green-600 hover:bg-green-100 transition-colors">
                    <Check className="h-5 w-5" />
                  </button>
                   <button title="Reject" onClick={() => handleReject(item.id)} className="rounded-full p-2 text-orange-500 hover:bg-orange-100 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                  <button title="Delete" onClick={() => handleDelete(item.id)} className="rounded-full p-2 text-red-600 hover:bg-red-100 transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
