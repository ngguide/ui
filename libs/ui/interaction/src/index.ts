// Public barrel for @ngguide/ui/interaction.
// Exports are added as each directive/utility lands (Groups A–E).
// GuiInteractionStyles is an internal implementation detail and is NOT exported.
export { GuiReducedMotion } from './reduced-motion';
export {
  GuiStateLayerDirective,
  type GuiInteractionState,
} from './state-layer.directive';
export { GuiRippleDirective } from './ripple.directive';
export { GuiFocusRingDirective } from './focus-ring.directive';
export {
  FocusKeyManager,
  ListKeyManager,
  type FocusableOption,
  type RovingOrientation,
  type RovingFocusOptions,
  createRovingFocus,
} from './a11y';
