import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { ButtonComponent } from '@ngguide/ui/button';
import { IconComponent } from '@ngguide/ui/icon';
import { GuiCard } from '@ngguide/ui/card';
import { GuiDivider } from '@ngguide/ui/divider';
import { ChipComponent } from '@ngguide/ui/chip';

import { Order, OrderStatus } from '../core/models';
import { formatCurrency, formatDate, formatRelative, initials } from '../core/formatters';
import { DEMO_TODAY } from '../core/demo-date';
import { ShopStore } from './shop.store';

/**
 * Commerce customer-detail screen (`/shop/customers/:id`). Reads the route `:id`,
 * shows the customer (avatar, name, email) and the orders they have placed
 * (via `store.ordersByCustomer`), each linking to the order detail. Renders a
 * "not found" state when the id does not resolve.
 */
@Component({
  selector: 'app-customer-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent, IconComponent, GuiCard, GuiDivider, ChipComponent],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.css',
})
export class CustomerDetailComponent {
  protected readonly store = inject(ShopStore);
  private readonly route = inject(ActivatedRoute);

  /** Route param `:id`, as a reactive signal. */
  protected readonly id = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );

  protected readonly customer = computed(() => this.store.customerById(this.id()));
  protected readonly orders = computed(() => {
    const c = this.customer();
    return c ? this.store.ordersByCustomer(c.id) : [];
  });

  protected formatCurrency = formatCurrency;
  protected formatDate = formatDate;
  protected initials = initials;

  protected relative(d: Date): string {
    return formatRelative(d, DEMO_TODAY);
  }

  protected avatar(name: string): string {
    let h = 0;
    for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
    return `oklch(70% 0.12 ${h}deg)`;
  }

  protected statusLabel(status: OrderStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  protected trackById(_: number, o: Order): string {
    return o.id;
  }
}
