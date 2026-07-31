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
    },
    {
      id: '2',
      title: 'Grid Concert 1',
      band: 'Band B',
      date: new Date(),
      status: ConcertStatus.SCHEDULED,
    },
    {
      id: '3',
      title: 'Grid Concert 2',
      band: 'Band C',
      date: new Date(),
      status: ConcertStatus.SCHEDULED,
    },
  ];

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="contenedor-banner"></div>
      <span id="contador-fechas"></span>
      <div id="contenedor-cartelera"></div>
    `;

    bannerContainer = document.getElementById('contenedor-banner')!;
    carteleraContainer = document.getElementById('contenedor-cartelera')!;
    contadorFechasContainer = document.getElementById('contador-fechas')!;
  });

  it('debe mostrar esqueletos de carga con showLoading', () => {
    const view = new ConcertBoardView();
    view.showLoading();

    expect(contadorFechasContainer.innerHTML).toContain('Cargando fechas...');
    expect(bannerContainer.children.length).toBeGreaterThan(0);
    expect(carteleraContainer.children.length).toBe(3);
  });

  it('debe renderizar conciertos correctamente y actualizar el contador en plural', () => {
    const view = new ConcertBoardView();
    view.renderConcerts(mockConcerts);

    expect(contadorFechasContainer.innerHTML).toContain('3 Fechas Confirmadas');
    expect(bannerContainer.children.length).toBe(1);
    expect(carteleraContainer.children.length).toBe(2);
  });

  it('debe utilizar la forma singular en el contador cuando hay 1 solo concierto', () => {
    const view = new ConcertBoardView();
    view.renderConcerts([mockConcerts[0]]);

    expect(contadorFechasContainer.innerHTML).toContain('1 Fecha Confirmada');
  });

  it('debe retornar temprano sin lanzar excepción si no existe el contenedor de cartelera', () => {
    document.body.innerHTML = ''; // Limpiar DOM
    const view = new ConcertBoardView();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    view.renderConcerts(mockConcerts);
    expect(consoleSpy).toHaveBeenCalledWith(
      '[NeonPulse] Error crítico: No se encontró "#contenedor-cartelera" en el DOM.',
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

    expect(contadorFechasContainer.innerHTML).toContain('0 Fechas Confirmadas');
    expect(bannerContainer.children.length).toBe(0);
    expect(carteleraContainer.innerHTML).toContain('No hay conciertos programados por el momento.');
  });

  it('debe renderizar el estado de error con showError', () => {
    const view = new ConcertBoardView();
    const onRetry = vi.fn();
    view.showError('Falla de red', onRetry);

    expect(contadorFechasContainer.innerHTML).toContain('0 Fechas Confirmadas');
    expect(bannerContainer.children.length).toBe(0);
    expect(carteleraContainer.innerHTML).toContain('Falla de red');
  });

  it('debe comportarse de forma segura si los elementos del DOM son nulos al llamar showLoading, showEmpty y showError', () => {
    document.body.innerHTML = ''; // Nodos nulos
    const view = new ConcertBoardView();

    expect(() => {
      view.showLoading();
      view.showEmpty();
      view.showError('Error test');
    }).not.toThrow();
  });
});
