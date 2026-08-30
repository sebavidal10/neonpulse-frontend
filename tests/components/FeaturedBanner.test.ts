import { describe, it, expect, vi } from 'vitest';
import { createFeaturedBannerElement } from '../../src/components/FeaturedBanner/FeaturedBanner';
import { ConcertStatus, type Concert } from '../../src/models';

describe('FeaturedBanner Component', () => {
  const mockFeaturedConcert: Concert = {
    id: '99',
    title: 'The Exploited - Live in Santiago',
    band: 'The Exploited',
    date: new Date(2026, 11, 31),
    time: '23:00',
    status: ConcertStatus.LIVE,
    imageUrl: '/images/punk2.png',
    ticketPrice: 35000,
    isFeatured: true,
  };

  it('debe renderizar la información completa del concierto destacado', () => {
    const el = createFeaturedBannerElement(mockFeaturedConcert);
    expect(el.tagName).toBe('SECTION');
    expect(el.innerHTML).toContain('The Exploited - Live in Santiago');
    expect(el.innerHTML).toContain('The Exploited');
    expect(el.innerHTML).toContain('HEADLINER EVENT');
    expect(el.innerHTML).toContain('$35,000');
  });

  it('debe disparar onSelectConcert al hacer click en el botón de reservar', () => {
    const onSelect = vi.fn();
    const el = createFeaturedBannerElement(mockFeaturedConcert, onSelect);
    const button = el.querySelector<HTMLButtonElement>('#btn-featured-book');

    expect(button).not.toBeNull();
    button?.click();

    expect(onSelect).toHaveBeenCalledWith(mockFeaturedConcert);
  });

  it('debe disparar onOpenDetail al hacer click en el botón de ver detalles', () => {
    const onOpenDetail = vi.fn();
    const el = createFeaturedBannerElement(mockFeaturedConcert, undefined, onOpenDetail);
    const detailBtn = el.querySelector<HTMLButtonElement>('#btn-featured-detail');

    expect(detailBtn).not.toBeNull();
    detailBtn?.click();

    expect(onOpenDetail).toHaveBeenCalledWith(mockFeaturedConcert);
  });
});
