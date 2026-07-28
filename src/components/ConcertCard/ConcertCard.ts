import type { Concert } from '../../models';
import { ConcertStatus } from '../../models';
import {
  createElement,
  Music,
  Calendar,
  Clock,
  Ticket,
  Radio,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide';

/**
 * Convierte una definición de icono Lucide a una cadena SVG limpia de forma segura.
 */
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
  } catch (error) {
    console.warn('[NeonPulse] Error al renderizar icono:', error);
    return '';
  }
}

/**
 * Formatea una fecha a una cadena legible en español.
 */
function formatDate(date?: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Fecha por confirmar';
  }
  try {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return 'Fecha por confirmar';
  }
}

/**
 * Obtiene la configuración del badge y botón según el estado del concierto con botones rockeros de alto contraste.
 */
function getStatusConfig(status?: ConcertStatus) {
  switch (status) {
    case ConcertStatus.LIVE:
      return {
        label: 'EN VIVO ⚡',
        badgeClass: 'bg-red-950/90 text-red-400 border border-red-700 font-black tracking-widest animate-pulse shadow',
        buttonText: 'Ver Transmisión',
        buttonDisabled: false,
        buttonClass: 'bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider border border-red-500 shadow-[0_0_12px_rgba(220,38,38,0.3)] cursor-pointer',
        icon: Radio,
      };
    case ConcertStatus.SCHEDULED:
      return {
        label: 'Programado',
        badgeClass: 'bg-zinc-900/90 text-zinc-200 border border-zinc-700 font-extrabold tracking-wider shadow',
        buttonText: 'Comprar Entradas',
        buttonDisabled: false,
        buttonClass: 'bg-zinc-100 hover:bg-white text-zinc-950 font-black uppercase tracking-wider border border-zinc-200 shadow-[0_0_12px_rgba(255,255,255,0.12)] cursor-pointer',
        icon: Ticket,
      };
    case ConcertStatus.FINISHED:
      return {
        label: 'Finalizado',
        badgeClass: 'bg-zinc-900/90 text-zinc-400 border border-zinc-800 font-bold uppercase shadow',
        buttonText: 'Show Finalizado',
        buttonDisabled: true,
        buttonClass: 'bg-zinc-900 text-zinc-600 font-bold uppercase tracking-wider border border-zinc-800 cursor-not-allowed',
        icon: CheckCircle2,
      };
    case ConcertStatus.CANCELLED:
      return {
        label: 'Cancelado',
        badgeClass: 'bg-zinc-900/90 text-red-500 border border-red-900/80 font-bold uppercase line-through shadow',
        buttonText: 'Show Cancelado',
        buttonDisabled: true,
        buttonClass: 'bg-zinc-900 text-zinc-600 font-bold uppercase tracking-wider border border-zinc-800 cursor-not-allowed',
        icon: XCircle,
      };
    default:
      return {
        label: status || 'Por confirmar',
        badgeClass: 'bg-zinc-900/90 text-zinc-200 border border-zinc-700 font-extrabold tracking-wider shadow',
        buttonText: 'Ver Detalles',
        buttonDisabled: false,
        buttonClass: 'bg-zinc-100 hover:bg-white text-zinc-950 font-black uppercase tracking-wider border border-zinc-200 shadow-[0_0_12px_rgba(255,255,255,0.12)] cursor-pointer',
        icon: Ticket,
      };
  }
}

/**
 * Genera el HTML declarativo y seguro de la tarjeta del concierto con diseño compacto Punk Rock y botones de alto contraste.
 */
export function generateConcertCardHtml(concert: Concert): string {
  if (!concert) {
    return `
      <article class="h-full bg-zinc-950 border border-red-600/40 rounded-xl p-5 text-center text-red-400 flex flex-col justify-center">
        <p class="font-bold uppercase text-sm">Información de concierto no disponible</p>
      </article>
    `;
  }

  const config = getStatusConfig(concert.status);
  const formattedDate = formatDate(concert.date);
  const timeDisplay = concert.time ? `${concert.time} hrs` : 'Por confirmar';
  const title = concert.title || 'Concierto sin título';
  const band = concert.band || 'Artista por confirmar';
  const id = concert.id || 'desconocido';
  const imageUrl = concert.imageUrl || '/images/punk1.png';

  return `
    <article 
      class="group bg-zinc-950 border border-zinc-800/90 rounded-xl overflow-hidden shadow-lg hover:border-zinc-500 transition-all duration-200 flex flex-col justify-between h-full relative" 
      data-id="${id}"
    >
      <!-- Cabecera con Imagen de Portada Compacta -->
      <div class="relative w-full h-40 overflow-hidden bg-zinc-900 shrink-0">
        <img 
          src="${imageUrl}" 
          alt="${title}" 
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 contrast-110 brightness-90"
          onerror="this.src='/images/punk1.png'"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-black/40"></div>
        <span class="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${config.badgeClass}">
          ${renderIcon(config.icon, 'w-3 h-3')}
          ${config.label}
        </span>
      </div>

      <!-- Cuerpo de la Tarjeta Compacto sin aire perdido -->
      <div class="p-4 flex flex-col justify-between flex-grow gap-3">
        <header class="flex flex-col gap-1">
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
            <span><strong class="text-zinc-400 font-semibold">Fecha:</strong> ${formattedDate}</span>
          </div>
          <div class="flex items-center gap-2">
            ${renderIcon(Clock, 'w-3.5 h-3.5 text-zinc-400 shrink-0')}
            <span><strong class="text-zinc-400 font-semibold">Hora:</strong> ${timeDisplay}</span>
          </div>
        </div>

        <footer class="mt-auto pt-1">
          <button 
            class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-black text-xs uppercase tracking-wider transition-all duration-150 ${config.buttonClass}" 
            ${config.buttonDisabled ? 'disabled' : ''}
            aria-label="${config.buttonText} para ${title}"
          >
            ${renderIcon(Ticket, 'w-3.5 h-3.5')}
            <span>${config.buttonText}</span>
          </button>
        </footer>
      </div>
    </article>
  `;
}

/**
 * Crea e instancia un nodo HTMLElement seguro para la tarjeta del concierto.
 * Retorna un fallback UI elegante si ocurre cualquier falla durante el renderizado.
 */
export function createConcertCardElement(concert: Concert): HTMLElement {
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generateConcertCardHtml(concert).trim();
    const element = tempDiv.firstElementChild as HTMLElement | null;

    if (!element) {
      throw new Error('No se pudo generar el elemento del DOM.');
    }

    return element;
  } catch (error) {
    console.error(`[NeonPulse] Error al crear la tarjeta del concierto (${concert?.id || 'desconocido'}):`, error);

    // Componente Fallback UI de error individual
    const fallbackArticle = document.createElement('article');
    fallbackArticle.className = 'h-full bg-zinc-950 border border-red-600/40 rounded-xl p-4 text-center text-red-400 flex flex-col justify-center items-center gap-2';
    
    const icon = renderIcon(AlertTriangle, 'w-5 h-5 text-red-400');
    fallbackArticle.innerHTML = `
      ${icon}
      <p class="text-xs font-black uppercase">No se pudo cargar esta tocata.</p>
    `;
    return fallbackArticle;
  }
}
