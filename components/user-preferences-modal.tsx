"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UserPreferencesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialUsername: string;
  onUsernameUpdated?: (nextUsername: string) => void;
};

/**
 * Validation schema for user preferences form
 */
const preferencesSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .min(2, "Username must be at least 2 characters")
      .regex(
        /^[a-zA-Z0-9.]+$/,
        "Username can only contain letters, numbers, and periods"
      ),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // If password is provided, it must meet requirements
      if (data.newPassword && data.newPassword.length > 0) {
        return data.newPassword.length >= 8;
      }
      return true;
    },
    {
      message: "Password must be at least 8 characters long",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword.length > 0) {
        return /[A-Z]/.test(data.newPassword);
      }
      return true;
    },
    {
      message: "Password must contain at least one uppercase letter",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword.length > 0) {
        return /[a-z]/.test(data.newPassword);
      }
      return true;
    },
    {
      message: "Password must contain at least one lowercase letter",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword.length > 0) {
        return /[0-9]/.test(data.newPassword);
      }
      return true;
    },
    {
      message: "Password must contain at least one number",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword.length > 0) {
        return /[^A-Za-z0-9]/.test(data.newPassword);
      }
      return true;
    },
    {
      message: "Password must contain at least one special character",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      // If either password field has a value, both must match
      if (data.newPassword || data.confirmPassword) {
        return data.newPassword === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

type PreferencesFormValues = z.infer<typeof preferencesSchema>;

/**
 * Modal for updating the authenticated user's own preferences.
 *
 * Allows changing the display username and optionally setting a new password.
 * Submits changes to `/api/user/preferences` and notifies the parent when
 * the username has been updated so the UI header can reflect the change.
 */
export function UserPreferencesModal({
  isOpen,
  onClose,
  initialUsername,
  onUsernameUpdated,
}: UserPreferencesModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      username: initialUsername,
      newPassword: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  // Reset form when modal opens or initialUsername changes
  useEffect(() => {
    if (isOpen) {
      reset({
        username: initialUsername,
        newPassword: "",
        confirmPassword: "",
      });
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, initialUsername, reset]);

  /**
   * Handles closing the modal and resetting state
   */
  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  /**
   * Handles form submission with username availability check
   */
  const onSubmit = async (data: PreferencesFormValues) => {
    const trimmedUsername = data.username.trim();

    // Check username availability if it changed
    if (trimmedUsername !== initialUsername) {
      try {
        const checkResponse = await fetch(
          `/api/user/preferences?username=${encodeURIComponent(
            trimmedUsername
          )}`
        );

        if (!checkResponse.ok) {
          throw new Error("Failed to check username");
        }

        const checkData: { available: boolean; username: string } =
          await checkResponse.json();

        if (!checkData.available) {
          toast.error("This username is already taken");
          return;
        }
      } catch (error) {
        console.error("Error checking username availability:", error);
        toast.error("Failed to check username availability");
        return;
      }
    }

    // Submit the form
    try {
      setIsSubmitting(true);
      toast.loading("Saving preferences...", { id: "preferences" });

      const response = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: trimmedUsername,
          newPassword: data.newPassword || undefined,
        }),
      });

      if (!response.ok) {
        const responseData = await response.json().catch(() => ({}));
        const message = responseData.error || "Failed to update preferences.";
        throw new Error(message);
      }

      const result: { username: string | null } = await response.json();

      if (result.username) {
        onUsernameUpdated?.(result.username);
      }

      toast.success("Preferences updated successfully.", {
        id: "preferences",
      });

      handleClose();
    } catch (error: unknown) {
      console.error("Failed to update preferences:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update preferences. Please try again.",
        { id: "preferences" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-semibold text-neutral-900">
            User Preferences
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-500">
            Update your display name or set a new password for your account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Username Field */}
          <div className="space-y-2">
            <Label
              htmlFor="preferences-username"
              className="text-xs font-semibold uppercase tracking-wide text-neutral-600"
            >
              Username
            </Label>
            <Input
              id="preferences-username"
              type="text"
              className={`rounded-lg border px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-1 ${
                errors.username
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-neutral-200 focus:border-pup-maroon focus:ring-pup-maroon"
              }`}
              autoComplete="username"
              {...register("username")}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-600">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* New Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="preferences-new-password"
              className="text-xs font-semibold uppercase tracking-wide text-neutral-600"
            >
              New Password
            </Label>
            <div className="relative">
              <Input
                id="preferences-new-password"
                type={showNewPassword ? "text" : "password"}
                className={`rounded-lg border px-3 py-2 pr-10 text-sm text-neutral-900 focus:outline-none focus:ring-1 ${
                  errors.newPassword
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-neutral-200 focus:border-pup-maroon focus:ring-pup-maroon"
                }`}
                autoComplete="new-password"
                placeholder="Leave blank to keep current password"
                {...register("newPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-neutral-400" />
                ) : (
                  <Eye className="h-4 w-4 text-neutral-400" />
                )}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-xs text-red-600">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="preferences-confirm-password"
              className="text-xs font-semibold uppercase tracking-wide text-neutral-600"
            >
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="preferences-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                className={`rounded-lg border px-3 py-2 pr-10 text-sm text-neutral-900 focus:outline-none focus:ring-1 ${
                  errors.confirmPassword
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-neutral-200 focus:border-pup-maroon focus:ring-pup-maroon"
                }`}
                autoComplete="new-password"
                placeholder="Re-enter new password"
                {...register("confirmPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-neutral-400" />
                ) : (
                  <Eye className="h-4 w-4 text-neutral-400" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <p className="text-[11px] text-neutral-500">
            Password updates are optional. If you only change your username,
            your password will stay the same.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-sm font-medium text-neutral-600 hover:bg-transparent hover:underline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-full bg-pup-maroon px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-pup-maroon/90 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UserPreferencesModal;
