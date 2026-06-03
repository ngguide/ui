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
    it('assigns static arranged sizes (no per-scroll morph) (Req 15)', () => {
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
      // Focal item is large; a trailing item collapses to the small keyline.
      expect(items[0].style.width).toBe('186px');
      expect(parseFloat(items[5].style.width)).toBeLessThanOrEqual(56);
    });
  });
});
