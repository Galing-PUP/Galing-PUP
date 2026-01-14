"use client";

import { colleges } from "@/data/collegeCourses";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addUserSchema,
  type AddUserFormValues,
} from "@/lib/validations/add-user-schema";

type AddUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
};

/**
 * Modal for adding a new admin user
 * Contains fields from request access page plus role selection
 */
export function AddUserModal({ isOpen, onClose, onUserAdded }: AddUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema) as Resolver<AddUserFormValues>,
    defaultValues: {
      username: "",
      college: 0,
      email: "",
      idNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = form;

  /**
   * Handles file input changes
   * Manually updates form value since RHF doesn't control file inputs well
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("idImage", file);
      await trigger("idImage");
    }
  };

  /**
   * Submits the new user data to the API
   */
  const onSubmit = async (data: AddUserFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Creating user...");

    try {
      const submissionData = new FormData();
      submissionData.append("name", data.username);
      submissionData.append("college", data.college.toString());
      submissionData.append("collegeId", data.college.toString());
      submissionData.append("email", data.email);
      submissionData.append("idNumber", data.idNumber);
      submissionData.append("password", data.password);
      submissionData.append("role", "ADMIN");
      submissionData.append("status", "Accepted");
      submissionData.append("subscriptionTier", "1");
      submissionData.append("idImage", data.idImage);

      const response = await fetch("/api/admin/users", {
        method: "POST",
        body: submissionData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.type === "DUPLICATE_ENTRY") {
          throw new Error("Username or Email already exists");
        }
        throw new Error(result.error || "Failed to create user");
      }

      toast.success("User created successfully", { id: toastId });
      reset();
      onUserAdded();
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast.error(message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles modal close and resets form
   */
  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3">
          <UserPlus className="h-6 w-6 text-pup-maroon" />
          <DialogTitle className="text-2xl font-semibold text-pup-maroon">Add New User</DialogTitle>
        </div>
        <DialogDescription>
          Create a new Admin account with the form below.
        </DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-6">
          {/* Full Name Field */}
          <div className="space-y-2">
            <Label htmlFor="username">Full Name</Label>
            <Input
              id="username"
              placeholder="Enter full name"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-sm text-red-500">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* College Field */}
          <div className="space-y-2">
            <Label htmlFor="college">College</Label>
            <Select
              onValueChange={(value) =>
                setValue("college", parseInt(value, 10), { shouldValidate: true })
              }
            >
              <SelectTrigger id="college" className="w-full">
                <SelectValue placeholder="Select your college or department" />
              </SelectTrigger>
              <SelectContent>
                {colleges.map((college) => (
                  <SelectItem key={college.id} value={college.id.toString()}>
                    {college.collegeName} ({college.collegeAbbr})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.college && (
              <p className="text-sm text-red-500">
                {errors.college.message}
              </p>
            )}
          </div>

          {/* Email and ID Number Row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                id="idNumber"
                placeholder="Enter ID number"
                {...register("idNumber")}
              />
              {errors.idNumber && (
                <p className="text-sm text-red-500">
                  {errors.idNumber.message}
                </p>
              )}
            </div>
          </div>

          {/* Password and Confirm Password Row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="pr-9"
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  className="pr-9"
                  {...register("confirmPassword")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showConfirmPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* ID Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="idImage">ID Image (Max 5MB)</Label>
            <Input
              id="idImage"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="cursor-pointer"
              onChange={handleFileChange}
            />
            {errors.idImage && (
              <p className="text-sm text-red-500">
                {errors.idImage.message as string}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-pup-maroon hover:bg-pup-maroon/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
