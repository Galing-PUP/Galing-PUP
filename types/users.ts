export type UserStatus = "Accepted" | "Pending" | "Delete";
export type UserRole = "User" | "Admin" | "Super Admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};
