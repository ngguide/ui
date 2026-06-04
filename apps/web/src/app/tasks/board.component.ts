import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CdkMenu, CdkMenuTrigger } from '@angular/cdk/menu';
import { GuiCard, GuiCardPrimaryAction } from '@ngguide/ui/card';
import { ChipComponent, ChipSetComponent } from '@ngguide/ui/chip';
import { FabComponent } from '@ngguide/ui/fab';
import { IconComponent } from '@ngguide/ui/icon';
import { IconButtonComponent } from '@ngguide/ui/icon-button';
import { GuiBadge } from '@ngguide/ui/badge';
import { MenuDirective, MenuItemComponent } from '@ngguide/ui/menu';
import {
  GuiSideSheetSurface,
  GuiSideSheetHeader,
  GuiSideSheetContent,
  GuiSideSheetActions,
} from '@ngguide/ui/side-sheet';
import { GuiBottomSheetSurface } from '@ngguide/ui/bottom-sheet';
import { GuiBreakpoint } from '@ngguide/ui/overlay';
import { ButtonComponent } from '@ngguide/ui/button';

import { Task, TaskStatus } from '../core/models';
import { initials } from '../core/formatters';
import { TasksStore } from './tasks.store';
import {
  STATUS_ICON,
  STATUS_LABEL,
  avatarColor,
  avatarInk,
  labelColor,
} from './task-ui';
import { TaskDetailComponent } from './task-detail.component';
import { TaskFormComponent } from './task-form.component';

/** Max avatars shown on a card before collapsing into a +N badge. */
const MAX_AVATARS = 2;

/**
 * Kanban board — one column per status, fed by `store.byStatus()`. Cards carry a
 * priority indicator, label chips, and assignee avatars (with a `[guiBadge]`
 * overflow count beyond 2). A per-card `cdkMenu` changes status via
 * `store.moveStatus`. Clicking a card opens the task detail in a `gui-side-sheet`
 * (expanded) or `gui-bottom-sheet` (compact) WITHOUT leaving the board.
 */
@Component({
  selector: 'app-tasks-board',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    CdkMenu,
    CdkMenuTrigger,
    GuiCard,
    GuiCardPrimaryAction,
    ChipComponent,
    ChipSetComponent,
    FabComponent,
    IconComponent,
    IconButtonComponent,
    GuiBadge,
    MenuDirective,
    MenuItemComponent,
    GuiSideSheetSurface,
    GuiSideSheetHeader,
    GuiSideSheetContent,
    GuiSideSheetActions,
    GuiBottomSheetSurface,
    ButtonComponent,
    TaskDetailComponent,
    TaskFormComponent,
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css',
})
export class BoardComponent {
  protected readonly store = inject(TasksStore);
  protected readonly breakpoint = inject(GuiBreakpoint);

  protected readonly statuses = this.store.statuses;
  protected readonly statusLabel = STATUS_LABEL;
  protected readonly statusIcon = STATUS_ICON;
  protected readonly maxAvatars = MAX_AVATARS;

  protected readonly initials = initials;
  protected readonly avatarColor = avatarColor;
  protected readonly avatarInk = avatarInk;
  protected readonly labelColor = labelColor;

  /** Currently opened task (detail sheet); `null` when no sheet is open. */
  protected readonly selectedId = signal<string | null>(null);
  /** New-task mode: open the form sheet with no existing task. */
  protected readonly creating = signal(false);

  protected readonly detailOpen = signal(false);

  protected readonly selectedTask = computed<Task | undefined>(() => {
    const id = this.selectedId();
    return id ? this.store.byId(id) : undefined;
  });

  protected readonly compact = computed(() => this.breakpoint.isCompact());

  protected openTask(task: Task): void {
    this.creating.set(false);
    this.selectedId.set(task.id);
    this.detailOpen.set(true);
  }

  protected newTask(): void {
    this.creating.set(true);
    this.selectedId.set(null);
    this.detailOpen.set(true);
  }

  protected closeDetail(): void {
    this.detailOpen.set(false);
    this.creating.set(false);
    this.selectedId.set(null);
  }

  protected onSaved(task: Task): void {
    // Keep the just-created/edited task visible in detail view.
    this.creating.set(false);
    this.selectedId.set(task.id);
  }

  protected setStatus(id: string, status: TaskStatus): void {
    this.store.moveStatus(id, status);
  }

  protected assigneesOf(task: Task) {
    return task.assigneeIds
      .map((id) => this.store.memberById(id))
      .filter((m): m is NonNullable<typeof m> => m !== undefined);
  }

  protected labelsOf(task: Task) {
    return task.labelIds
      .map((id) => this.store.labelById(id))
      .filter((l): l is NonNullable<typeof l> => l !== undefined);
  }

  protected overflow(task: Task): number {
    return Math.max(0, this.assigneesOf(task).length - MAX_AVATARS);
  }
}
