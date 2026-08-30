import { describe, it, expect, vi } from 'vitest';
import {
  generateConcertCardHtml,
  createConcertCardElement,
} from '../../src/components/ConcertCard/ConcertCard';
import { ConcertStatus, type Concert } from '../../src/models';

describe('ConcertCard Component', () => {
  const baseConcert: Concert = {
    id: '101',
    title: 'Sex Pistols Tribute',
    band: 'Never Mind The Bands',
    date: new Date(2026, 9, 20),
    time: '22:00',
    status: ConcertStatus.SCHEDULED,
    imageUrl: '/images/punk1.png',
  };

  it('debe generar HTML de fallback si el objeto concert no está definido', () => {
    // @ts-expect-error testing null
    const html = generateConcertCardHtml(null);
    expect(html).toContain('Concert information unavailable');
  });

  it('debe generar HTML correcto para un concierto SCHEDULED', () => {
    const html = generateConcertCardHtml(baseConcert);
    expect(html).toContain('Sex Pistols Tribute');
    expect(html).toContain('Never Mind The Bands');
    expect(html).toContain('Confirmed');
    expect(html).toContain('Book Tickets');
  });

  it('debe generar HTML correcto para un concierto LIVE', () => {
    const liveConcert: Concert = { ...baseConcert, status: ConcertStatus.LIVE };
    const html = generateConcertCardHtml(liveConcert);
    expect(html).toContain('LIVE NOW ⚡');
    expect(html).toContain('Watch Live Stream');
  });

  it('debe generar HTML correcto para un concierto SOLD_OUT', () => {
    const soldOutConcert: Concert = { ...baseConcert, status: ConcertStatus.SOLD_OUT };
    const html = generateConcertCardHtml(soldOutConcert);
    expect(html).toContain('Sold Out');
    expect(html).toContain('disabled');
  });

  it('debe generar HTML correcto para un concierto FINISHED', () => {
    const finishedConcert: Concert = { ...baseConcert, status: ConcertStatus.FINISHED };
    const html = generateConcertCardHtml(finishedConcert);
    expect(html).toContain('Concluded');
    expect(html).toContain('Gig Concluded');
    expect(html).toContain('disabled');
  });

  it('debe generar HTML correcto para un concierto CANCELLED', () => {
    const cancelledConcert: Concert = { ...baseConcert, status: ConcertStatus.CANCELLED };
    const html = generateConcertCardHtml(cancelledConcert);
    expect(html).toContain('Cancelled');
    expect(html).toContain('Gig Cancelled');
    expect(html).toContain('disabled');
  });

  it('debe manejar un estado desconocido (default case)', () => {
    const unknownConcert: Concert = {
      ...baseConcert,
      // @ts-expect-error testing custom status string
      status: 'CUSTOM_STATUS',
    };
    const html = generateConcertCardHtml(unknownConcert);
    expect(html).toContain('CUSTOM_STATUS');
    expect(html).toContain('View Details');
  });

  it('debe usar valores por defecto cuando faltan propiedades opcionales', () => {
    const minimalConcert: Concert = {
      id: '',
      title: '',
      band: '',
      date: new Date('invalid'),
      status: ConcertStatus.SCHEDULED,
    };
    const html = generateConcertCardHtml(minimalConcert);
    expect(html).toContain('Untitled Gig');
    expect(html).toContain('TBA Band');
    expect(html).toContain('/images/punk1.png');
  });

  it('debe crear un elemento DOM seguro con createConcertCardElement y disparar onSelect y onOpenDetail', () => {
    const onSelect = vi.fn();
    const onOpenDetail = vi.fn();
    const el = createConcertCardElement(baseConcert, onSelect, onOpenDetail);
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.tagName).toBe('ARTICLE');
    expect(el.getAttribute('data-id')).toBe('101');

    const bookBtn = el.querySelector<HTMLButtonElement>('.btn-book-ticket');
    expect(bookBtn).not.toBeNull();
    bookBtn?.click();
    expect(onSelect).toHaveBeenCalledWith(baseConcert);

    const detailBtn = el.querySelector<HTMLButtonElement>('.btn-view-detail');
    detailBtn?.click();
    expect(onOpenDetail).toHaveBeenCalledWith(baseConcert);

    const cover = el.querySelector<HTMLElement>('.card-cover-trigger');
    cover?.click();
    expect(onOpenDetail).toHaveBeenCalledTimes(2);
  });

  it('debe recurrir a onSelect si onOpenDetail no está definido al hacer click en el trigger de detalle', () => {
    const onSelect = vi.fn();
    const el = createConcertCardElement(baseConcert, onSelect);
    const detailBtn = el.querySelector<HTMLButtonElement>('.btn-view-detail');
    detailBtn?.click();
    expect(onSelect).toHaveBeenCalledWith(baseConcert);
  });

  it('debe retornar fallback UI si ocurre un error inesperado al crear el elemento', () => {
    const throwingConcert = {
      get id() {
        throw new Error('Render error');
      },
    } as unknown as Concert;

    const fallbackEl = createConcertCardElement(throwingConcert);
    expect(fallbackEl).toBeInstanceOf(HTMLElement);
    expect(fallbackEl.innerHTML).toContain('Failed to load this gig.');
  });
});
