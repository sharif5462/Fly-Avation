import { Company } from './company.model';
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
  /**
   * Every company this user may work in. The API decides this — the frontend
   * only ever offers what the login response contained, and the API must
   * re-check it on each request rather than trusting the company header.
   */
  companies: Company[];
  /** Which of `companies` to open first. Falls back to the first entry. */
  defaultCompanyId?: string;
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
