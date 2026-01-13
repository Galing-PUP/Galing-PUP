"use client";

import { useState, useEffect, useRef } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

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
  const [username, setUsername] = useState(initialUsername);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [touched, setTouched] = useState<{
    username?: boolean;
    newPassword?: boolean;
    confirmPassword?: boolean;
  }>({});
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const usernameCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync username when modal opens or initialUsername changes
  useEffect(() => {
    if (isOpen) {
      setUsername(initialUsername);
      setErrors({});
      setTouched({});
      setIsCheckingUsername(false);
      if (usernameCheckTimeoutRef.current) {
        clearTimeout(usernameCheckTimeoutRef.current);
        usernameCheckTimeoutRef.current = null;
      }
    }
  }, [isOpen, initialUsername]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (usernameCheckTimeoutRef.current) {
        clearTimeout(usernameCheckTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Check if username is available (debounced)
   */
  const checkUsernameAvailability = async (usernameToCheck: string) => {
    const trimmed = usernameToCheck.trim();

    // Don't check if username hasn't changed or is empty
    if (trimmed === initialUsername || trimmed.length === 0) {
      setErrors((prev) => ({ ...prev, username: undefined }));
      return;
    }

    // Basic validation first
    if (trimmed.length < 2) {
      return; // Let zod handle this
    }

    if (!/^[a-zA-Z0-9.]+$/.test(trimmed)) {
      return; // Let zod handle this
    }

    setIsCheckingUsername(true);
    try {
      const response = await fetch(
        `/api/user/preferences?username=${encodeURIComponent(trimmed)}`
      );

      if (!response.ok) {
        throw new Error("Failed to check username");
      }

      const data: { available: boolean; username: string } =
        await response.json();

      if (!data.available) {
        setErrors((prev) => ({
          ...prev,
          username: "This username is already taken",
        }));
      } else {
        // Clear username error if it was set
        setErrors((prev) => {
          const newErrors = { ...prev };
          if (newErrors.username === "This username is already taken") {
            delete newErrors.username;
          }
          return newErrors;
        });
      }
    } catch (error) {
      console.error("Error checking username availability:", error);
      // Don't set error on network failure, let submit handle it
    } finally {
      setIsCheckingUsername(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  /**
   * Validates a single field or all fields
   * Returns validation result and updates errors state
   */
  const validateField = (
    fieldName?: "username" | "newPassword" | "confirmPassword"
  ): { isValid: boolean; errors: typeof errors } => {
    try {
      const data = {
        username: username.trim(),
        newPassword,
        confirmPassword,
      };

      preferencesSchema.parse(data);
      // If validation passes, clear errors for the field(s)
      if (fieldName) {
        setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
      } else {
        setErrors({});
      }
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError && error.issues) {
        const fieldErrors: typeof errors = {};
        error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof typeof fieldErrors;
          if (fieldName && path !== fieldName) {
            // Only update the specific field if validating a single field
            return;
          }
          if (path) {
            fieldErrors[path] = issue.message;
          }
        });
        if (fieldName) {
          // Only update the specific field
          setErrors((prev) => ({ ...prev, [fieldName]: fieldErrors[fieldName] }));
        } else {
          // Update all fields
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
        }
        return { isValid: false, errors: fieldErrors };
      }
      return { isValid: false, errors: {} };
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
    setTouched({});
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Mark all fields as touched
    setTouched({
      username: true,
      newPassword: true,
      confirmPassword: true,
    });

    // Validate all fields
    const validationResult = validateField();
    if (!validationResult.isValid) {
      // Get the first error message to show in toast
      const firstError =
        Object.values(validationResult.errors)[0] ||
        "Please fix the errors above.";
      toast.error(firstError);
      return;
    }

    const trimmedUsername = username.trim();

    // If username changed, check availability one more time before submitting
    if (trimmedUsername !== initialUsername) {
      // Clear any pending timeout
      if (usernameCheckTimeoutRef.current) {
        clearTimeout(usernameCheckTimeoutRef.current);
        usernameCheckTimeoutRef.current = null;
      }

      setIsCheckingUsername(true);
      try {
        const checkResponse = await fetch(
          `/api/user/preferences?username=${encodeURIComponent(trimmedUsername)}`
        );

        if (!checkResponse.ok) {
          throw new Error("Failed to check username");
        }

        const checkData: { available: boolean; username: string } =
          await checkResponse.json();

        if (!checkData.available) {
          setErrors((prev) => ({
            ...prev,
            username: "This username is already taken",
          }));
          toast.error("This username is already taken");
          setIsCheckingUsername(false);
          return;
        }
      } catch (error) {
        console.error("Error checking username availability:", error);
        // Continue with submit - API will catch duplicate username
      } finally {
        setIsCheckingUsername(false);
      }
    }

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
          newPassword: newPassword || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message = data.error || "Failed to update preferences.";
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
        { id: "preferences" },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-full p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Close preferences modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-neutral-900">
                User Preferences
              </h2>
              <p className="text-sm text-neutral-500">
                Update your display name or set a new password for your account.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label
                  htmlFor="preferences-username"
                  className="block text-xs font-semibold uppercase tracking-wide text-neutral-600"
                >
                  Username
                </label>
                <div className="relative">
                  <input
                    id="preferences-username"
                    type="text"
                    value={username}
                    onChange={(event) => {
                      const newValue = event.target.value;
                      setUsername(newValue);
                      
                      // Clear previous timeout
                      if (usernameCheckTimeoutRef.current) {
                        clearTimeout(usernameCheckTimeoutRef.current);
                      }

                      // Validate format first
                      if (touched.username) {
                        validateField("username");
                      }

                      // Debounce username availability check (500ms delay)
                      usernameCheckTimeoutRef.current = setTimeout(() => {
                        checkUsernameAvailability(newValue);
                      }, 500);
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, username: true }));
                      validateField("username");
                      // Check availability immediately on blur
                      checkUsernameAvailability(username);
                    }}
                    className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm text-neutral-900 focus:outline-none focus:ring-1 ${
                      errors.username && touched.username
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-neutral-200 focus:border-pup-maroon focus:ring-pup-maroon"
                    }`}
                    autoComplete="username"
                  />
                  {isCheckingUsername && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-pup-maroon" />
                    </div>
                  )}
                </div>
                {errors.username && touched.username && (
                  <p className="text-xs text-red-600 mt-1">{errors.username}</p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="preferences-new-password"
                  className="block text-xs font-semibold uppercase tracking-wide text-neutral-600"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="preferences-new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(event) => {
                      setNewPassword(event.target.value);
                      if (touched.newPassword) {
                        validateField("newPassword");
                      }
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, newPassword: true }));
                      validateField("newPassword");
                    }}
                    className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm text-neutral-900 focus:outline-none focus:ring-1 ${
                      errors.newPassword && touched.newPassword
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-neutral-200 focus:border-pup-maroon focus:ring-pup-maroon"
                    }`}
                    autoComplete="new-password"
                    placeholder="Leave blank to keep current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.newPassword && touched.newPassword && (
                  <p className="text-xs text-red-600 mt-1">{errors.newPassword}</p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="preferences-confirm-password"
                  className="block text-xs font-semibold uppercase tracking-wide text-neutral-600"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="preferences-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      if (touched.confirmPassword) {
                        validateField("confirmPassword");
                      }
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, confirmPassword: true }));
                      validateField("confirmPassword");
                    }}
                    className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm text-neutral-900 focus:outline-none focus:ring-1 ${
                      errors.confirmPassword && touched.confirmPassword
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-neutral-200 focus:border-pup-maroon focus:ring-pup-maroon"
                    }`}
                    autoComplete="new-password"
                    placeholder="Re-enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <p className="text-[11px] text-neutral-500">
                Password updates are optional. If you only change your username,
                your password will stay the same.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-sm font-medium text-neutral-600 hover:underline"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isCheckingUsername}
                  className="inline-flex items-center rounded-full bg-pup-maroon px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-pup-maroon/90 disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Saving..."
                    : isCheckingUsername
                      ? "Checking username..."
                      : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserPreferencesModal;

