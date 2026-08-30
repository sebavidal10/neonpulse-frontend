import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { AuthModal } from '../AuthModal/AuthModal';
import { renderIcon } from '../../utils/icon.utils';
import { t } from '../../i18n';
import type { Ticket } from '../../models';
import {
  Ticket as TicketIcon,
  X,
  QrCode,
  Printer,
  ShieldCheck,
  AlertCircle,
} from 'lucide';

export class MyTicketsModal {
  private static modalElement: HTMLElement | null = null;

  /**
   * Opens the My Tickets modal and loads the user's tickets.
   */
  static async open(): Promise<void> {
    if (!AuthService.isAuthenticated()) {
      AuthModal.open('signin', () => {
        MyTicketsModal.open();
      });
      return;
    }

    if (!this.modalElement || !document.body.contains(this.modalElement)) {
      let existing = document.getElementById('my-tickets-modal-root');
      if (!existing) {
        existing = document.createElement('div');
        existing.id = 'my-tickets-modal-root';
        document.body.appendChild(existing);
      }
      this.modalElement = existing;
    }

    this.renderLoading();
    document.body.style.overflow = 'hidden';

    try {
      const tickets = await TicketService.getMyTickets();
      this.renderTickets(tickets);
    } catch (err: any) {
      this.renderError(err.message || 'Failed to load tickets');
    }
  }

  static close(): void {
    if (this.modalElement) {
      this.modalElement.innerHTML = '';
    }
    document.body.style.overflow = '';
  }

  private static renderLoading(): void {
    if (!this.modalElement) return;

    this.modalElement.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
        <div class="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-8 shadow-2xl text-center flex flex-col items-center gap-4">
          <svg class="animate-spin h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-sm font-black uppercase text-zinc-300 tracking-wider">Loading your digital passes...</p>
        </div>
      </div>
    `;
  }

  private static renderError(message: string): void {
    if (!this.modalElement) return;

    const closeIcon = renderIcon(X, 'w-5 h-5 text-zinc-400 hover:text-white');
    const alertIcon = renderIcon(AlertCircle, 'w-8 h-8 text-red-500 mb-2');

    this.modalElement.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
        <div class="relative w-full max-w-md bg-zinc-950 border border-red-900/60 rounded-2xl p-6 shadow-2xl text-center flex flex-col items-center">
          <button type="button" id="btn-close-tickets-modal" class="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer">
            ${closeIcon}
          </button>
          ${alertIcon}
          <h3 class="text-lg font-black text-white uppercase tracking-tight mb-1">Could Not Load Passes</h3>
          <p class="text-xs text-zinc-400 mb-4">${message}</p>
          <button type="button" id="btn-retry-tickets" class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-lg shadow cursor-pointer">
            Try Again
          </button>
        </div>
      </div>
    `;

    this.modalElement.querySelector('#btn-close-tickets-modal')?.addEventListener('click', () => this.close());
    this.modalElement.querySelector('#btn-retry-tickets')?.addEventListener('click', () => this.open());
  }

  private static renderTickets(tickets: Ticket[]): void {
    if (!this.modalElement) return;

    const closeIcon = renderIcon(X, 'w-5 h-5 text-zinc-400 hover:text-white');
    const ticketHeaderIcon = renderIcon(TicketIcon, 'w-5 h-5 text-red-500');
    const currentUser = AuthService.getCurrentUser();

    const ticketsContent =
      tickets.length === 0
        ? `
        <div class="py-12 text-center flex flex-col items-center gap-3">
          <div class="p-4 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-600">
            ${renderIcon(TicketIcon, 'w-10 h-10')}
          </div>
          <h4 class="text-base font-black text-white uppercase tracking-wider">${t('myTickets.noTicketsTitle')}</h4>
          <p class="text-xs text-zinc-400 max-w-sm">${t('myTickets.noTicketsDescription')}</p>
          <button type="button" id="btn-empty-explore" class="mt-3 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-lg shadow-[0_0_12px_rgba(220,38,38,0.3)] cursor-pointer">
            ${t('myTickets.exploreGigs')}
          </button>
        </div>
      `
        : `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto pr-1">
          ${tickets
            .map((ticket) => {
              const formattedDate = ticket.purchaseDate ? ticket.purchaseDate.replace('T', ' ').substring(0, 16) : 'Confirmed';
              const priceDisplay = ticket.unitPrice ? `$${ticket.unitPrice.toLocaleString()}` : '$35.00';
              return `
                <div class="bg-zinc-900/90 border border-zinc-800 hover:border-red-600/70 transition-all rounded-xl p-4 flex flex-col justify-between relative overflow-hidden shadow-lg group">
                  <!-- Neon Accent Line -->
                  <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600"></div>

                  <div class="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-950 text-red-400 border border-red-800">
                        ${renderIcon(ShieldCheck, 'w-3 h-3')}
                        ${t('myTickets.validPass')}
                      </span>
                      <h4 class="text-base font-black text-white uppercase tracking-tight mt-1.5 line-clamp-1">
                        ${ticket.band || 'NeonPulse Event'}
                      </h4>
                      <p class="text-[11px] font-bold text-red-500 tracking-wider">
                        Gig Ref: ${ticket.concertCode || '#' + ticket.concertId}
                      </p>
                    </div>
                    <div class="p-2 bg-black/60 border border-zinc-800 rounded-lg shrink-0 text-white">
                      ${renderIcon(QrCode, 'w-7 h-7 text-zinc-300')}
                    </div>
                  </div>

                  <div class="space-y-1.5 text-xs text-zinc-300 py-2 border-y border-zinc-800/80 my-2">
                    <div class="flex justify-between items-center text-[11px]">
                      <span class="text-zinc-500 font-extrabold uppercase">${t('myTickets.ticketCode')}:</span>
                      <span class="font-mono font-black text-white bg-black/80 px-2 py-0.5 rounded border border-zinc-800 text-[11px] tracking-wider">${ticket.code}</span>
                    </div>
                    <div class="flex justify-between items-center text-[11px]">
                      <span class="text-zinc-500 font-extrabold uppercase">Holder:</span>
                      <span class="font-semibold text-zinc-200">${ticket.customerName || currentUser?.fullName || 'Verified Member'}</span>
                    </div>
                    <div class="flex justify-between items-center text-[11px]">
                      <span class="text-zinc-500 font-extrabold uppercase">${t('myTickets.pricePaid')}:</span>
                      <span class="font-extrabold text-emerald-400">${priceDisplay}</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between text-[10px] text-zinc-500 font-medium">
                    <span>${formattedDate}</span>
                    <button type="button" class="btn-print-single text-zinc-400 hover:text-white inline-flex items-center gap-1 font-bold cursor-pointer" title="Print Pass">
                      ${renderIcon(Printer, 'w-3 h-3')}
                      <span>Print</span>
                    </button>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      `;

    this.modalElement.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
        <div class="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden">
          <!-- Background Ambient Glow -->
          <div class="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Close button -->
          <button 
            type="button" 
            id="btn-close-tickets-modal" 
            class="absolute top-4 right-4 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="${t('myTickets.close')}"
          >
            ${closeIcon}
          </button>

          <!-- Header -->
          <div class="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-zinc-900 pb-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                ${ticketHeaderIcon}
                <span class="text-xs font-black uppercase tracking-widest text-red-500">DIGITAL VAULT</span>
              </div>
              <h3 class="text-xl md:text-2xl font-black uppercase tracking-tight text-white">
                ${t('myTickets.title')}
              </h3>
              <p class="text-xs text-zinc-400 mt-0.5">
                ${t('myTickets.subtitle')}
              </p>
            </div>
            ${
              tickets.length > 0
                ? `
              <div class="text-xs font-extrabold text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 shrink-0">
                Total Passes: <strong class="text-white font-black">${tickets.length}</strong>
              </div>
            `
                : ''
            }
          </div>

          <!-- Content -->
          ${ticketsContent}
        </div>
      </div>
    `;

    // Event listeners
    this.modalElement.querySelector('#btn-close-tickets-modal')?.addEventListener('click', () => this.close());

    const backdrop = this.modalElement.querySelector('.fixed');
    backdrop?.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        this.close();
      }
    });

    this.modalElement.querySelector('#btn-empty-explore')?.addEventListener('click', () => {
      this.close();
      const el = document.getElementById('contenedor-cartelera');
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    });

    this.modalElement.querySelectorAll('.btn-print-single').forEach((btn) => {
      btn.addEventListener('click', () => {
        window.print();
      });
    });
  }
}
