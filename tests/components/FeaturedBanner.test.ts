import { describe, it, expect } from 'vitest';
import { createFeaturedBannerElement } from '../../src/components/FeaturedBanner/FeaturedBanner';
import { ConcertStatus, type Concert } from '../../src/models';

describe('FeaturedBanner Component', () => {
  const featuredConcert: Concert = {
    id: '1',
    title: 'London Calling Festival',
    band: 'The Clash',
    date: new Date(2026, 7, 14),
    time: '21:30',
    status: ConcertStatus.LIVE,
    imageUrl: '/images/punk1.png',
    isFeatured: true,
  };

  it('debe crear un elemento de banner destacado completo', () => {
    const el = createFeaturedBannerElement(featuredConcert);
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.tagName).toBe('SECTION');
    expect(el.innerHTML).toContain('London Calling Festival');
    expect(el.innerHTML).toContain('The Clash');
    expect(el.innerHTML).toContain('21:30 hrs');
    expect(el.innerHTML).toContain('HEADLINER PUNK');
    expect(el.innerHTML).toContain('EN VIVO AHORA');
  });

  it('debe utilizar fallbacks cuando faltan propiedades en el concierto', () => {
    const minimalConcert: Concert = {
      id: '2',
      title: '',
      band: '',
      date: new Date('invalid'),
      status: ConcertStatus.SCHEDULED,
    };
    const el = createFeaturedBannerElement(minimalConcert);
    expect(el.innerHTML).toContain('Evento Destacado');
    expect(el.innerHTML).toContain('Artista por confirmar');
    expect(el.innerHTML).toContain('Por confirmar');
    expect(el.innerHTML).toContain('/images/punk1.png');
  });
});
