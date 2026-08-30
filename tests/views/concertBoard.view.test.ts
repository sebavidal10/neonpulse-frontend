import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConcertBoardView } from '../../src/views/concertBoard.view';
import { ConcertStatus, type Concert } from '../../src/models';
import * as FeaturedBannerModule from '../../src/components/FeaturedBanner/FeaturedBanner';
import * as ConcertCardModule from '../../src/components/ConcertCard/ConcertCard';

describe('ConcertBoardView', () => {
  let bannerContainer: HTMLElement;
  let carteleraContainer: HTMLElement;
  let contadorFechasContainer: HTMLElement;

  const mockConcerts: Concert[] = [
    {
      id: '1',
      title: 'Featured Concert',
      band: 'Band A',
      date: new Date(),
      status: ConcertStatus.LIVE,
      isFeatured: true,
      ticketPrice: 25000,
    },
    {
      id: '2',
      title: 'Grid Concert 1',
      band: 'Band B',
      date: new Date(),
      status: ConcertStatus.SCHEDULED,
      ticketPrice: 25000,
    },
    {
      id: '3',
      title: 'Grid Concert 2',
      band: 'Band C',
      date: new Date(),
      status: ConcertStatus.SCHEDULED,
      ticketPrice: 25000,
    },
  ];

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="contenedor-destacado"></div>
      <span id="contador-fechas"></span>
      <div id="contenedor-cartelera"></div>
    `;

    bannerContainer = document.getElementById('contenedor-destacado')!;
    carteleraContainer = document.getElementById('contenedor-cartelera')!;
    contadorFechasContainer = document.getElementById('contador-fechas')!;
  });

  it('debe mostrar esqueletos de carga con showLoading', () => {
    const view = new ConcertBoardView();
    view.showLoading();

    expect(contadorFechasContainer.innerHTML).toContain('Loading gigs...');
    expect(bannerContainer.children.length).toBe(1);
    expect(carteleraContainer.children.length).toBe(3);
  });

  it('debe renderizar conciertos correctamente y actualizar el contador en plural', () => {
    const view = new ConcertBoardView();
    view.renderConcerts(mockConcerts);

    expect(contadorFechasContainer.innerHTML).toContain('3 Confirmed Dates');
    expect(bannerContainer.children.length).toBe(1);
    expect(carteleraContainer.children.length).toBe(2);
  });

  it('debe utilizar la forma singular en el contador cuando hay 1 solo concierto', () => {
    const view = new ConcertBoardView();
    view.renderConcerts([mockConcerts[0]]);

    expect(contadorFechasContainer.innerHTML).toContain('1 Confirmed Date');
  });

  it('debe retornar temprano sin lanzar excepción si no existe el contenedor de cartelera', () => {
    document.body.innerHTML = '';
    const view = new ConcertBoardView();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    view.renderConcerts(mockConcerts);
    expect(consoleSpy).toHaveBeenCalledWith(
      '[NeonPulse] Critical error: "#contenedor-cartelera" not found in DOM.',
    );

    consoleSpy.mockRestore();
  });

  it('debe limpiar el banner si createFeaturedBannerElement lanza un error', () => {
    const spy = vi
      .spyOn(FeaturedBannerModule, 'createFeaturedBannerElement')
      .mockImplementationOnce(() => {
        throw new Error('Banner render error');
      });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const view = new ConcertBoardView();
    view.renderConcerts(mockConcerts);

    expect(bannerContainer.children.length).toBe(0);

    spy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('debe registrar error en consola si falla el renderizado de una tarjeta de concierto individual', () => {
    const spy = vi
      .spyOn(ConcertCardModule, 'createConcertCardElement')
      .mockImplementationOnce(() => {
        throw new Error('Card error');
      });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const view = new ConcertBoardView();
    view.renderConcerts(mockConcerts);

    expect(consoleSpy).toHaveBeenCalled();

    spy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('debe renderizar el estado vacío con showEmpty', () => {
    const view = new ConcertBoardView();
    view.showEmpty();

    expect(contadorFechasContainer.innerHTML).toContain('0 Confirmed Dates');
    expect(bannerContainer.children.length).toBe(0);
    expect(carteleraContainer.innerHTML).toContain('No Concerts Found');
  });

  it('debe renderizar el estado de error con showError', () => {
    const view = new ConcertBoardView();
    const onRetry = vi.fn();
    view.showError('Network Error', onRetry);

    expect(contadorFechasContainer.innerHTML).toContain('0 Confirmed Dates');
    expect(bannerContainer.children.length).toBe(0);
    expect(carteleraContainer.innerHTML).toContain('Network Error');
  });

  it('debe comportarse de forma segura si los elementos del DOM son nulos al llamar showLoading, showEmpty y showError', () => {
    document.body.innerHTML = '';
    const view = new ConcertBoardView();

    expect(() => {
      view.showLoading();
      view.showEmpty();
      view.showError('Error test');
    }).not.toThrow();
  });

  it('debe despachar evento neonpulse:add-to-cart al llamar selectConcert', () => {
    let capturedConcert: Concert | null = null;
    window.addEventListener('neonpulse:add-to-cart', (e: any) => {
      capturedConcert = e.detail?.concert;
    });

    const view = new ConcertBoardView();
    view.selectConcert(mockConcerts[1]);

    expect(capturedConcert).not.toBeNull();
    expect(capturedConcert!.id).toBe(mockConcerts[1].id);
  });

  it('debe navegar a la vista de detalle con openConcertDetail', () => {
    let navigatedEvent: any = null;
    window.addEventListener('neonpulse:navigate', (e: any) => {
      navigatedEvent = e.detail;
    });

    const view = new ConcertBoardView();
    view.openConcertDetail(mockConcerts[0]);

    expect(navigatedEvent).not.toBeNull();
    expect(navigatedEvent.view).toBe('detail');
    expect(navigatedEvent.concert.id).toBe(mockConcerts[0].id);
  });
});
