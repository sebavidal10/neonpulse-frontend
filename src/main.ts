import './styles/global.css';
import { ConcertService } from './services/concert.service';
import { ConcertBoardView } from './views/concertBoard.view';

/**
 * Inicializa y orquesta la aplicación NeonPulse con Top-Level Await.
 */
async function bootstrap(): Promise<void> {
  const view = new ConcertBoardView();

  try {
    // 1. Mostrar estado de carga (skeleton loaders)
    view.showLoading();

    // 2. Obtener datos de la fuente asíncrona
    const concerts = await ConcertService.getAllConcerts();

    // 3. Manejo de estado vacío
    if (concerts.length === 0) {
      view.showEmpty();
      return;
    }

    // 4. Renderizado exitoso de la cartelera
    view.renderConcerts(concerts);
  } catch (error) {
    console.error('[NeonPulse] Error crítico durante la inicialización:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Error al cargar los eventos.';
    view.showError(errorMessage, () => bootstrap());
  }
}

// Inicializar la aplicación utilizando Top-Level Await
await bootstrap();
