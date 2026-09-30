import { Role } from './role.model';

export type UserStatus = 'Pending' | 'Active' | 'Rejected';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  jobTitle: string;
  roles: Role[];
  status: UserStatus;
  avatarColor: string;
  initials: string;

  stationScope?: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface SignupRequest {
  fullName: string;
  username: string;
  email: string;
  jobTitle: string;
  password: string;
}

export interface SignupResponse {
  success: boolean;
}
