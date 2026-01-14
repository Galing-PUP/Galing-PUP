'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { User } from '@/types/users'
import { Mail } from 'lucide-react'
import { useEffect, useState } from 'react'

type RegisteredUserFormModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (user: User) => void
  user: User | null
}

/**
 * Modal for editing Registered user details
 * Displays status badge, username as header, and subscription tier management
 */
export function RegisteredUserFormModal({
  isOpen,
  onClose,
  onSave,
  user,
}: RegisteredUserFormModalProps) {
  const getInitialFormData = () => {
    if (user) {
      return { ...user }
    }
    return {} as Partial<User>
  }

  const [formData, setFormData] = useState<Partial<User>>(getInitialFormData())
  const [initialData] = useState<Partial<User>>(getInitialFormData())

  useEffect(() => {
    if (isOpen && user) {
      const newData = getInitialFormData()
      setFormData(newData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user])

  const handleSave = () => {
    if (!user) return

    const userToSave: User = {
      ...user,
      status: formData.status || user.status,
      subscriptionTier:
        formData.subscriptionTier !== undefined
          ? formData.subscriptionTier
          : user.subscriptionTier,
    }

    onSave(userToSave)
  }

  const handleInputChange = (field: keyof User, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const hasChanges = () => {
    if (!user) return false
    return (
      formData.status !== initialData.status ||
      formData.subscriptionTier !== initialData.subscriptionTier
    )
  }

  const getRoleInfo = (role?: string) => {
    const normalizedRole = role?.toLowerCase()

    if (normalizedRole === 'registered') {
      return {
        badgeStyle: 'bg-gray-200 text-gray-700',
        dotColor: 'bg-green-500',
        label: 'Registered',
      }
    }

    return {
      badgeStyle: 'bg-gray-200 text-gray-700',
      dotColor: 'bg-gray-500',
      label: role || 'User',
    }
  }

  const title = 'Edit User Information'
  const description = "Update the user's details and save the changes."

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>

        <div className="bg-linear-to-br from-white via-gray-50 to-white px-8 py-8 border-b-4 border-pup-maroon shadow-sm rounded-t-lg">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <Badge
                className={`gap-2 ${getRoleInfo(formData.role).badgeStyle}`}
              >
                <div
                  className={`w-2 h-2 rounded-full animate-pulse ${getRoleInfo(formData.role).dotColor}`}
                />
                {getRoleInfo(formData.role).label}
              </Badge>
              <h2 className="text-4xl font-bold text-pup-maroon leading-tight tracking-tight">
                {formData.name || 'No username set'}
              </h2>
              <div className="space-y-1.5 pl-1">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {formData.email || 'email@example.com'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 space-y-6">
          {/* Row 1: Status and Subscription Tier */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || ''}
                onValueChange={(value) => handleInputChange('status', value)}
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
              <Label htmlFor="subscription">Subscription Tier</Label>
              <Select
                value={String(formData.subscriptionTier || 1)}
                onValueChange={(value) =>
                  handleInputChange('subscriptionTier', Number(value))
                }
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
          </div>

          {/* Row 2: Registration Date */}
          <div className="space-y-2">
            <Label htmlFor="registrationDate">Registration Date</Label>
            <Input
              id="registrationDate"
              value={
                formData.registrationDate
                  ? new Date(formData.registrationDate).toLocaleDateString()
                  : ''
              }
              disabled
              className="bg-gray-50"
            />
          </div>
        </div>

        <DialogFooter className="p-8 pt-4 border-t border-gray-100 rounded-b-lg">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges()}
            className={!hasChanges() ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
