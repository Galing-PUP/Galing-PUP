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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userData = user || {};
    setFormData(userData);
    setInitialData(userData);
    setSelectedFile(null);
  }, [isOpen, user]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    const userToSave: User = {
      id: formData.id || `#${Math.floor(Math.random() * 1000)}`,
      name: formData.name || "",
      email: formData.email || "",
      role: formData.role || "User",
      status: formData.status || "Pending",
    };
    onSave(userToSave);
  };

  const handleInputChange = (field: keyof User, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    if (selectedFile) return true;
    if (!user) {
      // For new users, check if any field has been filled
      return !!(formData.name || formData.email || formData.id);
    }
    // For existing users, check if any field has changed
    return (
      formData.name !== initialData.name ||
      formData.email !== initialData.email ||
      formData.role !== initialData.role ||
      formData.status !== initialData.status
    );
  };

  const title = user ? "Edit User Information" : "Add New User";
  const description = user ? "Update the user's details and save the changes." : "Fill in the details to add a new user.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
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
          <FormInput label="Full Name" value={formData.name || ""} onChange={e => handleInputChange('name', e.target.value)} />
          <FormSelect label="College">
            <option>College of Computer and Information Sciences</option>
            <option>College of Engineering</option>
            <option>College of Science</option>
          </FormSelect>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormInput label="Email Address" type="email" value={formData.email || ""} onChange={e => handleInputChange('email', e.target.value)} />
            <FormInput label="ID Number" value={formData.id || ""} onChange={e => handleInputChange('id', e.target.value)} disabled={!!user} />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormSelect label="Role" value={formData.role || "User"} onChange={e => handleInputChange('role', e.target.value)}>
              <option>User</option>
              <option>Admin</option>
              <option>Super Admin</option>
            </FormSelect>
            <FormSelect label="Status" value={formData.status || "Pending"} onChange={e => handleInputChange('status', e.target.value)}>
              <option>Accepted</option>
              <option>Pending</option>
              <option>Delete</option>
            </FormSelect>
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
