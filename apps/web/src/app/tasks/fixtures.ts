import { Label, Member, Task } from '../core/models';

/**
 * Deterministic Tracker seed data. Dates are fixed (`new Date(2026, m, d)`) and
 * ids are stable strings, so server and client renders match (no hydration
 * mismatch) and the demo reads the same on any day. A page reload re-runs these
 * factories, resetting all in-session edits.
 *
 * DEMO_TODAY is June 4, 2026 — due dates straddle it (overdue / today / ahead).
 */

export function seedMembers(): Member[] {
  return [
    { id: 'm-01', name: 'Ada Lovelace', avatarHue: 265 },
    { id: 'm-02', name: 'Grace Hopper', avatarHue: 210 },
    { id: 'm-03', name: 'Alan Turing', avatarHue: 200 },
    { id: 'm-04', name: 'Katherine Johnson', avatarHue: 150 },
    { id: 'm-05', name: 'Margaret Hamilton', avatarHue: 320 },
    { id: 'm-06', name: 'Hedy Lamarr', avatarHue: 25 },
  ];
}

export function seedLabels(): Label[] {
  return [
    { id: 'l-bug', name: 'Bug', hue: 25 },
    { id: 'l-feature', name: 'Feature', hue: 150 },
    { id: 'l-design', name: 'Design', hue: 290 },
    { id: 'l-docs', name: 'Docs', hue: 210 },
    { id: 'l-chore', name: 'Chore', hue: 80 },
  ];
}

/** Compact factory keeps the seed list readable. */
function mk(
  id: string,
  title: string,
  description: string,
  status: Task['status'],
  priority: Task['priority'],
  assigneeIds: string[],
  labelIds: string[],
  due: [number, number] | null,
  dueTime: Task['dueTime'] = null,
): Task {
  return {
    id,
    title,
    description,
    status,
    priority,
    assigneeIds,
    labelIds,
    dueAt: due ? new Date(2026, due[0], due[1]) : null,
    dueTime,
  };
}

export function seedTasks(): Task[] {
  return [
    // ── To do ────────────────────────────────────────────────────────────
    mk(
      't-01',
      'Audit color contrast on dark theme',
      'Several label-large tokens fall below 4.5:1 against surface-container. Document offenders and propose fixes.',
      'todo',
      'high',
      ['m-01', 'm-05'],
      ['l-design', 'l-bug'],
      [5, 9],
      { hours: 14, minutes: 30 },
    ),
    mk(
      't-02',
      'Write migration guide for v2',
      'Cover renamed inputs and the new attribute selectors. Include before/after snippets.',
      'todo',
      'medium',
      ['m-03'],
      ['l-docs'],
      [5, 18],
    ),
    mk(
      't-03',
      'Spike: virtual scroll for long lists',
      'Evaluate CDK virtual scroll vs. a hand-rolled windowing approach for the activity feed.',
      'todo',
      'low',
      ['m-02', 'm-04', 'm-06'],
      ['l-feature'],
      null,
    ),
    mk(
      't-04',
      'Triage incoming bug reports',
      'Label, deduplicate, and assign the 18 issues opened this week.',
      'todo',
      'medium',
      ['m-06'],
      ['l-bug', 'l-chore'],
      [5, 5],
      { hours: 9, minutes: 0 },
    ),
    mk(
      't-05',
      'Add density tokens to the spec sheet',
      'Comfortable / compact spacing scales are not yet in the token catalogue.',
      'todo',
      'low',
      [],
      ['l-docs', 'l-design'],
      [5, 22],
    ),

    // ── In progress ──────────────────────────────────────────────────────
    mk(
      't-06',
      'Implement carousel keyline engine',
      'Hero, multi-browse, and uncontained layouts share one keyline solver. Wire the 4 layouts on top.',
      'in-progress',
      'high',
      ['m-01'],
      ['l-feature'],
      [5, 6],
      { hours: 17, minutes: 0 },
    ),
    mk(
      't-07',
      'Fix focus ring clipping in chip-set',
      'Overflow:hidden on the row clips the outline. Move clipping to the chip, not the row.',
      'in-progress',
      'high',
      ['m-04', 'm-02'],
      ['l-bug', 'l-design'],
      [5, 3],
    ),
    mk(
      't-08',
      'Port datetime pickers to zoneless',
      'Remove the last zone.js assumption in the clock dial animation loop.',
      'in-progress',
      'medium',
      ['m-05'],
      ['l-chore', 'l-feature'],
      [5, 12],
      { hours: 11, minutes: 45 },
    ),
    mk(
      't-09',
      'Draft side-sheet a11y notes',
      'Focus trap, escape-to-dismiss, and aria-modal expectations for the standard variant.',
      'in-progress',
      'low',
      ['m-03', 'm-06'],
      ['l-docs'],
      null,
    ),

    // ── Review ───────────────────────────────────────────────────────────
    mk(
      't-10',
      'Review tonal button elevation PR',
      'Verify the resting/hover/pressed elevation matches the M3 reference at every size.',
      'review',
      'medium',
      ['m-02'],
      ['l-feature', 'l-design'],
      [5, 4],
      { hours: 16, minutes: 0 },
    ),
    mk(
      't-11',
      'Review snackbar queue logic',
      'Confirm at most one snackbar shows and queued ones surface in order.',
      'review',
      'high',
      ['m-01', 'm-03'],
      ['l-bug'],
      [5, 2],
    ),
    mk(
      't-12',
      'Review docs site nav redesign',
      'Sidebar collapse behaviour and the new breadcrumb need a design pass.',
      'review',
      'low',
      ['m-05', 'm-04', 'm-06'],
      ['l-design', 'l-docs'],
      [5, 7],
    ),

    // ── Done ─────────────────────────────────────────────────────────────
    mk(
      't-13',
      'Ship FAB menu component',
      'Speed-dial FAB with staggered reveal and scrim. Shipped in 1.4.',
      'done',
      'high',
      ['m-01'],
      ['l-feature'],
      [4, 28],
    ),
    mk(
      't-14',
      'Stabilise the Vitest builder migration',
      'Removed AnalogJS; every project now runs on the first-party Vitest builder.',
      'done',
      'medium',
      ['m-03', 'm-02'],
      ['l-chore'],
      [4, 20],
      { hours: 10, minutes: 30 },
    ),
    mk(
      't-15',
      'Write switch component specs',
      'Cover thumb travel, disabled state, and keyboard toggling.',
      'done',
      'low',
      ['m-04'],
      ['l-docs'],
      [4, 24],
    ),
    mk(
      't-16',
      'Patch divider inset variants',
      'Middle-inset divider was 1dp short on the trailing edge.',
      'done',
      'low',
      ['m-06', 'm-05'],
      ['l-bug', 'l-design'],
      [4, 30],
      { hours: 13, minutes: 15 },
    ),
  ];
}
