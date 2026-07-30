/**
 * Genera la vista de estado de error global con opción de reintento.
 */
export function createErrorStateElement(
  message: string = 'Ocurrió un problema al cargar los eventos.',
  onRetry?: () => void,
): HTMLElement {
  const container = document.createElement('div');
  container.className =
    'col-span-full text-center py-10 px-6 bg-zinc-950 border border-dashed border-red-600/40 rounded-xl text-zinc-400';

  container.innerHTML = `
    <h3 class="text-lg font-bold text-red-500 mb-2 uppercase">¡Ups! Ocurrió un problema al cargar los eventos.</h3>
    <p class="text-sm mb-4">${message}</p>
  `;

  if (onRetry) {
    const retryButton = document.createElement('button');
    retryButton.className =
      'px-5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all duration-150 shadow cursor-pointer';
    retryButton.textContent = 'Reintentar';
    retryButton.addEventListener('click', () => onRetry());
    container.appendChild(retryButton);
  }

  return container;
}

/**
 * Genera la vista de estado vacío cuando no hay conciertos disponibles.
 */
export function createEmptyStateElement(): HTMLElement {
  const container = document.createElement('div');
  container.className =
    'col-span-full text-center py-10 px-6 bg-zinc-950 border border-dashed border-zinc-800 rounded-xl text-zinc-400';
  container.innerHTML = `
    <p class="text-base font-bold uppercase">No hay conciertos programados por el momento. ¡Vuelve pronto!</p>
  `;
  return container;
}
