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
   * Row-level access scope: airport/station codes (matching EntityConfig.scopeField
   * values) this user is restricted to. Undefined or empty = unrestricted,
   * same as how SuperAdmin/Admin bypass module-role checks — most users have
   * no scope set and see every station's data, matching today's behavior.
   * Enforced in core/mock/mock-api.interceptor.ts; the real .NET API must
   * enforce the equivalent server-side (see README.md).
   */
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
