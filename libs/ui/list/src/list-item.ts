import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import {
  GuiFocusRingDirective,
  GuiRippleDirective,
  GuiStateLayerDirective,
} from '@ngguide/ui/interaction';
import { GUI_LIST, GuiListMode } from './list-context';

/** The kind of element a consumer projects into the leading slot. Only `icon`
 * changes layout (M3 aligns a leading icon to Top with an 8/12dp top padding at
 * every height, unlike an avatar/image/video which is centered then top-aligned
 * at 88dp+). The other values are advisory and documented for sizing. */
export type GuiListLeadingKind = 'icon' | 'avatar' | 'image' | 'video';

/**
 * A single M3 list row. Anatomy slots projected by the consumer:
 * `[guiListItemOverline]` (M3 overline — a small `label-small` label above the
 * headline), `[guiListItemLeading]` (M3 leading element — an avatar, icon, or
 * image; its size is owned by the projected content per the M3 slot model, e.g.
 * a 24dp icon, 40dp avatar, or 56dp image — and declare a leading icon via
 * `leadingKind="icon"` so it gets the M3 top alignment + 8/12dp top padding),
 * the default slot (headline, `body-large`), `[guiListItemSupporting]`
 * (`body-medium`), and `[guiListItemTrailing]` (`label-small` text or a
 * control). Height follows the `lines` count: 56 / 72 / 88dp (Req 4.2).
 *
 * M3 slot-accessibility note: projected interactive controls in the leading /
 * trailing slots must themselves meet the 48x48dp minimum target — the row is
 * >=56dp but the slot wrappers are sized by their content, so the consumer owns
 * the control's hit area (the spec assigns slot target sizing to the consumer).
 *
 * Behavior depends on the parent {@link GuiList} mode (Req 6.5):
 * - `action` — the row hosts its own native control(s); the item carries
 *   `role="listitem"` (or no role when `interactive`, letting the inner control
 *   own semantics).
 * - `listbox` — the item is a selectable `role="option"` with `aria-selected`,
 *   reached through the list's roving focus.
 */
@Component({
  selector: 'gui-list-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="gui-list-item-leading"><ng-content select="[guiListItemLeading]" /></span>
    <span class="gui-list-item-body">
      <span class="gui-list-item-overline"
        ><ng-content select="[guiListItemOverline]"
      /></span>
      <span class="gui-list-item-headline"><ng-content /></span>
      <span class="gui-list-item-supporting"
        ><ng-content select="[guiListItemSupporting]"
      /></span>
    </span>
    <span class="gui-list-item-trailing"
      ><ng-content select="[guiListItemTrailing]"
    /></span>
    @if (showSelectionCheck()) {
      <!-- M3 a11y: a non-color selection cue (leading/trailing checkmark) so
           selection isn't conveyed by the container color alone. -->
      <svg
        class="gui-list-item-check"
        viewBox="0 -960 960 960"
        focusable="false"
        aria-hidden="true"
      >
        <path
          d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"
          fill="currentColor"
        />
      </svg>
    }
  `,
  styleUrl: './list-item.css',
  // Keyboard focus indicator (Req 14.4): GuiFocusRingDirective marks keyboard
  // focus with `.gui-focus-visible` via CDK FocusMonitor, which also covers the
  // roving programmatic focus of a listbox option. The ring visual lives in
  // list-item.css. Non-focusable rows (action items with no tabindex) never
  // receive host focus, so it shows only on selectable/roving options.
  //
  // M3 state layer (hover / focus / pressed / dragged): GuiStateLayerDirective
  // renders the tinted `::before` overlay from the --md-sys-state-* opacity
  // tokens, tinted with the row's content color and clipped to the full-bleed
  // row. It self-suppresses on aria-disabled rows. The overlay is gated to
  // interactive rows only (listbox options and action+interactive rows) via the
  // `data-interactive` attribute in list-item.css, so plain `listitem` rows that
  // merely host their own controls stay flat.
  //
  // M3 touch ripple (Accessibility › Touch: "a touch ripple appears" on tap):
  // GuiRippleDirective renders the pointer-originating radial ripple on
  // pointerdown / Enter / Space. It self-suppresses on disabled (aria-disabled)
  // and reduced-motion; like the state layer it is gated to interactive rows via
  // `data-interactive` in list-item.css, so plain `listitem` rows stay flat.
  hostDirectives: [
    GuiFocusRingDirective,
    GuiStateLayerDirective,
    GuiRippleDirective,
  ],
  host: {
    class: 'gui-list-item',
    '[attr.data-lines]': 'lines()',
    '[attr.data-leading]': 'leadingKind()',
    '[attr.role]': 'role()',
    '[attr.aria-selected]': 'isListbox() ? (selected() ? "true" : "false") : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.data-selected]': 'selected() ? "" : null',
    '[attr.data-interactive]': 'interactiveRow() ? "" : null',
    '[attr.data-divider]': 'divider()',
    '[attr.tabindex]': 'isListbox() ? (active() ? 0 : -1) : null',
    '(click)': 'onClick()',
  },
})
export class GuiListItem {
  /** Visual density: 1, 2 or 3 lines → 56 / 72 / 88dp (Req 4.2). */
  readonly lines = input<1 | 2 | 3>(1);
  /**
   * Kind of leading element projected into `[guiListItemLeading]`. Set
   * `'icon'` for a leading icon so it is top-aligned with the M3 8dp (12dp at
   * 88dp) top padding at every row height; avatars/images/video stay centered
   * (top-aligned at 88dp+). Defaults to unset (centered, avatar/image regime).
   */
  readonly leadingKind = input<GuiListLeadingKind | null>(null);
  /** Action mode: the row is itself interactive (suppresses `role=listitem`). */
  readonly interactive = input(false, { transform: booleanAttribute });
  /** Listbox mode: the option can be selected (Req 6.1). */
  readonly selectable = input(false, { transform: booleanAttribute });
  /** Two-way selection state (Req 6.3). */
  readonly selected = model(false);
  /** Disabled options stay focusable but are not activatable (Req 6.6). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Renders an M3 bottom divider on the row (anatomy: Divider). `'full'` is the
   * full-width 100% divider; `'inset'` insets it by the leading-content left
   * padding (16dp) on the start side and the trailing right padding (24dp) on
   * the end side, per the M3 divider measurements.
   */
  readonly divider = input<'full' | 'inset' | null>(null);
  /**
   * Renders a trailing checkmark on a selected option as a built-in non-color
   * selection cue (M3 a11y: "don't rely on color as the only visual cue"). On
   * by default for listbox options so selection is never conveyed by the
   * primary-container fill alone; set `[selectionIndicator]="false"` when the
   * row already carries another non-color cue (radio/checkbox/leading icon).
   */
  readonly selectionIndicator = input(true, { transform: booleanAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly list = inject(GUI_LIST, { optional: true });

  /** Whether this option currently holds the list's single tab stop. */
  private readonly activeState = signal(false);
  protected readonly active = this.activeState.asReadonly();

  protected readonly mode = computed<GuiListMode>(
    () => this.list?.mode() ?? 'action',
  );
  protected readonly isListbox = computed(() => this.mode() === 'listbox');
  /**
   * Whether the row itself is the interactive target — a listbox option, or an
   * action row flagged `interactive`. Only such rows get the M3 state layer;
   * plain `listitem` rows that just host their own controls stay flat.
   */
  protected readonly interactiveRow = computed(
    () => this.isListbox() || this.interactive(),
  );
  protected readonly role = computed(() => {
    if (this.isListbox()) {
      return 'option';
    }
    return this.interactive() ? null : 'listitem';
  });
  /** Non-color selection cue: a trailing checkmark on a selected option. */
  protected readonly showSelectionCheck = computed(
    () => this.isListbox() && this.selectionIndicator() && this.selected(),
  );

  /** {@link FocusableOption}: move DOM focus to this row (roving focus). */
  focus(): void {
    this.host.nativeElement.focus();
  }

  /** {@link FocusableOption}: type-ahead label is the visible text. */
  getLabel(): string {
    return this.host.nativeElement.textContent?.trim() ?? '';
  }

  /** Called by the list to grant/withdraw the roving tab stop. */
  setActive(active: boolean): void {
    this.activeState.set(active);
  }

  protected onClick(): void {
    if (this.isListbox()) {
      this.list?.select(this);
    }
  }
}
