import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExtendedFabComponent } from './extended-fab';
import { GuiFabColor, GuiFabSize } from './fab';

@Component({
  template: `<button
    gui-extended-fab
    [color]="color()"
    [size]="size()"
    [expanded]="expanded()"
    [disabled]="disabled()"
  >
    <span guiIcon>★</span>
    Compose
  </button>`,
  imports: [ExtendedFabComponent],
})
class ExtendedFabHostComponent {
  color = signal<GuiFabColor>('primary-container');
  size = signal<GuiFabSize>('md');
  expanded = signal(true);
  disabled = signal(false);
}

@Component({
  template: `<a gui-extended-fab [disabled]="disabled()">Compose</a>`,
  imports: [ExtendedFabComponent],
})
class AnchorHostComponent {
  disabled = signal(false);
}

@Component({
  template: `<a gui-extended-fab href="/test">Compose</a>`,
  imports: [ExtendedFabComponent],
})
class LinkHostComponent {}

describe('ExtendedFabComponent', () => {
  let fixture: ComponentFixture<ExtendedFabHostComponent>;
  let host: ExtendedFabHostComponent;
  let button: HTMLButtonElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtendedFabHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  });

  it('should create', () => {
    expect(button).toBeTruthy();
  });

  it('reflects color/size to data-* attributes', () => {
    host.color.set('tertiary');
    host.size.set('lg');
    fixture.detectChanges();

    expect(button.getAttribute('data-color')).toBe('tertiary');
    expect(button.getAttribute('data-size')).toBe('lg');
  });

  it('exposes data-expanded and shows the label when expanded (default)', () => {
    const label = button.querySelector(
      '.gui-extended-fab-label',
    ) as HTMLSpanElement;

    expect(button.hasAttribute('data-expanded')).toBe(true);
    expect(label.hasAttribute('hidden')).toBe(false);
  });

  it('drops data-expanded and hides the label when collapsed', () => {
    host.expanded.set(false);
    fixture.detectChanges();

    const label = button.querySelector(
      '.gui-extended-fab-label',
    ) as HTMLSpanElement;

    expect(button.hasAttribute('data-expanded')).toBe(false);
    expect(label.hasAttribute('hidden')).toBe(true);
  });

  it('renders native disabled on a button host', () => {
    host.disabled.set(true);
    fixture.detectChanges();

    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.hasAttribute('aria-disabled')).toBe(false);
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

  it('removes the browser underline from link hosts', () => {
    const anchorFixture = TestBed.createComponent(LinkHostComponent);
    anchorFixture.detectChanges();

    const anchor = anchorFixture.nativeElement.querySelector(
      'a',
    ) as HTMLAnchorElement;
    expect(getComputedStyle(anchor).textDecoration).toBe('none');
  });
});
