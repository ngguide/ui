import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { ButtonComponent } from '@ngguide/ui/button';
import { IconComponent } from '@ngguide/ui/icon';
import { GuiCard } from '@ngguide/ui/card';
import { GuiDivider } from '@ngguide/ui/divider';
import { ChipSetComponent, ChipComponent } from '@ngguide/ui/chip';
import { GuiDialogTrigger } from '@ngguide/ui/dialog';
import {
  GuiDialogIcon,
  GuiDialogHeadline,
  GuiDialogContent,
  GuiDialogActions,
} from '@ngguide/ui/dialog';

import { User, UserRole, UserStatus } from '../core/models';
import { formatDate, formatRelative, initials } from '../core/formatters';
import { DEMO_TODAY } from '../core/demo-date';
import { AdminStore } from './admin.store';

/**
 * Read-only user profile (`/admin/users/:id`). Reads the route param reactively
 * and resolves the user from the shared {@link AdminStore}; offers edit / delete
 * affordances. Falls back to a not-found state when the id is unknown.
 */
@Component({
  selector: 'app-user-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonComponent,
    IconComponent,
    GuiCard,
    GuiDivider,
    ChipSetComponent,
    ChipComponent,
    GuiDialogTrigger,
    GuiDialogIcon,
    GuiDialogHeadline,
    GuiDialogContent,
    GuiDialogActions,
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css',
})
export class UserDetailComponent {
  private readonly store = inject(AdminStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly id = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );

  /** Re-resolves whenever the route id or the store data changes. */
  protected readonly user = computed<User | undefined>(() => {
    const id = this.id();
    // Touch the visible signal so deletes/edits re-run this computed.
    this.store.total();
    return id ? this.store.byId(id) : undefined;
  });

  protected initials = initials;
  protected formatDate = formatDate;

  protected lastActive(d: Date): string {
    return formatRelative(d, DEMO_TODAY);
  }

  protected avatarBg(hue: number): string {
    return `oklch(70% 0.12 ${hue}deg)`;
  }

  protected roleLabel(role: UserRole): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  protected statusLabel(status: UserStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  protected deleteUser(id: string): void {
    this.store.remove(id);
    this.router.navigate(['/admin/users']);
  }
}
