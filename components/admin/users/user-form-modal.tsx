"use client";

import { useState, useEffect, useRef } from "react";
import type { User } from "@/types/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User as UserIcon, Mail } from "lucide-react";

type College = {
  id: number;
  collegeName: string;
  collegeAbbr: string;
};

type UserFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User, file?: File | null) => void;
  user: User | null;
  colleges: College[];
};

export function UserFormModal({ isOpen, onClose, onSave, user, colleges }: UserFormModalProps) {
  // Initialize formData based on whether we're editing or creating
  const getInitialFormData = () => {
    if (user) {
      // Normalize role to TitleCase to match Select options
      const normalizedRole = (role: string) => {
        const r = role.toUpperCase();
        if (r === "ADMIN") return "Admin";
        if (r === "SUPERADMIN") return "Superadmin";
        if (r === "REGISTERED") return "Registered";
        if (r === "VIEWER") return "Viewer";
        return role; // Fallback
      };

      return {
        ...user,
        role: normalizedRole(user.role as string) as any
      };
    }
    return {
      role: "Registered",
      status: "Pending",
      subscriptionTier: 1,
      subscriptionTier: 1,
      name: "",
      email: "",
      collegeId: undefined,
      idNumber: undefined,
      idImagePath: undefined
    } as Partial<User>;
  };

  const [formData, setFormData] = useState<Partial<User>>(getInitialFormData());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [initialData] = useState<Partial<User>>(getInitialFormData());
  const [emailError, setEmailError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const newData = getInitialFormData();
      setFormData(newData);
      setSelectedFile(null);
      setEmailError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSave = () => {
    const userToSave: User = {
      id: formData.id || `#${Math.floor(Math.random() * 1000)}`,
      id: formData.id || `#${Math.floor(Math.random() * 1000)}`,
      name: formData.name || "",
      email: formData.email || "",
      role: formData.role || "Registered",
      status: formData.status || "Pending",
      subscriptionTier: formData.subscriptionTier || 1,
      registrationDate: formData.registrationDate || new Date().toISOString(),
      collegeId: formData.collegeId,
      idImagePath: formData.idImagePath,
    };

    if (formData.password) {
      userToSave.password = formData.password;
    }

    onSave(userToSave, selectedFile);
  };

  const handleInputChange = (field: keyof User, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Validate email
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (typeof value === 'string' && value && !emailRegex.test(value)) {
        setEmailError('Invalid email format');
      } else {
        setEmailError('');
      }
    }

  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Check if there are any changes
  const hasChanges = () => {
    if (!user) {
      // For new users, check if REQUIRED fields are filled and valid
      // College and ID Upload are OPTIONAL
      return !!(
        formData.name?.trim() &&
        formData.email?.trim() &&
        !emailError &&
        formData.role &&
        formData.status
      );
    }
    // For existing users, check if any field has changed
    return (
      !!selectedFile ||
      formData.name !== initialData.name ||
      formData.email !== initialData.email ||
      formData.role !== initialData.role ||
      formData.status !== initialData.status ||
      formData.subscriptionTier !== initialData.subscriptionTier ||
      formData.collegeId !== initialData.collegeId ||
      (!!formData.password && formData.password.trim() !== "")
    );
  };

  const title = user ? "Edit User Information" : "Add New User";
  const description = user ? "Update the user's details and save the changes." : "Fill in the details to add a new user.";

  // Construct image URL if idImagePath is a path
  const imageUrl = user?.idImagePath && !user.idImagePath.startsWith('http')
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ID_UPLOAD/${user.idImagePath}`
    : user?.idImagePath;

  // Get status badge variant
  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'Accepted':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Delete':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
        {user ? (
          <>
            <DialogTitle className="sr-only">{title}</DialogTitle>
            <DialogDescription className="sr-only">{description}</DialogDescription>
            <div className="bg-linear-to-br from-white via-gray-50 to-white px-8 py-8 border-b-4 border-pup-maroon shadow-sm rounded-t-lg">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <Badge variant={getStatusBadgeVariant(formData.status)} className="gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${formData.status === 'Accepted'
                      ? 'bg-green-500'
                      : formData.status === 'Pending'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                      }`} />
                    {formData.status || "Unknown"}
                  </Badge>
                  <h2 className="text-4xl font-bold text-pup-maroon leading-tight tracking-tight">
                    {formData.name || ""}
                  </h2>
                  <div className="space-y-1.5 pl-1">
                    <div className="flex items-center gap-2.5">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-semibold text-gray-700">@{formData.name || "username"}</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-600">{formData.email || "email@example.com"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <DialogHeader className="p-8 pb-4 rounded-t-lg">
            <DialogTitle className="text-2xl font-bold text-gray-900">{title}</DialogTitle>
            <DialogDescription className="text-gray-500">{description}</DialogDescription>
          </DialogHeader>
        )}

        <div className="flex-1 overflow-y-auto px-8 space-y-6">
          {/* For new users only: Show full name, username, email, and password fields */}
          {!user && (
            <>
              {/* Row 1: Full Name and Username */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.name || ""}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder="Username"
                  />
                </div>
              </div>

              {/* Row 2: Email and Password */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={e => handleInputChange('email', e.target.value)}
                    placeholder="example@gmail.com"
                  />
                  {emailError && (
                    <p className="text-xs text-red-600">{emailError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password || ""}
                    onChange={e => handleInputChange('password', e.target.value)}
                    placeholder="Enter password"
                  />
                </div>
              </div>
            </>
          )}

          {/* 2x2 Layout for Role, Status, Subscription Tier, College */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role || "Registered"}
                onValueChange={value => handleInputChange('role', value)}
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                  <SelectItem value="Registered">Registered</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || ""}
                onValueChange={value => handleInputChange('status', value)}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="User Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Delete">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subscription Tier */}
            <div className="space-y-2">
              <Label htmlFor="subscription">Subscription Tier</Label>
              <Select
                value={String(formData.subscriptionTier || 1)}
                onValueChange={value => handleInputChange('subscriptionTier', parseInt(value))}
              >
                <SelectTrigger id="subscription" className="w-full">
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Free</SelectItem>
                  <SelectItem value="2">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* College Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="college">College</Label>
              <Select
                value={formData.collegeId ? String(formData.collegeId) : ""}
                onValueChange={value => {
                  if (value) {
                    handleInputChange('collegeId', parseInt(value));
                  }
                }}
              >
                <SelectTrigger id="college" className="w-full">
                  <SelectValue placeholder="Select College" />
                </SelectTrigger>
                <SelectContent>
                  {colleges.map((college) => (
                    <SelectItem key={college.id} value={String(college.id)}>
                      {college.collegeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Registration Date and ID Number (for existing users) */}
          {user && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="registrationDate">Registration Date</Label>
                <Input
                  id="registrationDate"
                  value={formData.registrationDate ? new Date(formData.registrationDate).toLocaleDateString() : ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number</Label>
                <Input
                  id="idNumber"
                  value={formData.id || ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
          )}

          {/* ID Image Display & Upload */}
          <div className="space-y-2">
            <Label htmlFor="idImage">ID Image</Label>

            <div className="flex">
              <Button
                type="button"
                variant="outline"
                onClick={handleFileUpload}
                disabled={!!user}
                className="rounded-r-none border-r-0"
              >
                Change File
              </Button>
              <Input
                readOnly
                value={selectedFile ? selectedFile.name : (formData.idImagePath ? "Existing file" : "No file chosen")}
                placeholder="No file chosen"
                className="rounded-l-none bg-gray-100 text-gray-500"
              />
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                disabled={!!user}
                className="hidden"
              />
            </div>

            {imageUrl ? (
              <div className="mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="User ID"
                  className="w-full h-auto object-contain border border-gray-300 rounded-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No ID image uploaded.</p>
            )}
          </div>
        </div>

        <DialogFooter className="p-8 pt-4 border-t border-gray-100 rounded-b-lg">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges()}
            className={!hasChanges() ? "opacity-50 cursor-not-allowed" : ""}
          >
            {user ? 'Save Changes' : 'Add User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}