export type UserRole =
  | "EMPLOYEE"
  | "SUPERVISOR"
  | "HR"
  | "ADMIN";

export interface User {
  id: string | number;
  fullName: string;
  email: string;
  role: UserRole | string;
  profilePictureUrl?: string | null;
  leaveBalance: number;
  carryOverBalance: number;
}
