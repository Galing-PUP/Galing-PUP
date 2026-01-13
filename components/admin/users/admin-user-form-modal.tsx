"use client";

import { useState, useEffect } from "react";
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
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail } from "lucide-react";

type College = {
  id: number;
  collegeName: string;
  collegeAbbr: string;
};

type AdminUserFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  user: User | null;
  colleges: College[];
};

/**
 * Modal for editing Admin/Superadmin user details
 * Displays role badge, full name as header, and limited editable fields
 */
export function AdminUserFormModal({ isOpen, onClose, onSave, user, colleges }: AdminUserFormModalProps) {
  const getInitialFormData = () => {
    if (user) {
      const normalizedRole = (role: string) => {
        const r = role.toUpperCase();
        if (r === "ADMIN") return "Admin";
        if (r === "SUPERADMIN") return "Superadmin";
        return role;
      };

      return {
        ...user,
        role: normalizedRole(user.role as string) as any
      };
    }
    return {} as Partial<User>;
  };

  const [formData, setFormData] = useState<Partial<User>>(getInitialFormData());
  const [initialData] = useState<Partial<User>>(getInitialFormData());

  useEffect(() => {
    if (isOpen && user) {
      const newData = getInitialFormData();
      setFormData(newData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  const handleSave = () => {
    if (!user) return;

    const userToSave: User = {
      ...user,
      status: formData.status || user.status,
      role: formData.role || user.role,
      collegeId: formData.collegeId !== undefined ? formData.collegeId : user.collegeId,
    };

    onSave(userToSave);
  };

  const handleInputChange = (field: keyof User, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const hasChanges = () => {
    if (!user) return false;
    return (
      formData.status !== initialData.status ||
      formData.role !== initialData.role ||
      formData.collegeId !== initialData.collegeId
    );
  };

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



  const getRoleBadgeStyle = (role?: string) => {
    const r = role?.toUpperCase();
    if (r === 'OWNER') return 'bg-pup-maroon text-white hover:bg-pup-maroon/90';
    if (r === 'SUPERADMIN') return 'bg-pup-gold-dark text-black hover:bg-pup-gold-dark/90';
    if (r === 'ADMIN') return 'bg-pup-gold-light text-gray-900 hover:bg-pup-gold-light/90';
    return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
  };

  const getDotColor = (role?: string) => {
    const r = role?.toUpperCase();
    if (r === 'OWNER') return 'bg-yellow-400';
    if (r === 'SUPERADMIN') return 'bg-red-800';
    if (r === 'ADMIN') return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const imageUrl = user?.idImagePath && !user.idImagePath.startsWith('http')
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ID_UPLOAD/${user.idImagePath}`
    : user?.idImagePath;

  const title = "Edit Admin Information";
  const description = "Update the admin's details and save the changes.";

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        
        <div className="bg-linear-to-br from-white via-gray-50 to-white px-8 py-8 border-b-4 border-pup-maroon shadow-sm rounded-t-lg">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <Badge className={`gap-2 ${getRoleBadgeStyle(formData.role)}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${getDotColor(formData.role)}`} />
                {formData.role || "Admin"}
              </Badge>
              <h2 className="text-4xl font-bold text-pup-maroon leading-tight tracking-tight">
                {formData.fullname || formData.name || "Administrator"}
              </h2>
              <div className="space-y-1.5 pl-1">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-600">{formData.email || "email@example.com"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 space-y-6">
          {/* Row 1: Status and Role */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role || ""}
                onValueChange={value => handleInputChange('role', value)}
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: College and Registration Date */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

            <div className="space-y-2">
              <Label htmlFor="registrationDate">Registration Date</Label>
              <Input
                id="registrationDate"
                value={formData.registrationDate ? new Date(formData.registrationDate).toLocaleDateString() : ""}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          {/* Row 3: ID Number (Full Width) */}
          <div className="space-y-2">
            <Label htmlFor="idNumber">ID Number</Label>
            <Input
              id="idNumber"
              value={formData.id || ""}
              disabled
              className="bg-gray-50"
            />
          </div>

          {/* ID Picture Display */}
          <div className="space-y-2">
            <Label htmlFor="idImage">ID Picture</Label>
            {imageUrl ? (
              <div className="mt-2 border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Admin ID"
                  className="w-full h-auto object-contain rounded-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
                <p className="text-sm text-gray-500 italic text-center">No ID image uploaded.</p>
              </div>
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
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
