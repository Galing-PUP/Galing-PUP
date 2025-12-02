"use client";

import { useState, useMemo } from "react";
import { UserStats } from "@/components/admin/users/user-stats";
import { ContentManagementHeader } from "@/components/admin/approval/content-management-header";
import { ContentTabs, type TabStatus } from "@/components/admin/approval/content-tabs";
import { ContentTable } from "@/components/admin/approval/content-table";
import { mockContent } from "@/data/mockContent";
import type { ContentItem } from "@/types/content";

export default function ContentApprovalPage() {
  const [allContentItems, setAllContentItems] = useState<ContentItem[]>(mockContent);
  const [activeTab, setActiveTab] = useState<TabStatus>("Pending");

  const handleAction = (itemId: string) => {
    setAllContentItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const filteredItems = useMemo(() => {
    if (activeTab === "All") {
      return allContentItems;
    }
    return allContentItems.filter((item) => item.status === activeTab);
  }, [allContentItems, activeTab]);

  // Memoize the counts for each tab
  const counts = useMemo(() => ({
    pending: allContentItems.filter(item => item.status === 'Pending').length,
    rejected: allContentItems.filter(item => item.status === 'Rejected').length,
    accepted: allContentItems.filter(item => item.status === 'Accepted').length,
  }), [allContentItems]);

  return (
    <div className="space-y-8">
      <UserStats />
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <ContentManagementHeader />

        {/* Pass the active tab, the handler to change it, and the counts */}
        <ContentTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
        />

        {/* Pass the *filtered* list of items to the table */}
        <ContentTable items={filteredItems} onAction={handleAction} />

        <div className="mt-6 text-sm text-gray-500">
          Showing {filteredItems.length} of {allContentItems.length} total items
        </div>
      </div>
    </div>
  );
}
