/**
 * The subset of a demo account the login screen renders. Lives in its own
 * file — with no import of `mock-users.ts` — so that both the real and the
 * production-stub barrel can share the type without either dragging the
 * credential list into the bundle.
 */
export interface DemoAccount {
  username: string;
  password: string;
  fullName: string;
  jobTitle: string;
  initials: string;
  avatarColor: string;
}
