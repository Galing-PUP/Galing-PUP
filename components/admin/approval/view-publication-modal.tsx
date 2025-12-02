import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import type { ContentItem } from "@/types/content";

interface ViewPublicationModalProps {
  item: ContentItem;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ViewPublicationModal({ item, isOpen, onClose, onApprove, onReject }: ViewPublicationModalProps) {
  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Review Publication</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="space-y-4 my-4 text-sm">
          <p><strong>Title:</strong> {item.title}</p>
          <p><strong>Author:</strong> {item.author}</p>
          <p><strong>Type:</strong> {item.resourceType}</p>
          <p><strong>Submitted:</strong> {item.submittedDate}</p>
          {/* You can add an abstract or other details here */}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
          <AlertDialogAction onClick={() => onReject(item.id)} className="bg-orange-500 hover:bg-orange-600">Reject</AlertDialogAction>
          <AlertDialogAction onClick={() => onApprove(item.id)} className="bg-green-600 hover:bg-green-700">Approve</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
