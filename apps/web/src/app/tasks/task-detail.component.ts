import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ButtonComponent } from '@ngguide/ui/button';
import { ChipComponent, ChipSetComponent } from '@ngguide/ui/chip';
import { GuiDivider } from '@ngguide/ui/divider';
import { IconComponent } from '@ngguide/ui/icon';
import { SegmentedButtonGroupComponent, SegmentedButtonComponent } from '@ngguide/ui/segmented-button';

import { Task, TaskStatus } from '../core/models';
import { formatDate, initials } from '../core/formatters';
import { TasksStore } from './tasks.store';
import {
  PRIORITY_ICON,
  PRIORITY_LABEL,
  STATUS_ICON,
  STATUS_LABEL,
  avatarColor,
  avatarInk,
  labelColor,
} from './task-ui';
import { TaskFormComponent } from './task-form.component';

/**
 * Full detail view for a single task, designed to be hosted inside a side sheet
 * (expanded) or bottom sheet (compact). Carries an inline "Edit" affordance that
 * swaps to {@link TaskFormComponent}, and a segmented status-change control.
 */
@Component({
  selector: 'app-task-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    ChipComponent,
    ChipSetComponent,
    GuiDivider,
    IconComponent,
    SegmentedButtonGroupComponent,
    SegmentedButtonComponent,
    TaskFormComponent,
  ],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.css',
})
export class TaskDetailComponent {
  protected readonly store = inject(TasksStore);

  readonly task = input<Task | undefined>(undefined);

  /** Emitted when the user closes the detail (e.g. after a save). */
  readonly closed = output<void>();

  protected readonly editing = signal(false);

  protected readonly statuses = this.store.statuses;
  protected readonly statusLabel = STATUS_LABEL;
  protected readonly statusIcon = STATUS_ICON;
  protected readonly priorityLabel = PRIORITY_LABEL;
  protected readonly priorityIcon = PRIORITY_ICON;

  protected readonly initials = initials;
  protected readonly formatDate = formatDate;
  protected readonly avatarColor = avatarColor;
  protected readonly avatarInk = avatarInk;
  protected readonly labelColor = labelColor;

  /** Resolved assignee members for the current task, in declared order. */
  protected readonly assignees = computed(() => {
    const t = this.task();
    if (!t) return [];
    return t.assigneeIds
      .map((id) => this.store.memberById(id))
      .filter((m): m is NonNullable<typeof m> => m !== undefined);
  });

  /** Resolved labels for the current task, in declared order. */
  protected readonly taskLabels = computed(() => {
    const t = this.task();
    if (!t) return [];
    return t.labelIds
      .map((id) => this.store.labelById(id))
      .filter((l): l is NonNullable<typeof l> => l !== undefined);
  });

  protected readonly dueLabel = computed(() => {
    const t = this.task();
    if (!t || !t.dueAt) return null;
    const date = formatDate(t.dueAt);
    if (!t.dueTime) return date;
    const hh = String(t.dueTime.hours).padStart(2, '0');
    const mm = String(t.dueTime.minutes).padStart(2, '0');
    return `${date} · ${hh}:${mm}`;
  });

  protected startEdit(): void {
    this.editing.set(true);
  }

  protected onSaved(): void {
    this.editing.set(false);
  }

  protected onCancelEdit(): void {
    this.editing.set(false);
  }

  protected onStatusChange(value: string | string[] | null): void {
    const t = this.task();
    if (!t || typeof value !== 'string') return;
    this.store.moveStatus(t.id, value as TaskStatus);
  }

  protected close(): void {
    this.closed.emit();
  }
}
