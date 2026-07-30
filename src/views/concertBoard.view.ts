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

  constructor() {
    this.bannerContainer = document.getElementById('contenedor-banner');
    this.carteleraContainer = document.getElementById('contenedor-cartelera');
  }

  /**
   * Muestra esqueletos de carga visuales en ambos contenedores.
   */
  showLoading(): void {
    if (this.bannerContainer) {
      this.bannerContainer.replaceChildren(createBannerSkeletonElement());
    }

    if (this.carteleraContainer) {
      this.carteleraContainer.replaceChildren(createGridSkeletonElement(3));
    }
  }

  /**
   * Renderiza el banner destacado y la grilla de conciertos.
   */
  renderConcerts(concerts: Concert[]): void {
    if (!this.carteleraContainer) {
      console.error(
        '[NeonPulse] Error crítico: No se encontró "#contenedor-cartelera" en el DOM.',
      );
      return;
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
