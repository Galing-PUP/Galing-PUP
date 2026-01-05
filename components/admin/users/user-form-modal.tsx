"use client";

import { useState, useEffect, useRef } from "react";
import type { User } from "@/types/users";
import { Button } from "@/components/button";
import { FormInput } from "./form-input";
import { FormSelect } from "./form-select";
import { X } from "lucide-react";

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
  const [formData, setFormData] = useState<Partial<User>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [initialData, setInitialData] = useState<Partial<User>>({});
  const [emailError, setEmailError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userData = user || {};
    setFormData(userData);
    setInitialData(userData);
    setSelectedFile(null);
    setEmailError("");
  }, [isOpen, user]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    const userToSave: User = {
      id: formData.id || `#${Math.floor(Math.random() * 1000)}`,
      name: formData.name || "",
      fullname: formData.fullname || "",
      email: formData.email || "",
      role: formData.role || "Registered",
      status: formData.status || "Pending",
      subscriptionTier: formData.subscriptionTier || 1, // Default to Free
      collegeId: formData.collegeId,
      uploadId: formData.uploadId,
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
      if (typeof value === 'string' && value && !value.endsWith('@gmail.com')) {
        setEmailError('Email must end with @gmail.com');
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
      // For new users, check if ALL required fields are filled and email is valid
      return !!(
        formData.name?.trim() &&
        formData.email?.trim() &&
        formData.email?.endsWith('@gmail.com') &&
        !emailError &&
        formData.role &&
        formData.status
      );
    }
    // For existing users, check if any field has changed
    return (
      !!selectedFile ||
      formData.name !== initialData.name ||
      formData.fullname !== initialData.fullname ||
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

  // Construct image URL if uploadId is a path
  const imageUrl = user?.uploadId && !user.uploadId.startsWith('http')
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ID_UPLOAD/${user.uploadId}`
    : user?.uploadId;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30">
      <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="mt-1 text-gray-500">{description}</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="mt-8 space-y-6">
          {/* Row 1: Full Name and Username */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormInput
              label="Full Name"
              value={formData.fullname || ""}
              onChange={e => handleInputChange('fullname', e.target.value)}
              placeholder="Juan D. Dela Cruz"
            />
            <FormInput
              label="Username"
              value={formData.name || ""}
              onChange={e => handleInputChange('name', e.target.value)}
              placeholder="Username"
            />
          </div>

          {/* Row 2: Email (Full Width) */}
          <div>
            <FormInput
              label="Email Address"
              type="email"
              value={formData.email || ""}
              onChange={e => handleInputChange('email', e.target.value)}
              placeholder="example@gmail.com"
            />
            {emailError && (
              <p className="mt-1 text-xs text-red-600">{emailError}</p>
            )}
            {/* Row 3: Change Password */}
            <div className="mt-4">
              <FormInput
                label="New Password"
                type="password"
                value={formData.password || ""}
                onChange={e => handleInputChange('password', e.target.value)}
                placeholder="Leave blank to keep current password"
              />
            </div>
          </div>


          {/* Row 4: 2x2 Layout for Role, Status, Subscription Tier, College */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Role */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Role</label>
              <div className="relative">
                <select
                  value={formData.role || "User"}
                  onChange={e => handleInputChange('role', e.target.value)}
                  className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-12 text-sm shadow-sm focus:border-red-800 focus:outline-none focus:ring-1 focus:ring-red-800"
                >
                  <option>Viewer</option>
                  <option>Registered</option>
                  <option>Admin</option>
                  <option>Superadmin</option>
                </select>
                <div className="absolute right-0 top-0 h-full w-12 bg-red-100 border-l border-gray-300 rounded-r-md pointer-events-none flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
              <div className="relative">
                <select
                  value={formData.status || ""}
                  onChange={e => handleInputChange('status', e.target.value)}
                  className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-12 text-sm shadow-sm focus:border-red-800 focus:outline-none focus:ring-1 focus:ring-red-800"
                >
                  <option value="" disabled>User Status</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Pending">Pending</option>
                  <option value="Delete">Delete</option>
                </select>
                <div className="absolute right-0 top-0 h-full w-12 bg-red-100 border-l border-gray-300 rounded-r-md pointer-events-none flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Subscription Tier */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Subscription Tier</label>
              <div className="relative">
                <select
                  value={formData.subscriptionTier || 1}
                  onChange={e => handleInputChange('subscriptionTier', parseInt(e.target.value))}
                  className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-12 text-sm shadow-sm focus:border-red-800 focus:outline-none focus:ring-1 focus:ring-red-800"
                >
                  <option value={1}>Free</option>
                  <option value={2}>Paid</option>
                </select>
                <div className="absolute right-0 top-0 h-full w-12 bg-red-100 border-l border-gray-300 rounded-r-md pointer-events-none flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* College Dropdown */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">College</label>
              <div className="relative">
                <select
                  value={formData.collegeId || ""}
                  onChange={e => handleInputChange('collegeId', parseInt(e.target.value))}
                  className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-12 text-sm shadow-sm focus:border-red-800 focus:outline-none focus:ring-1 focus:ring-red-800"
                >
                  <option value="" disabled>Select College</option>
                  {colleges.map((college) => (
                    <option key={college.id} value={college.id}>
                      {college.collegeAbbr}
                    </option>
                  ))}
                </select>
                <div className="absolute right-0 top-0 h-full w-12 bg-red-100 border-l border-gray-300 rounded-r-md pointer-events-none flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>


          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Registration Date and ID Number */}
            {user && (
              <>
                <FormInput
                  label="Registration Date"
                  value={formData.registrationDate ? new Date(formData.registrationDate).toLocaleDateString() : ""}
                  disabled={true}
                  onChange={() => { }} // Read only
                />

                <div>
                  <FormInput
                    label="ID Number"
                    value={formData.id || ""}
                    onChange={e => handleInputChange('id', e.target.value)}
                    disabled={true}
                  />
                </div>
              </>
            )}
          </div>

          {/* ID Image Display & Upload */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">ID Image</label>
            {imageUrl ? (
              <div className="mb-2">
                <img
                  src={imageUrl}
                  alt="User ID"
                  className="h-32 w-auto object-cover border border-gray-300 rounded-md"
                  onError={(e) => {
                    // Hide broken image or show placeholder
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-2 italic">No ID image uploaded.</p>
            )}

            <div className="flex">
              <button
                type="button"
                onClick={handleFileUpload}
                className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Change File
              </button>
              <input
                type="text"
                readOnly
                value={selectedFile ? selectedFile.name : (formData.uploadId ? "Existing file" : "No file chosen")}
                placeholder="No file chosen"
                className="w-full rounded-r-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500"
              />
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
        </div>
        <div className="mt-10 flex justify-end gap-4">
          <Button variant="outline" shape="rounded" onClick={onClose} className="border-gray-300">
            Cancel
          </Button>
          <Button
            variant="primary"
            shape="rounded"
            onClick={handleSave}
            disabled={!hasChanges()}
            className={!hasChanges() ? "opacity-50 cursor-not-allowed" : ""}
          >
            {user ? 'Save Changes' : 'Add User'}
          </Button>
        </div>
      </div>
    </div>
  );
}