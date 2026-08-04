import { User } from '../models/user.model';

/**
 * DEMO CREDENTIALS ONLY. The mock interceptor compares plaintext passwords
 * here — that is never acceptable once core/mock is deleted and requests
 * hit the real .NET Web API, which must hash/verify server-side (see the
 * Authentication contract in README.md).
 */
export interface MockCredential {
  password: string;
  user: User;
}

export const MOCK_CREDENTIALS: MockCredential[] = [
  {
    password: 'super123',
    user: {
      id: 'usr-001',
      username: 'superadmin',
      fullName: 'Alex Morgan',
      email: 'alex.morgan@aviation-erp.test',
      jobTitle: 'System Administrator',
      roles: ['SuperAdmin'],
      avatarColor: '#134bd1',
      initials: 'AM'
    }
  },
  {
    password: 'admin123',
    user: {
      id: 'usr-002',
      username: 'admin',
      fullName: 'Jordan Blake',
      email: 'jordan.blake@aviation-erp.test',
      jobTitle: 'ERP Administrator',
      roles: ['Admin'],
      avatarColor: '#7c3aed',
      initials: 'JB'
    }
  },
  {
    password: 'ops123',
    user: {
      id: 'usr-003',
      username: 'ops.manager',
      fullName: 'Sam Whitfield',
      email: 'sam.whitfield@aviation-erp.test',
      jobTitle: 'Flight Operations Manager',
      roles: ['FlightOps', 'Fleet'],
      avatarColor: '#0891b2',
      initials: 'SW'
    }
  },
  {
    password: 'maint123',
    user: {
      id: 'usr-004',
      username: 'maint.lead',
      fullName: 'Priya Nandy',
      email: 'priya.nandy@aviation-erp.test',
      jobTitle: 'MRO Lead Engineer',
      roles: ['Maintenance', 'Fleet'],
      avatarColor: '#c2410c',
      initials: 'PN'
    }
  },
  {
    password: 'crew123',
    user: {
      id: 'usr-005',
      username: 'crew.sched',
      fullName: 'Morgan Reyes',
      email: 'morgan.reyes@aviation-erp.test',
      jobTitle: 'Crew Scheduling Officer',
      roles: ['Crew'],
      avatarColor: '#be185d',
      initials: 'MR'
    }
  },
  {
    password: 'inv123',
    user: {
      id: 'usr-006',
      username: 'inventory.mgr',
      fullName: 'Diego Salas',
      email: 'diego.salas@aviation-erp.test',
      jobTitle: 'Warehouse & Procurement Manager',
      roles: ['Inventory', 'Procurement'],
      avatarColor: '#15803d',
      initials: 'DS'
    }
  },
  {
    password: 'fin123',
    user: {
      id: 'usr-007',
      username: 'finance.mgr',
      fullName: 'Elena Cross',
      email: 'elena.cross@aviation-erp.test',
      jobTitle: 'Finance Controller',
      roles: ['Finance'],
      avatarColor: '#a16207',
      initials: 'EC'
    }
  },
  {
    password: 'hr123',
    user: {
      id: 'usr-008',
      username: 'hr.mgr',
      fullName: 'Nadia Hussain',
      email: 'nadia.hussain@aviation-erp.test',
      jobTitle: 'HR Manager',
      roles: ['HR'],
      avatarColor: '#4338ca',
      initials: 'NH'
    }
  },
  {
    password: 'sec123',
    user: {
      id: 'usr-009',
      username: 'security.officer',
      fullName: 'Marcus Lee',
      email: 'marcus.lee@aviation-erp.test',
      jobTitle: 'Security & Compliance Officer',
      roles: ['Security', 'Compliance'],
      avatarColor: '#334155',
      initials: 'ML'
    }
  }
];

export function findCredential(username: string, password: string): MockCredential | undefined {
  return MOCK_CREDENTIALS.find(
    (c) => c.user.username.toLowerCase() === username.trim().toLowerCase() && c.password === password
  );
}

export function findUserById(id: string): User | undefined {
  return MOCK_CREDENTIALS.find((c) => c.user.id === id)?.user;
}
