import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';

import { ButtonComponent } from '@ngguide/ui/button';
import { IconButtonComponent } from '@ngguide/ui/icon-button';
import { IconComponent } from '@ngguide/ui/icon';
import { TextFieldComponent } from '@ngguide/ui/text-field';
import {
  TextFieldInputDirective,
  TextFieldLeadingDirective,
  TextFieldTrailingDirective,
} from '@ngguide/ui/text-field';
import { ChipSetComponent } from '@ngguide/ui/chip';
import { ChipComponent } from '@ngguide/ui/chip';
import {
  SegmentedButtonGroupComponent,
  SegmentedButtonComponent,
} from '@ngguide/ui/segmented-button';
import { GuiList, GuiListItem } from '@ngguide/ui/list';
import { GuiDivider } from '@ngguide/ui/divider';
import { CheckboxComponent } from '@ngguide/ui/checkbox';
import { GuiLoadingIndicator } from '@ngguide/ui/loading-indicator';
import {
  MenuDirective,
  MenuItemComponent,
  MenuDividerComponent,
} from '@ngguide/ui/menu';
import { GuiDialogTrigger } from '@ngguide/ui/dialog';
import {
  GuiDialogIcon,
  GuiDialogHeadline,
  GuiDialogContent,
  GuiDialogActions,
} from '@ngguide/ui/dialog';

import { User, UserRole, UserStatus } from '../core/models';
import { initials } from '../core/formatters';
import { AdminStore, RoleFilter, UserSort } from './admin.store';

/**
 * Console user-management screen (`/admin/users`). Search + role/sort filters
 * feed the shared {@link AdminStore}; the list renders `store.visible()` with
 * per-row actions (edit/delete) and bulk selection.
 */
@Component({
  selector: 'app-users',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CdkMenu,
    CdkMenuItem,
    CdkMenuTrigger,
    ButtonComponent,
    IconButtonComponent,
    IconComponent,
    TextFieldComponent,
    TextFieldInputDirective,
    TextFieldLeadingDirective,
    TextFieldTrailingDirective,
    ChipSetComponent,
    ChipComponent,
    SegmentedButtonGroupComponent,
    SegmentedButtonComponent,
    GuiList,
    GuiListItem,
    GuiDivider,
    CheckboxComponent,
    GuiLoadingIndicator,
    MenuDirective,
    MenuItemComponent,
    MenuDividerComponent,
    GuiDialogTrigger,
    GuiDialogIcon,
    GuiDialogHeadline,
    GuiDialogContent,
    GuiDialogActions,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent {
  protected readonly store = inject(AdminStore);

  protected readonly search = new FormControl('', { nonNullable: true });

  /** Local mirrors of the store's role/sort, two-way bound to the controls. */
  protected readonly roleFilter = signal<RoleFilter>('all');
  protected readonly sortBy = signal<UserSort>('name-asc');

  /** Bulk-selection set keyed by user id. */
  protected readonly selected = signal<ReadonlySet<string>>(new Set());

  protected readonly selectedCount = computed(() => this.selected().size);
  protected readonly hasSelection = computed(() => this.selected().size > 0);

  /** "select all" reflects whether every currently visible row is selected. */
  protected readonly allSelected = computed(() => {
    const rows = this.store.visible();
    if (rows.length === 0) return false;
    const sel = this.selected();
    return rows.every((u) => sel.has(u.id));
  });

  protected initials = initials;

  protected onSearch(value: string): void {
    this.store.setQuery(value);
  }

  protected clearSearch(): void {
    this.search.setValue('');
    this.store.setQuery('');
  }

  protected onRole(value: string | null): void {
    const role = (value ?? 'all') as RoleFilter;
    this.roleFilter.set(role);
    this.store.setRole(role);
  }

  protected onSort(value: string | null): void {
    const sort = (value ?? 'name-asc') as UserSort;
    this.sortBy.set(sort);
    this.store.setSort(sort);
  }

  protected isSelected(id: string): boolean {
    return this.selected().has(id);
  }

  protected toggleRow(id: string, checked: boolean): void {
    this.selected.update((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  protected toggleAll(checked: boolean): void {
    if (!checked) {
      this.selected.set(new Set());
      return;
    }
    this.selected.set(new Set(this.store.visible().map((u) => u.id)));
  }

  protected deleteOne(id: string): void {
    this.store.remove(id);
    this.toggleRow(id, false);
  }

  protected clearSelection(): void {
    this.selected.set(new Set());
  }

  protected deleteSelected(): void {
    const ids = this.selected();
    ids.forEach((id) => this.store.remove(id));
    this.selected.set(new Set());
  }

  protected clearFilters(): void {
    this.search.setValue('');
    this.roleFilter.set('all');
    this.sortBy.set('name-asc');
    this.store.clearFilters();
  }

  protected reload(): void {
    this.store.reload();
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

  /** Stable identity for the list `@for`. */
  protected trackById(_: number, u: User): string {
    return u.id;
  }
}
