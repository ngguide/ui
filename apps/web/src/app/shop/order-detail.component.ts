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

import { OrderLine, OrderStatus } from '../core/models';
import { formatCurrency, formatDate, formatRelative, initials } from '../core/formatters';
import { DEMO_TODAY } from '../core/demo-date';
import { ShopStore } from './shop.store';

/**
 * Commerce order-detail screen (`/shop/orders/:id`). Reads the route `:id`
 * (component-input binding), shows the customer + status + placed date and a
 * line-items table with a computed grand total. Renders a "not found" state when
 * the id does not resolve.
 */
@Component({
  selector: 'app-order-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent, IconComponent, GuiCard, GuiDivider, ChipComponent],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css',
})
export class OrderDetailComponent {
  protected readonly store = inject(ShopStore);
  private readonly route = inject(ActivatedRoute);

  /** Route param `:id`, as a reactive signal (component-input binding is off). */
  protected readonly id = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );

  protected readonly order = computed(() => this.store.orderById(this.id()));
  protected readonly customer = computed(() => {
    const o = this.order();
    return o ? this.store.customerById(o.customerId) : undefined;
  });
  protected readonly total = computed(() => {
    const o = this.order();
    return o ? this.store.totalOf(o) : 0;
  });

  protected formatCurrency = formatCurrency;
  protected formatDate = formatDate;
  protected initials = initials;

  protected relative(d: Date): string {
    return formatRelative(d, DEMO_TODAY);
  }

  protected productName(id: string): string {
    return this.store.productById(id)?.name ?? 'Unknown product';
  }

  protected statusLabel(status: OrderStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  protected lineSubtotal(l: OrderLine): number {
    return l.qty * l.unitPrice;
  }

  protected trackLine(_: number, l: OrderLine): string {
    return l.productId;
  }
}
