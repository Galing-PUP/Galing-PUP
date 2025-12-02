"use client";

import { useState, useMemo } from "react";
import { UserStats } from "@/components/admin/users/user-stats";
import { ContentManagementHeader } from "@/components/admin/approval/content-management-header";
import { ContentTabs, type TabStatus } from "@/components/admin/approval/content-tabs";
import { ContentTable } from "@/components/admin/approval/content-table";
import { mockContent } from "@/data/mockContent";
import type { ContentItem } from "@/types/content";
import { ViewPublicationModal } from "@/components/admin/approval/view-publication-modal";

export default function ContentApprovalPage() {
  const [allContentItems, setAllContentItems] = useState<ContentItem[]>(mockContent);
  const [activeTab, setActiveTab] = useState<TabStatus>("Pending");

  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const handleAction = (itemId: string) => {
    setAllContentItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    setSelectedItem(null); // Close the modal after any action
  };

  const handleView = (item: ContentItem) => {
    setSelectedItem(item);
  };

  const filteredItems = useMemo(() => {
    if (activeTab === "All") return allContentItems;
    return allContentItems.filter((item) => item.status === activeTab);
  }, [allContentItems, activeTab]);

  const counts = useMemo(() => ({
    pending: allContentItems.filter(item => item.status === 'Pending').length,
    rejected: allContentItems.filter(item => item.status === 'Rejected').length,
    accepted: allContentItems.filter(item => item.status === 'Accepted').length,
  }), [allContentItems]);

  return (
    <>
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
        <UserStats />
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <ContentManagementHeader />
          <ContentTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />
          <ContentTable items={filteredItems} onAction={handleAction} onView={handleView} />
          <div className="mt-6 text-sm text-gray-500">
            Showing {filteredItems.length} of {allContentItems.length} total items
          </div>
        </div>
      </div>
    </>
  );
}
