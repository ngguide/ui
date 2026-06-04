import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { Label, Member, Task, TaskStatus } from '../core/models';
import { seedLabels, seedMembers, seedTasks } from './fixtures';

/** Board column order — also the canonical status order for the segmented/menu UI. */
const STATUSES: readonly TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];

const PRIORITY_ORDER: Record<Task['priority'], number> = { high: 0, medium: 1, low: 2 };

/**
 * Tracker (tasks) state. Plain Angular signals — the kit's zoneless house style,
 * mirroring {@link AdminStore}. Seeded synchronously from deterministic fixtures,
 * so a page reload resets every in-session edit. `byStatus` / `visibleList`
 * reactively recompute on any query/filter change; CRUD mutations flow to every
 * view that reads the signals.
 *
 * Provided on the Tracker feature route, so its lifetime is scoped to `/tasks`.
 */
@Injectable()
export class TasksStore {
  private readonly data = signal<Task[]>(seedTasks());

  readonly members: Signal<Member[]> = signal<Member[]>(seedMembers());
  readonly labels: Signal<Label[]> = signal<Label[]>(seedLabels());

  readonly query: WritableSignal<string> = signal('');
  readonly statusFilter: WritableSignal<TaskStatus | 'all'> = signal<TaskStatus | 'all'>('all');
  readonly assigneeFilter: WritableSignal<string | 'all'> = signal<string | 'all'>('all');
  readonly labelFilter: WritableSignal<string | 'all'> = signal<string | 'all'>('all');

  readonly statuses: readonly TaskStatus[] = STATUSES;

  /** Text query (title + description) + assignee + label filters, applied to every view. */
  private readonly matched = computed<Task[]>(() => {
    const q = this.query().trim().toLocaleLowerCase();
    const assignee = this.assigneeFilter();
    const label = this.labelFilter();
    return this.data().filter((t) => {
      if (assignee !== 'all' && !t.assigneeIds.includes(assignee)) return false;
      if (label !== 'all' && !t.labelIds.includes(label)) return false;
      if (
        q &&
        !t.title.toLocaleLowerCase().includes(q) &&
        !t.description.toLocaleLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  });

  /** Board columns: one bucket per status (query/assignee/label filters applied). */
  readonly byStatus: Signal<Record<TaskStatus, Task[]>> = computed(() => {
    const buckets: Record<TaskStatus, Task[]> = {
      'todo': [],
      'in-progress': [],
      'review': [],
      'done': [],
    };
    for (const t of this.matched()) buckets[t.status].push(t);
    for (const status of STATUSES) buckets[status].sort(byPriorityThenTitle);
    return buckets;
  });

  /** Flat filtered + sorted list — adds the status dropdown filter on top of `matched`. */
  readonly visibleList: Signal<Task[]> = computed(() => {
    const status = this.statusFilter();
    return this.matched()
      .filter((t) => status === 'all' || t.status === status)
      .sort((a, b) => STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status) || byPriorityThenTitle(a, b));
  });

  readonly isEmptyList: Signal<boolean> = computed(() => this.visibleList().length === 0);

  add(t: Task): void {
    this.data.update((xs) => [t, ...xs]);
  }

  update(id: string, patch: Partial<Task>): void {
    this.data.update((xs) => xs.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  remove(id: string): void {
    this.data.update((xs) => xs.filter((t) => t.id !== id));
  }

  moveStatus(id: string, status: TaskStatus): void {
    this.update(id, { status });
  }

  byId(id: string): Task | undefined {
    return this.data().find((t) => t.id === id);
  }

  memberById(id: string): Member | undefined {
    return this.members().find((m) => m.id === id);
  }

  labelById(id: string): Label | undefined {
    return this.labels().find((l) => l.id === id);
  }

  setQuery(q: string): void {
    this.query.set(q);
  }

  setStatusFilter(s: TaskStatus | 'all'): void {
    this.statusFilter.set(s);
  }

  setAssigneeFilter(a: string | 'all'): void {
    this.assigneeFilter.set(a);
  }

  setLabelFilter(l: string | 'all'): void {
    this.labelFilter.set(l);
  }

  clearFilters(): void {
    this.query.set('');
    this.statusFilter.set('all');
    this.assigneeFilter.set('all');
    this.labelFilter.set('all');
  }

  /** Stable count, used by callers (e.g. the form) to mint deterministic ids. */
  count(): number {
    return this.data().length;
  }
}

function byPriorityThenTitle(a: Task, b: Task): number {
  return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.title.localeCompare(b.title);
}
