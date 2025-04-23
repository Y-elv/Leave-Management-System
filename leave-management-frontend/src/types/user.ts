export type UserRole = 'STAFF' | 'MANAGER' | 'ADMIN';

export interface User {
    id: number;
    fullName: string;
    email: string;
    role: UserRole;
    profilePictureUrl?: string;
    leaveBalance: number;
    carryOverBalance: number;
}
