import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivityEntry, Metric, User, UserRole } from '../core/models';
import { seedActivity, seedMetrics, seedUsers } from './fixtures';

export type UserSort = 'name-asc' | 'name-desc' | 'recent' | 'role';
export type RoleFilter = UserRole | 'all';

const ROLE_ORDER: Record<UserRole, number> = { admin: 0, editor: 1, viewer: 2 };

function comparatorFor(sort: UserSort): (a: User, b: User) => number {
  switch (sort) {
    case 'name-desc':
      return (a, b) => b.name.localeCompare(a.name);
    case 'recent':
      return (a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime();
    case 'role':
      return (a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || a.name.localeCompare(b.name);
    case 'name-asc':
    default:
      return (a, b) => a.name.localeCompare(b.name);
  }
}

/**
 * Console (admin) state. Plain Angular signals — the kit's zoneless house style
 * (Decision 3A). Seeded synchronously from deterministic fixtures, so a page
 * reload resets every in-session edit (R6.3). `visible` reactively recomputes on
 * any search/filter/sort change (R6.1); CRUD mutations flow to every view that
 * reads the signal (R6.2).
 *
 * Provided on the Console feature route, so its lifetime is scoped to `/admin`.
 */
@Injectable()
export class AdminStore {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly data = signal<User[]>(seedUsers());

  readonly metrics = signal<Metric[]>(seedMetrics());
  readonly activity = signal<ActivityEntry[]>(seedActivity());

  readonly query = signal('');
  readonly role = signal<RoleFilter>('all');
  readonly sort = signal<UserSort>('name-asc');
  /** Client-only loading simulation; starts false so SSR renders content. */
  readonly loading = signal(false);

  readonly total = computed(() => this.data().length);

  /** Reactive search (name + email) + role filter + sort (R6.1). */
  readonly visible = computed<User[]>(() => {
    const q = this.query().trim().toLocaleLowerCase();
    const role = this.role();
    return this.data()
      .filter((u) => role === 'all' || u.role === role)
      .filter(
        (u) =>
          !q ||
          u.name.toLocaleLowerCase().includes(q) ||
          u.email.toLocaleLowerCase().includes(q),
      )
      .sort(comparatorFor(this.sort()));
  });

  /** Empty state driver (R9.1). */
  readonly isEmpty = computed(() => this.visible().length === 0);

  setQuery(q: string): void {
    this.query.set(q);
  }

  setRole(role: RoleFilter): void {
    this.role.set(role);
  }

  setSort(sort: UserSort): void {
    this.sort.set(sort);
  }

  clearFilters(): void {
    this.query.set('');
    this.role.set('all');
  }

  add(user: User): void {
    this.data.update((xs) => [user, ...xs]);
  }

  update(id: string, patch: Partial<User>): void {
    this.data.update((xs) => xs.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  remove(id: string): void {
    this.data.update((xs) => xs.filter((u) => u.id !== id));
  }

  byId(id: string): User | undefined {
    return this.data().find((u) => u.id === id);
  }

  /**
   * Client-only loading simulation: flips `loading` on, then off after a short
   * delay. Guarded by `isPlatformBrowser` so SSR never schedules a timer (which
   * would keep the render pending) and stays deterministic on the server.
   */
  reload(): void {
    this.loading.set(true);
    if (!this.isBrowser) {
      this.loading.set(false);
      return;
    }
    setTimeout(() => this.loading.set(false), 700);
  }
}
