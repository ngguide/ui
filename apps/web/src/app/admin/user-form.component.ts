import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ButtonComponent } from '@ngguide/ui/button';
import { IconComponent } from '@ngguide/ui/icon';
import { GuiCard } from '@ngguide/ui/card';
import { GuiDivider } from '@ngguide/ui/divider';
import { TextFieldComponent } from '@ngguide/ui/text-field';
import { TextFieldInputDirective } from '@ngguide/ui/text-field';
import { RadioGroupComponent, RadioComponent } from '@ngguide/ui/radio';
import { SwitchComponent } from '@ngguide/ui/switch';
import { DatePickerComponent } from '@ngguide/ui/date-picker';
import { GuiSnackbar } from '@ngguide/ui/snackbar';

import { User, UserRole } from '../core/models';
import { DEMO_TODAY } from '../core/demo-date';
import { AdminStore } from './admin.store';

type UserFormGroup = FormGroup<{
  name: FormControl<string>;
  email: FormControl<string>;
  role: FormControl<string | null>;
  active: FormControl<boolean>;
  joinedAt: FormControl<Date | null>;
}>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Create / edit user form (`/admin/users/new` and `/admin/users/:id/edit`).
 * Reactive `FormGroup` with inline validation; on submit it adds or updates the
 * user in the shared {@link AdminStore}, toasts, and returns to the list.
 */
@Component({
  selector: 'app-user-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonComponent,
    IconComponent,
    GuiCard,
    GuiDivider,
    TextFieldComponent,
    TextFieldInputDirective,
    RadioGroupComponent,
    RadioComponent,
    SwitchComponent,
    DatePickerComponent,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css',
})
export class UserFormComponent {
  private readonly store = inject(AdminStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackbar = inject(GuiSnackbar);

  private readonly editId = this.route.snapshot.paramMap.get('id');
  private readonly existing = this.editId
    ? this.store.byId(this.editId)
    : undefined;

  protected readonly isEdit = !!this.existing;

  protected readonly form: UserFormGroup = new FormGroup({
    name: new FormControl(this.existing?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    email: new FormControl(this.existing?.email ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(EMAIL_PATTERN)],
    }),
    role: new FormControl<string | null>(this.existing?.role ?? 'viewer', {
      validators: [Validators.required],
    }),
    active: new FormControl(this.existing ? this.existing.status === 'active' : true, {
      nonNullable: true,
    }),
    joinedAt: new FormControl<Date | null>(
      this.existing?.joinedAt ?? DEMO_TODAY,
    ),
  });

  /** True when a control should surface its error chrome (invalid + touched). */
  protected showError(control: 'name' | 'email'): boolean {
    const c = this.form.controls[control];
    return c.invalid && c.touched;
  }

  protected nameError(): string {
    const c = this.form.controls.name;
    if (c.hasError('required')) return 'Name is required.';
    if (c.hasError('minlength')) return 'Use at least 2 characters.';
    return '';
  }

  protected emailError(): string {
    const c = this.form.controls.email;
    if (c.hasError('required')) return 'Email is required.';
    if (c.hasError('pattern')) return 'Enter a valid email address.';
    return '';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const role = (v.role ?? 'viewer') as UserRole;

    if (this.existing) {
      this.store.update(this.existing.id, {
        name: v.name.trim(),
        email: v.email.trim(),
        role,
        status: v.active ? 'active' : 'suspended',
        joinedAt: v.joinedAt ?? this.existing.joinedAt,
      });
    } else {
      this.store.add(this.buildUser(v.name, v.email, role, v.active, v.joinedAt));
    }

    this.snackbar.open({ message: 'User saved', showClose: true, duration: 4000 });
    this.router.navigate(['/admin/users']);
  }

  /** Deterministic id from a name slug + the current user count (no randomness). */
  private buildUser(
    name: string,
    email: string,
    role: UserRole,
    active: boolean,
    joinedAt: Date | null,
  ): User {
    const slug =
      name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'user';
    return {
      id: `u-${slug}-${this.store.total() + 1}`,
      name: name.trim(),
      email: email.trim(),
      role,
      status: active ? 'active' : 'suspended',
      joinedAt: joinedAt ?? DEMO_TODAY,
      lastActiveAt: DEMO_TODAY,
      avatarHue: this.hueFromName(name),
    };
  }

  /** Stable hue (0..359) derived from the name string — deterministic. */
  private hueFromName(name: string): number {
    let h = 0;
    for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
    return h;
  }
}
