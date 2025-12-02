"use client";

import { useState, useEffect } from "react";
import type { User, UserRole, UserStatus } from "@/types/users";
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
  const [formData, setFormData] = useState<Partial<User>>(user || {});

  useEffect(() => {
    setFormData(user || {});
  }, [user]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave(formData as User);
  };

  const title = user ? "Edit User Information" : "Add New User";
  const description = user ? "Update the user's details and save the changes." : "Fill in the details to add a new user.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-8 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="mt-1 text-gray-500">{description}</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-8 space-y-6">
          <FormInput label="Full Name" defaultValue={formData.name} />
          <FormSelect label="College">
            <option>College of Computer and Information Sciences</option>
            <option>College of Engineering</option>
            <option>College of Science</option>
          </FormSelect>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormInput label="Email Address" type="email" defaultValue={formData.email} />
            <FormInput label="ID Number" defaultValue={formData.id} />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormSelect label="Role" defaultValue={formData.role}>
              <option>User</option>
              <option>Admin</option>
              <option>Super Admin</option>
            </FormSelect>
            <FormSelect label="Status" defaultValue={formData.status}>
              <option>Accepted</option>
              <option>Pending</option>
              <option>Delete</option>
            </FormSelect>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">ID Image</label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-600">
                Upload File
              </span>
              <input type="text" readOnly value="passport.png" className="w-full rounded-r-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500" />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-10 flex justify-end gap-4">
          <Button variant="outline" shape="rounded" onClick={onClose} className="border-gray-300">
            Cancel
          </Button>
          <Button variant="primary" shape="rounded" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
