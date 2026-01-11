import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, Upload, X, FileText } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";

interface FileUploadProps {
  value: File | null;
  onValueChange: (file: File | null) => void;
  accept?: string;
  className?: string;
}

export default function FileUpload05({ 
  value, 
  onValueChange, 
  accept = ".pdf,.doc,.docx",
  className 
}: FileUploadProps) {
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onValueChange(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    if (file) {
        onValueChange(file);
    }
  };

  const preventDefaults = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className={cn("w-full", className)}>
      {!value ? (
        <div 
            className="mt-4 flex justify-center rounded-md border border-dashed border-input px-6 py-10 transition-colors hover:bg-muted/50"
            onDragOver={preventDefaults}
            onDragEnter={preventDefaults}
            onDragLeave={preventDefaults}
            onDrop={handleDrop}
        >
          <div className="text-center sm:flex sm:items-center sm:gap-x-3">
            <Upload
              className="mx-auto h-8 w-8 text-muted-foreground sm:mx-0 sm:h-6 sm:w-6"
              aria-hidden={true}
            />
            <div className="mt-4 flex text-sm leading-6 text-foreground sm:mt-0">
              <p>Drag and drop or</p>
              <Label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-sm pl-1 font-medium text-primary hover:underline hover:underline-offset-4 z-10"
              >
                <span>choose file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept={accept}
                  onChange={handleFileChange}
                />
              </Label>
              <p className="pl-1">to upload</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative mt-4 rounded-lg bg-muted p-3 border border-border">
          <div className="absolute right-2 top-2 z-10">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-sm text-muted-foreground hover:text-foreground"
              aria-label="Remove"
              onClick={() => onValueChange(null)}
            >
              <X className="size-4" aria-hidden={true} />
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-background shadow-sm ring-1 ring-inset ring-input">
              <FileText
                className="size-5 text-foreground"
                aria-hidden={true}
              />
            </span>
            <div className="w-full pr-8">
              <p className="text-sm font-medium text-foreground truncate">
                {value.name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {/* Basic size formatting if utility not available */ }
                {(value.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
      )}
      
      {!value && (
         <p className="mt-2 text-xs text-muted-foreground text-center sm:text-left">
            Accepted file types: {accept.split(',').join(', ')}
         </p>
      )}
    </div>
  );
}
