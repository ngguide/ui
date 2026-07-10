import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent } from '@ngguide/ui/button';
import {
  GuiCard,
  GuiCardClickable,
  GuiCardPrimaryAction,
} from '@ngguide/ui/card';
import { IconComponent } from '@ngguide/ui/icon';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Vitrine demo for the M3 Card (`@ngguide/ui/card`).
 *
 * Exhaustively exercises every dimension the implemented card supports:
 * the three M3 variants (`elevated`, `filled`, `outlined`) on the
 * `GuiCard` container; the single M3 shape (medium / 12dp corner — the spec
 * defines no size or shape scale for cards); the disabled state; and the two
 * actionable patterns — whole-surface `[guiCardClickable]` ("Variant A") and
 * the `[guiCardPrimaryAction]` sub-region ("Variant B") paired with independent
 * action buttons. Hover/focus/pressed state layers, ripple and focus ring are
 * live on the actionable cards.
 */
@Component({
  selector: 'app-demo-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...GALLERY_DEMO_UI,
    GuiCard,
    GuiCardClickable,
    GuiCardPrimaryAction,
    ButtonComponent,
    IconComponent,
  ],
  template: `
    <app-demo-component
      name="Card"
      entry="@ngguide/ui/card"
      docHref="https://m3.material.io/components/cards"
    >
      <!-- ===== Variants (color configurations) ===== -->
      <app-demo-block
        heading="Variants"
        hint="Three M3 color configurations: elevated (surface-container-low + level 1), filled (surface-container-highest), outlined (surface + outline-variant border)"
        [code]="codeVariants"
      >
        <app-demo-specimen label="elevated (default)">
          <gui-card variant="elevated" class="card">
            <h4 class="card-title">Elevated</h4>
            <p class="card-text">Surface container low with elevation level 1.</p>
          </gui-card>
        </app-demo-specimen>
        <app-demo-specimen label="filled">
          <gui-card variant="filled" class="card">
            <h4 class="card-title">Filled</h4>
            <p class="card-text">Surface container highest, no resting elevation.</p>
          </gui-card>
        </app-demo-specimen>
        <app-demo-specimen label="outlined">
          <gui-card variant="outlined" class="card">
            <h4 class="card-title">Outlined</h4>
            <p class="card-text">Surface with a 1dp outline-variant border.</p>
          </gui-card>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ===== Shape ===== -->
      <app-demo-block
        heading="Shape"
        hint="M3 cards use a single corner: medium (12dp). No size or shape scale is defined in the spec."
        [code]="codeShape"
      >
        <app-demo-specimen label="medium · 12dp">
          <gui-card variant="elevated" class="card">
            <h4 class="card-title">Medium corner</h4>
            <p class="card-text">All variants share the medium (12dp) radius.</p>
          </gui-card>
        </app-demo-specimen>
        <app-demo-specimen label="medium · 12dp">
          <gui-card variant="outlined" class="card">
            <h4 class="card-title">Medium corner</h4>
            <p class="card-text">Content is clipped to the rounded corners.</p>
          </gui-card>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ===== Anatomy ===== -->
      <app-demo-block
        heading="Anatomy"
        hint="Cards hold arbitrary content — headline, supporting text, icon, and actions"
        [code]="codeAnatomy"
      >
        <app-demo-specimen label="header + text + actions">
          <gui-card variant="elevated" class="card">
            <div class="card-header">
              <gui-icon class="sym card-avatar">photo_camera</gui-icon>
              <div>
                <h4 class="card-title">Headline</h4>
                <p class="card-subtitle">Subhead</p>
              </div>
            </div>
            <p class="card-text">
              Supporting text grouped with related actions inside one surface.
            </p>
            <div class="card-actions">
              <button gui-button variant="text" size="sm">Cancel</button>
              <button gui-button variant="filled" size="sm">Confirm</button>
            </div>
          </gui-card>
        </app-demo-specimen>
        <app-demo-specimen label="icon + supporting text">
          <gui-card variant="filled" class="card">
            <div class="card-header">
              <gui-icon class="sym card-avatar">favorite</gui-icon>
              <h4 class="card-title">Saved</h4>
            </div>
            <p class="card-text">A non-actionable container with leading icon.</p>
          </gui-card>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ===== Actionable: whole-surface (Variant A) ===== -->
      <app-demo-block
        heading="Clickable (whole surface)"
        hint="[guiCardClickable] — the entire surface is one control with state layer, ripple, focus ring, Enter/Space activation, and hover elevation. Interact with them."
        [code]="codeClickable"
      >
        <app-demo-specimen label="elevated · {{ clickCount() }} activations">
          <gui-card
            variant="elevated"
            guiCardClickable
            (cardActivate)="onActivate()"
            class="card"
          >
            <h4 class="card-title">Tap me</h4>
            <p class="card-text">role=button, keyboard-activatable, ripples on press.</p>
          </gui-card>
        </app-demo-specimen>
        <app-demo-specimen label="filled · clickable">
          <gui-card variant="filled" guiCardClickable class="card">
            <h4 class="card-title">Filled action</h4>
            <p class="card-text">Hover raises elevation to level 1.</p>
          </gui-card>
        </app-demo-specimen>
        <app-demo-specimen label="outlined · clickable">
          <gui-card variant="outlined" guiCardClickable class="card">
            <h4 class="card-title">Outlined action</h4>
            <p class="card-text">Outline keeps its border on hover and focus.</p>
          </gui-card>
        </app-demo-specimen>
        <app-demo-specimen label="elevated · keyboard-activatable">
          <gui-card variant="elevated" guiCardClickable class="card">
            <h4 class="card-title">Tab + Enter</h4>
            <p class="card-text">
              Focusable (tabindex=0), activates on Enter or Space.
            </p>
          </gui-card>
        </app-demo-specimen>
        <app-demo-specimen label="link (&lt;a href&gt;) · {{ linkCount() }} activations">
          <a
            guiCardClickable
            id="card-link-demo"
            href="#card-link-demo"
            (cardActivate)="onLink()"
            class="card card-link"
          >
            <h4 class="card-title">Open article</h4>
            <p class="card-text">
              A real link card: keeps its link role, and Enter activates it
              exactly once while the browser performs the native navigation.
            </p>
          </a>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ===== Actionable: primary-action region (Variant B) ===== -->
      <app-demo-block
        heading="Primary action + buttons"
        hint="[guiCardPrimaryAction] — the headline/media region is one tap target, with action buttons OUTSIDE it so they stay independently focusable (no stacked interactions)."
        [code]="codePrimaryAction"
      >
        <app-demo-specimen label="region: {{ primaryCount() }} taps">
          <gui-card variant="elevated" class="card">
            <div
              guiCardPrimaryAction
              (primaryAction)="onPrimary()"
              class="card-primary"
            >
              <h4 class="card-title">Article title</h4>
              <p class="card-text">
                This region is the primary tap target (role=button).
              </p>
            </div>
            <div class="card-actions">
              <button gui-button variant="text" size="sm">
                <gui-icon guiIcon class="sym">share</gui-icon>
                Share
              </button>
              <button gui-button variant="text" size="sm">
                <gui-icon guiIcon class="sym">bookmark</gui-icon>
                Save
              </button>
            </div>
          </gui-card>
        </app-demo-specimen>
        <app-demo-specimen label="outlined · primary + actions">
          <gui-card variant="outlined" class="card">
            <div guiCardPrimaryAction class="card-primary">
              <h4 class="card-title">Playlist</h4>
              <p class="card-text">Tap the body to open; buttons act separately.</p>
            </div>
            <div class="card-actions">
              <button gui-button variant="text" size="sm">Play</button>
              <button gui-button variant="filled" size="sm">Add</button>
            </div>
          </gui-card>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ===== States ===== -->
      <app-demo-block
        heading="States"
        hint="Enabled vs disabled (0.38 opacity + pointer-events suppressed) across every variant. Disabled clickable cards drop their tab stop and activation."
        [code]="codeStates"
      >
        <app-demo-specimen label="elevated · enabled">
          <gui-card variant="elevated" guiCardClickable class="card">
            <h4 class="card-title">Enabled</h4>
            <p class="card-text">Fully interactive.</p>
          </gui-card>
        </app-demo-specimen>
        <app-demo-specimen label="elevated · disabled">
          <gui-card
            variant="elevated"
            guiCardClickable
            disabled
            class="card"
          >
            <h4 class="card-title">Disabled</h4>
            <p class="card-text">Dimmed, no activation.</p>
          </gui-card>
        </app-demo-specimen>
        <app-demo-specimen label="filled · enabled">
          <gui-card variant="filled" guiCardClickable class="card">
            <h4 class="card-title">Enabled</h4>
            <p class="card-text">Fully interactive.</p>
          </gui-card>
        </app-demo-specimen>
        <app-demo-specimen label="filled · disabled">
          <gui-card variant="filled" guiCardClickable disabled class="card">
            <h4 class="card-title">Disabled</h4>
            <p class="card-text">Dimmed, no activation.</p>
          </gui-card>
        </app-demo-specimen>
        <app-demo-specimen label="outlined · enabled">
          <gui-card variant="outlined" guiCardClickable class="card">
            <h4 class="card-title">Enabled</h4>
            <p class="card-text">Fully interactive.</p>
          </gui-card>
        </app-demo-specimen>
        <app-demo-specimen label="outlined · disabled">
          <gui-card
            variant="outlined"
            guiCardClickable
            disabled
            class="card"
          >
            <h4 class="card-title">Disabled</h4>
            <p class="card-text">Dimmed, no activation.</p>
          </gui-card>
        </app-demo-specimen>
        <app-demo-specimen label="primary action · disabled">
          <gui-card variant="elevated" class="card">
            <div guiCardPrimaryAction disabled class="card-primary">
              <h4 class="card-title">Disabled region</h4>
              <p class="card-text">Region drops its tab stop and activation.</p>
            </div>
            <div class="card-actions">
              <button gui-button variant="text" size="sm" disabled>Open</button>
            </div>
          </gui-card>
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
  styles: `
    .card {
      gap: 0.5rem;
      width: 16rem;
      max-width: 100%;
      padding-block: 1rem;
    }
    .card-title {
      margin: 0;
      font-family: var(--md-sys-typescale-title-medium-font, 'Roboto', sans-serif);
      font-size: var(--md-sys-typescale-title-medium-size, 1rem);
      line-height: var(--md-sys-typescale-title-medium-line-height, 1.5rem);
      font-weight: var(--md-sys-typescale-title-medium-weight, 500);
      color: var(--md-sys-color-on-surface, #1c1b1f);
    }
    .card-subtitle {
      margin: 0;
      font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
      line-height: var(--md-sys-typescale-body-small-line-height, 1rem);
      color: var(--md-sys-color-on-surface-variant, #49454e);
    }
    .card-text {
      margin: 0;
      font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
      line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
      color: var(--md-sys-color-on-surface-variant, #49454e);
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .card-avatar {
      color: var(--md-sys-color-primary, #6750a4);
    }
    .card-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      margin-top: 0.25rem;
    }
    .card-link {
      /* A whole-surface actionable card built on an <a> element. GuiCard's
         surface styling is :host-scoped to the gui-card element, so an anchor
         card recreates the outlined-variant look locally and resets the
         anchor's default link styling. The state layer / ripple / focus ring
         still come from [guiCardClickable]. */
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      padding-inline: 16px;
      border-radius: var(--md-sys-shape-corner-medium);
      background-color: var(--md-sys-color-surface);
      border: 1px solid var(--md-sys-color-outline-variant);
      color: var(--md-sys-color-on-surface);
      text-decoration: none;
      cursor: pointer;
    }
    .card-primary {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      /* The region bleeds to the card's top AND inline edges so its state layer
         covers the whole upper area — rounded corners included — instead of a
         band floating inset from the edges. Cancels the card's 1rem top padding
         and 16px inline padding, then restores the same spacing inside so the
         text keeps its position. Only the action row below stays outside the
         region (M3 "Variant B"). */
      margin: -1rem -16px 0;
      padding: 1rem 16px 0.5rem;
    }
  `,
})
export class CardDemo {
  /** Whole-surface activations (Variant A) — two-way from `cardActivate`. */
  protected readonly clickCount = signal(0);
  /** Primary-action region activations (Variant B) — from `primaryAction`. */
  protected readonly primaryCount = signal(0);
  /** Link-role whole-surface activations — from an `<a href>` clickable card. */
  protected readonly linkCount = signal(0);

  protected onActivate(): void {
    this.clickCount.update((n) => n + 1);
  }

  protected onPrimary(): void {
    this.primaryCount.update((n) => n + 1);
  }

  protected onLink(): void {
    this.linkCount.update((n) => n + 1);
  }

  protected readonly codeVariants = `
<gui-card variant="elevated">
  <h4>Elevated</h4>
  <p>Surface container low with elevation level 1.</p>
</gui-card>
<gui-card variant="filled">…</gui-card>
<gui-card variant="outlined">…</gui-card>`;

  protected readonly codeShape = `
<gui-card variant="elevated">
  <h4>Medium corner</h4>
  <p>All variants share the medium (12dp) radius.</p>
</gui-card>`;

  protected readonly codeAnatomy = `
<gui-card variant="elevated">
  <div class="card-header">
    <gui-icon class="sym">photo_camera</gui-icon>
    <div>
      <h4>Headline</h4>
      <p>Subhead</p>
    </div>
  </div>
  <p>Supporting text grouped with related actions inside one surface.</p>
  <div class="card-actions">
    <button gui-button variant="text" size="sm">Cancel</button>
    <button gui-button variant="filled" size="sm">Confirm</button>
  </div>
</gui-card>`;

  protected readonly codeClickable = `
<gui-card variant="elevated" guiCardClickable (cardActivate)="onActivate()">
  <h4>Tap me</h4>
  <p>role=button, keyboard-activatable, ripples on press.</p>
</gui-card>

<!-- Link-role card: put [guiCardClickable] on an <a href>. It keeps the
     link role (no role=button) and Enter triggers native navigation. -->
<a guiCardClickable href="/article" (cardActivate)="onLink()">
  <h4>Open article</h4>
  <p>Activates once on Enter; the browser navigates natively.</p>
</a>`;

  protected readonly codePrimaryAction = `
<gui-card variant="elevated">
  <div guiCardPrimaryAction (primaryAction)="onPrimary()">
    <h4>Article title</h4>
    <p>This region is the primary tap target (role=button).</p>
  </div>
  <div class="card-actions">
    <button gui-button variant="text" size="sm">Share</button>
    <button gui-button variant="text" size="sm">Save</button>
  </div>
</gui-card>`;

  protected readonly codeStates = `
<gui-card variant="elevated" guiCardClickable>Enabled</gui-card>
<gui-card variant="elevated" guiCardClickable disabled>Disabled</gui-card>`;
}
