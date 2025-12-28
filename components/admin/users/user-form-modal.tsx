"use client";

import { useState, useEffect, useRef } from "react";
import type { User } from "@/types/users";
import { Button } from "@/components/button";
import { FormInput } from "./form-input";
import { FormSelect } from "./form-select";
import { X } from "lucide-react";

type UserFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  user: User | null;
};

export function UserFormModal({ isOpen, onClose, onSave, user }: UserFormModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [initialData, setInitialData] = useState<Partial<User>>({});
  const [college, setCollege] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userData = user || {};
    setFormData(userData);
    setInitialData(userData);
    setSelectedFile(null);
    setCollege("");
    setEmailError("");
  }, [isOpen, user]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    const userToSave: User = {
      id: formData.id || `#${Math.floor(Math.random() * 1000)}`,
      name: formData.name || "",
      email: formData.email || "",
      role: formData.role || "Registered",
      status: formData.status || "Pending",
    };
    onSave(userToSave);
  };

  const handleInputChange = (field: keyof User, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Validate email
    if (field === 'email') {
      if (value && !value.endsWith('@gmail.com')) {
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
        formData.id?.trim() &&
        college?.trim() &&
        formData.role &&
        formData.status
      );
    }
    // For existing users, check if any field has changed
    return (
      selectedFile ||
      formData.name !== initialData.name ||
      formData.email !== initialData.email ||
      formData.role !== initialData.role ||
      formData.status !== initialData.status
    );
  };

  const title = user ? "Edit User Information" : "Add New User";
  const description = user ? "Update the user's details and save the changes." : "Fill in the details to add a new user.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30">
      <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-8 shadow-2xl">
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
          <FormInput
            label="Full Name"
            value={formData.name || ""}
            onChange={e => handleInputChange('name', e.target.value)}
            placeholder="First Name, Middle Name, Last Name"
          />

          {/* College with dropdown icon */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">College</label>
            <div className="relative">
              <select
                value={college}
                onChange={e => setCollege(e.target.value)}
                className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-12 text-sm shadow-sm focus:border-red-800 focus:outline-none focus:ring-1 focus:ring-red-800"
                style={{
                  color: college ? '#1f2937' : '#9ca3af'
                }}
              >
                <option value="" disabled style={{ color: '#9ca3af' }}>Choose College</option>
                <option value="College of Computer and Information Sciences" style={{ color: '#1f2937' }}>College of Computer and Information Sciences</option>
                <option value="College of Engineering" style={{ color: '#1f2937' }}>College of Engineering</option>
                <option value="College of Science" style={{ color: '#1f2937' }}>College of Science</option>
              </select>
              <div className="absolute right-0 top-0 h-full w-12 bg-red-100 border-l border-gray-300 rounded-r-md pointer-events-none flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
            </div>
            <FormInput
              label="ID Number"
              value={formData.id || ""}
              onChange={e => handleInputChange('id', e.target.value)}
              disabled={!!user}
            />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormSelect label="Role" value={formData.role || "User"} onChange={e => handleInputChange('role', e.target.value)}>
              <option>Viewer</option>
              <option>Registered</option>
              <option>Admin</option>
              <option>Superadmin</option>
            </FormSelect>

            {/* Status with dropdown icon */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
              <div className="relative">
                <select
                  value={formData.status || ""}
                  onChange={e => handleInputChange('status', e.target.value)}
                  className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-12 text-sm shadow-sm focus:border-red-800 focus:outline-none focus:ring-1 focus:ring-red-800"
                  style={{
                    color: formData.status ? '#1f2937' : '#9ca3af'
                  }}
                >
                  <option value="" disabled style={{ color: '#9ca3af' }}>User Status</option>
                  <option value="Accepted" style={{ color: '#1f2937' }}>Accepted</option>
                  <option value="Pending" style={{ color: '#1f2937' }}>Pending</option>
                  <option value="Delete" style={{ color: '#1f2937' }}>Delete</option>
                </select>
                <div className="absolute right-0 top-0 h-full w-12 bg-red-100 border-l border-gray-300 rounded-r-md pointer-events-none flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">ID Image</label>
            <div className="flex">
              <button
                type="button"
                onClick={handleFileUpload}
                className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Upload File
              </button>
              <input
                type="text"
                readOnly
                value={selectedFile ? selectedFile.name : "No file chosen"}
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
