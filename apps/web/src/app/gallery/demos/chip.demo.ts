import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ChipComponent, ChipSetComponent } from '@ngguide/ui/chip';
import { IconComponent } from '@ngguide/ui/icon';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Exhaustive vitrine demo for the M3 chip (`@ngguide/ui/chip`).
 *
 * The implemented anatomy is a `gui-chip-set` (`role="grid"`) owning one or more
 * `gui-chip` cells. Coverage:
 * - Variants: the four M3 families — assist, filter, input, suggestion — driven
 *   onto the host via `data-type`.
 * - Anatomy: leading icon (`[guiChipLeading]`), input-chip avatar
 *   (`[guiChipAvatar]`), and the removable trailing icon (`[guiChipRemove]`).
 * - Selection: filter chips toggle on the owning set in `single` and `multiple`
 *   modes; the selected filter chip swaps its leading slot for the M3 check.
 * - Elevation: the optional `elevated` level-1 container, shown per variant.
 * - States: enabled, selected, disabled (per chip and whole-set), removable.
 *
 * Selection is live through the set's two-way `value`; removable chips drop the
 * removed value from a local signal so the remove action actually deletes.
 */
@Component({
  selector: 'app-demo-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...GALLERY_DEMO_UI, ChipSetComponent, ChipComponent, IconComponent],
  template: `
    <app-demo-component
      name="Chips"
      entry="@ngguide/ui/chip"
      docHref="https://m3.material.io/components/chips"
    >
      <!-- VARIANTS: the four M3 chip families. Assist/suggestion are actions;
           filter is selectable; input is removable + supports an avatar. -->
      <app-demo-block
        heading="Variants"
        hint="Four M3 families — assist, filter, input, suggestion"
      >
        <app-demo-specimen label="assist">
          <gui-chip-set>
            <gui-chip type="assist" value="lights" label="Turn on lights">
              <gui-icon guiChipLeading class="sym">lightbulb</gui-icon>
              Turn on lights
            </gui-chip>
          </gui-chip-set>
        </app-demo-specimen>

        <app-demo-specimen label="filter">
          <gui-chip-set select="single" [(value)]="variantFilter">
            <gui-chip type="filter" value="recent" label="Recent">Recent</gui-chip>
          </gui-chip-set>
        </app-demo-specimen>

        <app-demo-specimen label="input">
          <gui-chip-set>
            <gui-chip
              type="input"
              value="brooklyn"
              label="Brooklyn"
              removable
              (remove)="noop()"
            >
              Brooklyn
              <gui-icon guiChipRemove class="sym">close</gui-icon>
            </gui-chip>
          </gui-chip-set>
        </app-demo-specimen>

        <app-demo-specimen label="suggestion">
          <gui-chip-set>
            <gui-chip type="suggestion" value="weather" label="What's the weather?">
              What's the weather?
            </gui-chip>
          </gui-chip-set>
        </app-demo-specimen>
      </app-demo-block>

      <!-- LEADING ICON: assist (Primary), filter, and suggestion chips can carry
           a leading icon via the [guiChipLeading] slot. -->
      <app-demo-block
        heading="Leading icon"
        hint="Optional 18dp leading icon in the [guiChipLeading] slot"
      >
        <app-demo-specimen label="assist + icon">
          <gui-chip-set>
            <gui-chip type="assist" value="event" label="Add to calendar">
              <gui-icon guiChipLeading class="sym">event</gui-icon>
              Add to calendar
            </gui-chip>
          </gui-chip-set>
        </app-demo-specimen>

        <app-demo-specimen label="filter + icon">
          <gui-chip-set select="single" [(value)]="leadingFilter">
            <gui-chip type="filter" value="starred" label="Starred">
              <gui-icon guiChipLeading class="sym">star</gui-icon>
              Starred
            </gui-chip>
          </gui-chip-set>
        </app-demo-specimen>

        <app-demo-specimen label="suggestion + icon">
          <gui-chip-set>
            <gui-chip type="suggestion" value="directions" label="Directions">
              <gui-icon guiChipLeading class="sym">directions</gui-icon>
              Directions
            </gui-chip>
          </gui-chip-set>
        </app-demo-specimen>
      </app-demo-block>

      <!-- AVATAR: input chips may lead with a 24dp circular avatar via the
           [guiChipAvatar] slot. We use a tinted icon stand-in (deterministic,
           no remote image). -->
      <app-demo-block
        heading="Avatar (input)"
        hint="Input chip 24dp leading avatar via [guiChipAvatar]"
      >
        <app-demo-specimen label="avatar + remove">
          <gui-chip-set>
            <gui-chip
              type="input"
              value="ada"
              label="Ada Lovelace"
              removable
              (remove)="noop()"
            >
              <span guiChipAvatar class="avatar">AL</span>
              Ada Lovelace
              <gui-icon guiChipRemove class="sym">close</gui-icon>
            </gui-chip>
          </gui-chip-set>
        </app-demo-specimen>
      </app-demo-block>

      <!-- SELECTION: filter chips own selection on the set. Single-select keeps
           at most one; multiple-select toggles independently. Selected filter
           chips render the M3 leading check automatically. -->
      <app-demo-block
        heading="Selection (filter)"
        hint="Single keeps one; multiple toggles independently; selected shows the M3 check"
      >
        <app-demo-specimen label="single-select" class="fill">
          <gui-chip-set select="single" [(value)]="single">
            <gui-chip type="filter" value="all" label="All">All</gui-chip>
            <gui-chip type="filter" value="unread" label="Unread">Unread</gui-chip>
            <gui-chip type="filter" value="flagged" label="Flagged">Flagged</gui-chip>
          </gui-chip-set>
        </app-demo-specimen>

        <app-demo-specimen label="multi-select" class="fill">
          <gui-chip-set select="multiple" [(value)]="multi">
            <gui-chip type="filter" value="cafe" label="Cafe">Cafe</gui-chip>
            <gui-chip type="filter" value="bar" label="Bar">Bar</gui-chip>
            <gui-chip type="filter" value="park" label="Park">Park</gui-chip>
            <gui-chip type="filter" value="museum" label="Museum">Museum</gui-chip>
          </gui-chip-set>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ELEVATION: every variant can opt into the M3 level-1 elevated
           container (no stroke, surface-container-low fill). -->
      <app-demo-block
        heading="Elevation"
        hint="Optional level-1 elevated container (no stroke) per variant"
      >
        <app-demo-specimen label="assist · flat">
          <gui-chip-set>
            <gui-chip type="assist" value="flat" label="Flat">Flat</gui-chip>
          </gui-chip-set>
        </app-demo-specimen>

        <app-demo-specimen label="assist · elevated">
          <gui-chip-set>
            <gui-chip type="assist" value="raised" label="Elevated" elevated>
              Elevated
            </gui-chip>
          </gui-chip-set>
        </app-demo-specimen>

        <app-demo-specimen label="filter · elevated">
          <gui-chip-set select="single" [(value)]="elevatedFilter">
            <gui-chip type="filter" value="on" label="Elevated" elevated>
              Elevated
            </gui-chip>
          </gui-chip-set>
        </app-demo-specimen>

        <app-demo-specimen label="suggestion · elevated">
          <gui-chip-set>
            <gui-chip type="suggestion" value="idea" label="Idea" elevated>
              Idea
            </gui-chip>
          </gui-chip-set>
        </app-demo-specimen>
      </app-demo-block>

      <!-- REMOVABLE: input chips expose a trailing remove button + emit remove.
           Removing drops the value from the local list so deletion is real. -->
      <app-demo-block
        heading="Removable (input)"
        hint="Trailing remove button emits remove — try removing a chip"
      >
        <app-demo-specimen label="live removable set" class="fill">
          <gui-chip-set>
            @for (tag of tags(); track tag) {
              <gui-chip
                type="input"
                [value]="tag"
                [label]="tag"
                removable
                (remove)="removeTag(tag)"
              >
                {{ tag }}
                <gui-icon guiChipRemove class="sym">close</gui-icon>
              </gui-chip>
            }
          </gui-chip-set>
        </app-demo-specimen>
      </app-demo-block>

      <!-- STATES: enabled, selected, per-chip disabled, disabled+selected, and a
           fully disabled set (set-level disabled input). -->
      <app-demo-block
        heading="States"
        hint="Enabled, selected, disabled chip, disabled + selected, fully disabled set"
      >
        <app-demo-specimen label="enabled">
          <gui-chip-set>
            <gui-chip type="assist" value="enabled" label="Enabled">Enabled</gui-chip>
          </gui-chip-set>
        </app-demo-specimen>

        <app-demo-specimen label="selected (filter)">
          <gui-chip-set select="single" [(value)]="stateSelected">
            <gui-chip type="filter" value="on" label="Selected">Selected</gui-chip>
          </gui-chip-set>
        </app-demo-specimen>

        <app-demo-specimen label="disabled chip">
          <gui-chip-set>
            <gui-chip type="assist" value="off" label="Disabled" disabled>
              Disabled
            </gui-chip>
          </gui-chip-set>
        </app-demo-specimen>

        <app-demo-specimen label="disabled + selected">
          <gui-chip-set select="single" [(value)]="stateDisabledSelected">
            <gui-chip type="filter" value="on" label="Disabled" disabled>
              Disabled
            </gui-chip>
          </gui-chip-set>
        </app-demo-specimen>

        <app-demo-specimen label="fully disabled set" class="fill">
          <gui-chip-set select="multiple" disabled [(value)]="stateSetDisabled">
            <gui-chip type="filter" value="a" label="One">One</gui-chip>
            <gui-chip type="filter" value="b" label="Two">Two</gui-chip>
            <gui-chip type="filter" value="c" label="Three">Three</gui-chip>
          </gui-chip-set>
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
  styles: `
    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.6875rem;
      font-weight: 500;
      color: var(--md-sys-color-on-primary, #fff);
      background: var(--md-sys-color-primary, #6750a4);
    }
  `,
})
export class ChipDemo {
  // Variants / single-specimen filter state.
  protected readonly variantFilter = signal<string | string[] | null>('recent');
  protected readonly leadingFilter = signal<string | string[] | null>('starred');
  protected readonly elevatedFilter = signal<string | string[] | null>('on');

  // Selection.
  protected readonly single = signal<string | string[] | null>('unread');
  protected readonly multi = signal<string | string[] | null>(['cafe', 'park']);

  // States.
  protected readonly stateSelected = signal<string | string[] | null>('on');
  protected readonly stateDisabledSelected = signal<string | string[] | null>(
    'on',
  );
  protected readonly stateSetDisabled = signal<string | string[] | null>(['a']);

  // Live removable input chips.
  protected readonly tags = signal<readonly string[]>([
    'design',
    'angular',
    'material',
    'a11y',
  ]);

  protected removeTag(tag: string): void {
    this.tags.update((tags) => tags.filter((t) => t !== tag));
  }

  protected noop(): void {
    // Single-chip removable specimens demonstrate the trailing icon without
    // mutating state, so the chip stays visible for inspection.
  }
}
