import type { Concert } from '../models';
import { ConcertService } from '../services/concert.service';
import { createConcertCardElement } from '../components/ConcertCard';
import { createFeaturedBannerElement } from '../components/FeaturedBanner';
import {
  createBannerSkeletonElement,
  createGridSkeletonElement,
} from '../components/LoadingSkeleton';
import {
  createEmptyStateElement,
  createErrorStateElement,
} from '../components/StateViews';
import { t } from '../i18n';

/**
 * Orchestrates DOM rendering for the main NeonPulse Concert Board.
 */
export class ConcertBoardView {
  get carteleraContainer(): HTMLElement | null {
    return document.getElementById('contenedor-cartelera');
  }

  get bannerContainer(): HTMLElement | null {
    return document.getElementById('contenedor-destacado');
  }

  get contadorFechasContainer(): HTMLElement | null {
    return document.getElementById('contador-fechas');
  }

  /**
   * Shows animated loading skeleton across billboard.
   */
  showLoading(): void {
    if (this.contadorFechasContainer) {
      this.contadorFechasContainer.innerHTML = `<span class="animate-pulse">${t('board.loading')}</span>`;
    }
    if (this.bannerContainer) {
      this.bannerContainer.replaceChildren(createBannerSkeletonElement());
    }
    if (this.carteleraContainer) {
      this.carteleraContainer.replaceChildren(createGridSkeletonElement(3));
    }
  }

  /**
   * Handles user clicking "Buy Tickets" on card or banner by adding to cart drawer.
   */
  selectConcert(concert: Concert): void {
    window.dispatchEvent(
      new CustomEvent('neonpulse:add-to-cart', {
        detail: { concert },
      }),
    );
  }

  /**
   * Navigates to the full-page detail view for a concert.
   */
  openConcertDetail(concert: Concert): void {
    window.dispatchEvent(
      new CustomEvent('neonpulse:navigate', {
        detail: { view: 'detail', concert },
      }),
    );
  }

  /**
   * Renders the complete lineup including Featured Banner and Grid Cards.
   */
  renderConcerts(concerts: Concert[]): void {
    if (!this.carteleraContainer) {
      console.error('[NeonPulse] Critical error: "#contenedor-cartelera" not found in DOM.');
      return;
    }

    // 0. Update Counter
    if (this.contadorFechasContainer) {
      const count = concerts.length;
      const label =
        count === 1
          ? t('board.datesConfirmed', { count })
          : t('board.datesConfirmedPlural', { count });
      this.contadorFechasContainer.innerHTML = `<span>${label}</span>`;
    }

    // 1. Featured Banner
    const featuredConcert = ConcertService.getFeaturedConcert(concerts);
    if (this.bannerContainer && featuredConcert) {
      try {
        const bannerElement = createFeaturedBannerElement(
          featuredConcert,
          (c) => this.selectConcert(c),
          (c) => this.openConcertDetail(c),
        );
        this.bannerContainer.replaceChildren(bannerElement);
      } catch (bannerError) {
        console.error('[NeonPulse] Error rendering featured banner:', bannerError);
        this.bannerContainer.replaceChildren();
      }
    }

    // 2. Concert Grid
    const gridConcerts = ConcertService.getGridConcerts(concerts);
    const fragment = document.createDocumentFragment();

    gridConcerts.forEach((concert) => {
      try {
        const cardElement = createConcertCardElement(
          concert,
          (c) => this.selectConcert(c),
          (c) => this.openConcertDetail(c),
        );
        fragment.appendChild(cardElement);
      } catch (cardError) {
        console.error(`[NeonPulse] Failed to render concert ID ${concert?.id}:`, cardError);
      }
    });

    this.carteleraContainer.replaceChildren(fragment);
  }

  /**
   * Shows empty state when no concerts are returned.
   */
  showEmpty(): void {
    if (this.contadorFechasContainer) {
      this.contadorFechasContainer.innerHTML = `<span>0 ${t('board.datesConfirmedPlural', { count: 0 })}</span>`;
    }
    if (this.bannerContainer) {
      this.bannerContainer.replaceChildren();
    }
    if (this.carteleraContainer) {
      this.carteleraContainer.replaceChildren(createEmptyStateElement());
    }
  }

  /**
   * Shows global error state.
   */
  showError(message: string, onRetry?: () => void): void {
    if (this.contadorFechasContainer) {
      this.contadorFechasContainer.innerHTML = `<span>0 ${t('board.datesConfirmedPlural', { count: 0 })}</span>`;
    }
    if (this.bannerContainer) {
      this.bannerContainer.replaceChildren();
    }
    if (this.carteleraContainer) {
      this.carteleraContainer.replaceChildren(createErrorStateElement(message, onRetry));
    }
  }
}
