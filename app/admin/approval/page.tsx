"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { UserStats } from "@/components/admin/users/user-stats";
import { ContentManagementHeader } from "@/components/admin/approval/content-management-header";
import { ContentTabs, type TabStatus } from "@/components/admin/approval/content-tabs";
import { ContentTable } from "@/components/admin/approval/content-table";
import type { ContentItem } from "@/types/content";
import { ViewPublicationModal } from "@/components/admin/approval/view-publication-modal";
import { DeleteConfirmationDialog } from "@/components/admin/approval/delete-confirmation-dialog";

export default function ContentApprovalPage() {
  const [allContentItems, setAllContentItems] = useState<ContentItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabStatus>("Pending");
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [viewingItem, setViewingItem] = useState<ContentItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches all documents for approval from the API
   */
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/approval");
        if (!res.ok) {
          throw new Error(`Failed to load documents: ${res.status}`);
        }
        const data: ContentItem[] = await res.json();
        setAllContentItems(data);
      } catch (e) {
        console.error("Error fetching documents:", e);
        setError("Failed to load documents from the database.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  /**
   * Handles accepting a document by updating its status to "Accepted"
   * @param itemId - The ID of the document to accept
   */
  const handleAccept = async (itemId: string) => {
    try {
      const res = await fetch(`/api/admin/documents/${itemId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Accepted" }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to accept document");
      }

      // Update local state
      setAllContentItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, status: "Accepted" } : item
        )
      );
      setSelectedItem(null);
      setViewingItem(null);
      toast.success("Document accepted successfully");
    } catch (error) {
      console.error("Error accepting document:", error);
      toast.error("There was an error accepting this document. Please try again.");
    }
  };

  /**
   * Handles rejecting a document by updating its status to "Rejected"
   * @param itemId - The ID of the document to reject
   */
  const handleReject = async (itemId: string) => {
    try {
      const res = await fetch(`/api/admin/documents/${itemId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Rejected" }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to reject document");
      }

      // Update local state
      setAllContentItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, status: "Rejected" } : item
        )
      );
      setSelectedItem(null);
      setViewingItem(null);
      toast.success("Document rejected successfully");
    } catch (error) {
      console.error("Error rejecting document:", error);
      toast.error("There was an error rejecting this document. Please try again.");
    }
  };

  /**
   * Handles deleting a document permanently
   * @param itemId - The ID of the document to delete
   */
  const handleDelete = async (itemId: string) => {
    try {
      const res = await fetch(`/api/admin/documents/${itemId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to delete document");
      }

      // Update local state
      setAllContentItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId)
      );
      setItemToDelete(null);
      toast.success("Document deleted successfully");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("There was an error deleting this document. Please try again.");
    }
  };

  /**
   * Opens the view modal for a document
   * @param item - The document item to view
   */
  const handleView = (item: ContentItem) => {
    setViewingItem(item);
  };

  /**
   * Opens the delete confirmation dialog for a document
   * @param item - The document item to delete
   */
  const handleDeleteRequest = (item: ContentItem) => {
    setItemToDelete(item);
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
      {/* View Modal */}
      {viewingItem && (
        <ViewPublicationModal
          isOpen={!!viewingItem}
          item={viewingItem}
          onClose={() => setViewingItem(null)}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {itemToDelete && (
        <DeleteConfirmationDialog
          isOpen={!!itemToDelete}
          item={itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleDelete}
        />
      )}

      <div className="space-y-8">
        <UserStats />
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <ContentManagementHeader />
          <ContentTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />
          {loading ? (
            <div className="mt-6 py-10 text-center text-gray-500">
              Loading documents...
            </div>
          ) : error ? (
            <div className="mt-6 py-10 text-center text-red-600">
              {error}
            </div>
          ) : (
            <>
              <ContentTable
                items={filteredItems}
                onView={handleView}
                onAccept={handleAccept}
                onReject={handleReject}
                onDeleteRequest={handleDeleteRequest}
              />
              <div className="mt-6 text-sm text-gray-500">
                Showing {filteredItems.length} of {allContentItems.length} total items
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
