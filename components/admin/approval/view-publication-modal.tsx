"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/button";
import { formatResourceType } from "@/lib/utils/format";
import { ResourceTypes } from "@/lib/generated/prisma/enums";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Users, FileText, Tag, File, Calendar } from "lucide-react";

interface ViewPublicationModalProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onRestore?: (id: string) => void;
  documentStatus?: "Pending" | "Accepted" | "Rejected";
}

interface DocumentDetails {
  id: number;
  title: string;
  abstract: string;
  datePublished: string;
  resourceType: ResourceTypes;
  courseId: string;
  filePath: string;
  originalFileName: string;
  fileSize: number | null;
  mimeType: string | null;
  status?: "Pending" | "Accepted" | "Rejected";
  authors: Array<{
    firstName: string;
    middleName: string;
    lastName: string;
    email: string | null;
  }>;
  keywords: string[];
  course?: {
    courseName: string;
    college?: {
      collegeName: string;
    };
  };
  submissionDate?: string;
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
    <p className="text-gray-800">{value || "N/A"}</p>
  </div>
);

export function ViewPublicationModal({ documentId, isOpen, onClose, onAccept, onReject, onRestore, documentStatus }: ViewPublicationModalProps) {
  const [document, setDocument] = useState<DocumentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Gets the current document status, preferring the prop over the fetched document
   */
  const getCurrentStatus = (): "Pending" | "Accepted" | "Rejected" | undefined => {
    return documentStatus || document?.status;
  };

  /**
   * Fetches document details from the API when modal opens
   */
  useEffect(() => {
    if (isOpen && documentId) {
      const fetchDocument = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch(`/api/admin/documents/${documentId}`);
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
            throw new Error(errorData.error || `Failed to fetch document details (${res.status})`);
          }
          const data = await res.json();
          setDocument(data);
        } catch (e) {
          console.error("Error fetching document:", e);
          const errorMessage = e instanceof Error ? e.message : "Failed to load document details. Please try again.";
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      };

      fetchDocument();
    } else {
      // Reset state when modal closes
      setDocument(null);
      setError(null);
      setLoading(false);
    }
  }, [isOpen, documentId]);

  /**
   * Formats author name from individual components
   */
  const formatAuthorName = (author: DocumentDetails["authors"][0]) => {
    return [author.firstName, author.middleName, author.lastName]
      .filter(Boolean)
      .join(" ");
  };

  /**
   * Formats file size in bytes to human-readable format
   */
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Review Publication Details</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-6 py-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : error ? (
            <div className="py-10 text-center text-red-600">{error}</div>
          ) : document ? (
            <>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-red-800 border-b pb-2">Basic Information</h3>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Publication Title</p>
                  <p className="text-gray-800 font-bold mt-1">{document.title}</p>
                </div>
                
                {/* Abstract Section */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Abstract</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm">
                    <p className="text-sm leading-7 text-gray-700 whitespace-pre-wrap">
                      {document.abstract}
                    </p>
                  </div>
                </div>

                {/* Keywords Section */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Keywords {document.keywords && document.keywords.length > 0 && `(${document.keywords.length})`}
                    </p>
                  </div>
                  {document.keywords && document.keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {document.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-pup-gold-light px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-pup-gold-dark hover:text-white"
                        >
                          {keyword.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <p className="text-sm text-gray-500 italic">No keywords provided</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow
                    label="Date Published"
                    value={document.datePublished ? new Date(document.datePublished).toLocaleDateString() : "N/A"}
                  />
                  <InfoRow label="Resource Type" value={formatResourceType(document.resourceType)} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-red-800 border-b pb-2">Authorship & Academic Details</h3>
                
                {/* Authors Section */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Authors ({document.authors.length})
                    </p>
                  </div>
                  <div className="space-y-2">
                    {document.authors.map((author, index) => {
                      const authorName = formatAuthorName(author);
                      return (
                        <div
                          key={index}
                          className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pup-maroon/10 text-sm font-semibold text-pup-maroon">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 shrink-0 text-gray-400" />
                              <p className="font-medium text-gray-900">{authorName}</p>
                            </div>
                            {author.email && (
                              <div className="mt-1 flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                <a
                                  href={`mailto:${author.email}`}
                                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {author.email}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {document.course && (
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow label="College" value={document.course.college?.collegeName || "N/A"} />
                    <InfoRow label="Course/Department" value={document.course.courseName || "N/A"} />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-red-800 border-b pb-2">Submitted File</h3>
                
                <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-100">
                      <File className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">File Name</p>
                        <p className="text-sm font-medium text-gray-900 break-words">
                          {document.originalFileName || document.filePath.split("/").pop() || "N/A"}
                        </p>
                      </div>
                      {document.submissionDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">Submitted:</span>
                          <span>{new Date(document.submissionDate).toLocaleDateString("en-US", { 
                            year: "numeric", 
                            month: "long", 
                            day: "numeric" 
                          })}</span>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0">
                      <span className="inline-flex items-center rounded-md bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
                        PDF
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        <DialogFooter className="pt-4 border-t">
          <DialogClose asChild>
            <Button variant="outline" shape="rounded">Close</Button>
          </DialogClose>
          {getCurrentStatus() === "Rejected" ? (
            <>
              {onRestore && (
                <Button
                  onClick={() => onRestore(documentId)}
                  variant="secondary"
                  shape="rounded"
                  disabled={loading}
                >
                  Restore
                </Button>
              )}
              <Button
                onClick={() => onAccept(documentId)}
                variant="primary"
                shape="rounded"
                disabled={loading}
              >
                Accept
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => onReject(documentId)}
                variant="secondary"
                shape="rounded"
                disabled={loading}
              >
                Reject
              </Button>
              <Button
                onClick={() => onAccept(documentId)}
                variant="primary"
                shape="rounded"
                disabled={loading}
              >
                Accept
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
