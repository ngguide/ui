import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FabComponent, GuiFabColor, GuiFabSize } from './fab';

@Component({
  imports: [FabComponent],
  template: `
    <button
      gui-fab
      [color]="color"
      [size]="size"
      [lowered]="lowered"
      [disabled]="disabled"
    >
      FAB
    </button>
  `,
})
class ButtonHostComponent {
  color: GuiFabColor = 'primary-container';
  size: GuiFabSize = 'md';
  lowered = false;
  disabled = false;
}

@Component({
  imports: [FabComponent],
  template: `<a gui-fab [disabled]="disabled">FAB</a>`,
})
class AnchorHostComponent {
  disabled = false;
}

describe('FabComponent', () => {
  it('should create', () => {
    const fixture = TestBed.createComponent(FabComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('reflects color and size to data-color/data-size', () => {
    const fixture = TestBed.createComponent(ButtonHostComponent);
    fixture.componentInstance.color = 'tertiary';
    fixture.componentInstance.size = 'lg';
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(el.getAttribute('data-color')).toBe('tertiary');
    expect(el.getAttribute('data-size')).toBe('lg');
  });

  it('defaults to data-color="primary-container" and data-size="md"', () => {
    const fixture = TestBed.createComponent(ButtonHostComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(el.getAttribute('data-color')).toBe('primary-container');
    expect(el.getAttribute('data-size')).toBe('md');
  });

  it('adds the data-lowered attribute when lowered=true', () => {
    const fixture = TestBed.createComponent(ButtonHostComponent);
    fixture.componentInstance.lowered = true;
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(el.hasAttribute('data-lowered')).toBe(true);
  });

  it('omits the data-lowered attribute when lowered=false', () => {
    const fixture = TestBed.createComponent(ButtonHostComponent);
    fixture.componentInstance.lowered = false;
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(el.hasAttribute('data-lowered')).toBe(false);
  });

  it('uses native disabled on a button host', () => {
    const fixture = TestBed.createComponent(ButtonHostComponent);
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(el.hasAttribute('disabled')).toBe(true);
    expect(el.getAttribute('aria-disabled')).toBeNull();
  });

  it('uses aria-disabled on an anchor host', () => {
    const fixture = TestBed.createComponent(AnchorHostComponent);
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement.querySelector('a');
    expect(el.getAttribute('aria-disabled')).toBe('true');
    expect(el.hasAttribute('disabled')).toBe(false);
  });
});
