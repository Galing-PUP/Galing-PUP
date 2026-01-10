"use client";

import { CourseCombobox } from "@/components/admin/publications/course-combobox";
import { KeywordsSection } from "@/components/admin/publications/form-sections/keywords";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PublicationFormData } from "@/lib/validations/publication-schema";
import { ChevronDownIcon, FileText, Sparkles } from "lucide-react";
import { ChangeEvent, useState } from "react";

interface BasicInfoSectionProps {
  formData: PublicationFormData;
  setFormData: React.Dispatch<React.SetStateAction<PublicationFormData>>;
  errors: Record<string, string>;
}

export function BasicInfoSection({
  formData,
  setFormData,
  errors,
}: BasicInfoSectionProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    formData.datePublished ? new Date(formData.datePublished) : undefined
  );

  const resourceTypeOptions = [
    { value: "THESIS", label: "Thesis" },
    { value: "CAPSTONE", label: "Capstone" },
    { value: "DISSERTATION", label: "Dissertation" },
    { value: "ARTICLE", label: "Article" },
    { value: "RESEARCH_PAPER", label: "Research Paper" },
  ];

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      <CardContent className="pt-2 space-y-6">
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
        <KeywordsSection
          formData={formData}
          setFormData={setFormData}
          errors={errors}
        />

        {/* AI Summary Placeholder */}
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
  );
}
