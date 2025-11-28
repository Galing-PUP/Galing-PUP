export type UserStatus = "Active" | "Inactive";
export type UserRole = "Admin" | "Member";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};
