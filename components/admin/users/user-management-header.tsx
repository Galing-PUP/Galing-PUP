import { Button } from '@/components/button'
import { UserPlus } from 'lucide-react'

type UserManagementHeaderProps = {
  onAddNewUser: () => void;
  showAddButton?: boolean;
};

export function UserManagementHeader({ onAddNewUser, showAddButton = true }: UserManagementHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <p className="mt-1 text-gray-500">
          View, add, edit, and delete users. Assign and modify roles.
        </p>
      </div>
      {showAddButton && (
        <Button
          variant="primary"
          size="md"
          shape="rounded"
          icon={<UserPlus className="h-4 w-4" />}
          onClick={onAddNewUser}
        >
          Add New User
        </Button>
      )}
    </div>
  )
}
