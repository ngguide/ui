import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SegmentedButtonComponent } from './segmented-button';
import { SegmentedButtonGroupComponent } from './segmented-button-group';

@Component({
  template: `<gui-segmented-buttons
    [multiple]="multiple()"
    [(value)]="value"
  >
    <button gui-segmented-button value="a">A</button>
    <button gui-segmented-button value="b">B</button>
    <button gui-segmented-button value="c">C</button>
  </gui-segmented-buttons>`,
  imports: [SegmentedButtonGroupComponent, SegmentedButtonComponent],
})
class HostComponent {
  multiple = signal(false);
  value = signal<string | string[] | null>(null);
}

/** Host with a single segment — used to exercise the 2–5 segment warning. */
@Component({
  template: `<gui-segmented-buttons>
    <button gui-segmented-button value="a">A</button>
  </gui-segmented-buttons>`,
  imports: [SegmentedButtonGroupComponent, SegmentedButtonComponent],
})
class OneSegmentHostComponent {}

describe('SegmentedButtonComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let segments: HTMLButtonElement[];
  let group: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    segments = Array.from(
      fixture.nativeElement.querySelectorAll('button[gui-segmented-button]'),
    ) as HTMLButtonElement[];
    group = fixture.nativeElement.querySelector(
      'gui-segmented-buttons',
    ) as HTMLElement;
  });

  it('should create', () => {
    expect(segments.length).toBe(3);
  });

  describe('single-select', () => {
    it('exposes role="radio" on each segment', () => {
      for (const segment of segments) {
        expect(segment.getAttribute('role')).toBe('radio');
      }
    });

    it('selects a segment on click and reflects aria-checked/data-selected', () => {
      segments[1].click();
      fixture.detectChanges();

      expect(host.value()).toBe('b');
      expect(segments[1].getAttribute('aria-checked')).toBe('true');
      expect(segments[1].hasAttribute('data-selected')).toBe(true);

      expect(segments[0].getAttribute('aria-checked')).toBe('false');
      expect(segments[0].hasAttribute('data-selected')).toBe(false);
      expect(segments[2].getAttribute('aria-checked')).toBe('false');
    });

    it('unselects the selected segment on a second click', () => {
      segments[0].click();
      fixture.detectChanges();
      expect(host.value()).toBe('a');

      segments[0].click();
      fixture.detectChanges();

      expect(host.value()).toBeNull();
      expect(segments[0].getAttribute('aria-checked')).toBe('false');
      expect(segments[0].hasAttribute('data-selected')).toBe(false);
    });
  });

  describe('multi-select', () => {
    beforeEach(() => {
      host.multiple.set(true);
      fixture.detectChanges();
    });

    it('exposes role="checkbox" on each segment', () => {
      for (const segment of segments) {
        expect(segment.getAttribute('role')).toBe('checkbox');
      }
    });

    it('accumulates clicked segments into the array value', () => {
      segments[0].click();
      fixture.detectChanges();
      segments[2].click();
      fixture.detectChanges();

      expect(host.value()).toEqual(['a', 'c']);
      expect(segments[0].hasAttribute('data-selected')).toBe(true);
      expect(segments[2].hasAttribute('data-selected')).toBe(true);
      expect(segments[1].hasAttribute('data-selected')).toBe(false);
    });

    it('removes a segment from the array on a second click', () => {
      segments[0].click();
      fixture.detectChanges();
      segments[2].click();
      fixture.detectChanges();
      segments[0].click();
      fixture.detectChanges();

      expect(host.value()).toEqual(['c']);
      expect(segments[0].hasAttribute('data-selected')).toBe(false);
    });
  });

  describe('group host', () => {
    it('has role="radiogroup" in single-select', () => {
      expect(group.getAttribute('role')).toBe('radiogroup');
    });

    it('switches to role="group" in multi-select (children are checkboxes)', () => {
      host.multiple.set(true);
      fixture.detectChanges();

      expect(group.getAttribute('role')).toBe('group');
    });

    it('sets aria-multiselectable="true" when multiple', () => {
      expect(group.hasAttribute('aria-multiselectable')).toBe(false);

      host.multiple.set(true);
      fixture.detectChanges();

      expect(group.getAttribute('aria-multiselectable')).toBe('true');
    });
  });

  it('warns when the group has fewer than 2 segments', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const oneFixture = TestBed.createComponent(OneSegmentHostComponent);
    oneFixture.detectChanges();

    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
