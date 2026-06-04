import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '@ngguide/ui/button';
import { IconButtonComponent } from '@ngguide/ui/icon-button';
import { IconComponent } from '@ngguide/ui/icon';
import {
  TextFieldComponent,
  TextFieldInputDirective,
  TextFieldLeadingDirective,
  TextFieldTrailingDirective,
} from '@ngguide/ui/text-field';
import { ChipSetComponent, ChipComponent } from '@ngguide/ui/chip';
import { GuiList, GuiListItem } from '@ngguide/ui/list';
import { GuiDivider } from '@ngguide/ui/divider';

import { Task, TaskStatus } from '../core/models';
import { DEMO_TODAY } from '../core/demo-date';
import { formatRelative, initials } from '../core/formatters';
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

/**
 * Flat, filterable task list (`/tasks/list`). Mirrors the Console users screen:
 * a search `gui-text-field`, a status `gui-chip-set` and a label `gui-chip-set`
 * feed the shared {@link TasksStore}; rows render `store.visibleList()` with the
 * title, a status + due supporting line, and trailing assignee avatars + priority.
 */
@Component({
  selector: 'app-tasks-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonComponent,
    IconButtonComponent,
    IconComponent,
    TextFieldComponent,
    TextFieldInputDirective,
    TextFieldLeadingDirective,
    TextFieldTrailingDirective,
    ChipSetComponent,
    ChipComponent,
    GuiList,
    GuiListItem,
    GuiDivider,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent {
  protected readonly store = inject(TasksStore);

  protected readonly search = new FormControl('', { nonNullable: true });

  protected readonly statuses = this.store.statuses;
  protected readonly statusLabel = STATUS_LABEL;
  protected readonly statusIcon = STATUS_ICON;
  protected readonly priorityLabel = PRIORITY_LABEL;
  protected readonly priorityIcon = PRIORITY_ICON;

  protected readonly initials = initials;
  protected readonly avatarColor = avatarColor;
  protected readonly avatarInk = avatarInk;
  protected readonly labelColor = labelColor;

  /** Fixed "now" for deterministic relative due-date labels. */
  protected readonly today = DEMO_TODAY;

  constructor() {
    this.search.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.store.setQuery(value));
  }

  protected clearSearch(): void {
    this.search.setValue('');
  }

  protected onStatus(value: string | string[] | null): void {
    this.store.setStatusFilter((value as TaskStatus | null) ?? 'all');
  }

  protected onLabel(value: string | string[] | null): void {
    this.store.setLabelFilter((value as string | null) ?? 'all');
  }

  protected clearFilters(): void {
    this.search.setValue('');
    this.store.clearFilters();
  }

  /** Status label + relative due date (when set) for the supporting line. */
  protected supporting(task: Task): string {
    const status = this.statusLabel[task.status];
    return task.dueAt ? `${status} · due ${formatRelative(task.dueAt, this.today)}` : status;
  }

  protected assigneesOf(task: Task) {
    return task.assigneeIds
      .map((id) => this.store.memberById(id))
      .filter((m): m is NonNullable<typeof m> => m !== undefined);
  }

  protected trackById(_: number, task: Task): string {
    return task.id;
  }
}
