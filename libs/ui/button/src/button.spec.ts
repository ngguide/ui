import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent, GuiButtonShape, GuiButtonVariant } from './button';
import { GuiSize } from '@ngguide/ui';

@Component({
  template: `<button
    gui-button
    [variant]="variant()"
    [size]="size()"
    [shape]="shape()"
    [toggle]="toggle()"
    [disabled]="disabled()"
    [(selected)]="selected"
  >
    Label
    <span guiSelectedIcon>★</span>
  </button>`,
  imports: [ButtonComponent],
})
class ButtonHostComponent {
  variant = signal<GuiButtonVariant>('filled');
  size = signal<GuiSize>('md');
  shape = signal<GuiButtonShape>('round');
  toggle = signal(false);
  disabled = signal(false);
  selected = signal(false);
}

@Component({
  template: `<a gui-button [disabled]="disabled()">Label</a>`,
  imports: [ButtonComponent],
})
class AnchorHostComponent {
  disabled = signal(false);
}

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<ButtonHostComponent>;
  let host: ButtonHostComponent;
  let button: HTMLButtonElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  });

  it('should create', () => {
    expect(button).toBeTruthy();
  });

  it('reflects variant/size/shape to data-* attributes', () => {
    host.variant.set('outlined');
    host.size.set('lg');
    host.shape.set('square');
    fixture.detectChanges();

    expect(button.getAttribute('data-variant')).toBe('outlined');
    expect(button.getAttribute('data-size')).toBe('lg');
    expect(button.getAttribute('data-shape')).toBe('square');
  });

  it('toggles selected and aria-pressed on click when toggle=true', () => {
    host.toggle.set(true);
    fixture.detectChanges();

    expect(host.selected()).toBe(false);
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.hasAttribute('data-selected')).toBe(false);

    button.click();
    fixture.detectChanges();

    expect(host.selected()).toBe(true);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.hasAttribute('data-selected')).toBe(true);

    button.click();
    fixture.detectChanges();

    expect(host.selected()).toBe(false);
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.hasAttribute('data-selected')).toBe(false);
  });

  it('omits aria-pressed and does not select when toggle=false', () => {
    expect(button.hasAttribute('aria-pressed')).toBe(false);

    button.click();
    fixture.detectChanges();

    expect(host.selected()).toBe(false);
    expect(button.hasAttribute('data-selected')).toBe(false);
  });

  it('renders native disabled and guards clicks when disabled=true', () => {
    host.toggle.set(true);
    host.disabled.set(true);
    fixture.detectChanges();

    expect(button.hasAttribute('disabled')).toBe(true);

    button.click();
    fixture.detectChanges();

    expect(host.selected()).toBe(false);
    expect(button.hasAttribute('data-selected')).toBe(false);
  });

  it('does not select for variant="text" even when toggle=true (no toggle text button)', () => {
    host.variant.set('text');
    host.toggle.set(true);
    fixture.detectChanges();

    button.click();
    fixture.detectChanges();

    expect(host.selected()).toBe(false);
    expect(button.hasAttribute('data-selected')).toBe(false);
  });

  it('uses aria-disabled (not native disabled) on an anchor host', () => {
    const anchorFixture = TestBed.createComponent(AnchorHostComponent);
    anchorFixture.componentInstance.disabled.set(true);
    anchorFixture.detectChanges();

    const anchor = anchorFixture.nativeElement.querySelector(
      'a',
    ) as HTMLAnchorElement;

    expect(anchor.getAttribute('aria-disabled')).toBe('true');
    expect(anchor.hasAttribute('disabled')).toBe(false);
  });
});
