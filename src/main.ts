import './styles/global.css';
import { type Concert, ConcertStatus } from './models';
import { createConcertCardElement } from './components/ConcertCard';
import { createFeaturedBannerElement } from './components/FeaturedBanner/FeaturedBanner';

const bannerContainer = document.getElementById('contenedor-banner');
const carteleraContainer = document.getElementById('contenedor-cartelera');

const concertsList: Concert[] = [
  {
    id: '1',
    title: 'London Calling 50th Anniversary Live',
    band: 'The Clash & Special Guests',
    date: new Date('2026-08-14'),
    time: '21:30',
    status: ConcertStatus.LIVE,
    imageUrl: '/images/punk1.png',
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Blitzkrieg Bop Reunion Session',
    band: 'Ramones',
    date: new Date('2026-07-28'),
    time: '22:00',
    status: ConcertStatus.LIVE,
    imageUrl: '/images/punk2.png',
  },
  {
    id: '3',
    title: 'No Control 35th Anniversary Show',
    band: 'Bad Religion',
    date: new Date('2026-08-20'),
    time: '21:00',
    status: ConcertStatus.SCHEDULED,
    imageUrl: '/images/punk3.png',
  },
  {
    id: '4',
    title: 'Dookie & Insomniac Special Session',
    band: 'Green Day',
    date: new Date('2026-09-05'),
    time: '20:30',
    status: ConcertStatus.SCHEDULED,
    imageUrl: '/images/punk1.png',
  },
  {
    id: '5',
    title: 'And Out Come The Wolves World Tour',
    band: 'Rancid',
    date: new Date('2026-09-18'),
    time: '21:00',
    status: ConcertStatus.SCHEDULED,
    imageUrl: '/images/punk2.png',
  },
  {
    id: '6',
    title: 'Static Age Reunion Night',
    band: 'The Misfits',
    date: new Date('2026-05-10'),
    time: '22:30',
    status: ConcertStatus.FINISHED,
    imageUrl: '/images/punk3.png',
  },
  {
    id: '7',
    title: 'Mommy\'s Little Monster Revival',
    band: 'Social Distortion',
    date: new Date('2026-06-12'),
    time: '21:00',
    status: ConcertStatus.CANCELLED,
    imageUrl: '/images/punk1.png',
  },
];

/**
 * Renderiza la cartelera de conciertos y el banner destacado manejando excepciones.
 */
function renderApp(): void {
  if (!carteleraContainer) {
    console.error(
      '[NeonPulse] Error crítico: No se encontró el elemento "#contenedor-cartelera" en el DOM.',
    );
    return;
  }

  try {
    // 1. Renderizar Banner de Evento Destacado
    const featuredConcert = concertsList.find((c) => c.isFeatured) || concertsList[0];
    if (bannerContainer && featuredConcert) {
      try {
        const bannerElement = createFeaturedBannerElement(featuredConcert);
        bannerContainer.replaceChildren(bannerElement);
      } catch (bannerError) {
        console.error('[NeonPulse] Error al renderizar banner destacado:', bannerError);
      }
    }

    // 2. Manejo de Estado Vacío
    if (!concertsList || concertsList.length === 0) {
      carteleraContainer.innerHTML = `
        <div class="col-span-full text-center py-10 px-6 bg-zinc-950 border border-dashed border-zinc-800 rounded-xl text-zinc-400">
          <p class="text-base font-bold uppercase">No hay conciertos programados por el momento. ¡Vuelve pronto!</p>
        </div>
      `;
      return;
    }

    // 3. Renderizado Seguro por Componente con DocumentFragment (GRID)
    const fragment = document.createDocumentFragment();

    // Filtramos la lista para omitir el destacado en la lista o mostrar todos
    const gridConcerts = concertsList.filter((c) => !c.isFeatured);

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

    carteleraContainer.replaceChildren(fragment);
  } catch (globalError) {
    console.error(
      '[NeonPulse] Error no controlado al renderizar la cartelera:',
      globalError,
    );

    // Fallback UI Global ante Error Inesperado
    carteleraContainer.innerHTML = `
      <div class="col-span-full text-center py-10 px-6 bg-zinc-950 border border-dashed border-red-600/40 rounded-xl text-zinc-400">
        <h3 class="text-lg font-bold text-red-500 mb-2 uppercase">¡Ups! Ocurrió un problema al cargar los eventos.</h3>
        <p class="text-sm">No se pudo mostrar la lista de conciertos.</p>
        <button class="mt-4 px-5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all duration-150 shadow" onclick="window.location.reload()">Reintentar</button>
      </div>
    `;
  }
}

// Inicializar renderizado
renderApp();
