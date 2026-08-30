import type { Concert } from '../../models';
import { ConcertStatus } from '../../models';
import { renderIcon } from '../../utils/icon.utils';
import { formatDate } from '../../utils/date.utils';
import { t } from '../../i18n';
import {
  Music,
  Calendar,
  Ticket,
  Radio,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  Eye,
} from 'lucide';

function getStatusConfig(status?: ConcertStatus) {
  switch (status) {
    case ConcertStatus.LIVE:
      return {
        label: 'LIVE NOW ⚡',
        badgeClass:
          'bg-red-950/90 text-red-400 border border-red-700 font-black tracking-widest animate-pulse shadow',
        buttonText: 'Watch Live Stream',
        buttonDisabled: false,
        buttonClass:
          'bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider border border-red-500 shadow-[0_0_12px_rgba(220,38,38,0.3)] cursor-pointer',
        icon: Radio,
      };
    case ConcertStatus.SCHEDULED:
      return {
        label: 'Confirmed',
        badgeClass:
          'bg-zinc-900/90 text-zinc-200 border border-zinc-700 font-extrabold tracking-wider shadow',
        buttonText: 'Book Tickets',
        buttonDisabled: false,
        buttonClass:
          'bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider border border-red-500 shadow-[0_0_12px_rgba(220,38,38,0.3)] hover:scale-[1.02] cursor-pointer',
        icon: Ticket,
      };
    case ConcertStatus.SOLD_OUT:
      return {
        label: 'Sold Out',
        badgeClass:
          'bg-red-950/90 text-red-400 border border-red-900 font-bold uppercase shadow',
        buttonText: 'Sold Out',
        buttonDisabled: true,
        buttonClass:
          'bg-zinc-900 text-zinc-600 font-bold uppercase tracking-wider border border-zinc-800 cursor-not-allowed',
        icon: XCircle,
      };
    case ConcertStatus.FINISHED:
      return {
        label: 'Concluded',
        badgeClass:
          'bg-zinc-900/90 text-zinc-400 border border-zinc-800 font-bold uppercase shadow',
        buttonText: 'Gig Concluded',
        buttonDisabled: true,
        buttonClass:
          'bg-zinc-900 text-zinc-600 font-bold uppercase tracking-wider border border-zinc-800 cursor-not-allowed',
        icon: CheckCircle2,
      };
    case ConcertStatus.CANCELLED:
      return {
        label: 'Cancelled',
        badgeClass:
          'bg-zinc-900/90 text-red-500 border border-red-900/80 font-bold uppercase line-through shadow',
        buttonText: 'Gig Cancelled',
        buttonDisabled: true,
        buttonClass:
          'bg-zinc-900 text-zinc-600 font-bold uppercase tracking-wider border border-zinc-800 cursor-not-allowed',
        icon: XCircle,
      };
    default:
      return {
        label: status || 'Pending',
        badgeClass:
          'bg-zinc-900/90 text-zinc-200 border border-zinc-700 font-extrabold tracking-wider shadow',
        buttonText: 'View Details',
        buttonDisabled: false,
        buttonClass:
          'bg-zinc-100 hover:bg-white text-zinc-950 font-black uppercase tracking-wider border border-zinc-200 shadow-[0_0_12px_rgba(255,255,255,0.12)] cursor-pointer',
        icon: Ticket,
      };
  }
}

export function generateConcertCardHtml(concert: Concert): string {
  if (!concert) {
    return `
      <article class="h-full bg-zinc-950 border border-red-600/40 rounded-xl p-5 text-center text-red-400 flex flex-col justify-center">
        <p class="font-bold uppercase text-sm">Concert information unavailable</p>
      </article>
    `;
  }

  const config = getStatusConfig(concert.status);
  const formattedDate = formatDate(concert.date);
  const timeDisplay = concert.time ? `${concert.time}` : '20:00 EST';
  const title = concert.title || 'Untitled Gig';
  const band = concert.band || 'TBA Band';
  const id = concert.id || 'unknown';
  const imageUrl = concert.imageUrl || '/images/punk1.png';
  const price = concert.ticketPrice ? `$${concert.ticketPrice.toLocaleString()}` : '$35.00';
  const venue = concert.venueName
    ? `${concert.venueName}${concert.cityName ? ' (' + concert.cityName + ')' : ''}`
    : concert.cityName || 'Underground Vault';

  return `
    <article 
      class="group bg-zinc-950 border border-zinc-800/90 rounded-xl overflow-hidden shadow-lg hover:border-red-600/60 transition-all duration-200 flex flex-col justify-between h-full relative" 
      data-id="${id}"
    >
      <!-- Cover Header (Clickable for details) -->
      <div class="card-cover-trigger relative w-full h-44 overflow-hidden bg-zinc-900 shrink-0 cursor-pointer" title="${t('board.viewDetails')}">
        <img 
          src="${imageUrl}" 
          alt="${title}" 
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 contrast-110 brightness-90"
          onerror="this.src='/images/punk1.png'"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-black/40"></div>
        <span class="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${config.badgeClass}">
          ${renderIcon(config.icon, 'w-3 h-3')}
          ${config.label}
        </span>
        <div class="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded bg-zinc-950/90 border border-zinc-700 text-xs font-black text-white">
          ${price}
        </div>
      </div>

      <!-- Card Body -->
      <div class="p-4 flex flex-col justify-between flex-grow gap-3">
        <header class="card-title-trigger flex flex-col gap-1 cursor-pointer">
          <h3 class="text-base md:text-lg font-black text-white uppercase tracking-tight leading-snug group-hover:text-red-500 transition-colors duration-150 line-clamp-2">
            ${title}
          </h3>
          <div class="flex items-center gap-1.5 text-red-500 font-extrabold text-xs tracking-wider">
            ${renderIcon(Music, 'w-3.5 h-3.5 shrink-0 text-red-500')}
            <span>${band}</span>
          </div>
        </header>

        <div class="flex flex-col gap-1.5 pt-2.5 border-t border-zinc-800/80 text-xs text-zinc-300">
          <div class="flex items-center gap-2">
            ${renderIcon(Calendar, 'w-3.5 h-3.5 text-zinc-400 shrink-0')}
            <span><strong class="text-zinc-400 font-semibold">Date:</strong> ${formattedDate} (${timeDisplay})</span>
          </div>
          <div class="flex items-center gap-2">
            ${renderIcon(MapPin, 'w-3.5 h-3.5 text-zinc-400 shrink-0')}
            <span><strong class="text-zinc-400 font-semibold">Venue:</strong> ${venue}</span>
          </div>
        </div>

        <footer class="mt-auto pt-1 flex items-center gap-2">
          <button 
            type="button"
            class="btn-view-detail flex items-center justify-center p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="${t('board.viewDetails')}"
            aria-label="${t('board.viewDetails')}"
          >
            ${renderIcon(Eye, 'w-4 h-4')}
          </button>

          <button 
            type="button"
            class="btn-book-ticket flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-black text-xs uppercase tracking-wider transition-all duration-150 ${config.buttonClass}" 
            ${config.buttonDisabled ? 'disabled' : ''}
            aria-label="${config.buttonText} for ${title}"
          >
            ${renderIcon(Ticket, 'w-3.5 h-3.5')}
            <span>${config.buttonText}</span>
          </button>
        </footer>
      </div>
    </article>
  `;
}

export function createConcertCardElement(
  concert: Concert,
  onSelectConcert?: (concert: Concert) => void,
  onOpenDetail?: (concert: Concert) => void,
): HTMLElement {
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generateConcertCardHtml(concert).trim();
    const element = tempDiv.firstElementChild as HTMLElement | null;

    if (!element) {
      throw new Error('Could not create DOM element.');
    }

    const bookBtn = element.querySelector<HTMLButtonElement>('.btn-book-ticket');
    if (bookBtn && !bookBtn.disabled) {
      bookBtn.addEventListener('click', () => {
        if (onSelectConcert) {
          onSelectConcert(concert);
        }
      });
    }

    const detailBtn = element.querySelector<HTMLButtonElement>('.btn-view-detail');
    const coverTrigger = element.querySelector<HTMLElement>('.card-cover-trigger');
    const titleTrigger = element.querySelector<HTMLElement>('.card-title-trigger');

    const handleDetailClick = () => {
      if (onOpenDetail) {
        onOpenDetail(concert);
      } else if (onSelectConcert) {
        onSelectConcert(concert);
      }
    };

    detailBtn?.addEventListener('click', handleDetailClick);
    coverTrigger?.addEventListener('click', handleDetailClick);
    titleTrigger?.addEventListener('click', handleDetailClick);

    return element;
  } catch (error) {
    let concertId = 'unknown';
    try {
      if (concert && 'id' in concert) {
        concertId = String(concert.id);
      }
    } catch {
      // ignore
    }
    console.error(`[NeonPulse] Error creating concert card (${concertId}):`, error);

    const fallbackArticle = document.createElement('article');
    fallbackArticle.className =
      'h-full bg-zinc-950 border border-red-600/40 rounded-xl p-4 text-center text-red-400 flex flex-col justify-center items-center gap-2';

    const icon = renderIcon(AlertTriangle, 'w-5 h-5 text-red-400');
    fallbackArticle.innerHTML = `
      ${icon}
      <p class="text-xs font-black uppercase">Failed to load this gig.</p>
    `;
    return fallbackArticle;
  }
}
