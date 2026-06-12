import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GuiDivider } from '@ngguide/ui/divider';
import { IconComponent } from '@ngguide/ui/icon';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Isolated vitrine demo for the M3 Divider (`@ngguide/ui/divider`).
 *
 * Divider (`<gui-divider>`) is a decorative 1dp `outline-variant` rule exposed
 * to assistive tech as `role="separator"`. Its full M3 surface is two
 * orthogonal inputs:
 *
 * - `orientation`: `'horizontal'` (default, full-width 1dp tall) or
 *   `'vertical'` (1dp wide, stretches to host height).
 * - `inset`: `'none'` (full-bleed), `'inset'` (16dp leading margin — aligns the
 *   rule with text after a leading element), or `'middle-inset'` (16dp on both
 *   edges).
 *
 * Per M3, dividers have no color/size/shape variants and no interactive states
 * (non-interactive, decorative), so the demo enumerates the orientation × inset
 * matrix and shows the canonical list usage the insets are designed for.
 */
@Component({
  selector: 'app-demo-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...GALLERY_DEMO_UI, GuiDivider, IconComponent],
  template: `
    <app-demo-component
      name="Divider"
      entry="@ngguide/ui/divider"
      docHref="https://m3.material.io/components/divider"
    >
      <!-- M3 configurations: horizontal (full-width) vs vertical. -->
      <app-demo-block
        heading="Orientation"
        hint="M3 has two configurations: a full-width horizontal rule and a vertical rule."
        [column]="true"
        [code]="codeOrientation"
      >
        <app-demo-specimen label="horizontal (default)" class="fill">
          <div class="stack">
            <span class="row-text">Above the rule</span>
            <gui-divider orientation="horizontal" />
            <span class="row-text">Below the rule</span>
          </div>
        </app-demo-specimen>
        <app-demo-specimen label="vertical">
          <div class="hrow">
            <span class="row-text">Left</span>
            <gui-divider orientation="vertical" />
            <span class="row-text">Center</span>
            <gui-divider orientation="vertical" />
            <span class="row-text">Right</span>
          </div>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Inset treatments on the horizontal rule (the M3 measurements). -->
      <app-demo-block
        heading="Inset (horizontal)"
        hint="none = full-bleed, inset = 16dp leading margin, middle-inset = 16dp both edges."
        [column]="true"
        [code]="codeInsetHorizontal"
      >
        <app-demo-specimen label="none (full-width)" class="fill">
          <div class="stack">
            <span class="row-text">Full-bleed rule</span>
            <gui-divider inset="none" />
            <span class="row-text">spans the whole width</span>
          </div>
        </app-demo-specimen>
        <app-demo-specimen label="inset (16dp leading)" class="fill">
          <div class="stack">
            <span class="row-text">Indented on the leading edge</span>
            <gui-divider inset="inset" />
            <span class="row-text">aligns with text after a leading element</span>
          </div>
        </app-demo-specimen>
        <app-demo-specimen label="middle-inset (16dp both)" class="fill">
          <div class="stack">
            <span class="row-text">Indented on both edges</span>
            <gui-divider inset="middle-inset" />
            <span class="row-text">a centered, contained rule</span>
          </div>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Inset treatments on the vertical rule. -->
      <app-demo-block
        heading="Inset (vertical)"
        hint="The same inset values apply to the block (top / both) edges of a vertical rule."
        [code]="codeInsetVertical"
      >
        <app-demo-specimen label="none">
          <div class="hrow tall">
            <span class="row-text">A</span>
            <gui-divider orientation="vertical" inset="none" />
            <span class="row-text">B</span>
          </div>
        </app-demo-specimen>
        <app-demo-specimen label="inset (16dp top)">
          <div class="hrow tall">
            <span class="row-text">A</span>
            <gui-divider orientation="vertical" inset="inset" />
            <span class="row-text">B</span>
          </div>
        </app-demo-specimen>
        <app-demo-specimen label="middle-inset (16dp both)">
          <div class="hrow tall">
            <span class="row-text">A</span>
            <gui-divider orientation="vertical" inset="middle-inset" />
            <span class="row-text">B</span>
          </div>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Canonical M3 usage: grouping items in a list with an inset rule. -->
      <app-demo-block
        heading="In a list"
        hint="Dividers group list items; the inset variant aligns the rule with the leading icon's text."
        [column]="true"
        [code]="codeInList"
      >
        <app-demo-specimen label="inset rule between list rows" class="fill">
          <ul class="list">
            <li class="list-item">
              <gui-icon class="sym">inbox</gui-icon>
              <span class="row-text">Inbox</span>
            </li>
            <gui-divider inset="inset" />
            <li class="list-item">
              <gui-icon class="sym">send</gui-icon>
              <span class="row-text">Sent</span>
            </li>
            <gui-divider inset="inset" />
            <li class="list-item">
              <gui-icon class="sym">drafts</gui-icon>
              <span class="row-text">Drafts</span>
            </li>
          </ul>
        </app-demo-specimen>
        <app-demo-specimen label="full-width section break" class="fill">
          <ul class="list">
            <li class="list-item">
              <gui-icon class="sym">star</gui-icon>
              <span class="row-text">Starred</span>
            </li>
            <li class="list-item">
              <gui-icon class="sym">label</gui-icon>
              <span class="row-text">Important</span>
            </li>
            <gui-divider inset="none" />
            <li class="list-item">
              <gui-icon class="sym">delete</gui-icon>
              <span class="row-text">Trash</span>
            </li>
          </ul>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Accessibility: decorative separator exposed to assistive tech. -->
      <app-demo-block
        heading="Accessibility"
        hint="Non-interactive and decorative — exposed as role=separator with aria-orientation."
        [code]="codeAccessibility"
      >
        <app-demo-specimen label='role="separator"' class="fill">
          <div class="stack">
            <span class="row-text">Reported to assistive tech as a separator</span>
            <gui-divider />
            <span class="row-text">with no contrast minimum (decorative)</span>
          </div>
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
  styles: `
    .stack {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
    }
    .hrow {
      display: flex;
      align-items: stretch;
      gap: 0.75rem;
      height: 1.5rem;
    }
    .hrow.tall {
      height: 3rem;
    }
    .row-text {
      color: var(--md-sys-color-on-surface, #1c1b1f);
      font-size: 0.8125rem;
      display: flex;
      align-items: center;
    }
    .list {
      list-style: none;
      margin: 0;
      padding: 0;
      width: 100%;
    }
    .list-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0;
      color: var(--md-sys-color-on-surface, #1c1b1f);
      font-size: 0.875rem;
    }
  `,
})
export class DividerDemo {
  protected readonly codeOrientation = `
<gui-divider orientation="horizontal" />

<gui-divider orientation="vertical" />`;

  protected readonly codeInsetHorizontal = `
<gui-divider inset="none" />
<gui-divider inset="inset" />
<gui-divider inset="middle-inset" />`;

  protected readonly codeInsetVertical = `
<gui-divider orientation="vertical" inset="none" />
<gui-divider orientation="vertical" inset="inset" />
<gui-divider orientation="vertical" inset="middle-inset" />`;

  protected readonly codeInList = `
<ul class="list">
  <li class="list-item">
    <gui-icon class="sym">inbox</gui-icon>
    <span>Inbox</span>
  </li>
  <gui-divider inset="inset" />
  <li class="list-item">
    <gui-icon class="sym">send</gui-icon>
    <span>Sent</span>
  </li>
</ul>`;

  protected readonly codeAccessibility = `
<gui-divider />`;
}
