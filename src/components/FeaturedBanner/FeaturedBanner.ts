import type { Concert } from '../../models';
import { renderIcon } from '../../utils/icon.utils';
import { formatDate } from '../../utils/date.utils';
import { t } from '../../i18n';
import {
  Flame,
  Music,
  Calendar,
  Clock,
  Ticket,
  Radio,
  MapPin,
  Eye,
} from 'lucide';

export function createFeaturedBannerElement(
  concert: Concert,
  onSelectConcert?: (concert: Concert) => void,
  onOpenDetail?: (concert: Concert) => void,
): HTMLElement {
  const container = document.createElement('section');
  container.className =
    'w-full mb-6 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-xl relative group';

  const imageUrl = concert.imageUrl || '/images/punk1.png';
  const title = concert.title || 'Featured Gig';
  const band = concert.band || 'Headliner Artist';
  const formattedDate = formatDate(concert.date);
  const timeDisplay = concert.time ? `${concert.time}` : '21:00 EST';
  const venue = concert.venueName
    ? `${concert.venueName} (${concert.cityName || ''})`
    : concert.cityName
    ? concert.cityName
    : 'Underground Arena';
  const price = concert.ticketPrice ? `$${concert.ticketPrice.toLocaleString()}` : '$35.00';

  container.innerHTML = `
    <div class="relative min-h-[300px] md:min-h-[350px] flex flex-col justify-end p-5 md:p-7 overflow-hidden">
      <!-- Background Image with Dark Vignette Overlay -->
      <img 
        src="${imageUrl}" 
        alt="${title}" 
        class="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-75 contrast-125"
        onerror="this.src='/images/punk1.png'"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>

      <!-- Content -->
      <div class="relative z-10 max-w-2xl flex flex-col gap-2.5">
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-widest bg-red-700 text-white shadow">
            ${renderIcon(Flame, 'w-3 h-3 fill-current')}
            ${t('board.headlinerEvent')}
          </span>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-zinc-900 text-red-400 border border-red-800/80 animate-pulse">
            ${renderIcon(Radio, 'w-3 h-3')}
            ${t('board.onTourNow')}
          </span>
        </div>

        <h2 class="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight drop-shadow-md">
          ${title}
        </h2>

        <div class="flex items-center gap-2 text-zinc-200 font-extrabold text-base md:text-lg">
          ${renderIcon(Music, 'w-4 h-4 text-red-500')}
          <span class="text-red-500">${band}</span>
        </div>

        <div class="flex flex-wrap items-center gap-3 text-xs text-zinc-300 font-semibold pt-1">
          <div class="flex items-center gap-1.5 bg-zinc-900/90 px-2.5 py-1 rounded border border-zinc-800">
            ${renderIcon(Calendar, 'w-3.5 h-3.5 text-zinc-400')}
            <span>${formattedDate}</span>
          </div>
          <div class="flex items-center gap-1.5 bg-zinc-900/90 px-2.5 py-1 rounded border border-zinc-800">
            ${renderIcon(Clock, 'w-3.5 h-3.5 text-zinc-400')}
            <span>${timeDisplay}</span>
          </div>
          <div class="flex items-center gap-1.5 bg-zinc-900/90 px-2.5 py-1 rounded border border-zinc-800 text-zinc-200">
            ${renderIcon(MapPin, 'w-3.5 h-3.5 text-red-500')}
            <span>${venue}</span>
          </div>
        </div>

        <div class="pt-2 flex flex-wrap items-center gap-3">
          <button 
            type="button"
            id="btn-featured-detail" 
            class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-black text-xs md:text-sm uppercase tracking-wider bg-zinc-900/90 hover:bg-zinc-800 text-white border border-zinc-700 transition-all duration-150 shadow cursor-pointer"
          >
            ${renderIcon(Eye, 'w-4 h-4 text-zinc-400')}
            <span>${t('board.viewDetails')}</span>
          </button>

          <button 
            type="button"
            id="btn-featured-book" 
            class="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-black text-xs md:text-sm uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white border border-red-500 transition-all duration-150 shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:scale-105 cursor-pointer"
          >
            ${renderIcon(Ticket, 'w-4 h-4')}
            <span>${t('board.buyTickets')} (${price})</span>
          </button>
        </div>
      </div>
    </div>
  `;

  const bookBtn = container.querySelector<HTMLButtonElement>('#btn-featured-book');
  if (bookBtn && onSelectConcert) {
    bookBtn.addEventListener('click', () => {
      onSelectConcert(concert);
    });
  }

  const detailBtn = container.querySelector<HTMLButtonElement>('#btn-featured-detail');
  if (detailBtn) {
    detailBtn.addEventListener('click', () => {
      if (onOpenDetail) {
        onOpenDetail(concert);
      } else if (onSelectConcert) {
        onSelectConcert(concert);
      }
    });
  }

  return container;
}
