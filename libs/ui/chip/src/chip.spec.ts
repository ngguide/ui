import { ApplicationRef, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ChipComponent, GuiChipType } from './chip';
import { ChipSetComponent, GuiChipSelect } from './chip-set';

@Component({
  template: `<gui-chip-set
    [select]="select()"
    [disabled]="setDisabled()"
    [(value)]="value"
  >
    <gui-chip
      [type]="type()"
      value="a"
      label="A"
      [removable]="removable()"
      [elevated]="elevated()"
      [disabled]="chipDisabled()"
      (remove)="removed = removed + 1"
      >A</gui-chip
    >
    <gui-chip [type]="type()" value="b" label="B">B</gui-chip>
  </gui-chip-set>`,
  imports: [ChipSetComponent, ChipComponent],
})
class HostComponent {
  select = signal<GuiChipSelect>('none');
  type = signal<GuiChipType>('assist');
  removable = signal(false);
  elevated = signal(false);
  chipDisabled = signal(false);
  setDisabled = signal(false);
  value = signal<string | string[] | null>(null);
  removed = 0;
}

@Component({
  template: `<gui-chip-set select="single" [value]="'b'">
    <gui-chip type="filter" value="a" label="A">A</gui-chip>
    <gui-chip type="filter" value="b" label="B">B</gui-chip>
  </gui-chip-set>`,
  imports: [ChipSetComponent, ChipComponent],
})
class PreselectedHost {}

@Component({
  template: `<gui-chip-set>
    <gui-chip type="filter" value="a" label="A">
      A
      <span guiChipTrailing class="trail">v</span>
    </gui-chip>
  </gui-chip-set>`,
  imports: [ChipSetComponent, ChipComponent],
})
class TrailingHost {}

/** Run pending afterNextRender callbacks (manager seed) synchronously. */
function flush(): void {
  TestBed.inject(ApplicationRef).tick();
}

function key(el: Element, k: string, keyCode = 0): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: k, bubbles: true });
  if (keyCode) {
    Object.defineProperty(event, 'keyCode', { get: () => keyCode });
  }
  el.dispatchEvent(event);
  return event;
}

describe('ChipComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let set: HTMLElement;
  let chips: HTMLElement[];

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    flush();
    set = fixture.nativeElement.querySelector('gui-chip-set') as HTMLElement;
    chips = Array.from(
      fixture.nativeElement.querySelectorAll('gui-chip'),
    ) as HTMLElement[];
  });

  it('exposes the grid/row/gridcell roles with a single roving tab stop', () => {
    expect(set.getAttribute('role')).toBe('grid');
    expect(set.querySelector('[role="row"]')).not.toBeNull();
    for (const chip of chips) {
      expect(chip.getAttribute('role')).toBe('gridcell');
    }
    // Exactly one chip carries tabindex=0 (the set is a single Tab stop).
    expect(chips[0].getAttribute('tabindex')).toBe('0');
    expect(chips[1].getAttribute('tabindex')).toBe('-1');
  });

  it('moves the roving tab stop with ArrowRight', () => {
    key(set, 'ArrowRight', 39);
    fixture.detectChanges();
    expect(chips[0].getAttribute('tabindex')).toBe('-1');
    expect(chips[1].getAttribute('tabindex')).toBe('0');
  });

  it('seeds the tab stop on a pre-selected chip, not the first', () => {
    const f = TestBed.createComponent(PreselectedHost);
    f.detectChanges();
    flush();
    const c = Array.from(
      f.nativeElement.querySelectorAll('gui-chip'),
    ) as HTMLElement[];
    expect(c[0].getAttribute('tabindex')).toBe('-1');
    expect(c[1].getAttribute('tabindex')).toBe('0');
  });

  it('conveys selection via aria-selected on the gridcell host (not a checkbox)', () => {
    host.select.set('multiple');
    host.type.set('filter');
    host.value.set([]);
    fixture.detectChanges();

    expect(chips[0].getAttribute('aria-selected')).toBe('false');
    // No nested checkbox role — selection lives on the gridcell.
    expect(chips[0].querySelector('[role="checkbox"]')).toBeNull();

    chips[0].click();
    fixture.detectChanges();

    expect(host.value()).toEqual(['a']);
    expect(chips[0].hasAttribute('data-selected')).toBe(true);
    expect(chips[0].getAttribute('aria-selected')).toBe('true');
  });

  it('selects by the set mode, so an input chip is selectable too', () => {
    host.select.set('single');
    host.type.set('input');
    fixture.detectChanges();

    chips[0].click();
    fixture.detectChanges();
    expect(host.value()).toBe('a');
    expect(chips[0].hasAttribute('data-selected')).toBe(true);

    // single-select clears on re-toggle (M3).
    chips[0].click();
    fixture.detectChanges();
    expect(host.value()).toBeNull();
  });

  it('does not select or expose aria-selected when the set is not selectable', () => {
    // default select = 'none'
    chips[0].click();
    fixture.detectChanges();
    expect(host.value()).toBeNull();
    expect(chips[0].hasAttribute('aria-selected')).toBe(false);
  });

  it('emits remove when Delete is pressed on a removable input chip', () => {
    host.removable.set(true);
    host.type.set('input');
    fixture.detectChanges();

    key(chips[0], 'Delete');
    fixture.detectChanges();
    expect(host.removed).toBe(1);
  });

  it('does not remove a disabled chip via Delete', () => {
    host.removable.set(true);
    host.type.set('input');
    host.chipDisabled.set(true);
    fixture.detectChanges();

    key(chips[0], 'Delete');
    fixture.detectChanges();
    expect(host.removed).toBe(0);
  });

  it('renders the remove button only on input chips', () => {
    host.removable.set(true);
    host.type.set('assist');
    fixture.detectChanges();
    expect(chips[0].querySelector('.gui-chip-remove')).toBeNull();

    host.type.set('input');
    fixture.detectChanges();
    expect(chips[0].querySelector('.gui-chip-remove')).not.toBeNull();
  });

  it('disables every chip when the set is disabled', () => {
    host.select.set('multiple');
    host.type.set('filter');
    host.value.set([]);
    host.setDisabled.set(true);
    fixture.detectChanges();

    for (const chip of chips) {
      expect(chip.getAttribute('aria-disabled')).toBe('true');
      expect(chip.classList.contains('gui-disabled')).toBe(true);
    }
    // Activating a disabled chip is a no-op.
    chips[0].click();
    fixture.detectChanges();
    expect(host.value()).toEqual([]);
  });

  it('reflects the elevated input as data-elevated', () => {
    expect(chips[0].hasAttribute('data-elevated')).toBe(false);
    host.elevated.set(true);
    fixture.detectChanges();
    expect(chips[0].hasAttribute('data-elevated')).toBe(true);
  });

  it('renders the filter trailing-icon slot', () => {
    const f = TestBed.createComponent(TrailingHost);
    f.detectChanges();
    flush();
    const trailing = f.nativeElement.querySelector('.gui-chip-trailing .trail');
    expect(trailing).not.toBeNull();
  });

  it('implements getLabel so roving type-ahead does not throw (FocusableOption)', () => {
    const instances = fixture.debugElement
      .queryAll(By.directive(ChipComponent))
      .map((d) => d.componentInstance as ChipComponent);
    expect(instances.map((c) => c.getLabel())).toEqual(['A', 'B']);
  });
});
