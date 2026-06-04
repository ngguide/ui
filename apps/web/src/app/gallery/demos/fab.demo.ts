import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExtendedFabComponent, FabComponent } from '@ngguide/ui/fab';
import { IconComponent } from '@ngguide/ui/icon';

import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Vitrine demo for the FAB family (`@ngguide/ui/fab`): the circular
 * {@link FabComponent} (`button[gui-fab]` / `a[gui-fab]`) and the
 * {@link ExtendedFabComponent} (`button[gui-extended-fab]`). Every supported
 * size, color configuration, and state from the strict-M3 reference is shown.
 */
@Component({
  selector: 'app-demo-fab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...GALLERY_DEMO_UI, FabComponent, ExtendedFabComponent, IconComponent],
  template: `
    <app-demo-component
      name="FAB"
      entry="@ngguide/ui/fab"
      docHref="https://m3.material.io/components/floating-action-button"
    >
      <!-- FAB sizes — M3 Expressive variants are size-based (sm/md/lg/xl). -->
      <app-demo-block heading="Sizes" hint="M3 FAB variants are based on size (sm 40 · md 56 · lg 96 · xl)">
        <app-demo-specimen label="sm (deprecated)">
          <button gui-fab size="sm" aria-label="Add">
            <gui-icon class="sym">add</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="md (FAB)">
          <button gui-fab size="md" aria-label="Add">
            <gui-icon class="sym">add</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="lg (large FAB)">
          <button gui-fab size="lg" aria-label="Add">
            <gui-icon class="sym">add</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="xl">
          <button gui-fab size="xl" aria-label="Add">
            <gui-icon class="sym">add</gui-icon>
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Color styles — six legible container/tone mappings. -->
      <app-demo-block heading="Color styles" hint="Three tonal containers + three tone colors (primary/secondary/tertiary)">
        <app-demo-specimen label="primary-container">
          <button gui-fab color="primary-container" aria-label="Edit">
            <gui-icon class="sym">edit</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="secondary-container">
          <button gui-fab color="secondary-container" aria-label="Edit">
            <gui-icon class="sym">edit</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="tertiary-container">
          <button gui-fab color="tertiary-container" aria-label="Edit">
            <gui-icon class="sym">edit</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="primary">
          <button gui-fab color="primary" aria-label="Edit">
            <gui-icon class="sym">edit</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="secondary">
          <button gui-fab color="secondary" aria-label="Edit">
            <gui-icon class="sym">edit</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="tertiary">
          <button gui-fab color="tertiary" aria-label="Edit">
            <gui-icon class="sym">edit</gui-icon>
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- States — enabled vs disabled, plus the anchor-rendered FAB. -->
      <app-demo-block heading="States" hint="Hover / focus / pressed are live state-layer interactions">
        <app-demo-specimen label="enabled">
          <button gui-fab aria-label="Favorite">
            <gui-icon class="sym">favorite</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="disabled (button)">
          <button gui-fab disabled aria-label="Favorite">
            <gui-icon class="sym">favorite</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="link (a[gui-fab])">
          <a gui-fab href="#c-fab" aria-label="Favorite">
            <gui-icon class="sym">favorite</gui-icon>
          </a>
        </app-demo-specimen>
        <app-demo-specimen label="link disabled">
          <a gui-fab disabled aria-label="Favorite">
            <gui-icon class="sym">favorite</gui-icon>
          </a>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Extended FAB — sizes (sm/md/lg/xl). -->
      <app-demo-block heading="Extended FAB · sizes" hint="Label + icon container; small extended FAB is the M3 Expressive default">
        <app-demo-specimen label="sm">
          <button gui-extended-fab size="sm">
            <gui-icon guiIcon class="sym">add</gui-icon>
            Compose
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="md">
          <button gui-extended-fab size="md">
            <gui-icon guiIcon class="sym">add</gui-icon>
            Compose
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="lg">
          <button gui-extended-fab size="lg">
            <gui-icon guiIcon class="sym">add</gui-icon>
            Compose
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="xl">
          <button gui-extended-fab size="xl">
            <gui-icon guiIcon class="sym">add</gui-icon>
            Compose
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Extended FAB — color styles. -->
      <app-demo-block heading="Extended FAB · color styles">
        <app-demo-specimen label="primary-container">
          <button gui-extended-fab color="primary-container">
            <gui-icon guiIcon class="sym">edit</gui-icon>
            Edit
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="secondary-container">
          <button gui-extended-fab color="secondary-container">
            <gui-icon guiIcon class="sym">edit</gui-icon>
            Edit
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="tertiary-container">
          <button gui-extended-fab color="tertiary-container">
            <gui-icon guiIcon class="sym">edit</gui-icon>
            Edit
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="primary">
          <button gui-extended-fab color="primary">
            <gui-icon guiIcon class="sym">edit</gui-icon>
            Edit
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="secondary">
          <button gui-extended-fab color="secondary">
            <gui-icon guiIcon class="sym">edit</gui-icon>
            Edit
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="tertiary">
          <button gui-extended-fab color="tertiary">
            <gui-icon guiIcon class="sym">edit</gui-icon>
            Edit
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Extended FAB — expanded vs collapsed, with/without icon, disabled. -->
      <app-demo-block heading="Extended FAB · states" hint="expanded toggles the label; collapses to a square FAB footprint">
        <app-demo-specimen label="expanded">
          <button gui-extended-fab [expanded]="true">
            <gui-icon guiIcon class="sym">navigation</gui-icon>
            Navigate
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="collapsed">
          <button gui-extended-fab [expanded]="false" aria-label="Navigate">
            <gui-icon guiIcon class="sym">navigation</gui-icon>
            Navigate
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="without icon">
          <button gui-extended-fab>Navigate</button>
        </app-demo-specimen>
        <app-demo-specimen label="disabled">
          <button gui-extended-fab disabled>
            <gui-icon guiIcon class="sym">navigation</gui-icon>
            Navigate
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="link (a[gui-extended-fab])">
          <a gui-extended-fab href="#c-fab">
            <gui-icon guiIcon class="sym">navigation</gui-icon>
            Navigate
          </a>
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
})
export class FabDemo {}
