import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent } from '@ngguide/ui/button';
import { IconButtonComponent } from '@ngguide/ui/icon-button';
import { IconComponent } from '@ngguide/ui/icon';
import {
  GuiRichTooltip,
  GuiRichTooltipTrigger,
  GuiTooltip,
} from '@ngguide/ui/tooltip';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Vitrine demo for tooltips (`@ngguide/ui/tooltip`).
 *
 * Covers both M3 variants the library implements:
 *
 * - Plain tooltip — the `GuiTooltip` directive (`[guiTooltip]`), a short
 *   non-interactive label shown on hover / focus / long-press. Exercises the
 *   four `position` placements (above / below / before / after), the
 *   `showDelay` / `hideDelay` timing inputs, the `disabled` state, and the
 *   typical host targets (icon button + button). Hover or keyboard-focus any
 *   trigger to open it; the overlay panel uses the M3 inverse-surface roles.
 * - Rich tooltip — the persistent, interactive `gui-rich-tooltip` panel driven
 *   by the `[guiRichTooltipTrigger]` directive. Walks the five M3 content
 *   configurations (subhead + body + two buttons, + one button, subhead + body
 *   only, body + one button, body + two buttons), plus the `position` input.
 *   Hover the trigger (or its panel) to keep it open; Escape or clicking an
 *   action closes it.
 *
 * No clock or RNG anywhere — every specimen is statically configured, so SSR
 * and client renders are byte-identical.
 */
@Component({
  selector: 'app-demo-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...GALLERY_DEMO_UI,
    GuiTooltip,
    GuiRichTooltip,
    GuiRichTooltipTrigger,
    ButtonComponent,
    IconButtonComponent,
    IconComponent,
  ],
  template: `
    <app-demo-component
      name="Tooltip"
      entry="@ngguide/ui/tooltip"
      docHref="https://m3.material.io/components/tooltips"
    >
      <!-- ── Variants: the two M3 tooltip types — plain and rich ── -->
      <app-demo-block
        heading="Variants"
        hint="Two M3 variants — plain (short non-interactive label) and rich (persistent, with subhead + actions). Hover or focus each trigger."
      >
        <app-demo-specimen label="plain">
          <button gui-icon-button variant="standard" label="Add" guiTooltip="Add to library">
            <gui-icon class="sym">add</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="rich">
          <gui-rich-tooltip #richVariant>
            <span guiRichTooltipSubhead>Encrypted storage</span>
            Your files are encrypted at rest and in transit.
            <div guiRichTooltipActions>
              <button gui-button variant="text">Learn more</button>
            </div>
          </gui-rich-tooltip>
          <button gui-button variant="tonal" [guiRichTooltipTrigger]="richVariant">
            Details
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ── Positions: the four connected placements for plain tooltips ── -->
      <app-demo-block
        heading="Positions"
        hint="Four placements — above (default), below, before, after — with a sensible fallback when space is tight"
      >
        <app-demo-specimen label="above">
          <button gui-icon-button variant="tonal" label="Above" guiTooltip="Above" position="above">
            <gui-icon class="sym">arrow_upward</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="below">
          <button gui-icon-button variant="tonal" label="Below" guiTooltip="Below" position="below">
            <gui-icon class="sym">arrow_downward</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="before">
          <button gui-icon-button variant="tonal" label="Before" guiTooltip="Before" position="before">
            <gui-icon class="sym">arrow_back</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="after">
          <button gui-icon-button variant="tonal" label="After" guiTooltip="After" position="after">
            <gui-icon class="sym">arrow_forward</gui-icon>
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ── Triggers: plain tooltip attaches to any host (icon button / button) ── -->
      <app-demo-block
        heading="Trigger hosts"
        hint="The plain-tooltip directive attaches to any element — icon buttons, buttons, links"
      >
        <app-demo-specimen label="icon button">
          <button gui-icon-button variant="filled" label="Favorite" guiTooltip="Add to favorites">
            <gui-icon class="sym">favorite</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="button">
          <button gui-button variant="outlined" guiTooltip="Share this item">
            Share
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="link">
          <a gui-button variant="text" href="#c-tooltip" guiTooltip="Open documentation">
            Docs
          </a>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ── Timing: show / hide delays. The default show delay is 500ms;
           these specimens make the timing inputs observable on hover. ── -->
      <app-demo-block
        heading="Timing"
        hint="showDelay (default 500ms) and hideDelay (default 0ms) tune how quickly the label appears / dismisses"
      >
        <app-demo-specimen label="instant (showDelay 0)">
          <button gui-icon-button variant="standard" label="Instant" guiTooltip="Shows immediately" [showDelay]="0">
            <gui-icon class="sym">bolt</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="default (showDelay 500)">
          <button gui-icon-button variant="standard" label="Default" guiTooltip="Shows after 500ms">
            <gui-icon class="sym">schedule</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="lingers (hideDelay 1000)">
          <button gui-icon-button variant="standard" label="Linger" guiTooltip="Stays after the cursor leaves" [hideDelay]="1000">
            <gui-icon class="sym">timer</gui-icon>
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ── States: enabled vs disabled. A disabled tooltip never opens. ── -->
      <app-demo-block
        heading="States"
        hint="Enabled opens on hover/focus; disabled suppresses the tooltip entirely"
      >
        <app-demo-specimen label="enabled">
          <button gui-icon-button variant="filled" label="Edit" guiTooltip="Edit item">
            <gui-icon class="sym">edit</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="disabled (no tooltip)">
          <button gui-icon-button variant="filled" label="Edit" guiTooltip="Edit item" disabled>
            <gui-icon class="sym">edit</gui-icon>
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ── Rich tooltip content configurations: the five M3 layouts.
           Each is a persistent panel — hover the trigger (or panel) to keep it
           open; Escape or clicking an action closes it. ── -->
      <app-demo-block
        heading="Rich tooltip configurations"
        hint="The five M3 content layouts — subhead, body, and up to two text buttons. Hover each trigger to open."
        [column]="true"
      >
        <app-demo-specimen class="fill" label="subhead + body + two buttons">
          <gui-rich-tooltip #richTwo>
            <span guiRichTooltipSubhead>Cloud backup</span>
            Keep a synced copy of your photos across all devices.
            <div guiRichTooltipActions>
              <button gui-button variant="text">Dismiss</button>
              <button gui-button variant="text">Turn on</button>
            </div>
          </gui-rich-tooltip>
          <button gui-button variant="tonal" [guiRichTooltipTrigger]="richTwo">
            Two buttons
          </button>
        </app-demo-specimen>

        <app-demo-specimen class="fill" label="subhead + body + one button">
          <gui-rich-tooltip #richOne>
            <span guiRichTooltipSubhead>Smart compose</span>
            Suggestions appear as you type to help you write faster.
            <div guiRichTooltipActions>
              <button gui-button variant="text">Got it</button>
            </div>
          </gui-rich-tooltip>
          <button gui-button variant="tonal" [guiRichTooltipTrigger]="richOne">
            One button
          </button>
        </app-demo-specimen>

        <app-demo-specimen class="fill" label="subhead + body (no buttons)">
          <gui-rich-tooltip #richSubhead>
            <span guiRichTooltipSubhead>Offline mode</span>
            Changes you make offline sync automatically once you reconnect.
          </gui-rich-tooltip>
          <button gui-button variant="tonal" [guiRichTooltipTrigger]="richSubhead">
            Subhead only
          </button>
        </app-demo-specimen>

        <app-demo-specimen class="fill" label="body + one button (no subhead)">
          <gui-rich-tooltip #richBodyOne>
            This feature is still in beta and may change.
            <div guiRichTooltipActions>
              <button gui-button variant="text">Send feedback</button>
            </div>
          </gui-rich-tooltip>
          <button gui-button variant="tonal" [guiRichTooltipTrigger]="richBodyOne">
            Body + one
          </button>
        </app-demo-specimen>

        <app-demo-specimen class="fill" label="body + two buttons (no subhead)">
          <gui-rich-tooltip #richBodyTwo>
            Delete this draft? This action cannot be undone.
            <div guiRichTooltipActions>
              <button gui-button variant="text">Cancel</button>
              <button gui-button variant="text">Delete</button>
            </div>
          </gui-rich-tooltip>
          <button gui-button variant="tonal" [guiRichTooltipTrigger]="richBodyTwo">
            Body + two
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ── Rich tooltip positions: the trigger's connected placement ── -->
      <app-demo-block
        heading="Rich tooltip positions"
        hint="The rich-tooltip trigger accepts the same four placements (default below)"
      >
        <app-demo-specimen label="above">
          <gui-rich-tooltip #richAbove>
            <span guiRichTooltipSubhead>Above</span>
            Opens above the trigger.
          </gui-rich-tooltip>
          <button gui-button variant="outlined" [guiRichTooltipTrigger]="richAbove" position="above">
            Above
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="below (default)">
          <gui-rich-tooltip #richBelow>
            <span guiRichTooltipSubhead>Below</span>
            Opens below the trigger.
          </gui-rich-tooltip>
          <button gui-button variant="outlined" [guiRichTooltipTrigger]="richBelow" position="below">
            Below
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="before">
          <gui-rich-tooltip #richBefore>
            <span guiRichTooltipSubhead>Before</span>
            Opens to the inline-start of the trigger.
          </gui-rich-tooltip>
          <button gui-button variant="outlined" [guiRichTooltipTrigger]="richBefore" position="before">
            Before
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="after">
          <gui-rich-tooltip #richAfter>
            <span guiRichTooltipSubhead>After</span>
            Opens to the inline-end of the trigger.
          </gui-rich-tooltip>
          <button gui-button variant="outlined" [guiRichTooltipTrigger]="richAfter" position="after">
            After
          </button>
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
})
export class TooltipDemo {}
