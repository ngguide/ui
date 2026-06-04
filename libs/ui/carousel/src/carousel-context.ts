import { InjectionToken, Signal } from '@angular/core';

/**
 * Minimal contract a {@link GuiCarouselItem} needs from its parent carousel,
 * exposed through a DI token so the item never imports the carousel class
 * directly (avoids a circular module dependency — the same pattern the list
 * uses).
 */
export interface GuiCarouselContext {
  /** Activate (click / Space / Enter) an item — emits the carousel's output. */
  activate(item: GuiCarouselActivatable): void;
}

/** The slice of a carousel item the parent activates / labels. */
export interface GuiCarouselActivatable {
  readonly disabled: Signal<boolean>;
}

export const GUI_CAROUSEL = new InjectionToken<GuiCarouselContext>(
  'GUI_CAROUSEL',
);
