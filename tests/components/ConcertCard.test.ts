import { describe, it, expect, vi } from 'vitest';
import {
  generateConcertCardHtml,
  createConcertCardElement,
} from '../../src/components/ConcertCard/ConcertCard';
import { ConcertStatus, type Concert } from '../../src/models';
import * as ConcertCardModule from '../../src/components/ConcertCard/ConcertCard';

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
    expect(html).toContain('Información de concierto no disponible');
  });

  it('debe generar HTML correcto para un concierto SCHEDULED', () => {
    const html = generateConcertCardHtml(baseConcert);
    expect(html).toContain('Sex Pistols Tribute');
    expect(html).toContain('Never Mind The Bands');
    expect(html).toContain('Programado');
    expect(html).toContain('Comprar Entradas');
    expect(html).toContain('22:00 hrs');
  });

  it('debe generar HTML correcto para un concierto LIVE', () => {
    const liveConcert: Concert = { ...baseConcert, status: ConcertStatus.LIVE };
    const html = generateConcertCardHtml(liveConcert);
    expect(html).toContain('EN VIVO ⚡');
    expect(html).toContain('Ver Transmisión');
  });

  it('debe generar HTML correcto para un concierto FINISHED', () => {
    const finishedConcert: Concert = { ...baseConcert, status: ConcertStatus.FINISHED };
    const html = generateConcertCardHtml(finishedConcert);
    expect(html).toContain('Finalizado');
    expect(html).toContain('Show Finalizado');
    expect(html).toContain('disabled');
  });

  it('debe generar HTML correcto para un concierto CANCELLED', () => {
    const cancelledConcert: Concert = { ...baseConcert, status: ConcertStatus.CANCELLED };
    const html = generateConcertCardHtml(cancelledConcert);
    expect(html).toContain('Cancelado');
    expect(html).toContain('Show Cancelado');
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
    expect(html).toContain('Ver Detalles');
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
    expect(html).toContain('Concierto sin título');
    expect(html).toContain('Artista por confirmar');
    expect(html).toContain('Por confirmar');
    expect(html).toContain('/images/punk1.png');
  });

  it('debe crear un elemento DOM seguro con createConcertCardElement', () => {
    const el = createConcertCardElement(baseConcert);
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.tagName).toBe('ARTICLE');
    expect(el.getAttribute('data-id')).toBe('101');
  });

  it('debe retornar fallback UI si ocurre un error inesperado al crear el elemento', () => {
    const throwingConcert = {
      get id() {
        throw new Error('Render error');
      },
    } as unknown as Concert;

    const fallbackEl = createConcertCardElement(throwingConcert);
    expect(fallbackEl).toBeInstanceOf(HTMLElement);
    expect(fallbackEl.innerHTML).toContain('No se pudo cargar esta tocata.');
  });

  it('debe retornar fallback UI si createConcertCardElement lanza un error por elemento nulo generado', () => {
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'div') {
        const div = originalCreateElement('div');
        Object.defineProperty(div, 'firstElementChild', {
          get: () => null,
          configurable: true
        });
        return div;
      }
      return originalCreateElement(tagName);
    });
    const fallbackEl = createConcertCardElement(baseConcert);
    expect(fallbackEl).toBeInstanceOf(HTMLElement);
    expect(fallbackEl.innerHTML).toContain('No se pudo cargar esta tocata.');
    createElementSpy.mockRestore();
  });
});

