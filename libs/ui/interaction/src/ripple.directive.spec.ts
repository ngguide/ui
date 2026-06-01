import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GuiRippleDirective } from './ripple.directive';
import { GuiReducedMotion } from './reduced-motion';

@Component({
  template: `<div guiRipple [disabled]="disabled()"></div>`,
  imports: [GuiRippleDirective],
})
class HostComponent {
  readonly disabled = signal(false);
}

describe('GuiRippleDirective', () => {
  let animateSpy: ReturnType<typeof vi.fn>;
  let originalAnimate: typeof Element.prototype.animate;

  beforeEach(() => {
    originalAnimate = Element.prototype.animate;
    // jsdom has no real WAAP; stub a settled Animation so cleanup can run.
    animateSpy = vi.fn(
      () =>
        ({
          finished: Promise.resolve(),
          cancel: () => undefined,
        }) as unknown as Animation,
    );
    Element.prototype.animate =
      animateSpy as unknown as typeof Element.prototype.animate;
  });

  afterEach(() => {
    Element.prototype.animate = originalAnimate;
  });

  function setup(opts?: { reducedMotion?: boolean }) {
    TestBed.configureTestingModule({
      providers: opts?.reducedMotion
        ? [
            {
              provide: GuiReducedMotion,
              useValue: { prefersReducedMotion: () => true },
            },
          ]
        : [],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('div') as HTMLElement;
    return { fixture, host: fixture.componentInstance, el };
  }

  it('appends a ripple on pointer activation and removes it after the animation (Req 2.1, 2.7)', async () => {
    const { el } = setup();

    el.dispatchEvent(new MouseEvent('pointerdown', { clientX: 10, clientY: 10 }));
    expect(el.querySelectorAll('.gui-ripple').length).toBe(1);
    expect(animateSpy).toHaveBeenCalledTimes(1);

    // Let the settled Animation.finished microtask run the cleanup.
    await Promise.resolve();
    await Promise.resolve();
    expect(el.querySelectorAll('.gui-ripple').length).toBe(0);
  });

  it('produces a centered ripple on keyboard activation (Req 2.2)', () => {
    const { el } = setup();

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(el.querySelectorAll('.gui-ripple').length).toBe(1);
    expect(animateSpy).toHaveBeenCalledTimes(1);
  });

  it('does not animate when disabled (Req 4.2)', () => {
    const { host, fixture, el } = setup();

    host.disabled.set(true);
    fixture.detectChanges();

    el.dispatchEvent(new MouseEvent('pointerdown', { clientX: 5, clientY: 5 }));
    expect(animateSpy).not.toHaveBeenCalled();
    expect(el.querySelectorAll('.gui-ripple').length).toBe(0);
  });

  it('does not animate when reduced motion is preferred (Req 5.1)', () => {
    const { el } = setup({ reducedMotion: true });

    el.dispatchEvent(new MouseEvent('pointerdown', { clientX: 5, clientY: 5 }));
    expect(animateSpy).not.toHaveBeenCalled();
    expect(el.querySelectorAll('.gui-ripple').length).toBe(0);
  });
});
