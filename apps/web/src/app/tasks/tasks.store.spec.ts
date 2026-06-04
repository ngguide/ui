import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TasksStore } from './tasks.store';
import { Task } from '../core/models';

function makeStore(): TasksStore {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection(), TasksStore],
  });
  return TestBed.inject(TasksStore);
}

const NEW_TASK: Task = {
  id: 't-new',
  title: 'Refactor the overlay scrim',
  description: 'Unify scrim opacity across dialog, side-sheet, and bottom-sheet.',
  status: 'todo',
  priority: 'medium',
  assigneeIds: ['m-01'],
  labelIds: ['l-chore'],
  dueAt: new Date(2026, 5, 10),
  dueTime: { hours: 9, minutes: 0 },
};

describe('TasksStore', () => {
  it('filters the list by status', () => {
    const s = makeStore();
    s.setStatusFilter('done');
    expect(s.visibleList().length).toBeGreaterThan(0);
    expect(s.visibleList().every((t) => t.status === 'done')).toBe(true);
  });

  it('filters by assignee across board and list', () => {
    const s = makeStore();
    s.setAssigneeFilter('m-01');
    expect(s.visibleList().every((t) => t.assigneeIds.includes('m-01'))).toBe(true);
    const board = s.byStatus();
    for (const status of s.statuses) {
      expect(board[status].every((t) => t.assigneeIds.includes('m-01'))).toBe(true);
    }
  });

  it('filters by label', () => {
    const s = makeStore();
    s.setLabelFilter('l-bug');
    expect(s.visibleList().length).toBeGreaterThan(0);
    expect(s.visibleList().every((t) => t.labelIds.includes('l-bug'))).toBe(true);
  });

  it('query matches title and description', () => {
    const s = makeStore();
    s.setQuery('carousel'); // appears in t-06 title
    expect(s.visibleList().some((t) => t.id === 't-06')).toBe(true);

    s.setQuery('staggered reveal'); // appears in a description only (t-13)
    expect(s.visibleList().some((t) => t.id === 't-13')).toBe(true);
  });

  it('moveStatus moves a task between byStatus columns', () => {
    const s = makeStore();
    const target = s.byStatus()['todo'][0];
    expect(target).toBeDefined();

    s.moveStatus(target.id, 'done');

    expect(s.byStatus()['todo'].some((t) => t.id === target.id)).toBe(false);
    expect(s.byStatus()['done'].some((t) => t.id === target.id)).toBe(true);
    expect(s.byId(target.id)?.status).toBe('done');
  });

  it('add / update / remove reflect in visibleList', () => {
    const s = makeStore();
    const before = s.visibleList().length;

    s.add(NEW_TASK);
    expect(s.visibleList().some((t) => t.id === 't-new')).toBe(true);
    expect(s.visibleList().length).toBe(before + 1);

    s.update('t-new', { title: 'Refactor the scrim' });
    expect(s.byId('t-new')?.title).toBe('Refactor the scrim');

    s.remove('t-new');
    expect(s.byId('t-new')).toBeUndefined();
    expect(s.visibleList().length).toBe(before);
  });

  it('isEmptyList is true when nothing matches', () => {
    const s = makeStore();
    expect(s.isEmptyList()).toBe(false);
    s.setQuery('zzz-no-such-task');
    expect(s.isEmptyList()).toBe(true);
    s.clearFilters();
    expect(s.isEmptyList()).toBe(false);
  });
});
