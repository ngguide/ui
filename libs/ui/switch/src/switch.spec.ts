import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SwitchComponent } from './switch';

@Component({
  template: `<gui-switch [(checked)]="checked" [disabled]="disabled()"
    >Label</gui-switch
  >`,
  imports: [SwitchComponent],
})
class HostComponent {
  checked = signal<boolean | null>(false);
  disabled = signal(false);
}

@Component({
  template: `<gui-switch [(checked)]="checked" aria-label="Airplane mode" />`,
  imports: [SwitchComponent],
})
class AriaLabelHostComponent {
  checked = signal<boolean | null>(false);
}

describe('SwitchComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let switchEl: HTMLElement;
  let input: HTMLInputElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    switchEl = fixture.nativeElement.querySelector('gui-switch') as HTMLElement;
    input = fixture.nativeElement.querySelector(
      'input[type=checkbox]',
    ) as HTMLInputElement;
  });

  it('exposes role="switch" on the inner input', () => {
    expect(input.getAttribute('role')).toBe('switch');
  });

  it('toggles on/off and reflects aria-checked on click', () => {
    expect(host.checked()).toBe(false);
    expect(input.getAttribute('aria-checked')).toBe('false');

    input.click();
    fixture.detectChanges();

    expect(host.checked()).toBe(true);
    expect(input.getAttribute('aria-checked')).toBe('true');

    input.click();
    fixture.detectChanges();

    expect(host.checked()).toBe(false);
    expect(input.getAttribute('aria-checked')).toBe('false');
  });

  it('toggles on Enter (M3 keyboard contract is Space or Enter)', () => {
    expect(host.checked()).toBe(false);

    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    fixture.detectChanges();

    expect(host.checked()).toBe(true);
    expect(input.getAttribute('aria-checked')).toBe('true');
  });

  it('scopes the state layer / focus ring / ripple to a 40dp .gui-switch-state circle, not the host', () => {
    // The interaction directives live on a dedicated element around the handle,
    // not on the host (so the tint/ring/ripple stay on the switch, not the label,
    // and FocusMonitor can watch keyboard focus on the nested input).
    const state = switchEl.querySelector('.gui-switch-state');
    expect(state).not.toBeNull();
    expect(state?.classList.contains('gui-state-layer')).toBe(true);
    expect(state?.classList.contains('gui-focus-ring')).toBe(true);
    expect(state?.classList.contains('gui-ripple-host')).toBe(true);
    // The host itself must NOT carry the interaction layer.
    expect(switchEl.classList.contains('gui-state-layer')).toBe(false);
    expect(switchEl.classList.contains('gui-focus-ring')).toBe(false);
  });

  it('toggles when the handle itself is clicked (the handle no longer absorbs the click)', () => {
    // Regression for the M3 hit-target bug: the handle used to paint over the
    // input and eat the click, so only the bare track toggled. It is now a
    // non-interactive child of the wrapping <label>, so clicking it activates
    // the input.
    const handle = switchEl.querySelector('.gui-switch-handle') as HTMLElement;
    expect(handle).not.toBeNull();

    handle.click();
    fixture.detectChanges();

    expect(host.checked()).toBe(true);
    expect(input.checked).toBe(true);
  });

  it('toggles when the adjacent text label is clicked', () => {
    const textLabel = switchEl.querySelector(
      'label.gui-switch-label',
    ) as HTMLLabelElement;

    textLabel.click();
    fixture.detectChanges();

    expect(host.checked()).toBe(true);
    expect(input.checked).toBe(true);
  });

  it('links the input to its adjacent label via for/id and names it via aria-labelledby', () => {
    const textLabel = switchEl.querySelector(
      'label.gui-switch-label',
    ) as HTMLLabelElement;

    expect(input.id).toBeTruthy();
    expect(textLabel.htmlFor).toBe(input.id);
    expect(textLabel.id).toBeTruthy();
    // aria-labelledby points at the visible text, so AT reads the UI text.
    expect(input.getAttribute('aria-labelledby')).toBe(textLabel.id);
    expect(input.getAttribute('aria-label')).toBeNull();
    expect(textLabel.textContent?.trim()).toBe('Label');
  });

  it('retints the selected state layer to the primary role (not on-surface)', () => {
    // M3: a selected switch's hover/focus/pressed state layer + ripple tint with
    // primary, not on-surface (Material Web md-switch selected-*-state-layer-color
    // = primary). The interaction overlay/ripple key off currentColor, so the
    // selected state must switch .gui-switch-state's color to the primary token.
    // jsdom cannot resolve a [data-checked]-driven computed color, so assert the
    // rule is present in the component's injected styles (mirrors radio/checkbox).
    const css = Array.from(document.querySelectorAll('style'))
      .map((s) => s.textContent ?? '')
      .join('\n');

    expect(css).toMatch(
      /\[data-checked\][^{]*\.gui-switch-state[^{]*\{[^}]*--md-sys-color-primary/,
    );
  });

  it('blocks toggling when disabled', () => {
    host.disabled.set(true);
    fixture.detectChanges();

    expect(input.disabled).toBe(true);

    input.click();
    fixture.detectChanges();

    expect(host.checked()).toBe(false);
  });

  describe('host aria-label delegation', () => {
    it('forwards a host aria-label onto the role=switch input and drops aria-labelledby', () => {
      const labelledFixture = TestBed.createComponent(AriaLabelHostComponent);
      labelledFixture.detectChanges();

      const labelledInput = labelledFixture.nativeElement.querySelector(
        'input[type=checkbox]',
      ) as HTMLInputElement;

      expect(labelledInput.getAttribute('aria-label')).toBe('Airplane mode');
      // aria-label provides the name, so the (empty) text label is not referenced.
      expect(labelledInput.getAttribute('aria-labelledby')).toBeNull();
    });
  });
});
