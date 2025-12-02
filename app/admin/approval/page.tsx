"use client";

import { useState } from "react";
import { UserStats } from "@/components/admin/users/user-stats";
import { ContentManagementHeader } from "@/components/admin/approval/content-management-header";
import { ContentTabs } from "@/components/admin/approval/content-tabs";
import { ContentTable } from "@/components/admin/approval/content-table";
import { mockContent } from "@/data/mockContent";
import type { ContentItem } from "@/types/content";
import { ViewPublicationModal } from "@/components/admin/approval/view-publication-modal";

export default function ContentApprovalPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>(mockContent);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const handleAction = (itemId: string) => {
    setContentItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    if (selectedItem?.id === itemId) {
      setSelectedItem(null);
    }
  };

  const handleView = (item: ContentItem) => {
    setSelectedItem(item);
  };

  return (
    <>
      {/* Render the modal when an item is selected */}
      {selectedItem && (
        <ViewPublicationModal
          isOpen={!!selectedItem}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onApprove={handleAction}
          onReject={handleAction}
        />
      )}

      <div className="space-y-8">
        {/* <UserStats /> */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <ContentManagementHeader />
          <ContentTabs />
          {/* Pass the handleView function to the table */}
          <ContentTable items={contentItems} onAction={handleAction} onView={handleView} />
          <div className="mt-6 text-sm text-gray-500">
            Showing {contentItems.length} of {contentItems.length} pending content
          </div>
        </div>
      </div>
    </>
  );
}
