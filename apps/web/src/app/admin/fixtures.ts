import { ActivityEntry, Metric, User } from '../core/models';

/**
 * Deterministic Console seed data. Dates are fixed (`new Date(2026, m, d)`) and
 * ids are stable strings, so server and client renders match (no hydration
 * mismatch) and the demo reads the same on any day. A page reload re-runs these
 * factories, resetting all in-session edits (R6.3).
 */

export function seedUsers(): User[] {
  return [
    mk('u-01', 'Ada Lovelace', 'ada@aperture.io', 'admin', 'active', [1, 18], [5, 4], 265),
    mk('u-02', 'Grace Hopper', 'grace@aperture.io', 'admin', 'active', [1, 22], [5, 3], 210),
    mk('u-03', 'Alan Turing', 'alan@aperture.io', 'editor', 'active', [2, 3], [5, 4], 200),
    mk('u-04', 'Katherine Johnson', 'katherine@aperture.io', 'editor', 'active', [2, 14], [5, 1], 150),
    mk('u-05', 'Linus Torvalds', 'linus@aperture.io', 'editor', 'suspended', [2, 27], [4, 20], 95),
    mk('u-06', 'Margaret Hamilton', 'margaret@aperture.io', 'editor', 'active', [3, 5], [5, 4], 320),
    mk('u-07', 'Dennis Ritchie', 'dennis@aperture.io', 'viewer', 'active', [3, 12], [5, 2], 25),
    mk('u-08', 'Barbara Liskov', 'barbara@aperture.io', 'viewer', 'invited', [3, 28], [3, 28], 290),
    mk('u-09', 'Tim Berners-Lee', 'tim@aperture.io', 'viewer', 'active', [4, 2], [5, 3], 175),
    mk('u-10', 'Donald Knuth', 'donald@aperture.io', 'viewer', 'active', [4, 9], [4, 30], 50),
    mk('u-11', 'Radia Perlman', 'radia@aperture.io', 'editor', 'invited', [4, 21], [4, 21], 130),
    mk('u-12', 'Vint Cerf', 'vint@aperture.io', 'viewer', 'suspended', [5, 1], [4, 18], 240),
    mk('u-13', 'Hedy Lamarr', 'hedy@aperture.io', 'viewer', 'active', [5, 8], [5, 4], 350),
    mk('u-14', 'Claude Shannon', 'claude@aperture.io', 'admin', 'active', [5, 15], [5, 4], 110),
  ];
}

function mk(
  id: string,
  name: string,
  email: string,
  role: User['role'],
  status: User['status'],
  joined: [number, number],
  active: [number, number],
  avatarHue: number,
): User {
  return {
    id,
    name,
    email,
    role,
    status,
    joinedAt: new Date(2025, joined[0], joined[1]),
    lastActiveAt: new Date(2026, active[0], active[1]),
    avatarHue,
  };
}

export function seedMetrics(): Metric[] {
  return [
    {
      key: 'active-users',
      label: 'Active users',
      value: 8421,
      deltaPct: 12.4,
      format: 'number',
      spark: [6100, 6320, 6280, 6710, 7050, 7240, 7600, 7980, 8120, 8421],
    },
    {
      key: 'revenue',
      label: 'Revenue (MTD)',
      value: 184230.5,
      deltaPct: 8.1,
      format: 'currency',
      spark: [120000, 134000, 129000, 142000, 151000, 160000, 168000, 171000, 178000, 184230],
    },
    {
      key: 'conversion',
      label: 'Conversion',
      value: 4.7,
      deltaPct: -1.3,
      format: 'percent',
      spark: [5.2, 5.1, 5.3, 5.0, 4.9, 4.8, 5.0, 4.9, 4.8, 4.7],
    },
    {
      key: 'signups',
      label: 'New signups',
      value: 1268,
      deltaPct: 23.6,
      format: 'number',
      spark: [620, 680, 700, 760, 840, 910, 980, 1080, 1170, 1268],
    },
  ];
}

export function seedActivity(): ActivityEntry[] {
  return [
    a('a-01', 'Grace Hopper', 'invited a new editor', [5, 4]),
    a('a-02', 'Ada Lovelace', 'updated billing settings', [5, 4]),
    a('a-03', 'Margaret Hamilton', 'published the changelog', [5, 3]),
    a('a-04', 'Alan Turing', 'archived 3 old projects', [5, 2]),
    a('a-05', 'Hedy Lamarr', 'commented on “Roadmap Q3”', [5, 1]),
    a('a-06', 'Vint Cerf', 'was suspended by an admin', [4, 18]),
    a('a-07', 'Tim Berners-Lee', 'exported the user report', [4, 15]),
    a('a-08', 'Claude Shannon', 'rotated the API keys', [4, 12]),
  ];
}

function a(id: string, actor: string, action: string, at: [number, number]): ActivityEntry {
  return { id, actor, action, at: new Date(2026, at[0], at[1]) };
}
