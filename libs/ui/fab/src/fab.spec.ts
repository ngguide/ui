import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FabComponent, GuiFabColor, GuiFabSize } from './fab';

@Component({
  imports: [FabComponent],
  template: `
    <button gui-fab [color]="color" [size]="size" [disabled]="disabled">
      FAB
    </button>
  `,
})
class ButtonHostComponent {
  color: GuiFabColor = 'primary-container';
  size: GuiFabSize = 'sm';
  disabled = false;
}

@Component({
  imports: [FabComponent],
  template: `<a gui-fab [disabled]="disabled">FAB</a>`,
})
class AnchorHostComponent {
  disabled = false;
}

@Component({
  imports: [FabComponent],
  template: `<a gui-fab href="/test">FAB</a>`,
})
class LinkHostComponent {}

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

  it('defaults to data-color="primary-container" and data-size="sm" (the 56dp FAB)', () => {
    const fixture = TestBed.createComponent(ButtonHostComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(el.getAttribute('data-color')).toBe('primary-container');
    expect(el.getAttribute('data-size')).toBe('sm');
  });

  it('reflects the medium FAB size (md) to data-size', () => {
    const fixture = TestBed.createComponent(ButtonHostComponent);
    fixture.componentInstance.size = 'md';
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(el.getAttribute('data-size')).toBe('md');
  });

  it('reflects the large FAB size (lg) to data-size', () => {
    const fixture = TestBed.createComponent(ButtonHostComponent);
    fixture.componentInstance.size = 'lg';
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(el.getAttribute('data-size')).toBe('lg');
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

  it('removes the browser underline from link hosts', () => {
    const fixture = TestBed.createComponent(LinkHostComponent);
    fixture.detectChanges();

    const el: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(getComputedStyle(el).textDecoration).toBe('none');
  });
});
