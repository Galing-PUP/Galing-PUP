'use client'

import FileUpload05 from '@/components/file-upload-05'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatFileSize } from '@/lib/utils'
import { PublicationFormData } from '@/lib/validations/publication-schema'
import { FileText, Info, Upload } from 'lucide-react'

interface FileSectionProps {
  formData: PublicationFormData
  setFormData: React.Dispatch<React.SetStateAction<PublicationFormData>>
  uploadedFiles: File[]
  setUploadedFiles: React.Dispatch<React.SetStateAction<File[]>>
  existingFileName?: string
  existingFileSize?: number
  existingFileDate?: string
  existingFilePath?: string
  documentId?: number
  documentToken?: string
}

export function FileSection({
  formData,
  setFormData,
  uploadedFiles,
  setUploadedFiles,
  existingFileName,
  existingFileSize,
  existingFileDate,
  existingFilePath,
  documentId,
  documentToken,
}: FileSectionProps) {
  return (
    <Card>
      <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Upload className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">
              Section 3: File Management <span className="text-red-500">*</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Upload and verify the primary academic document
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 space-y-6">
        {/* Existing File Display (Edit Mode) */}
        {existingFileName && (
          <div className="flex flex-col gap-4">
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
              <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium flex items-center gap-2">
                <Info className="h-3 w-3" />
                Note: Uploading a new file below will replace the current
                document.
              </p>
            </div>

            {existingFilePath ? (
              <a
                href={
                  documentToken
                    ? `/api/pdf/${encodeURIComponent(documentToken)}`
                    : existingFilePath
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-sm font-bold flex items-center gap-2">
                      {existingFileName}
                      <Upload className="h-3 w-3 opacity-50" />
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {existingFileSize && formatFileSize(existingFileSize)}
                      {existingFileDate && ` • Uploaded on ${existingFileDate}`}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded-full group-hover:bg-primary/90">
                  View PDF
                </span>
              </a>
            ) : (
              <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-bold">{existingFileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {existingFileSize && formatFileSize(existingFileSize)}
                      {existingFileDate && ` • Uploaded on ${existingFileDate}`}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded-full">
                  Current File
                </span>
              </div>
            )}
          </div>
        )}

        {/* File Upload */}
        <FileUpload05
          value={uploadedFiles[0] || formData.file}
          onValueChange={(file: File | null) => {
            if (file) {
              setUploadedFiles([file])
              setFormData((prev) => ({ ...prev, file }))
            } else {
              setUploadedFiles([])
              setFormData((prev) => ({ ...prev, file: null }))
            }
          }}
          accept=".pdf"
          className="border-dashed hover:bg-muted/50"
        />
      </CardContent>
    </Card>
  )
}
