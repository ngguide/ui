import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/core';
import { GuiInteractionStyles } from './interaction-styles';

function interactionStyles(doc: Document): HTMLStyleElement[] {
  return Array.from(doc.head.querySelectorAll('style[data-gui-interaction]'));
}

describe('GuiInteractionStyles', () => {
  let doc: Document;

  afterEach(() => {
    // The jsdom document persists across specs — clean the injected styles.
    for (const el of interactionStyles(doc ?? document)) {
      el.remove();
    }
  });

  it('injects exactly one <style data-gui-interaction> and is idempotent (Req 7.4)', () => {
    const svc = TestBed.inject(GuiInteractionStyles);
    doc = TestBed.inject(DOCUMENT);

    svc.ensure();
    expect(interactionStyles(doc).length).toBe(1);
    expect(interactionStyles(doc)[0].textContent).toContain('.gui-state-layer::before');

    svc.ensure();
    expect(interactionStyles(doc).length).toBe(1);
  });

  it('adopts a pre-existing server-serialized style instead of duplicating (Req 7.4)', () => {
    doc = TestBed.inject(DOCUMENT);
    const pre = doc.createElement('style');
    pre.setAttribute('data-gui-interaction', '');
    doc.head.appendChild(pre);

    const svc = TestBed.inject(GuiInteractionStyles);
    svc.ensure();

    const styles = interactionStyles(doc);
    expect(styles.length).toBe(1);
    expect(styles[0]).toBe(pre);
  });
});
