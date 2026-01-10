"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Author } from "@/lib/generated/prisma/browser";
import { cn } from "@/lib/utils";
import {
  authorFormSchema,
  type AuthorFormValues,
} from "@/lib/validations/author-schema";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronsUpDown,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface AuthorSelectorProps {
  selectedAuthors: AuthorFormValues[];
  onAuthorsChange: (authors: AuthorFormValues[]) => void;
  error?: string;
}

/**
 * Component for selecting and managing authors
 * Features:
 * - Combobox to select from existing authors
 * - Modal dialog to add new authors
 * - Reorder and remove selected authors
 */
export function AuthorSelector({
  selectedAuthors,
  onAuthorsChange,
  error,
}: AuthorSelectorProps) {
  const [availableAuthors, setAvailableAuthors] = useState<Author[]>([]);
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AuthorFormValues>({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search for authors
  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchAuthors = async () => {
        setIsLoading(true);
        try {
          // If query is empty, fetch first 20 authors ascending by lastName
          const response = await fetch(
            `/api/authors?q=${encodeURIComponent(searchQuery)}`
          );
          if (response.ok) {
            const data = await response.json();
            setAvailableAuthors(data);
          }
        } catch (error) {
          console.error("Failed to fetch authors:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchAuthors();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectAuthor = (author: Author) => {
    const newAuthor: AuthorFormValues = {
      id: author.id, // Preserve ID for connection
      firstName: author.firstName,
      middleName: author.middleName || undefined,
      lastName: author.lastName,
      email: author.email || undefined,
    };

    // Check if author already selected
    const alreadySelected = selectedAuthors.some(
      (a) => a.email === newAuthor.email
    );

    if (!alreadySelected) {
      onAuthorsChange([...selectedAuthors, newAuthor]);
    }
    setOpen(false);
  };

  const handleRemoveAuthor = (index: number) => {
    onAuthorsChange(selectedAuthors.filter((_, i) => i !== index));
  };

  const handleMoveAuthor = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedAuthors.length) return;

    const newAuthors = [...selectedAuthors];
    const temp = newAuthors[index];
    newAuthors[index] = newAuthors[newIndex];
    newAuthors[newIndex] = temp;
    onAuthorsChange(newAuthors);
  };

  const handleAddNewAuthor = async () => {
    setFormErrors({});
    setIsSubmitting(true);

    // Validate with Zod
    const result = authorFormSchema.safeParse(formData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = String(issue.path[0]);
        errors[path] = issue.message;
      });
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    // Add to selected authors
    const newAuthor: AuthorFormValues = {
      firstName: formData.firstName,
      middleName: formData.middleName || undefined,
      lastName: formData.lastName,
      email: formData.email || undefined,
    };

    // Check if author already exists
    const alreadySelected = selectedAuthors.some(
      (a) => a.email === newAuthor.email
    );

    if (alreadySelected) {
      setFormErrors({ email: "This author is already added" });
      setIsSubmitting(false);
      return;
    }

    onAuthorsChange([...selectedAuthors, newAuthor]);

    // Add to available authors if not already there
    const existsInDB = availableAuthors.some(
      (a) => a.email === newAuthor.email
    );
    if (!existsInDB) {
      const fullName = `${newAuthor.firstName} ${newAuthor.middleName || ""} ${
        newAuthor.lastName
      }`.trim();
      setAvailableAuthors([
        ...availableAuthors,
        {
          id: Date.now(), // Temporary ID
          ...newAuthor,
          middleName: newAuthor.middleName || null,
          email: newAuthor.email || null,
          fullName,
        },
      ]);
    }

    // Reset form
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
    });
    setDialogOpen(false);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {/* Author Selection */}
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="flex-1 justify-between"
            >
              Select existing author...
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="p-0"
            align="start"
            style={{ width: "var(--radix-popover-trigger-width)" }}
          >
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search authors..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                {isLoading && (
                  <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </div>
                )}
                {!isLoading && availableAuthors.length === 0 && (
                  <CommandEmpty>
                    No author found.{" "}
                    <button
                      className="text-primary underline"
                      onClick={() => {
                        setOpen(false);
                        setDialogOpen(true);
                        setFormData((prev) => ({
                          ...prev,
                          lastName: searchQuery,
                        }));
                      }}
                    >
                      Create new?
                    </button>
                  </CommandEmpty>
                )}
                <CommandGroup>
                  {availableAuthors.map((author) => (
                    <CommandItem
                      key={author.id}
                      value={`${author.fullName} ${author.email}`}
                      onSelect={() => handleSelectAuthor(author)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedAuthors.some((a) => a.email === author.email)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{author.fullName}</span>
                        {author.email && (
                          <span className="text-xs text-muted-foreground">
                            {author.email}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Add New Author Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Author</DialogTitle>
              <DialogDescription>
                Enter the author's information. This will be added to your
                publication.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className={cn(formErrors.firstName && "border-red-500")}
                />
                {formErrors.firstName && (
                  <p className="text-sm text-red-600">{formErrors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  value={formData.middleName}
                  onChange={(e) =>
                    setFormData({ ...formData, middleName: e.target.value })
                  }
                  className={cn(formErrors.middleName && "border-red-500")}
                />
                {formErrors.middleName && (
                  <p className="text-sm text-red-600">
                    {formErrors.middleName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className={cn(formErrors.lastName && "border-red-500")}
                />
                {formErrors.lastName && (
                  <p className="text-sm text-red-600">{formErrors.lastName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={cn(formErrors.email && "border-red-500")}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddNewAuthor}
                disabled={isSubmitting}
              >
                Add Author
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Selected Authors List */}
      {selectedAuthors.length > 0 && (
        <div className="space-y-2">
          {selectedAuthors.map((author, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 border rounded-lg bg-white dark:bg-slate-950"
            >
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => handleMoveAuthor(index, "up")}
                  disabled={index === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveAuthor(index, "down")}
                  disabled={index === selectedAuthors.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium">
                  {author.firstName} {author.middleName} {author.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{author.email}</p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveAuthor(index)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
