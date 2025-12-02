"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/button";
import type { ContentItem } from "@/types/content";

interface ViewPublicationModalProps {
  item: ContentItem;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
    <p className="text-gray-800">{value}</p>
  </div>
);

export function ViewPublicationModal({ item, isOpen, onClose, onApprove, onReject }: ViewPublicationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Review Publication Details</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-6 py-4">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-red-800 border-b pb-2">Basic Information</h3>
            <InfoRow label="Publication Title" value={item.title} />
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Abstract</p>
                <p className="text-gray-800 leading-relaxed mt-1">{item.abstract}</p>
            </div>
            <InfoRow label="Keywords" value={item.keywords} />
            <div className="grid grid-cols-3 gap-4">
                <InfoRow label="Date Submitted" value={item.submittedDate} />
                <InfoRow label="Resource Type" value={item.resourceType} />
                <InfoRow label="Visibility" value={item.visibility} />
            </div>
          </div>

          {/* Section 2: Authorship & Academic Details */}
           <div className="space-y-4">
            <h3 className="font-semibold text-lg text-red-800 border-b pb-2">Authorship & Academic Details</h3>
             <InfoRow label="Authors" value={item.authors} />
             <InfoRow label="Adviser" value={item.adviser} />
             <div className="grid grid-cols-3 gap-4">
                <InfoRow label="Campus" value={item.campus} />
                <InfoRow label="College" value={item.college} />
                <InfoRow label="Department" value={item.department} />
            </div>
            <InfoRow label="Affiliated Library" value={item.library} />
          </div>

           {/* Section 3: File */}
           <div className="space-y-4">
                <h3 className="font-semibold text-lg text-red-800 border-b pb-2">Submitted File</h3>
                <InfoRow label="File Name" value={item.fileName} />
           </div>
        </div>

        <DialogFooter className="pt-4 border-t">
            <DialogClose asChild>
                <Button variant="outline" shape="rounded">Close</Button>
            </DialogClose>
            <Button onClick={() => onReject(item.id)} variant="secondary" shape="rounded">Reject</Button>
            <Button onClick={() => onApprove(item.id)} variant="primary" shape="rounded">Approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
