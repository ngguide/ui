import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  GuiIconButtonVariant,
  GuiIconButtonWidth,
  IconButtonComponent,
} from './icon-button';
import { GuiSize } from '@ngguide/ui';

@Component({
  template: `<button
    gui-icon-button
    [variant]="variant()"
    [size]="size()"
    [width]="width()"
    [toggle]="toggle()"
    [disabled]="disabled()"
    [(selected)]="selected"
  >
    ☆
    <span guiSelectedIcon>★</span>
  </button>`,
  imports: [IconButtonComponent],
})
class IconButtonHostComponent {
  variant = signal<GuiIconButtonVariant>('standard');
  size = signal<GuiSize>('sm');
  width = signal<GuiIconButtonWidth>('uniform');
  toggle = signal(false);
  disabled = signal(false);
  selected = signal(false);
}

@Component({
  template: `<a gui-icon-button [disabled]="disabled()">☆</a>`,
  imports: [IconButtonComponent],
})
class AnchorHostComponent {
  disabled = signal(false);
}

describe('IconButtonComponent', () => {
  let fixture: ComponentFixture<IconButtonHostComponent>;
  let host: IconButtonHostComponent;
  let button: HTMLButtonElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(IconButtonHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  });

  it('should create', () => {
    expect(button).toBeTruthy();
  });

  it('reflects variant/size/width to data-* attributes', () => {
    host.variant.set('filled');
    host.size.set('lg');
    host.width.set('wide');
    fixture.detectChanges();

    expect(button.getAttribute('data-variant')).toBe('filled');
    expect(button.getAttribute('data-size')).toBe('lg');
    expect(button.getAttribute('data-width')).toBe('wide');
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
