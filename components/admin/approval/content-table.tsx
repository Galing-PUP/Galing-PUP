import type { ContentItem } from "@/types/content";
import { Eye } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { ResourceTypeBadge } from "./resource-type-badge";

type ContentTableProps = {
  items: ContentItem[];
};

export function ContentTable({ items }: ContentTableProps) {
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
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Actions</div>
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
                  {item.author}
                </div>
                <div className="col-span-1 text-sm text-gray-600">
                  {item.submittedDate}
                </div>
                <div className="col-span-2">
                  <StatusBadge status={item.status} />
                </div>
                <div className="col-span-1">
                  <button className="rounded-full p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-800">
                    <Eye className="h-5 w-5" />
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
