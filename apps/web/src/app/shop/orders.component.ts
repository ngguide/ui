import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';

import { ButtonComponent } from '@ngguide/ui/button';
import { IconButtonComponent } from '@ngguide/ui/icon-button';
import { IconComponent } from '@ngguide/ui/icon';
import { GuiCard } from '@ngguide/ui/card';
import { GuiDivider } from '@ngguide/ui/divider';
import {
  TextFieldComponent,
  TextFieldInputDirective,
  TextFieldLeadingDirective,
  TextFieldTrailingDirective,
} from '@ngguide/ui/text-field';
import { ChipComponent, ChipSetComponent } from '@ngguide/ui/chip';
import {
  SegmentedButtonComponent,
  SegmentedButtonGroupComponent,
} from '@ngguide/ui/segmented-button';
import { DateRangePickerComponent } from '@ngguide/ui/date-picker';
import { MenuDirective, MenuItemComponent } from '@ngguide/ui/menu';

import { GuiDateRange, Order, OrderStatus } from '../core/models';
import { formatCurrency, formatDate, initials } from '../core/formatters';
import {
  OrderSort,
  OrderStatusFilter,
  ShopStore,
} from './shop.store';

const STATUSES: readonly OrderStatus[] = ['pending', 'paid', 'shipped', 'refunded'];

/**
 * Commerce orders screen (`/shop/orders`). Search + status/sort/date filters
 * feed the shared {@link ShopStore}; the list renders `store.visibleOrders()`
 * with per-row status actions and links to each order detail.
 */
@Component({
  selector: 'app-orders',
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
    GuiCard,
    GuiDivider,
    TextFieldComponent,
    TextFieldInputDirective,
    TextFieldLeadingDirective,
    TextFieldTrailingDirective,
    ChipComponent,
    ChipSetComponent,
    SegmentedButtonComponent,
    SegmentedButtonGroupComponent,
    DateRangePickerComponent,
    MenuDirective,
    MenuItemComponent,
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent {
  protected readonly store = inject(ShopStore);
  protected readonly statuses = STATUSES;

  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly dateRange = new FormControl<GuiDateRange>(
    { start: null, end: null },
    { nonNullable: true },
  );

  /** Local mirror of the store's status filter, two-way bound to the chip set. */
  protected readonly statusFilter = signal<OrderStatusFilter>('all');
  /** Local mirror of the store's sort, two-way bound to the segmented buttons. */
  protected readonly sortBy = signal<OrderSort>('recent');

  protected formatCurrency = formatCurrency;
  protected formatDate = formatDate;
  protected initials = initials;

  constructor() {
    // Two-way-bound signals push their changes into the store reactively (R6.1).
    effect(() => this.store.setOrderStatus(this.statusFilter() ?? 'all'));
    effect(() => this.store.setOrderSort(this.sortBy() ?? 'recent'));

    this.search.valueChanges.subscribe((v) => this.store.setOrderQuery(v ?? ''));
    this.dateRange.valueChanges.subscribe((r) =>
      this.store.setOrderDateRange(r?.start ?? null, r?.end ?? null),
    );
  }

  protected clearSearch(): void {
    this.search.setValue('');
  }

  protected setStatus(value: OrderStatus, id: string): void {
    this.store.updateOrderStatus(id, value);
  }

  protected clearFilters(): void {
    this.search.setValue('');
    this.dateRange.setValue({ start: null, end: null });
    this.statusFilter.set('all');
    this.sortBy.set('recent');
    this.store.clearOrderFilters();
  }

  protected statusLabel(status: OrderStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  protected trackById(_: number, o: Order): string {
    return o.id;
  }
}
