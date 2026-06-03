import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChipComponent, GuiChipType } from './chip';
import { ChipSetComponent, GuiChipSelect } from './chip-set';

@Component({
  template: `<gui-chip-set [select]="select()" [(value)]="value">
    <gui-chip
      [type]="type()"
      value="a"
      label="A"
      [removable]="removable()"
      [elevated]="elevated()"
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
  value = signal<string | string[] | null>(null);
  removed = 0;
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
    set = fixture.nativeElement.querySelector('gui-chip-set') as HTMLElement;
    chips = Array.from(
      fixture.nativeElement.querySelectorAll('gui-chip'),
    ) as HTMLElement[];
  });

  it('exposes the grid/row/gridcell roles', () => {
    expect(set.getAttribute('role')).toBe('grid');
    expect(set.querySelector('[role="row"]')).not.toBeNull();
    for (const chip of chips) {
      expect(chip.getAttribute('role')).toBe('gridcell');
      expect(chip.getAttribute('tabindex')).toBe('-1');
    }
  });

  it('toggles a filter chip and updates the set value', () => {
    host.select.set('multiple');
    host.type.set('filter');
    host.value.set([]);
    fixture.detectChanges();

    const primary = chips[0].querySelector(
      'button.gui-chip-primary',
    ) as HTMLButtonElement;
    expect(primary.getAttribute('role')).toBe('checkbox');
    expect(primary.getAttribute('aria-checked')).toBe('false');

    primary.click();
    fixture.detectChanges();

    expect(host.value()).toEqual(['a']);
    expect(chips[0].hasAttribute('data-selected')).toBe(true);
    expect(primary.getAttribute('aria-checked')).toBe('true');
  });

  it('emits remove when Delete is pressed on a removable chip', () => {
    host.removable.set(true);
    host.type.set('input');
    fixture.detectChanges();

    const event = new KeyboardEvent('keydown', { key: 'Delete', bubbles: true });
    chips[0].dispatchEvent(event);
    fixture.detectChanges();

    expect(host.removed).toBe(1);
  });

  it('reflects the elevated input as data-elevated', () => {
    expect(chips[0].hasAttribute('data-elevated')).toBe(false);

    host.elevated.set(true);
    fixture.detectChanges();

    expect(chips[0].hasAttribute('data-elevated')).toBe(true);
  });
});
