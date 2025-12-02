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

  const handleAccept = (itemId: string) => {
    setAllContentItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, status: "Accepted" } : item
      )
    );
    setSelectedItem(null);
    console.log(`Item ${itemId} has been accepted.`);
  };

  const handleReject = (itemId: string) => {
    setAllContentItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, status: "Rejected" } : item
      )
    );
    setSelectedItem(null);
    console.log(`Item ${itemId} has been rejected.`);
  };


  const handleDelete = (itemId: string) => {
    setAllContentItems((prevItems) =>
      prevItems.filter((item) => item.id !== itemId)
    );
    setSelectedItem(null);
    console.log(`Item ${itemId} has been deleted.`);
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
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}

      <div className="space-y-8">
        <UserStats />
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <ContentManagementHeader />
          <ContentTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />
          <ContentTable
            items={filteredItems}
            onView={handleView}
            onAccept={handleAccept}
            onReject={handleReject}
            onDelete={handleDelete}
          />
          <div className="mt-6 text-sm text-gray-500">
            Showing {filteredItems.length} of {allContentItems.length} total items
          </div>
        </div>
      </div>
    </>
  );
}
