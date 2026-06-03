import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RadioComponent } from './radio';
import { RadioGroupComponent } from './radio-group';

@Component({
  template: `<gui-radio-group [(value)]="value">
    <gui-radio value="a">A</gui-radio>
    <gui-radio value="b">B</gui-radio>
    <gui-radio value="c" [disabled]="cDisabled()">C</gui-radio>
  </gui-radio-group>`,
  imports: [RadioGroupComponent, RadioComponent],
})
class HostComponent {
  value = signal<string | null>(null);
  cDisabled = signal(false);
}

@Component({
  template: `<gui-radio-group [formControl]="control">
    <gui-radio value="a">A</gui-radio>
    <gui-radio value="b">B</gui-radio>
  </gui-radio-group>`,
  imports: [RadioGroupComponent, RadioComponent, ReactiveFormsModule],
})
class ReactiveHostComponent {
  control = new FormControl<string | null>(null);
}

describe('RadioComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let group: HTMLElement;
  let radios: HTMLElement[];
  let inputs: HTMLInputElement[];

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    group = fixture.nativeElement.querySelector(
      'gui-radio-group',
    ) as HTMLElement;
    radios = Array.from(
      fixture.nativeElement.querySelectorAll('gui-radio'),
    ) as HTMLElement[];
    inputs = Array.from(
      fixture.nativeElement.querySelectorAll('input[type=radio]'),
    ) as HTMLInputElement[];
  });

  it('should create three radios', () => {
    expect(inputs.length).toBe(3);
  });

  it('exposes role="radiogroup" on the group and role=radio on inputs', () => {
    expect(group.getAttribute('role')).toBe('radiogroup');
    for (const input of inputs) {
      expect(input.type).toBe('radio');
    }
  });

  it('shares a single generated name across the radios', () => {
    const names = new Set(inputs.map((i) => i.name));
    expect(names.size).toBe(1);
    expect([...names][0]).toMatch(/^gui-radio-\d+$/);
  });

  it('selecting one updates the group value and unchecks the others', () => {
    inputs[1].click();
    fixture.detectChanges();

    expect(host.value()).toBe('b');
    expect(inputs[1].checked).toBe(true);
    expect(inputs[0].checked).toBe(false);
    expect(inputs[2].checked).toBe(false);

    inputs[0].click();
    fixture.detectChanges();

    expect(host.value()).toBe('a');
    expect(inputs[0].checked).toBe(true);
    expect(inputs[1].checked).toBe(false);
  });

  it('does not change value when a disabled radio is clicked', () => {
    host.cDisabled.set(true);
    fixture.detectChanges();

    expect(inputs[2].disabled).toBe(true);

    inputs[2].click();
    fixture.detectChanges();

    expect(host.value()).toBeNull();
  });

  describe('reactive forms', () => {
    let reactiveFixture: ComponentFixture<ReactiveHostComponent>;
    let reactiveHost: ReactiveHostComponent;
    let reactiveInputs: HTMLInputElement[];

    beforeEach(() => {
      reactiveFixture = TestBed.createComponent(ReactiveHostComponent);
      reactiveHost = reactiveFixture.componentInstance;
      reactiveFixture.detectChanges();
      reactiveInputs = Array.from(
        reactiveFixture.nativeElement.querySelectorAll('input[type=radio]'),
      ) as HTMLInputElement[];
    });

    it('writeValue selects the matching radio from the control', () => {
      reactiveHost.control.setValue('b');
      reactiveFixture.detectChanges();

      expect(reactiveInputs[1].checked).toBe(true);
      expect(reactiveInputs[0].checked).toBe(false);
    });

    it('clicking a radio writes the value back to the control', () => {
      reactiveInputs[0].click();
      reactiveFixture.detectChanges();

      expect(reactiveHost.control.value).toBe('a');
    });

    it('disabling the control disables every radio input', () => {
      reactiveHost.control.disable();
      reactiveFixture.detectChanges();

      for (const input of reactiveInputs) {
        expect(input.disabled).toBe(true);
      }
    });
  });
});
