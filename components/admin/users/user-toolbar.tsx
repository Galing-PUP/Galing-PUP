import { Button } from "@/components/button";
import { SearchBar } from "@/components/search-bar";
import { Filter } from "lucide-react";

export function UserToolbar() {
  return (
    <div className="mt-6 flex flex-col items-stretch gap-4 md:flex-row">
      <div className="flex-1">
        <SearchBar placeholder="Search users by name or email..." size="sm" />
      </div>
      <Button variant="outline" shape="rounded" size="md" icon={<Filter className="h-4 w-4" />} iconPosition="left" className="border-gray-300">
        Filter by Status
      </Button>
      <Button variant="outline" shape="rounded" size="md" icon={<Filter className="h-4 w-4" />} iconPosition="left" className="border-gray-300">
        Filter by Role
      </Button>
    </div>
  );
}
