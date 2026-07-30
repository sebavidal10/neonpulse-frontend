import type { Concert } from '../models';
import { ConcertService } from '../services/concert.service';
import { createConcertCardElement } from '../components/ConcertCard';
import { createFeaturedBannerElement } from '../components/FeaturedBanner/FeaturedBanner';
import {
  createBannerSkeletonElement,
  createGridSkeletonElement,
} from '../components/LoadingSkeleton/LoadingSkeleton';
import {
  createErrorStateElement,
  createEmptyStateElement,
} from '../components/StateViews/StateViews';

export class ConcertBoardView {
  private bannerContainer: HTMLElement | null;
  private carteleraContainer: HTMLElement | null;
  private contadorFechasContainer: HTMLElement | null;

  constructor() {
    this.bannerContainer = document.getElementById('contenedor-banner');
    this.carteleraContainer = document.getElementById('contenedor-cartelera');
    this.contadorFechasContainer = document.getElementById('contador-fechas');
  }

  /**
   * Muestra esqueletos de carga visuales en los contenedores e icono de spin en el contador.
   */
  showLoading(): void {
    if (this.contadorFechasContainer) {
      this.contadorFechasContainer.innerHTML = `
        <svg class="animate-spin h-3 w-3 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Cargando fechas...</span>
      `;
    }

    if (this.bannerContainer) {
      this.bannerContainer.replaceChildren(createBannerSkeletonElement());
    }

    if (this.carteleraContainer) {
      this.carteleraContainer.replaceChildren(createGridSkeletonElement(3));
    }
  }

  /**
   * Renderiza el banner destacado, la grilla de conciertos y actualiza el contador dinámico de fechas.
   */
  renderConcerts(concerts: Concert[]): void {
    if (!this.carteleraContainer) {
      console.error(
        '[NeonPulse] Error crítico: No se encontró "#contenedor-cartelera" en el DOM.',
      );
      return;
    }

    // Actualizar el contador dinámico de fechas confirmadas
    if (this.contadorFechasContainer) {
      const count = concerts.length;
      const label = count === 1 ? 'Fecha Confirmada' : 'Fechas Confirmadas';
      this.contadorFechasContainer.innerHTML = `<span>${count} ${label}</span>`;
    }

    // 1. Renderizar Banner Destacado
    const featuredConcert = ConcertService.getFeaturedConcert(concerts);
    if (this.bannerContainer && featuredConcert) {
      try {
        const bannerElement = createFeaturedBannerElement(featuredConcert);
        this.bannerContainer.replaceChildren(bannerElement);
      } catch (bannerError) {
        console.error('[NeonPulse] Error al renderizar banner destacado:', bannerError);
        this.bannerContainer.replaceChildren();
      }
    }

    // 2. Renderizar Grilla de Conciertos
    const gridConcerts = ConcertService.getGridConcerts(concerts);
    const fragment = document.createDocumentFragment();

    gridConcerts.forEach((concert) => {
      try {
        const cardElement = createConcertCardElement(concert);
        fragment.appendChild(cardElement);
      } catch (cardError) {
        console.error(
          `[NeonPulse] Falló el renderizado del concierto ID ${concert?.id}:`,
          cardError,
        );
      }
    });

    this.carteleraContainer.replaceChildren(fragment);
  }

  /**
   * Muestra la vista de estado vacío cuando no hay conciertos.
   */
  showEmpty(): void {
    if (this.contadorFechasContainer) {
      this.contadorFechasContainer.innerHTML = `<span>0 Fechas Confirmadas</span>`;
    }
    if (this.bannerContainer) {
      this.bannerContainer.replaceChildren();
    }
    if (this.carteleraContainer) {
      this.carteleraContainer.replaceChildren(createEmptyStateElement());
    }
  }

  /**
   * Muestra la vista de estado de error global.
   */
  showError(message: string, onRetry?: () => void): void {
    if (this.contadorFechasContainer) {
      this.contadorFechasContainer.innerHTML = `<span>0 Fechas Confirmadas</span>`;
    }
    if (this.bannerContainer) {
      this.bannerContainer.replaceChildren();
    }
    if (this.carteleraContainer) {
      this.carteleraContainer.replaceChildren(
        createErrorStateElement(message, onRetry),
      );
    }
  }
}
