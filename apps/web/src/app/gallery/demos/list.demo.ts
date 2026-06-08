import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IconComponent } from '@ngguide/ui/icon';
import { GuiList, GuiListItem } from '@ngguide/ui/list';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Exhaustive vitrine demo for the M3 list (`@ngguide/ui/list`).
 *
 * Covers every dimension the implemented component supports:
 * - Variants (ARIA `mode`): `action` (`role=list`, rows host their own native
 *   controls, natural Tab order) and `listbox` (`role=listbox` with roving
 *   focus, single-select and `multiselectable` multi-select).
 * - Sizes (`lines`): 1 / 2 / 3 → 56 / 72 / 88dp row heights.
 * - Dividers (`divider`): none, `full` (100%), and `inset` (16/24dp).
 * - Anatomy slots: `[guiListItemLeading]` (icon / avatar), default headline,
 *   `[guiListItemSupporting]` (body-medium), `[guiListItemTrailing]` (text or
 *   a control), plus the built-in non-color selection checkmark
 *   (`selectionIndicator`).
 * - States: enabled, selected (two-way `selected` model →
 *   primary-container), and `disabled` (dimmed, stays discoverable). The
 *   listbox selection is live (click / arrow keys / Enter / Space).
 */
@Component({
  selector: 'app-demo-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...GALLERY_DEMO_UI, GuiList, GuiListItem, IconComponent],
  template: `
    <app-demo-component
      name="List"
      entry="@ngguide/ui/list"
      docHref="https://m3.material.io/components/lists"
    >
      <!-- VARIANTS: the two ARIA patterns driven by the list mode input. -->
      <app-demo-block
        heading="Variants (mode)"
        hint="action = role=list, rows host their own controls; listbox = role=listbox with roving focus and selection"
        [column]="true"
      >
        <app-demo-specimen class="fill" label="action (role=list)">
          <gui-list aria-label="Inbox">
            <gui-list-item>Primary action row</gui-list-item>
            <gui-list-item>Second row</gui-list-item>
            <gui-list-item>Third row</gui-list-item>
          </gui-list>
        </app-demo-specimen>

        <app-demo-specimen class="fill" label="listbox · single-select (role=listbox)">
          <gui-list mode="listbox" aria-label="Choose one fruit">
            <gui-list-item selectable selectionIndicator>Apple</gui-list-item>
            <gui-list-item selectable selectionIndicator [selected]="true">
              Banana
            </gui-list-item>
            <gui-list-item selectable selectionIndicator>Cherry</gui-list-item>
          </gui-list>
        </app-demo-specimen>

        <app-demo-specimen
          class="fill"
          label="listbox · multiselectable (aria-multiselectable=true)"
        >
          <gui-list mode="listbox" multiselectable aria-label="Select toppings">
            <gui-list-item selectable selectionIndicator [selected]="true">
              Cheese
            </gui-list-item>
            <gui-list-item selectable selectionIndicator>Pepperoni</gui-list-item>
            <gui-list-item selectable selectionIndicator [selected]="true">
              Mushrooms
            </gui-list-item>
          </gui-list>
        </app-demo-specimen>
      </app-demo-block>

      <!-- SIZES: line count drives the 56 / 72 / 88dp M3 row heights. -->
      <app-demo-block
        heading="Sizes (lines)"
        hint="lines = 1 / 2 / 3 → 56 / 72 / 88dp; 3-line rows top-align their elements"
        [column]="true"
      >
        <app-demo-specimen class="fill" label="1 line · 56dp">
          <gui-list aria-label="One-line list">
            <gui-list-item [lines]="1" leadingKind="icon">
              <gui-icon guiListItemLeading class="sym">person</gui-icon>
              Headline only
            </gui-list-item>
          </gui-list>
        </app-demo-specimen>

        <app-demo-specimen class="fill" label="2 lines · 72dp">
          <gui-list aria-label="Two-line list">
            <gui-list-item [lines]="2" leadingKind="icon">
              <gui-icon guiListItemLeading class="sym">mail</gui-icon>
              Headline
              <span guiListItemSupporting>Supporting text on a second line</span>
            </gui-list-item>
          </gui-list>
        </app-demo-specimen>

        <app-demo-specimen class="fill" label="3 lines · 88dp">
          <gui-list aria-label="Three-line list">
            <gui-list-item [lines]="3" leadingKind="icon">
              <gui-icon guiListItemLeading class="sym">article</gui-icon>
              Headline
              <span guiListItemSupporting>
                Supporting text that wraps onto a second clamped line to fill the
                taller three-line row.
              </span>
            </gui-list-item>
          </gui-list>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ANATOMY: leading slot, headline, supporting text, trailing slot. -->
      <app-demo-block
        heading="Anatomy (slots)"
        hint="[guiListItemOverline] · [guiListItemLeading] · default headline · [guiListItemSupporting] · [guiListItemTrailing]"
        [column]="true"
      >
        <app-demo-specimen class="fill" label="text only">
          <gui-list aria-label="Text-only list">
            <gui-list-item>Just a label</gui-list-item>
          </gui-list>
        </app-demo-specimen>

        <app-demo-specimen class="fill" label="overline + headline + supporting">
          <gui-list aria-label="Overline list">
            <gui-list-item [lines]="3" leadingKind="icon">
              <gui-icon guiListItemLeading class="sym">label</gui-icon>
              <span guiListItemOverline>OVERLINE</span>
              Headline text
              <span guiListItemSupporting>Supporting text under the headline</span>
            </gui-list-item>
          </gui-list>
        </app-demo-specimen>

        <app-demo-specimen class="fill" label="leading icon + trailing text">
          <gui-list aria-label="Leading icon list">
            <gui-list-item [lines]="2" leadingKind="icon">
              <gui-icon guiListItemLeading class="sym">folder</gui-icon>
              Documents
              <span guiListItemSupporting>14 items</span>
              <span guiListItemTrailing>2:30 PM</span>
            </gui-list-item>
          </gui-list>
        </app-demo-specimen>

        <app-demo-specimen class="fill" label="trailing icon">
          <gui-list aria-label="Trailing icon list">
            <gui-list-item leadingKind="icon">
              <gui-icon guiListItemLeading class="sym">wifi</gui-icon>
              Wi-Fi
              <gui-icon guiListItemTrailing class="sym">chevron_right</gui-icon>
            </gui-list-item>
          </gui-list>
        </app-demo-specimen>

        <app-demo-specimen class="fill" label="leading avatar + supporting + trailing icon">
          <gui-list aria-label="Avatar list">
            <gui-list-item [lines]="2" leadingKind="avatar">
              <span
                guiListItemLeading
                class="demo-avatar"
                aria-hidden="true"
              >IK</span>
              Igor Katsuba
              <span guiListItemSupporting>igor&#64;katsuba.dev</span>
              <gui-icon guiListItemTrailing class="sym">more_vert</gui-icon>
            </gui-list-item>
          </gui-list>
        </app-demo-specimen>
      </app-demo-block>

      <!-- TRAILING / LEADING CONTROLS: action rows host their own native
           controls in the slots, per the M3 selection-control configurations
           (leading checkbox / radio, trailing checkbox / switch). -->
      <app-demo-block
        heading="Action rows with controls"
        hint="action mode rows hosting native selection controls in the leading / trailing slots"
        [column]="true"
      >
        <app-demo-specimen class="fill" label="trailing switch">
          <gui-list aria-label="Settings">
            <gui-list-item leadingKind="icon">
              <gui-icon guiListItemLeading class="sym">notifications</gui-icon>
              Notifications
              <input
                guiListItemTrailing
                type="checkbox"
                role="switch"
                [checked]="notifications()"
                (change)="notifications.set($any($event.target).checked)"
                aria-label="Notifications"
              />
            </gui-list-item>
          </gui-list>
        </app-demo-specimen>

        <app-demo-specimen class="fill" label="leading checkbox + trailing text">
          <gui-list aria-label="Tasks">
            <gui-list-item>
              <input
                guiListItemLeading
                type="checkbox"
                [checked]="taskDone()"
                (change)="taskDone.set($any($event.target).checked)"
                aria-label="Buy groceries"
              />
              Buy groceries
              <span guiListItemTrailing>Today</span>
            </gui-list-item>
          </gui-list>
        </app-demo-specimen>

        <app-demo-specimen class="fill" label="leading radio buttons">
          <gui-list aria-label="Pick a plan">
            <gui-list-item>
              <input
                guiListItemLeading
                type="radio"
                name="demo-plan"
                value="free"
                [checked]="plan() === 'free'"
                (change)="plan.set('free')"
                aria-label="Free"
              />
              Free
            </gui-list-item>
            <gui-list-item>
              <input
                guiListItemLeading
                type="radio"
                name="demo-plan"
                value="pro"
                [checked]="plan() === 'pro'"
                (change)="plan.set('pro')"
                aria-label="Pro"
              />
              Pro
            </gui-list-item>
          </gui-list>
        </app-demo-specimen>
      </app-demo-block>

      <!-- DIVIDERS (anatomy: Divider). full = 100%, inset = 16/24dp insets. -->
      <app-demo-block
        heading="Dividers"
        hint="divider = 'full' (100%) or 'inset' (16dp start / 24dp end); null = no rule"
        [column]="true"
      >
        <app-demo-specimen class="fill" label="full dividers">
          <gui-list aria-label="Full divider list">
            <gui-list-item divider="full">First</gui-list-item>
            <gui-list-item divider="full">Second</gui-list-item>
            <gui-list-item>Third (no divider)</gui-list-item>
          </gui-list>
        </app-demo-specimen>

        <app-demo-specimen class="fill" label="inset dividers (aligned to leading icon)">
          <gui-list aria-label="Inset divider list">
            <gui-list-item divider="inset" leadingKind="icon">
              <gui-icon guiListItemLeading class="sym">inbox</gui-icon>
              Primary
            </gui-list-item>
            <gui-list-item divider="inset" leadingKind="icon">
              <gui-icon guiListItemLeading class="sym">drafts</gui-icon>
              Drafts
            </gui-list-item>
            <gui-list-item leadingKind="icon">
              <gui-icon guiListItemLeading class="sym">send</gui-icon>
              Sent (no divider)
            </gui-list-item>
          </gui-list>
        </app-demo-specimen>
      </app-demo-block>

      <!-- STATES: enabled, selected (primary-container), and disabled. -->
      <app-demo-block
        heading="States"
        hint="enabled · selected (primary-container + checkmark cue) · disabled (dimmed, stays discoverable)"
        [column]="true"
      >
        <app-demo-specimen class="fill" label="listbox · enabled / selected / disabled">
          <gui-list mode="listbox" aria-label="Choose a label">
            <gui-list-item selectable selectionIndicator>Enabled</gui-list-item>
            <gui-list-item selectable selectionIndicator [selected]="true">
              Selected
            </gui-list-item>
            <gui-list-item selectable selectionIndicator disabled>
              Disabled (unselected)
            </gui-list-item>
            <gui-list-item selectable selectionIndicator disabled [selected]="true">
              Disabled (selected)
            </gui-list-item>
          </gui-list>
        </app-demo-specimen>

        <app-demo-specimen class="fill" label="interactive action row (state layer on hover)">
          <gui-list aria-label="Interactive action list">
            <gui-list-item interactive leadingKind="icon">
              <gui-icon guiListItemLeading class="sym">bolt</gui-icon>
              Tap me — interactive row shows the M3 state layer
            </gui-list-item>
            <gui-list-item interactive disabled leadingKind="icon">
              <gui-icon guiListItemLeading class="sym">block</gui-icon>
              Disabled interactive row
            </gui-list-item>
          </gui-list>
        </app-demo-specimen>

        <app-demo-specimen class="fill" label="live single-select (click / arrows / Enter)">
          <gui-list mode="listbox" aria-label="Live selection">
            <gui-list-item selectable selectionIndicator>One</gui-list-item>
            <gui-list-item selectable selectionIndicator>Two</gui-list-item>
            <gui-list-item selectable selectionIndicator>Three</gui-list-item>
          </gui-list>
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
  styles: `
    .demo-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--md-sys-color-primary-container, #eaddff);
      color: var(--md-sys-color-on-primary-container, #21005d);
      font-family: var(--md-sys-typescale-label-large-font, 'Roboto', sans-serif);
      font-size: var(--md-sys-typescale-label-large-size, 0.875rem);
      font-weight: var(--md-sys-typescale-label-large-weight, 500);
    }
  `,
})
export class ListDemo {
  /** Action-row native controls — operable local state (no clock / RNG). */
  protected readonly notifications = signal(true);
  protected readonly taskDone = signal(false);
  protected readonly plan = signal<'free' | 'pro'>('pro');
}
