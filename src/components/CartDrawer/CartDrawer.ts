import type { Concert, Ticket } from '../../models';
import { AuthService } from '../../services/auth.service';
import { TicketService } from '../../services/ticket.service';
import { renderIcon } from '../../utils/icon.utils';
import { formatDate } from '../../utils/date.utils';
import { t } from '../../i18n';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
} from 'lucide';

export class CartDrawer {
  private static selectedConcert: Concert | null = null;
  private static quantity: number = 1;
  private static isOpen: boolean = false;
  private static isProcessing: boolean = false;
  private static confirmedTickets: Ticket[] | null = null;
  private static confirmedEmail: string = '';

  /**
   * Initializes floating trigger and drawer DOM nodes.
   */
  static init(): void {
    if (document.getElementById('neonpulse-cart-container')) return;

    const root = document.createElement('div');
    root.id = 'neonpulse-cart-container';
    document.body.appendChild(root);

    this.render();

    // Listen for custom events
    window.addEventListener('neonpulse:add-to-cart', (event: any) => {
      const concert = event.detail?.concert;
      if (concert) {
        this.addGig(concert, true);
      }
    });

    window.addEventListener('neonpulse:open-cart', () => {
      this.open();
    });

    AuthService.onAuthStateChange(() => {
      if (this.isOpen) {
        this.render();
      } else {
        this.renderFloatingButton();
      }
    });
  }

  /**
   * Sets the gig to purchase and optionally opens the checkout drawer.
   */
  static addGig(concert: Concert, openNow: boolean = true): void {
    this.selectedConcert = concert;
    this.quantity = 1;
    this.confirmedTickets = null;
    this.isProcessing = false;

    if (openNow) {
      this.open();
    } else {
      this.renderFloatingButton();
    }
  }

  static open(): void {
    this.isOpen = true;
    this.render();
  }

  static close(): void {
    this.isOpen = false;
    if (this.confirmedTickets !== null) {
      this.selectedConcert = null;
      this.quantity = 1;
      this.confirmedTickets = null;
    }
    this.render();
  }

  static toggle(): void {
    this.isOpen = !this.isOpen;
    this.render();
  }

  private static render(): void {
    const root = document.getElementById('neonpulse-cart-container');
    if (!root) return;

    root.innerHTML = `
      ${this.renderFloatingButtonHtml()}
      ${this.renderDrawerOverlayHtml()}
    `;

    this.attachEventListeners(root);
  }

  private static renderFloatingButton(): void {
    const btnContainer = document.getElementById('floating-cart-btn-wrapper');
    if (btnContainer) {
      btnContainer.outerHTML = this.renderFloatingButtonHtml();
      const newBtn = document.getElementById('btn-floating-cart-toggle');
      newBtn?.addEventListener('click', () => this.toggle());
    }
  }

  private static renderFloatingButtonHtml(): string {
    const hasActiveItem = this.selectedConcert !== null && this.confirmedTickets === null;
    const badgeText = hasActiveItem ? `${this.quantity}` : '0';
    const totalAmount = hasActiveItem && this.selectedConcert
      ? (this.selectedConcert.ticketPrice * this.quantity).toLocaleString()
      : '0';

    return `
      <div id="floating-cart-btn-wrapper" class="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          id="btn-floating-cart-toggle"
          class="flex items-center gap-2.5 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(220,38,38,0.5)] border border-red-500 hover:scale-105 transition-all duration-200 cursor-pointer group"
          title="${t('cart.floatingButton')}"
        >
          <div class="relative">
            ${renderIcon(ShoppingBag, 'w-4 h-4')}
            <span class="absolute -top-2 -right-2 w-4 h-4 bg-zinc-950 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-red-500">
              ${badgeText}
            </span>
          </div>
          <span class="hidden sm:inline">${t('cart.floatingButton')}</span>
          ${hasActiveItem ? `<span class="bg-red-950/80 px-2 py-0.5 rounded text-[11px] font-extrabold text-red-200 border border-red-800">$${totalAmount}</span>` : ''}
        </button>
      </div>
    `;
  }

  private static renderDrawerOverlayHtml(): string {
    if (!this.isOpen) return '';

    return `
      <div id="cart-drawer-backdrop" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fadeIn flex justify-end">
        <div id="cart-drawer-panel" class="w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full flex flex-col justify-between shadow-2xl p-6 overflow-y-auto animate-slideInRight relative">
          
          <!-- Top Header -->
          <div class="flex items-center justify-between pb-4 border-b border-zinc-900">
            <div class="flex items-center gap-2">
              <div class="p-2 bg-red-950/80 border border-red-800 rounded-lg text-red-400">
                ${renderIcon(ShoppingBag, 'w-4 h-4')}
              </div>
              <div>
                <h3 class="text-base font-black uppercase tracking-tight text-white">${t('cart.drawerTitle')}</h3>
                <p class="text-[11px] text-zinc-400">${t('cart.drawerSubtitle')}</p>
              </div>
            </div>
            <button type="button" id="btn-cart-close" class="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer" title="${t('cart.closeDrawer')}">
              ${renderIcon(X, 'w-4 h-4')}
            </button>
          </div>

          <!-- Drawer Body Content -->
          <div class="py-5 flex-1 flex flex-col justify-center">
            ${this.renderDrawerBody()}
          </div>

        </div>
      </div>
    `;
  }

  private static renderDrawerBody(): string {
    if (this.confirmedTickets && this.selectedConcert) {
      return this.renderConfirmedStateHtml();
    }

    if (this.isProcessing) {
      return this.renderProcessingStateHtml();
    }

    if (!this.selectedConcert) {
      return this.renderEmptyCartHtml();
    }

    return this.renderCheckoutFormHtml();
  }

  private static renderEmptyCartHtml(): string {
    return `
      <div class="text-center flex flex-col items-center gap-3 py-10">
        <div class="p-4 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-600">
          ${renderIcon(ShoppingBag, 'w-10 h-10')}
        </div>
        <h4 class="text-base font-black text-white uppercase tracking-tight">${t('cart.emptyTitle')}</h4>
        <p class="text-xs text-zinc-400 max-w-xs">${t('cart.emptySubtitle')}</p>
        <button 
          type="button" 
          id="btn-cart-empty-browse"
          class="mt-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all cursor-pointer"
        >
          ${t('cart.browseGigs')}
        </button>
      </div>
    `;
  }

  private static renderCheckoutFormHtml(): string {
    const concert = this.selectedConcert!;
    const currentUser = AuthService.getCurrentUser();
    const defaultEmail = currentUser?.email || '';
    const unitPrice = concert.ticketPrice || 35000;
    const total = unitPrice * this.quantity;
    const formattedDate = formatDate(concert.date);
    const coverImage = concert.imageUrl || '/images/punk1.png';

    return `
      <div class="space-y-4">
        <!-- Selected Gig Summary Card -->
        <div class="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 flex items-center gap-3.5 relative overflow-hidden">
          <img 
            src="${coverImage}" 
            alt="${concert.band}" 
            class="w-16 h-16 rounded-lg object-cover border border-zinc-700 shrink-0"
            onerror="this.src='/images/punk1.png'"
          />
          <div class="flex-1 min-w-0">
            <span class="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-900 mb-1">
              ${t('cart.selectedGig')}
            </span>
            <h4 class="text-sm font-black text-white uppercase tracking-tight truncate">${concert.band}</h4>
            <p class="text-xs text-zinc-400 truncate">${concert.cityName || 'Underground Venue'}</p>
            <p class="text-[11px] font-bold text-red-500 mt-0.5">${formattedDate}</p>
          </div>
        </div>

        <!-- Quantity Selector & Price -->
        <div class="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black uppercase text-zinc-400">${t('cart.quantity')}</span>
            <div class="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg p-1">
              <button 
                type="button" 
                id="btn-cart-qty-minus" 
                class="w-7 h-7 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded flex items-center justify-center font-bold transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                ${renderIcon(Minus, 'w-3 h-3')}
              </button>
              <span id="cart-qty-display" class="w-6 text-center font-black text-xs text-white">${this.quantity}</span>
              <button 
                type="button" 
                id="btn-cart-qty-plus" 
                class="w-7 h-7 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded flex items-center justify-center font-bold transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                ${renderIcon(Plus, 'w-3 h-3')}
              </button>
            </div>
          </div>

          <div class="flex justify-between items-center text-xs pt-2 border-t border-zinc-800/80">
            <span class="text-zinc-500 font-extrabold uppercase">${t('cart.unitPrice')}:</span>
            <span class="font-bold text-zinc-300">$${unitPrice.toLocaleString()}</span>
          </div>

          <div class="flex justify-between items-center text-xs">
            <span class="text-zinc-400 font-black uppercase">${t('cart.subtotal')}:</span>
            <span id="cart-total-display" class="font-black text-base text-emerald-400">$${total.toLocaleString()}</span>
          </div>
        </div>

        <!-- Checkout Form -->
        <form id="form-cart-checkout" class="space-y-3 pt-1">
          <div>
            <label for="cart-email" class="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1">
              ${t('cart.emailLabel')} <span class="text-red-500">*</span>
            </label>
            <input 
              type="email" 
              id="cart-email" 
              required
              value="${defaultEmail}" 
              placeholder="${t('cart.emailPlaceholder')}"
              class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div id="cart-error-block" class="hidden p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-lg flex items-center gap-2"></div>

          <button 
            type="submit" 
            id="btn-cart-pay"
            class="w-full mt-2 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            ${renderIcon(Zap, 'w-4 h-4 fill-current')}
            <span id="btn-cart-pay-text">${t('cart.payButton', { total: total.toLocaleString() })}</span>
          </button>
        </form>
      </div>
    `;
  }

  private static renderProcessingStateHtml(): string {
    return `
      <div class="text-center flex flex-col items-center gap-4 py-12 animate-pulse">
        <div class="p-4 bg-zinc-900 border border-red-600/50 rounded-full">
          <svg class="animate-spin h-10 w-10 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h4 class="text-base font-black text-white uppercase tracking-tight">${t('cart.processingPayment')}</h4>
        <p class="text-xs text-zinc-400 max-w-xs">Connecting to secure underground pass gateway...</p>
      </div>
    `;
  }

  private static renderConfirmedStateHtml(): string {
    const count = this.confirmedTickets?.length || this.quantity;
    const concert = this.selectedConcert!;

    return `
      <div class="text-center flex flex-col items-center gap-3 py-6 animate-fadeIn">
        <div class="p-3.5 bg-emerald-950/80 border border-emerald-600 rounded-full text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          ${renderIcon(CheckCircle2, 'w-10 h-10')}
        </div>
        <h4 class="text-lg font-black text-white uppercase tracking-tight">${t('cart.confirmedTitle')}</h4>
        <p class="text-xs text-zinc-300 max-w-xs">
          ${t('cart.confirmedMessage', { quantity: count, concertName: concert.band })}
        </p>
        <p class="text-[11px] text-zinc-500 max-w-xs">
          ${t('cart.emailSentNotice', { email: this.confirmedEmail })}
        </p>

        <div class="flex flex-col gap-2.5 w-full mt-4">
          <button 
            type="button" 
            id="btn-cart-view-passes" 
            class="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>${t('cart.viewMyPasses')}</span>
            ${renderIcon(ArrowRight, 'w-3.5 h-3.5')}
          </button>
          <button 
            type="button" 
            id="btn-cart-browse-more" 
            class="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider rounded-lg border border-zinc-700 transition-colors cursor-pointer"
          >
            ${t('cart.buyMore')}
          </button>
        </div>
      </div>
    `;
  }

  private static attachEventListeners(root: HTMLElement): void {
    // Floating Button
    root.querySelector('#btn-floating-cart-toggle')?.addEventListener('click', () => this.toggle());

    // Close button & Backdrop click
    root.querySelector('#btn-cart-close')?.addEventListener('click', () => this.close());
    root.querySelector('#cart-drawer-backdrop')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.close();
      }
    });

    // Empty state button
    root.querySelector('#btn-cart-empty-browse')?.addEventListener('click', () => {
      this.close();
      window.dispatchEvent(new CustomEvent('neonpulse:navigate', { detail: { view: 'lineup' } }));
    });

    // Quantity Stepper
    const qtyMinus = root.querySelector('#btn-cart-qty-minus');
    const qtyPlus = root.querySelector('#btn-cart-qty-plus');
    const qtyDisplay = root.querySelector('#cart-qty-display');
    const totalDisplay = root.querySelector('#cart-total-display');
    const btnPayText = root.querySelector('#btn-cart-pay-text');

    const updateQty = (newQty: number) => {
      if (newQty < 1 || newQty > 10) return;
      this.quantity = newQty;
      if (qtyDisplay) qtyDisplay.textContent = String(this.quantity);
      if (this.selectedConcert) {
        const total = this.selectedConcert.ticketPrice * this.quantity;
        if (totalDisplay) totalDisplay.textContent = `$${total.toLocaleString()}`;
        if (btnPayText) btnPayText.textContent = t('cart.payButton', { total: total.toLocaleString() });
      }
      this.renderFloatingButton();
    };

    qtyMinus?.addEventListener('click', () => updateQty(this.quantity - 1));
    qtyPlus?.addEventListener('click', () => updateQty(this.quantity + 1));

    // Form submit / Checkout
    const emailInput = root.querySelector('#cart-email') as HTMLInputElement | null;
    const form = root.querySelector('#form-cart-checkout') as HTMLFormElement | null;
    const errorBlock = root.querySelector('#cart-error-block') as HTMLElement | null;

    const showError = (msg: string) => {
      if (errorBlock) {
        errorBlock.innerHTML = `${renderIcon(AlertCircle, 'w-4 h-4 shrink-0')}<span>${msg}</span>`;
        errorBlock.classList.remove('hidden');
      }
    };

    if (form && emailInput) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (errorBlock) {
          errorBlock.classList.add('hidden');
          errorBlock.innerHTML = '';
        }

        const email = emailInput.value.trim();

        if (!email) {
          showError(t('cart.errors.emailRequired'));
          emailInput.focus();
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          showError(t('cart.errors.emailInvalid'));
          emailInput.focus();
          return;
        }

        const currentUser = AuthService.getCurrentUser();
        const fallbackName = email
          .split('@')[0]
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        const name = currentUser?.fullName || fallbackName || 'NeonPulse Fan';

        // Trigger loading state
        this.isProcessing = true;
        this.render();

        try {
          const result = await TicketService.purchaseTickets(
            this.selectedConcert!.id,
            name,
            email,
            this.quantity,
          );

          this.isProcessing = false;
          this.confirmedTickets = result.tickets;
          this.confirmedEmail = email;
          this.render();
        } catch (err: any) {
          console.error('[NeonPulse] Checkout failed:', err);
          this.isProcessing = false;
          this.render();
          showError(err.message || t('cart.errors.paymentFailed'));
        }
      });
    }

    // Confirmed buttons
    root.querySelector('#btn-cart-view-passes')?.addEventListener('click', () => {
      this.close();
      window.dispatchEvent(new CustomEvent('neonpulse:navigate', { detail: { view: 'profile' } }));
    });

    root.querySelector('#btn-cart-browse-more')?.addEventListener('click', () => {
      this.close();
      window.dispatchEvent(new CustomEvent('neonpulse:navigate', { detail: { view: 'lineup' } }));
    });
  }
}
