import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '@ngguide/ui/button';
import { IconComponent } from '@ngguide/ui/icon';
import { GuiCard } from '@ngguide/ui/card';
import { GuiList, GuiListItem } from '@ngguide/ui/list';

import { Customer } from '../core/models';
import { initials } from '../core/formatters';
import { ShopStore } from './shop.store';

/**
 * Commerce customers screen (`/shop/customers`). Lists `store.customers()` with
 * a deterministic gradient avatar, name, and email; each row links to the
 * customer detail via a trailing action (a11y-safe — no bare div clicks).
 */
@Component({
  selector: 'app-customers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonComponent,
    IconComponent,
    GuiCard,
    GuiList,
    GuiListItem,
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css',
})
export class CustomersComponent {
  protected readonly store = inject(ShopStore);
  protected initials = initials;

  /** Stable avatar hue (0..359) derived from the customer name — deterministic. */
  protected avatar(c: Customer): string {
    let h = 0;
    for (const ch of c.name) h = (h * 31 + ch.charCodeAt(0)) % 360;
    return `oklch(70% 0.12 ${h}deg)`;
  }

  protected trackById(_: number, c: Customer): string {
    return c.id;
  }
}
