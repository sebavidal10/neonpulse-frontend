import type { Concert } from '../../models';
import {
  createElement,
  Flame,
  Music,
  Calendar,
  Clock,
  Ticket,
  Radio,
  MapPin,
} from 'lucide';

function renderIcon(
  iconDef: Parameters<typeof createElement>[0],
  extraClass: string = '',
): string {
  try {
    if (!iconDef) return '';
    const iconEl = createElement(iconDef);
    if (extraClass) {
      iconEl.classList.add(...extraClass.split(' '));
    }
    return iconEl.outerHTML;
  } catch {
    return '';
  }
}

/**
 * Genera el Banner de Evento Destacado a ancho completo con estilo Punk Rock compacto de alto contraste.
 */
export function createFeaturedBannerElement(concert: Concert): HTMLElement {
  const container = document.createElement('section');
  container.className = 'w-full mb-6 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-xl relative group';

  const imageUrl = concert.imageUrl || '/images/punk1.png';
  const title = concert.title || 'London Calling 50th Anniversary Live';
  const band = concert.band || 'The Clash & Special Guests';

  container.innerHTML = `
    <div class="relative min-h-[300px] md:min-h-[350px] flex flex-col justify-end p-5 md:p-7 overflow-hidden">
      <!-- Imagen de fondo con overlay de alto contraste -->
      <img 
        src="${imageUrl}" 
        alt="${title}" 
        class="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-75 contrast-125"
        onerror="this.src='/images/punk1.png'"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>

      <!-- Contenido compacto sin aire perdido -->
      <div class="relative z-10 max-w-2xl flex flex-col gap-2.5">
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-widest bg-red-700 text-white shadow">
            ${renderIcon(Flame, 'w-3 h-3 fill-current')}
            HEADLINER PUNK
          </span>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-zinc-900 text-red-400 border border-red-800/80 animate-pulse">
            ${renderIcon(Radio, 'w-3 h-3')}
            EN VIVO AHORA
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
            <span>Viernes 14 de Agosto, 2026</span>
          </div>
          <div class="flex items-center gap-1.5 bg-zinc-900/90 px-2.5 py-1 rounded border border-zinc-800">
            ${renderIcon(Clock, 'w-3.5 h-3.5 text-zinc-400')}
            <span>21:30 hrs</span>
          </div>
          <div class="flex items-center gap-1.5 bg-zinc-900/90 px-2.5 py-1 rounded border border-zinc-800 text-zinc-200">
            ${renderIcon(MapPin, 'w-3.5 h-3.5 text-red-500')}
            <span>CBGB Stage Underground</span>
          </div>
        </div>

        <div class="pt-2 flex flex-wrap gap-3">
          <button class="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-black text-xs md:text-sm uppercase tracking-wider bg-zinc-100 hover:bg-white text-zinc-950 border border-zinc-200 transition-all duration-150 shadow-[0_0_15px_rgba(255,255,255,0.15)] cursor-pointer">
            ${renderIcon(Ticket, 'w-4 h-4')}
            <span>Obtener Pases VIP</span>
          </button>
        </div>
      </div>
    </div>
  `;

  return container;
}
