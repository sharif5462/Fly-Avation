import { Role } from './role.model';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  jobTitle: string;
  roles: Role[];
  avatarColor: string;
  initials: string;
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
