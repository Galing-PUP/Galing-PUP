export type UserStatus = "Accepted" | "Pending" | "Delete";
export type UserRole = "Viewer" | "Registered" | "Admin" | "Superadmin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};
