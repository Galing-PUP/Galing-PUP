"use client";

import { CourseCombobox } from "@/components/admin/publications/course-combobox";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import {
  Tags,
  TagsContent,
  TagsEmpty,
  TagsGroup,
  TagsInput,
  TagsItem,
  TagsList,
  TagsTrigger,
  TagsValue,
} from "@/components/ui/shadcn-io/tags";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  publicationEditSchema,
  publicationSchema,
} from "@/lib/validations/publication-schema";
import {
  CheckIcon,
  ChevronDownIcon,
  FileText,
  GripVertical,
  PlusIcon,
  Sparkles,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { AuthorSelector, type Author } from "@/components/admin/publications/author-selector";

export interface PublicationFormData {
  title: string;
  abstract: string;
  keywords: string[];
  datePublished: string;
  resourceType: string;
  authors: Author[];
  courseId: string;
  file: File | null;
}

interface PublicationFormProps {
  initialData?: Partial<PublicationFormData>;
  onSubmit: (data: PublicationFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  title: string;
  description: string;
  submitLabel: string;
  existingFileName?: string;
  existingFileSize?: number;
  existingFileDate?: string;
}

/**
 * A modern, sectioned form component for managing research publications.
 * Features multi-author management, tag chips, drag-and-drop file upload,
 * and AI summary placeholder.
 */
export function PublicationForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  title,
  description,
  submitLabel,
  existingFileName,
  existingFileSize,
  existingFileDate,
}: PublicationFormProps) {
  const [formData, setFormData] = useState<PublicationFormData>({
    title: initialData?.title || "",
    abstract: initialData?.abstract || "",
    keywords: initialData?.keywords || [],
    datePublished: initialData?.datePublished || "",
    resourceType: initialData?.resourceType || "",
    authors: initialData?.authors || [],
    courseId: initialData?.courseId || "",
    file: null,
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialData?.datePublished ? new Date(initialData.datePublished) : undefined
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newKeyword, setNewKeyword] = useState<string>("");
  const [availableKeywords, setAvailableKeywords] = useState<string[]>([]);

  const resourceTypeOptions = [
    { value: "THESIS", label: "Thesis" },
    { value: "CAPSTONE", label: "Capstone" },
    { value: "DISSERTATION", label: "Dissertation" },
    { value: "ARTICLE", label: "Article" },
    { value: "RESEARCH_PAPER", label: "Research Paper" },
  ];

  // Fetch existing keywords from database
  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const response = await fetch("/api/keywords");
        if (response.ok) {
          const data = await response.json();
          setAvailableKeywords(
            data.map((k: { keywordText: string }) => k.keywordText)
          );
        }
      } catch (error) {
        console.error("Failed to fetch keywords:", error);
      }
    };
    fetchKeywords();
  }, []);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Author management functions
  const removeKeyword = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };

  // Handlers for shadcn Tags component
  const handleKeywordSelect = (value: string) => {
    if (formData.keywords.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        keywords: prev.keywords.filter((k) => k !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, value],
      }));
    }
  };

  const handleKeywordRemove = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== value),
    }));
  };

  const handleCreateKeyword = () => {
    const trimmed = newKeyword.trim();
    if (trimmed && !formData.keywords.includes(trimmed)) {
      // Add to form data
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, trimmed],
      }));
      // Add to available keywords if not already there
      if (!availableKeywords.includes(trimmed)) {
        setAvailableKeywords((prev) => [...prev, trimmed].sort());
      }
      setNewKeyword("");
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const submitData = {
      ...formData,
      file: uploadedFiles[0] || formData.file,
    };

    // Validate with Zod
    const schema = existingFileName ? publicationEditSchema : publicationSchema;
    const result = schema.safeParse(submitData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);

      // Scroll to first error
      const firstErrorElement = document.querySelector('[data-error="true"]');
      firstErrorElement?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    onSubmit(submitData);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Helper to display field errors
  const FieldError = ({ name }: { name: string }) => {
    if (!errors[name]) return null;
    return (
      <p className="text-sm text-red-600 mt-1" data-error="true">
        {errors[name]}
      </p>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section 1: Metadata */}
      <Card>
        <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Section 1: Metadata</CardTitle>
              <CardDescription className="text-xs">
                Core identification and descriptive details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Document Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">
              Document Title
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter the full title of the publication"
              className={cn("text-sm", errors.title && "border-red-500")}
              required
            />
            <FieldError name="title" />
          </div>

          {/* Abstract */}
          <div className="space-y-2">
            <Label htmlFor="abstract" className="text-sm font-semibold">
              Abstract
            </Label>
            <Textarea
              id="abstract"
              name="abstract"
              value={formData.abstract}
              onChange={handleInputChange}
              placeholder="Enter a brief summary of your research (150-300 words)"
              rows={4}
              className={cn(
                "text-sm resize-none",
                errors.abstract && "border-red-500"
              )}
              required
            />
            <FieldError name="abstract" />
          </div>

          {/* Date, Resource Type, Visibility Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date of Publication */}
            <div className="space-y-2">
              <Label htmlFor="datePublished" className="text-sm font-semibold">
                Date Published
              </Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="datePublished"
                    className="w-full justify-between font-normal text-sm"
                  >
                    {selectedDate
                      ? selectedDate.toLocaleDateString()
                      : "Select date"}
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setFormData((prev) => ({
                        ...prev,
                        datePublished: date
                          ? date.toISOString().split("T")[0]
                          : "",
                      }));
                      setDatePickerOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Resource Type */}
            <div className="space-y-2">
              <Label htmlFor="resourceType" className="text-sm font-semibold">
                Resource Type
              </Label>
              <Select
                value={formData.resourceType}
                onValueChange={(value) =>
                  handleSelectChange("resourceType", value)
                }
              >
                <SelectTrigger id="resourceType" className="text-sm">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Course / Program */}
            <div className="space-y-2">
              <Label htmlFor="courseId" className="text-sm font-semibold">
                Course / Program
              </Label>
              <CourseCombobox
                value={formData.courseId}
                onValueChange={(value) => handleSelectChange("courseId", value)}
              />
            </div>
          </div>

          {/* Keywords / Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Keywords / Tags</Label>
            <Tags className="w-full">
              <TagsTrigger className="w-full justify-start min-h-[42px]">
                {formData.keywords.map((keyword) => (
                  <TagsValue
                    key={keyword}
                    onRemove={() => handleKeywordRemove(keyword)}
                  >
                    {keyword}
                  </TagsValue>
                ))}
              </TagsTrigger>
              <TagsContent>
                <TagsInput
                  onValueChange={setNewKeyword}
                  value={newKeyword}
                  placeholder="Search or create tag..."
                />
                <TagsList>
                  <TagsEmpty>
                    <button
                      className="mx-auto flex cursor-pointer items-center gap-2 text-sm"
                      onClick={handleCreateKeyword}
                      type="button"
                    >
                      <PlusIcon className="text-muted-foreground" size={14} />
                      Create new tag: {newKeyword}
                    </button>
                  </TagsEmpty>
                  <TagsGroup>
                    {availableKeywords
                      .filter((keyword) =>
                        keyword.toLowerCase().includes(newKeyword.toLowerCase())
                      )
                      .map((keyword) => (
                        <TagsItem
                          key={keyword}
                          onSelect={handleKeywordSelect}
                          value={keyword}
                        >
                          {keyword}
                          {formData.keywords.includes(keyword) && (
                            <CheckIcon
                              className="text-muted-foreground"
                              size={14}
                            />
                          )}
                        </TagsItem>
                      ))}
                  </TagsGroup>
                </TagsList>
              </TagsContent>
            </Tags>
            <FieldError name="keywords" />
          </div>

          {/* AI Summary Placeholder - Feature not yet functional */}
          <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-4 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold text-primary">
                AI-Generated Summary
              </span>
              <span className="text-xs text-muted-foreground italic">
                (Feature coming soon)
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
              AI-powered summaries will automatically generate concise overviews
              of your research once this feature is implemented.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Authorship */}
      <Card>
        <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Section 2: Authorship</CardTitle>
              <CardDescription className="text-xs">
                Select existing authors or add new contributors
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <AuthorSelector
            selectedAuthors={formData.authors}
            onAuthorsChange={(authors) =>
              setFormData((prev) => ({ ...prev, authors }))
            }
            error={errors.authors}
          />
        </CardContent>
      </Card>

      {/* Section 3: File Management */}
      <Card>
        <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                Section 3: File Management
              </CardTitle>
              <CardDescription className="text-xs">
                Upload and verify the primary academic document
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Existing File Display (Edit Mode) */}
          {existingFileName && (
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

          {/* Dropzone */}
          <Dropzone
            src={uploadedFiles}
            onDrop={(acceptedFiles) => {
              setUploadedFiles(acceptedFiles);
              setFormData((prev) => ({ ...prev, file: acceptedFiles[0] }));
            }}
            accept={{
              "application/pdf": [".pdf"],
              "application/msword": [".doc"],
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                [".docx"],
            }}
            maxSize={50 * 1024 * 1024} // 50MB
            className="border-2 border-dashed hover:border-primary transition-colors"
          >
            <DropzoneContent />
            <DropzoneEmptyState />
          </Dropzone>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
