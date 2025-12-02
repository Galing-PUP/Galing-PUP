import type { User } from "@/types/users";

export const mockUsers: User[] = [
  {
    id: "#1",
    name: "John Doe",
    email: "john@example.com",
    role: "Super Admin",
    status: "Accepted",
  },
  {
    id: "#2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Admin",
    status: "Accepted",
  },
  {
    id: "#3",
    name: "Bob Wilson",
    email: "bob@example.com",
    role: "User",
    status: "Pending",
  },
  {
    id: "#4",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Admin",
    status: "Accepted",
  },
  {
    id: "#5",
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "User",
    status: "Delete",
  },
];
