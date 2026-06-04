import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonComponent } from '@ngguide/ui/button';
import { TextFieldComponent, TextFieldInputDirective } from '@ngguide/ui/text-field';
import { RadioGroupComponent, RadioComponent } from '@ngguide/ui/radio';
import { ChipSetComponent, ChipComponent } from '@ngguide/ui/chip';
import { DatePickerComponent } from '@ngguide/ui/date-picker';
import { TimePickerComponent } from '@ngguide/ui/time-picker';
import { IconComponent } from '@ngguide/ui/icon';

import { GuiTime, Task, TaskPriority, TaskStatus } from '../core/models';
import { TasksStore } from './tasks.store';
import { PRIORITY_LABEL, STATUS_LABEL } from './task-ui';

interface TaskFormValue {
  title: FormControl<string>;
  description: FormControl<string>;
  status: FormControl<TaskStatus>;
  priority: FormControl<TaskPriority>;
  assigneeIds: FormControl<string[]>;
  labelIds: FormControl<string[]>;
  dueAt: FormControl<Date | null>;
  dueTime: FormControl<GuiTime | null>;
}

/**
 * Reactive create/edit form for a Task. `task` input toggles edit vs. create.
 * On submit it builds a deterministic Task (id derived from store count, never
 * random) and calls `store.add`/`store.update`, then emits `saved`.
 */
@Component({
  selector: 'app-task-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    TextFieldComponent,
    TextFieldInputDirective,
    RadioGroupComponent,
    RadioComponent,
    ChipSetComponent,
    ChipComponent,
    DatePickerComponent,
    TimePickerComponent,
    IconComponent,
  ],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css',
})
export class TaskFormComponent {
  protected readonly store = inject(TasksStore);

  /** Existing task → edit mode; `undefined` → create mode. */
  readonly task = input<Task | undefined>(undefined);

  readonly saved = output<Task>();
  readonly cancelled = output<void>();

  protected readonly statuses = this.store.statuses;
  protected readonly priorities: readonly TaskPriority[] = ['low', 'medium', 'high'];
  protected readonly statusLabel = STATUS_LABEL;
  protected readonly priorityLabel = PRIORITY_LABEL;

  protected readonly form = new FormGroup<TaskFormValue>({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(80)],
    }),
    description: new FormControl('', { nonNullable: true }),
    status: new FormControl<TaskStatus>('todo', { nonNullable: true }),
    priority: new FormControl<TaskPriority>('medium', { nonNullable: true }),
    assigneeIds: new FormControl<string[]>([], { nonNullable: true }),
    labelIds: new FormControl<string[]>([], { nonNullable: true }),
    dueAt: new FormControl<Date | null>(null),
    dueTime: new FormControl<GuiTime | null>(null),
  });

  protected readonly isEdit = computed(() => this.task() !== undefined);

  constructor() {
    // Reset the form whenever a different task (or create mode) is selected.
    effect(() => {
      const t = this.task();
      if (t) {
        this.form.reset({
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          assigneeIds: [...t.assigneeIds],
          labelIds: [...t.labelIds],
          dueAt: t.dueAt,
          dueTime: t.dueTime,
        });
      } else {
        this.form.reset({
          title: '',
          description: '',
          status: 'todo',
          priority: 'medium',
          assigneeIds: [],
          labelIds: [],
          dueAt: null,
          dueTime: null,
        });
      }
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const existing = this.task();
    const id = existing ? existing.id : `t-${String(this.store.count() + 1).padStart(2, '0')}`;
    const task: Task = {
      id,
      title: v.title.trim(),
      description: v.description.trim(),
      status: v.status,
      priority: v.priority,
      assigneeIds: v.assigneeIds,
      labelIds: v.labelIds,
      dueAt: v.dueAt,
      dueTime: v.dueTime,
    };
    if (existing) {
      this.store.update(id, task);
    } else {
      this.store.add(task);
    }
    this.saved.emit(task);
  }

  protected cancel(): void {
    this.cancelled.emit();
  }

  protected get titleCtrl(): FormControl<string> {
    return this.form.controls.title;
  }

  protected get titleInvalid(): boolean {
    const c = this.titleCtrl;
    return c.invalid && (c.touched || c.dirty);
  }
}
