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

  it('seeds the first item as the only tab stop and labels position/total', () => {
    const fixture = TestBed.createComponent(CarouselHost);
    fixture.detectChanges();
    flush();
    const items = Array.from(
      fixture.nativeElement.querySelectorAll('gui-carousel-item'),
    ) as HTMLElement[];
    // Exactly one roving tab stop (the first item); the rest are -1.
    expect(items[0].getAttribute('tabindex')).toBe('0');
    expect(items.slice(1).every((el) => el.getAttribute('tabindex') === '-1'))
      .toBe(true);
    // Each item conveys its 1-based position and the total count.
    expect(items[0].getAttribute('aria-posinset')).toBe('1');
    expect(items[0].getAttribute('aria-setsize')).toBe('6');
    expect(items[0].getAttribute('aria-label')).toBe('Item 1 of 6');
    expect(items[5].getAttribute('aria-label')).toBe('Item 6 of 6');
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

  it('assigns item widths from the engine after layout (Req 11.2)', () => {
    const fixture = TestBed.createComponent(CarouselHost);
    fixture.detectChanges();
    flush();
    const carousel = fixture.debugElement.children[0]
      .componentInstance as GuiCarousel;
    // jsdom does not compute layout, so drive a viewport width explicitly.
    (carousel as unknown as { measure(w: number): void }).measure(412);
    fixture.detectChanges();

    const items = Array.from(
      fixture.nativeElement.querySelectorAll('gui-carousel-item'),
    ) as HTMLElement[];
    // Focal item renders at the large width (186px).
    expect(items[0].style.width).toBe('186px');
    // A distant item is narrower than the focal one.
    expect(parseFloat(items[5].style.width)).toBeLessThan(186);
  });

  it('sizes uncontained items uniformly (no per-scroll morph) (Req 11.2)', () => {
    const fixture = TestBed.createComponent(CarouselHost);
    fixture.componentInstance.layout.set('uncontained');
    fixture.detectChanges();
    flush();
    const carousel = fixture.debugElement.children[0]
      .componentInstance as GuiCarousel;
    (carousel as unknown as { measure(w: number): void }).measure(412);
    fixture.detectChanges();
    const widths = Array.from(
      fixture.nativeElement.querySelectorAll('gui-carousel-item'),
    ).map((el) => (el as HTMLElement).style.width);
    // Every item is the same (large) width — the trailing item is cut by the
    // container's overflow, not resized down per keyline.
    expect(new Set(widths).size).toBe(1);
    expect(parseFloat(widths[0])).toBeGreaterThan(56);
  });

  it('renders full-screen items without an engine width (CSS fills them)', () => {
    const fixture = TestBed.createComponent(CarouselHost);
    fixture.componentInstance.layout.set('full-screen');
    fixture.detectChanges();
    flush();
    const carousel = fixture.debugElement.children[0]
      .componentInstance as GuiCarousel;
    (carousel as unknown as { measure(w: number): void }).measure(360);
    fixture.detectChanges();
    const item = fixture.nativeElement.querySelector(
      'gui-carousel-item',
    ) as HTMLElement;
    expect(item.style.width).toBe('');
  });

  describe('reduced motion', () => {
    it('makes every item the same (large) size with no morph (Req 15)', () => {
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
      (carousel as unknown as { measure(w: number): void }).measure(412);
      fixture.detectChanges();
      const items = Array.from(
        fixture.nativeElement.querySelectorAll('gui-carousel-item'),
      ) as HTMLElement[];
      const widths = items.map((el) => el.style.width);
      // M3: under reduced motion all items are the same size (no staggered
      // large/medium/small) and no per-scroll expansion.
      expect(new Set(widths).size).toBe(1);
      expect(widths[0]).toBe('186px');
    });
  });
});
