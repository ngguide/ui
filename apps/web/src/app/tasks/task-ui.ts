import { TaskPriority, TaskStatus } from '../core/models';

/** Human-facing column / chip labels for each status. */
export const STATUS_LABEL: Record<TaskStatus, string> = {
  'todo': 'To do',
  'in-progress': 'In progress',
  'review': 'Review',
  'done': 'Done',
};

/** Material Symbols ligature per status — used on chips and the detail header. */
export const STATUS_ICON: Record<TaskStatus, string> = {
  'todo': 'radio_button_unchecked',
  'in-progress': 'pending',
  'review': 'rate_review',
  'done': 'check_circle',
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const PRIORITY_ICON: Record<TaskPriority, string> = {
  low: 'arrow_downward',
  medium: 'drag_handle',
  high: 'arrow_upward',
};

/**
 * Deterministic avatar fill from a member hue (0..360). Token-friendly: pure
 * `oklch()` so it renders identically on server and client with no network.
 */
export function avatarColor(hue: number): string {
  return `oklch(72% 0.12 ${hue}deg)`;
}

/** Deterministic readable text color paired with {@link avatarColor}. */
export function avatarInk(hue: number): string {
  return `oklch(28% 0.08 ${hue}deg)`;
}

/** Token-friendly dot/border color for a label hue. */
export function labelColor(hue: number): string {
  return `oklch(70% 0.12 ${hue}deg)`;
}
