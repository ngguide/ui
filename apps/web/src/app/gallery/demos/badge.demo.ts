import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { GuiBadge } from '@ngguide/ui/badge';
import { IconButtonComponent } from '@ngguide/ui/icon-button';
import { IconComponent } from '@ngguide/ui/icon';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Isolated vitrine demo for the M3 Badge directive (`@ngguide/ui/badge`).
 *
 * Badge is an attribute directive (`[guiBadge]`) that overlays a status graphic
 * on the top-trailing corner of its host. It supports exactly the two M3
 * variants — a 6dp **small** dot (no/empty value) and a 16dp **large** numeric
 * badge (value present, capped to four characters as `"{max}+"`) — plus a
 * force-hide state (`guiBadgeHidden`) and a configurable cap (`guiBadgeMax`).
 * There are no size/shape inputs: the variant fixes both per spec.
 *
 * The directive appends an overflowing badge graphic, so a clipping host (an
 * icon button) must be wrapped in a non-clipping `<span guiBadge>`.
 */
@Component({
  selector: 'app-demo-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...GALLERY_DEMO_UI, GuiBadge, IconButtonComponent, IconComponent],
  template: `
    <app-demo-component
      name="Badge"
      entry="@ngguide/ui/badge"
      docHref="https://m3.material.io/components/badges"
    >
      <!-- M3: two variants — small (dot) and large (numeric). -->
      <app-demo-block
        heading="Variants"
        hint="M3 has two: a 6dp small dot (no value) and a 16dp large numeric badge."
      >
        <app-demo-specimen label="small (dot)">
          <span guiBadge>
            <button gui-icon-button label="Notifications">
              <gui-icon class="sym">notifications</gui-icon>
            </button>
          </span>
        </app-demo-specimen>
        <app-demo-specimen label="large (numeric)">
          <span [guiBadge]="3">
            <button gui-icon-button label="Mail">
              <gui-icon class="sym">mail</gui-icon>
            </button>
          </span>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Value content: numbers, strings, and the four-character M3 cap. -->
      <app-demo-block
        heading="Content"
        hint="Numeric count, label string, and the four-character M3 limit (incl. a +)."
      >
        <app-demo-specimen label="one digit">
          <span [guiBadge]="1">
            <button gui-icon-button label="Inbox">
              <gui-icon class="sym">inbox</gui-icon>
            </button>
          </span>
        </app-demo-specimen>
        <app-demo-specimen label="two digits">
          <span [guiBadge]="42">
            <button gui-icon-button label="Chat">
              <gui-icon class="sym">chat</gui-icon>
            </button>
          </span>
        </app-demo-specimen>
        <app-demo-specimen label="label string">
          <span guiBadge="new">
            <button gui-icon-button label="Updates">
              <gui-icon class="sym">campaign</gui-icon>
            </button>
          </span>
        </app-demo-specimen>
        <app-demo-specimen label="capped 999+">
          <span [guiBadge]="1500">
            <button gui-icon-button label="Messages">
              <gui-icon class="sym">forum</gui-icon>
            </button>
          </span>
        </app-demo-specimen>
      </app-demo-block>

      <!-- guiBadgeMax controls the "{max}+" cap. -->
      <app-demo-block
        heading="Max cap"
        hint="guiBadgeMax sets the threshold; over it the badge shows {max}+ (default 999)."
      >
        <app-demo-specimen label="max 9 → 9+">
          <span [guiBadge]="15" [guiBadgeMax]="9">
            <button gui-icon-button label="Alerts">
              <gui-icon class="sym">notifications_active</gui-icon>
            </button>
          </span>
        </app-demo-specimen>
        <app-demo-specimen label="max 99 → 99+">
          <span [guiBadge]="240" [guiBadgeMax]="99">
            <button gui-icon-button label="Tasks">
              <gui-icon class="sym">task</gui-icon>
            </button>
          </span>
        </app-demo-specimen>
        <app-demo-specimen label="max 999 (default)">
          <span [guiBadge]="1200">
            <button gui-icon-button label="Downloads">
              <gui-icon class="sym">download</gui-icon>
            </button>
          </span>
        </app-demo-specimen>
      </app-demo-block>

      <!-- States: shown vs force-hidden (guiBadgeHidden). -->
      <app-demo-block
        heading="States"
        hint="guiBadgeHidden force-hides the badge graphic without removing the directive."
      >
        <app-demo-specimen label="dot shown">
          <span guiBadge>
            <button gui-icon-button label="Favorites">
              <gui-icon class="sym">favorite</gui-icon>
            </button>
          </span>
        </app-demo-specimen>
        <app-demo-specimen label="dot hidden">
          <span guiBadge [guiBadgeHidden]="true">
            <button gui-icon-button label="Favorites (read)">
              <gui-icon class="sym">favorite</gui-icon>
            </button>
          </span>
        </app-demo-specimen>
        <app-demo-specimen label="numeric shown">
          <span [guiBadge]="6">
            <button gui-icon-button label="Cart">
              <gui-icon class="sym">shopping_cart</gui-icon>
            </button>
          </span>
        </app-demo-specimen>
        <app-demo-specimen label="numeric hidden">
          <span [guiBadge]="6" [guiBadgeHidden]="true">
            <button gui-icon-button label="Cart (read)">
              <gui-icon class="sym">shopping_cart</gui-icon>
            </button>
          </span>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Interactive: toggle the badge on/off and bump its count. -->
      <app-demo-block
        heading="Interactive"
        hint="Mark-as-read hides the badge; the bump button increments the count."
      >
        <app-demo-specimen label="unread toggle">
          <span guiBadge [guiBadgeHidden]="read()">
            <button
              gui-icon-button
              toggle
              label="Mark notifications read"
              (click)="read.set(!read())"
            >
              <gui-icon class="sym">notifications</gui-icon>
            </button>
          </span>
        </app-demo-specimen>
        <app-demo-specimen label="bump count">
          <span [guiBadge]="count()">
            <button gui-icon-button label="Add one" (click)="count.set(count() + 1)">
              <gui-icon class="sym">add</gui-icon>
            </button>
          </span>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Anchored to a non-clipping host directly (text / avatar). -->
      <app-demo-block
        heading="On non-clipping hosts"
        hint="Applied directly to any non-clipping element (icon, avatar, text)."
      >
        <app-demo-specimen label="on an icon">
          <gui-icon class="sym" guiBadge>account_circle</gui-icon>
        </app-demo-specimen>
        <app-demo-specimen label="on text">
          <span [guiBadge]="8" style="padding-inline-end: 0.25rem;">Updates</span>
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
})
export class BadgeDemo {
  /** Whether the unread notifications were marked as read (hides the dot). */
  protected readonly read = signal(false);
  /** Live count for the bump specimen (deterministic seed, no clock/RNG). */
  protected readonly count = signal(2);
}
