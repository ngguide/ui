import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  GuiIconButtonShape,
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
    [shape]="shape()"
    [label]="label()"
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
  width = signal<GuiIconButtonWidth>('default');
  shape = signal<GuiIconButtonShape>('round');
  label = signal('');
  toggle = signal(false);
  disabled = signal(false);
  selected = signal(false);
}

@Component({
  template: `<a
    gui-icon-button
    [toggle]="toggle()"
    [disabled]="disabled()"
    [(selected)]="selected"
    >☆</a
  >`,
  imports: [IconButtonComponent],
})
class AnchorHostComponent {
  toggle = signal(false);
  disabled = signal(false);
  selected = signal(false);
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

  it('defaults to round shape and morphs round -> square when selected', () => {
    host.toggle.set(true);
    fixture.detectChanges();

    expect(button.getAttribute('data-shape')).toBe('round');
    expect(button.hasAttribute('data-selected')).toBe(false);

    button.click();
    fixture.detectChanges();

    // Round-resting toggle gains data-selected; CSS then applies a square radius.
    expect(button.hasAttribute('data-selected')).toBe(true);
  });

  it('reflects an explicit square resting shape to data-shape', () => {
    host.shape.set('square');
    host.toggle.set(true);
    fixture.detectChanges();

    expect(button.getAttribute('data-shape')).toBe('square');
  });

  it('sets aria-label from the label input', () => {
    expect(button.hasAttribute('aria-label')).toBe(false);

    host.label.set('Add to favorites');
    fixture.detectChanges();

    expect(button.getAttribute('aria-label')).toBe('Add to favorites');
  });

  it('gives a linkless anchor a button role + tabindex and activates on Space', () => {
    const anchorFixture = TestBed.createComponent(AnchorHostComponent);
    const anchorHost = anchorFixture.componentInstance;
    anchorHost.toggle.set(true);
    anchorFixture.detectChanges();

    const anchor = anchorFixture.nativeElement.querySelector(
      'a',
    ) as HTMLAnchorElement;

    expect(anchor.getAttribute('role')).toBe('button');
    expect(anchor.getAttribute('tabindex')).toBe('0');

    anchor.dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', bubbles: true }),
    );
    anchorFixture.detectChanges();

    expect(anchorHost.selected()).toBe(true);
    expect(anchor.getAttribute('aria-pressed')).toBe('true');
  });

  it('does not activate a disabled anchor on Space and uses tabindex -1', () => {
    const anchorFixture = TestBed.createComponent(AnchorHostComponent);
    const anchorHost = anchorFixture.componentInstance;
    anchorHost.toggle.set(true);
    anchorHost.disabled.set(true);
    anchorFixture.detectChanges();

    const anchor = anchorFixture.nativeElement.querySelector(
      'a',
    ) as HTMLAnchorElement;

    expect(anchor.getAttribute('tabindex')).toBe('-1');

    anchor.dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', bubbles: true }),
    );
    anchorFixture.detectChanges();

    expect(anchorHost.selected()).toBe(false);
  });
});
