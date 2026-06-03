import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AdminStore } from './admin.store';
import { User } from '../core/models';

function makeStore(): AdminStore {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection(), AdminStore],
  });
  return TestBed.inject(AdminStore);
}

const NEW_USER: User = {
  id: 'u-new',
  name: 'Zora Neale',
  email: 'zora@aperture.io',
  role: 'viewer',
  status: 'invited',
  joinedAt: new Date(2026, 5, 4),
  lastActiveAt: new Date(2026, 5, 4),
  avatarHue: 12,
};

describe('AdminStore', () => {
  it('searches across name and email (R6.1)', () => {
    const s = makeStore();
    s.setQuery('ada');
    expect(s.visible().length).toBe(1);
    expect(s.visible()[0].name).toBe('Ada Lovelace');

    s.setQuery('aperture.io');
    expect(s.visible().length).toBe(s.total());
  });

  it('filters by role (R6.1)', () => {
    const s = makeStore();
    s.setRole('admin');
    expect(s.visible().every((u) => u.role === 'admin')).toBe(true);
    expect(s.visible().length).toBeGreaterThan(0);
  });

  it('sorts by name and by most-recent activity', () => {
    const s = makeStore();
    s.setSort('name-asc');
    const asc = s.visible().map((u) => u.name);
    expect(asc).toEqual([...asc].sort((a, b) => a.localeCompare(b)));

    s.setSort('recent');
    const times = s.visible().map((u) => u.lastActiveAt.getTime());
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it('add / update / remove reflect in visible() (R6.2)', () => {
    const s = makeStore();
    const before = s.total();

    s.add(NEW_USER);
    expect(s.total()).toBe(before + 1);
    expect(s.byId('u-new')?.name).toBe('Zora Neale');

    s.update('u-new', { name: 'Zora Hurston' });
    expect(s.byId('u-new')?.name).toBe('Zora Hurston');

    s.remove('u-new');
    expect(s.byId('u-new')).toBeUndefined();
    expect(s.total()).toBe(before);
  });

  it('isEmpty is true when nothing matches (R9.1)', () => {
    const s = makeStore();
    expect(s.isEmpty()).toBe(false);
    s.setQuery('zzz-no-such-user');
    expect(s.isEmpty()).toBe(true);
    s.clearFilters();
    expect(s.isEmpty()).toBe(false);
  });

  it('exposes deterministic dashboard metrics and activity', () => {
    const s = makeStore();
    expect(s.metrics().length).toBeGreaterThan(0);
    expect(s.activity().length).toBeGreaterThan(0);
  });
});
