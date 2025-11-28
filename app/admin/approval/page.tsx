import { UserStats } from "@/components/admin/users/user-stats";
import { ContentManagementHeader } from "@/components/admin/approval/content-management-header";
import { ContentTabs } from "@/components/admin/approval/content-tabs";
import { ContentTable } from "@/components/admin/approval/content-table";
import { mockContent } from "@/data/mockContent";

export default function ContentApprovalPage() {
  const contentItems = mockContent;

  return (
    <div className="space-y-8">
      {/* This section is reused directly from the user management page */}
      <UserStats />

      {/* Main Content Area */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <ContentManagementHeader />
        <ContentTabs />
        <ContentTable items={contentItems} />

        {/* Table Footer */}
        <div className="mt-6 text-sm text-gray-500">
          Showing {contentItems.length} of 1,247 pending content
        </div>
      </div>
    </div>
  );
}
