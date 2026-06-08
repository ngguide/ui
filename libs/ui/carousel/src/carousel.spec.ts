import { ApplicationRef, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MediaMatcher } from '@angular/cdk/layout';
import { GuiCarousel } from './carousel';
import { GuiCarouselItem } from './carousel-item';
import { GuiCarouselLayout } from './carousel-keylines';

@Component({
  imports: [GuiCarousel, GuiCarouselItem],
  template: `
    <gui-carousel [layout]="layout()" [preferredLargeWidth]="186">
      @for (n of items; track n) {
        <gui-carousel-item>{{ n }}</gui-carousel-item>
      }
    </gui-carousel>
  `,
})
class CarouselHost {
  readonly layout = signal<GuiCarouselLayout>('multi-browse');
  readonly items = [1, 2, 3, 4, 5, 6];
}

function flush(): void {
  TestBed.inject(ApplicationRef).tick();
}

function itemEls(fixture: { nativeElement: HTMLElement }): HTMLElement[] {
  return Array.from(
    fixture.nativeElement.querySelectorAll('gui-carousel-item'),
  ) as HTMLElement[];
}

describe('GuiCarousel', () => {
  it('exposes the carousel role and reflects the layout (Req 11.1, 14)', () => {
    const fixture = TestBed.createComponent(CarouselHost);
    fixture.componentInstance.layout.set('hero');
    fixture.detectChanges();
    flush();
    const carousel = fixture.nativeElement.querySelector('gui-carousel');
    expect(carousel.getAttribute('role')).toBe('group');
    expect(carousel.getAttribute('aria-roledescription')).toBe('carousel');
    expect(carousel.getAttribute('data-layout')).toBe('hero');
  });

  it('makes every item Tab-reachable and labels position/total (M3 keyboard + a11y)', () => {
    const fixture = TestBed.createComponent(CarouselHost);
    fixture.detectChanges();
    flush();
    const items = itemEls(fixture);
    // M3: Tab AND arrows navigate items, so every item is in the tab order.
    expect(items.every((el) => el.getAttribute('tabindex') === '0')).toBe(true);
    // Each item conveys its 1-based position and the total count.
    expect(items[0].getAttribute('aria-label')).toBe('Item 1 of 6');
    expect(items[5].getAttribute('aria-label')).toBe('Item 6 of 6');
    expect(items[0].getAttribute('role')).toBe('group');
    expect(items[0].getAttribute('aria-roledescription')).toBe('carousel item');
  });

  it('emits the activated item on click and Enter, but not when disabled', () => {
    @Component({
      imports: [GuiCarousel, GuiCarouselItem],
      template: `
        <gui-carousel (activated)="onActivate($event)">
          <gui-carousel-item>a</gui-carousel-item>
          <gui-carousel-item [disabled]="true">b</gui-carousel-item>
        </gui-carousel>
      `,
    })
    class ActivateHost {
      readonly activated: GuiCarouselItem[] = [];
      onActivate(item: GuiCarouselItem): void {
        this.activated.push(item);
      }
    }
    const fixture = TestBed.createComponent(ActivateHost);
    fixture.detectChanges();
    flush();
    const items = Array.from(
      fixture.nativeElement.querySelectorAll('gui-carousel-item'),
    ) as HTMLElement[];
    items[0].click();
    expect(fixture.componentInstance.activated.length).toBe(1);
    // Disabled item never activates.
    items[1].click();
    expect(fixture.componentInstance.activated.length).toBe(1);
    expect(items[1].getAttribute('aria-disabled')).toBe('true');
  });

  it('moves focus between items with the arrow keys (Req 14)', () => {
    const fixture = TestBed.createComponent(CarouselHost);
    fixture.detectChanges();
    flush();
    const items = itemEls(fixture);
    items[0].focus();
    items[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
    expect(document.activeElement).toBe(items[1]);
    items[1].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
    );
    expect(document.activeElement).toBe(items[0]);
  });

  it('leaves the carousel on Up/Down in a horizontal layout (no focus trap)', () => {
    const fixture = TestBed.createComponent(CarouselHost);
    fixture.detectChanges();
    flush();
    const items = itemEls(fixture);
    items[1].focus();
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    items[1].dispatchEvent(event);
    // The carousel must NOT consume Up/Down — focus stays put so the browser
    // can move it out of the carousel.
    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(items[1]);
  });

  it('assigns item widths from the engine after measuring (Req 11.2)', () => {
    const fixture = TestBed.createComponent(CarouselHost);
    fixture.detectChanges();
    flush();
    const carousel = fixture.debugElement.children[0]
      .componentInstance as GuiCarousel;
    // jsdom does not compute layout, so drive a viewport width explicitly.
    (carousel as unknown as { measure(w: number): void }).measure(1022);
    fixture.detectChanges();
    flush();
    const items = itemEls(fixture);
    // Focal item renders at the large width (186px); a distant item is smaller.
    expect(items[0].style.width).toBe('186px');
    expect(parseFloat(items[5].style.width)).toBeLessThan(186);
  });

  describe('reduced motion', () => {
    it('falls back to a uniform (large) flow with no morph (Req 15)', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          {
            provide: MediaMatcher,
            useValue: {
              matchMedia: (q: string) => ({
                matches: q.includes('prefers-reduced-motion'),
              }),
            },
          },
        ],
      });
      const fixture = TestBed.createComponent(CarouselHost);
      fixture.detectChanges();
      flush();
      const carousel = fixture.debugElement.children[0]
        .componentInstance as GuiCarousel;
      (carousel as unknown as { measure(w: number): void }).measure(1022);
      fixture.detectChanges();
      flush();
      const carouselEl = fixture.nativeElement.querySelector('gui-carousel');
      // Reduced motion uses the uniform flow mode (no per-scroll morph).
      expect(carouselEl.getAttribute('data-mode')).toBe('flow');
      const widths = itemEls(fixture).map((el) => el.style.width);
      // Every item is the same (large) size.
      expect(new Set(widths).size).toBe(1);
      expect(widths[0]).toBe('186px');
    });
  });
});
