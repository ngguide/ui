/**
 * Recognizes a disabled interactive host from either the native `disabled`
 * property (form controls) or `aria-disabled="true"` (Req 4.4). Shared by the
 * interaction directives so all of them suppress feedback consistently.
 */
export function isHostDisabled(el: HTMLElement): boolean {
  return (
    (el as Partial<HTMLButtonElement>).disabled === true ||
    el.getAttribute('aria-disabled') === 'true'
  );
}
