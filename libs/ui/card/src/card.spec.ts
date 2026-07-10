import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  GuiCard,
  GuiCardClickable,
  GuiCardPrimaryAction,
  GuiCardVariant,
} from './card';

@Component({
  imports: [GuiCard],
  template: `<gui-card [variant]="variant()" [disabled]="disabled()"
    >content</gui-card
  >`,
})
class CardHost {
  readonly variant = signal<GuiCardVariant>('elevated');
  readonly disabled = signal(false);
}

@Component({
  imports: [GuiCardClickable],
  template: `<div
    guiCardClickable
    [disabled]="disabled()"
    (cardActivate)="count = count + 1"
  ></div>`,
})
class ClickableHost {
  readonly disabled = signal(false);
  count = 0;
}

@Component({
  imports: [GuiCardPrimaryAction],
  template: `<div guiCardPrimaryAction (primaryAction)="count = count + 1"></div>`,
})
class PrimaryActionHost {
  count = 0;
}

@Component({
  imports: [GuiCardPrimaryAction],
  template: `<div guiCardPrimaryAction [disabled]="disabled()">region</div>`,
})
class PrimaryActionDisabledHost {
  readonly disabled = signal(false);
}

@Component({
  imports: [GuiCardClickable],
  template: `<a
    guiCardClickable
    href="#dest"
    (cardActivate)="count = count + 1"
    >link</a
  >`,
})
class AnchorClickableHost {
  count = 0;
}

describe('GuiCard', () => {
  it('reflects variant onto data-variant (Req 1.2)', () => {
    const fixture = TestBed.createComponent(CardHost);
    fixture.componentInstance.variant.set('outlined');
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('gui-card');
    expect(card.getAttribute('data-variant')).toBe('outlined');
  });

  it('sets data-disabled only when disabled (Req 2.6)', () => {
    const fixture = TestBed.createComponent(CardHost);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('gui-card');
    expect(card.hasAttribute('data-disabled')).toBe(true);
  });
});

describe('GuiCardClickable', () => {
  it('exposes role=button and tabindex=0 (Req 2.1)', () => {
    const fixture = TestBed.createComponent(ClickableHost);
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.directive(GuiCardClickable))
      .nativeElement as HTMLElement;
    expect(el.getAttribute('role')).toBe('button');
    expect(el.getAttribute('tabindex')).toBe('0');
  });

  it('emits cardActivate on click and Enter (Req 2.1)', () => {
    const fixture = TestBed.createComponent(ClickableHost);
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.directive(GuiCardClickable))
      .nativeElement as HTMLElement;

    el.dispatchEvent(new MouseEvent('click'));
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(fixture.componentInstance.count).toBe(2);
  });

  it('suppresses activation + exposes aria-disabled when disabled (Req 2.6)', () => {
    const fixture = TestBed.createComponent(ClickableHost);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.directive(GuiCardClickable))
      .nativeElement as HTMLElement;

    expect(el.getAttribute('aria-disabled')).toBe('true');
    expect(el.hasAttribute('tabindex')).toBe(false);
    el.dispatchEvent(new MouseEvent('click'));
    expect(fixture.componentInstance.count).toBe(0);
  });

  it('prevents the default Enter action on a non-anchor card (button semantics)', () => {
    const fixture = TestBed.createComponent(ClickableHost);
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.directive(GuiCardClickable))
      .nativeElement as HTMLElement;

    const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    el.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('keeps native Enter navigation on an <a href> card and emits exactly once (Req 2.1, #39)', () => {
    const fixture = TestBed.createComponent(AnchorClickableHost);
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.directive(GuiCardClickable))
      .nativeElement as HTMLElement;

    // An anchor keeps its native link role, not role=button.
    expect(el.getAttribute('role')).toBeNull();

    // Reproduce the real browser sequence: Enter fires a keydown and then,
    // because the directive leaves the link's default action intact, the
    // browser synthesises a follow-on click. jsdom does not do this on its own,
    // so dispatch both to prove activation fires only once across the pair.
    const keydown = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    el.dispatchEvent(keydown);
    // The directive must NOT cancel the link's native Enter navigation...
    expect(keydown.defaultPrevented).toBe(false);
    el.dispatchEvent(new MouseEvent('click', { cancelable: true }));

    // ...while emitting activation exactly once across the whole sequence (#39).
    expect(fixture.componentInstance.count).toBe(1);
  });
});

describe('GuiCardPrimaryAction', () => {
  it('emits primaryAction independently of the surface (Req 2.2)', () => {
    const fixture = TestBed.createComponent(PrimaryActionHost);
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.directive(GuiCardPrimaryAction))
      .nativeElement as HTMLElement;

    el.dispatchEvent(new MouseEvent('click'));
    expect(fixture.componentInstance.count).toBe(1);
    expect(el.getAttribute('role')).toBe('button');
  });

  it('dims the region and drops its tab stop when disabled (Req 2.6)', () => {
    const fixture = TestBed.createComponent(PrimaryActionDisabledHost);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.directive(GuiCardPrimaryAction))
      .nativeElement as HTMLElement;

    expect(el.style.opacity).toBe('0.38');
    expect(el.getAttribute('aria-disabled')).toBe('true');
    expect(el.hasAttribute('tabindex')).toBe(false);
  });
});
