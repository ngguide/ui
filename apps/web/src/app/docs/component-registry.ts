import { Type } from '@angular/core';

/**
 * Single source of truth for the M3-style documentation site (`/ui`).
 *
 * Every component the kit ships gets one entry here: its human name, the
 * `@ngguide/ui/*` entry point, the canonical Material Design 3 source page, the
 * in-repo strict-M3 spec doc, and a lazy loader for its live gallery demo. The
 * docs shell (sidebar), the home page (category grid) and the per-component
 * page all read from this list, so adding a component is a one-line change.
 */
export interface DocComponent {
  /** URL slug + demo filename stem, e.g. `icon-button`. */
  readonly slug: string;
  /** Human-facing name shown in the sidebar and page header. */
  readonly name: string;
  /** Library entry point, e.g. `@ngguide/ui/button`. */
  readonly entry: string;
  /** One-line description shown on the home category cards. */
  readonly blurb: string;
  /** Canonical Material Design 3 source page. */
  readonly m3: string;
  /** Lazy loader for the live demo component. */
  readonly load: () => Promise<Type<unknown>>;
}

export interface DocCategory {
  /** URL + docs-folder id, e.g. `text-inputs`. */
  readonly id: string;
  /** Human-facing title, e.g. "Text inputs". */
  readonly title: string;
  /** One-line description shown on the home page. */
  readonly blurb: string;
  readonly components: readonly DocComponent[];
}

const GITHUB = 'https://github.com/ngguide/ui/blob/main';

/** In-repo strict-M3 spec doc for a component (GitHub blob URL). */
export function specHref(categoryId: string, slug: string): string {
  return `${GITHUB}/docs/components/${categoryId}/${slug}.md`;
}

export const DOC_CATEGORIES: readonly DocCategory[] = [
  {
    id: 'actions',
    title: 'Actions',
    blurb: 'Buttons and button-like triggers that start an action.',
    components: [
      {
        slug: 'button',
        name: 'Button',
        entry: '@ngguide/ui/button',
        blurb: 'Five color styles, five sizes, two shapes, toggle.',
        m3: 'https://m3.material.io/components/buttons',
        load: () => import('../gallery/demos/button.demo').then((m) => m.ButtonDemo),
      },
      {
        slug: 'fab',
        name: 'FAB',
        entry: '@ngguide/ui/fab',
        blurb: 'Floating action button and extended FAB.',
        m3: 'https://m3.material.io/components/floating-action-button',
        load: () => import('../gallery/demos/fab.demo').then((m) => m.FabDemo),
      },
      {
        slug: 'fab-menu',
        name: 'FAB menu',
        entry: '@ngguide/ui/fab-menu',
        blurb: 'A FAB that expands into a menu of related actions.',
        m3: 'https://m3.material.io/components/fab-menu',
        load: () => import('../gallery/demos/fab-menu.demo').then((m) => m.FabMenuDemo),
      },
      {
        slug: 'icon-button',
        name: 'Icon button',
        entry: '@ngguide/ui/icon-button',
        blurb: 'Compact icon-only action, with toggle support.',
        m3: 'https://m3.material.io/components/icon-buttons',
        load: () => import('../gallery/demos/icon-button.demo').then((m) => m.IconButtonDemo),
      },
      {
        slug: 'button-group',
        name: 'Button group',
        entry: '@ngguide/ui/button-group',
        blurb: 'A connected row of buttons with a press width morph.',
        m3: 'https://m3.material.io/components/button-groups',
        load: () => import('../gallery/demos/button-group.demo').then((m) => m.ButtonGroupDemo),
      },
      {
        slug: 'segmented-button',
        name: 'Segmented button',
        entry: '@ngguide/ui/segmented-button',
        blurb: 'Single- or multi-select segmented control.',
        m3: 'https://m3.material.io/components/segmented-buttons',
        load: () => import('../gallery/demos/segmented-button.demo').then((m) => m.SegmentedButtonDemo),
      },
      {
        slug: 'split-button',
        name: 'Split button',
        entry: '@ngguide/ui/split-button',
        blurb: 'A primary action paired with a connected menu trigger.',
        m3: 'https://m3.material.io/components/split-button',
        load: () => import('../gallery/demos/split-button.demo').then((m) => m.SplitButtonDemo),
      },
    ],
  },
  {
    id: 'communication',
    title: 'Communication',
    blurb: 'Status, feedback and helper surfaces.',
    components: [
      {
        slug: 'badge',
        name: 'Badge',
        entry: '@ngguide/ui/badge',
        blurb: 'A small count or dot anchored to another element.',
        m3: 'https://m3.material.io/components/badges',
        load: () => import('../gallery/demos/badge.demo').then((m) => m.BadgeDemo),
      },
      {
        slug: 'progress',
        name: 'Progress indicator',
        entry: '@ngguide/ui/progress',
        blurb: 'Linear and circular, determinate or indeterminate.',
        m3: 'https://m3.material.io/components/progress-indicators',
        load: () => import('../gallery/demos/progress.demo').then((m) => m.ProgressDemo),
      },
      {
        slug: 'loading-indicator',
        name: 'Loading indicator',
        entry: '@ngguide/ui/loading-indicator',
        blurb: 'The M3 Expressive active/contained loading indicator.',
        m3: 'https://m3.material.io/components/loading-indicator',
        load: () => import('../gallery/demos/loading-indicator.demo').then((m) => m.LoadingIndicatorDemo),
      },
      {
        slug: 'snackbar',
        name: 'Snackbar',
        entry: '@ngguide/ui/snackbar',
        blurb: 'Brief, low-priority messages with an optional action.',
        m3: 'https://m3.material.io/components/snackbar',
        load: () => import('../gallery/demos/snackbar.demo').then((m) => m.SnackbarDemo),
      },
      {
        slug: 'tooltip',
        name: 'Tooltip',
        entry: '@ngguide/ui/tooltip',
        blurb: 'Plain and rich tooltips on hover/focus.',
        m3: 'https://m3.material.io/components/tooltips',
        load: () => import('../gallery/demos/tooltip.demo').then((m) => m.TooltipDemo),
      },
    ],
  },
  {
    id: 'containment',
    title: 'Containment',
    blurb: 'Surfaces that group or contain other content.',
    components: [
      {
        slug: 'card',
        name: 'Card',
        entry: '@ngguide/ui/card',
        blurb: 'Elevated, filled and outlined content containers.',
        m3: 'https://m3.material.io/components/cards',
        load: () => import('../gallery/demos/card.demo').then((m) => m.CardDemo),
      },
      {
        slug: 'carousel',
        name: 'Carousel',
        entry: '@ngguide/ui/carousel',
        blurb: 'Keyline-morph scrolling item strip.',
        m3: 'https://m3.material.io/components/carousel',
        load: () => import('../gallery/demos/carousel.demo').then((m) => m.CarouselDemo),
      },
      {
        slug: 'dialog',
        name: 'Dialog',
        entry: '@ngguide/ui/dialog',
        blurb: 'Basic and full-screen modal dialogs.',
        m3: 'https://m3.material.io/components/dialogs',
        load: () => import('../gallery/demos/dialog.demo').then((m) => m.DialogDemo),
      },
      {
        slug: 'divider',
        name: 'Divider',
        entry: '@ngguide/ui/divider',
        blurb: 'A thin line that groups content in lists and layouts.',
        m3: 'https://m3.material.io/components/divider',
        load: () => import('../gallery/demos/divider.demo').then((m) => m.DividerDemo),
      },
      {
        slug: 'list',
        name: 'List',
        entry: '@ngguide/ui/list',
        blurb: 'Single- and multi-line list items with slots.',
        m3: 'https://m3.material.io/components/lists',
        load: () => import('../gallery/demos/list.demo').then((m) => m.ListDemo),
      },
      {
        slug: 'bottom-sheet',
        name: 'Bottom sheet',
        entry: '@ngguide/ui/bottom-sheet',
        blurb: 'A surface anchored to the bottom of the screen.',
        m3: 'https://m3.material.io/components/bottom-sheets',
        load: () => import('../gallery/demos/bottom-sheet.demo').then((m) => m.BottomSheetDemo),
      },
      {
        slug: 'side-sheet',
        name: 'Side sheet',
        entry: '@ngguide/ui/side-sheet',
        blurb: 'A surface anchored to the side for supplementary content.',
        m3: 'https://m3.material.io/components/side-sheets',
        load: () => import('../gallery/demos/side-sheet.demo').then((m) => m.SideSheetDemo),
      },
    ],
  },
  {
    id: 'selection',
    title: 'Selection',
    blurb: 'Controls for choosing values and options.',
    components: [
      {
        slug: 'checkbox',
        name: 'Checkbox',
        entry: '@ngguide/ui/checkbox',
        blurb: 'Binary and indeterminate checkboxes.',
        m3: 'https://m3.material.io/components/checkbox',
        load: () => import('../gallery/demos/checkbox.demo').then((m) => m.CheckboxDemo),
      },
      {
        slug: 'radio',
        name: 'Radio button',
        entry: '@ngguide/ui/radio',
        blurb: 'A single choice from a set.',
        m3: 'https://m3.material.io/components/radio-button',
        load: () => import('../gallery/demos/radio.demo').then((m) => m.RadioDemo),
      },
      {
        slug: 'switch',
        name: 'Switch',
        entry: '@ngguide/ui/switch',
        blurb: 'A toggle for a single on/off setting.',
        m3: 'https://m3.material.io/components/switch',
        load: () => import('../gallery/demos/switch.demo').then((m) => m.SwitchDemo),
      },
      {
        slug: 'chip',
        name: 'Chip',
        entry: '@ngguide/ui/chip',
        blurb: 'Assist, filter, input and suggestion chips.',
        m3: 'https://m3.material.io/components/chips',
        load: () => import('../gallery/demos/chip.demo').then((m) => m.ChipDemo),
      },
      {
        slug: 'slider',
        name: 'Slider',
        entry: '@ngguide/ui/slider',
        blurb: 'Continuous and discrete value selection.',
        m3: 'https://m3.material.io/components/sliders',
        load: () => import('../gallery/demos/slider.demo').then((m) => m.SliderDemo),
      },
      {
        slug: 'menu',
        name: 'Menu',
        entry: '@ngguide/ui/menu',
        blurb: 'A list of choices on a temporary surface.',
        m3: 'https://m3.material.io/components/menus',
        load: () => import('../gallery/demos/menu.demo').then((m) => m.MenuDemo),
      },
    ],
  },
  {
    id: 'text-inputs',
    title: 'Text inputs',
    blurb: 'Text entry and date/time pickers.',
    components: [
      {
        slug: 'text-field',
        name: 'Text field',
        entry: '@ngguide/ui/text-field',
        blurb: 'Filled and outlined text fields with affixes.',
        m3: 'https://m3.material.io/components/text-fields',
        load: () => import('../gallery/demos/text-field.demo').then((m) => m.TextFieldDemo),
      },
      {
        slug: 'date-picker',
        name: 'Date picker',
        entry: '@ngguide/ui/date-picker',
        blurb: 'Docked and modal date and date-range pickers.',
        m3: 'https://m3.material.io/components/date-pickers',
        load: () => import('../gallery/demos/date-picker.demo').then((m) => m.DatePickerDemo),
      },
      {
        slug: 'time-picker',
        name: 'Time picker',
        entry: '@ngguide/ui/time-picker',
        blurb: 'Dial and input time pickers.',
        m3: 'https://m3.material.io/components/time-pickers',
        load: () => import('../gallery/demos/time-picker.demo').then((m) => m.TimePickerDemo),
      },
    ],
  },
  {
    id: 'foundations',
    title: 'Foundations',
    blurb: 'Primitives the rest of the kit is built on.',
    components: [
      {
        slug: 'icon',
        name: 'Icon',
        entry: '@ngguide/ui/icon',
        blurb: 'A Material Symbols ligature icon, sized via a token.',
        m3: 'https://m3.material.io/styles/icons/overview',
        load: () => import('../gallery/demos/icon.demo').then((m) => m.IconDemo),
      },
    ],
  },
];

/** Flat slug → {category, component} lookup for route resolution. */
export interface DocLookup {
  readonly category: DocCategory;
  readonly component: DocComponent;
}

const INDEX = new Map<string, DocLookup>();
for (const category of DOC_CATEGORIES) {
  for (const component of category.components) {
    INDEX.set(component.slug, { category, component });
  }
}

export function findComponent(slug: string): DocLookup | undefined {
  return INDEX.get(slug);
}

/** Flat ordered list of every component (sidebar / prev-next). */
export const ALL_COMPONENTS: readonly DocLookup[] = DOC_CATEGORIES.flatMap(
  (category) => category.components.map((component) => ({ category, component })),
);
