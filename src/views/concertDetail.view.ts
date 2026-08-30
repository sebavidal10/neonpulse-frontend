import type { Concert } from '../models';
import { renderIcon } from '../utils/icon.utils';
import { formatDate } from '../utils/date.utils';
import { t } from '../i18n';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Music,
  Ticket as TicketIcon,
  Radio,
  Flame,
} from 'lucide';

export class ConcertDetailView {
  private container: HTMLElement;
  private onNavigateToLineup?: () => void;

  constructor(container: HTMLElement, onNavigateToLineup?: () => void) {
    this.container = container;
    this.onNavigateToLineup = onNavigateToLineup;
  }

  /**
   * Renders the full-page concert detail view with integrated booking and payment.
   */
  render(concert: Concert): void {
    const formattedDate = formatDate(concert.date);
    const timeDisplay = concert.time ? `${concert.time}` : '20:00 EST';
    const venue = concert.venueName
      ? `${concert.venueName}${concert.cityName ? ' (' + concert.cityName + ')' : ''}`
      : concert.cityName || 'Underground Vault Arena';
    const price = concert.ticketPrice ? `$${concert.ticketPrice.toLocaleString()}` : '$35.00';
    const imageUrl = concert.imageUrl || '/images/punk1.png';
    const available = concert.availableTickets ?? 50;
    const total = concert.totalTickets ?? 100;
    const percentage = Math.min(100, Math.max(0, Math.round((available / total) * 100)));

    this.container.innerHTML = `
      <section class="space-y-6 animate-fadeIn pb-12">
        <!-- Top Back Navigation -->
        <div class="flex items-center justify-between">
          <button 
            type="button" 
            id="btn-detail-back-lineup"
            class="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-black uppercase tracking-wider rounded-lg border border-zinc-800 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            ${renderIcon(ArrowLeft, 'w-4 h-4')}
            <span>${t('profile.backToLineup')}</span>
          </button>
        </div>

        <!-- Main Hero Header -->
        <div class="relative w-full min-h-[320px] md:min-h-[420px] rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col justify-end p-6 md:p-10">
          <img 
            src="${imageUrl}" 
            alt="${concert.title}" 
            class="absolute inset-0 w-full h-full object-cover brightness-70 contrast-125"
            onerror="this.src='/images/punk1.png'"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>

          <div class="relative z-10 max-w-3xl flex flex-col gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-black uppercase tracking-wider bg-red-700 text-white shadow">
                ${renderIcon(Flame, 'w-3.5 h-3.5 fill-current')}
                ${t('detail.badge')}
              </span>
              ${
                concert.status === 'LIVE'
                  ? `
                <span class="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-black uppercase tracking-wider bg-red-950 text-red-400 border border-red-800 animate-pulse">
                  ${renderIcon(Radio, 'w-3.5 h-3.5')}
                  ${t('board.liveNow')}
                </span>
              `
                  : ''
              }
            </div>

            <h1 class="text-3xl md:text-5xl font-black uppercase tracking-tight text-white drop-shadow-md leading-tight">
              ${concert.title}
            </h1>

            <div class="flex items-center gap-2 text-red-500 font-black text-lg md:text-xl">
              ${renderIcon(Music, 'w-5 h-5')}
              <span>${concert.band}</span>
            </div>
          </div>
        </div>

        <!-- Specifications & Stats Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow">
            <span class="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1">
              ${renderIcon(MapPin, 'w-3.5 h-3.5 text-red-500')}
              ${t('detail.venueLabel')}
            </span>
            <p class="text-sm font-black text-white mt-1 truncate">${venue}</p>
          </div>

          <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow">
            <span class="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1">
              ${renderIcon(Calendar, 'w-3.5 h-3.5 text-zinc-400')}
              ${t('detail.dateLabel')}
            </span>
            <p class="text-sm font-black text-white mt-1">${formattedDate}</p>
          </div>

          <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow">
            <span class="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1">
              ${renderIcon(Clock, 'w-3.5 h-3.5 text-zinc-400')}
              ${t('detail.scheduleLabel')}
            </span>
            <p class="text-sm font-black text-white mt-1">${timeDisplay}</p>
          </div>

          <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow">
            <span class="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1">
              ${renderIcon(TicketIcon, 'w-3.5 h-3.5 text-emerald-400')}
              ${t('detail.priceLabel')}
            </span>
            <p class="text-sm font-black text-emerald-400 mt-1">${price}</p>
          </div>
        </div>

        <!-- Capacity Status Bar -->
        <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-2 shadow">
          <div class="flex justify-between items-center text-xs">
            <span class="font-extrabold uppercase text-zinc-400">${t('detail.availabilityLabel')}</span>
            <span class="font-bold text-zinc-300">${t('detail.ticketsRemaining', { available, total })}</span>
          </div>
          <div class="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div class="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-300" style="width: ${percentage}%;"></div>
          </div>
        </div>

        <!-- Action Card -->
        <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div>
            <span class="text-xs text-zinc-400 font-bold uppercase tracking-wider">${t('detail.priceLabel')}</span>
            <div class="text-2xl font-black text-emerald-400 mt-0.5">${price} <span class="text-xs text-zinc-500 font-normal">${t('detail.perPass')}</span></div>
          </div>

          <button 
            type="button" 
            id="btn-detail-buy-ticket" 
            class="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:scale-105"
          >
            ${renderIcon(TicketIcon, 'w-4 h-4')}
            <span>${t('detail.buyNow')}</span>
          </button>
        </div>
      </section>
    `;

    // Attach buy ticket handler
    this.container.querySelector('#btn-detail-buy-ticket')?.addEventListener('click', () => {
      window.dispatchEvent(
        new CustomEvent('neonpulse:add-to-cart', {
          detail: { concert },
        }),
      );
    });

    // Attach back handler
    this.container.querySelector('#btn-detail-back-lineup')?.addEventListener('click', () => {
      if (this.onNavigateToLineup) {
        this.onNavigateToLineup();
      }
    });
  }
}
