import { t } from '../../i18n';

/**
 * Generates global error state view with optional retry action.
 */
export function createErrorStateElement(
  message: string = 'Failed to load gig lineup.',
  onRetry?: () => void,
): HTMLElement {
  const container = document.createElement('div');
  container.className =
    'col-span-full text-center py-10 px-6 bg-zinc-950 border border-dashed border-red-600/40 rounded-xl text-zinc-400';

  container.innerHTML = `
    <h3 class="text-lg font-bold text-red-500 mb-2 uppercase">${t('board.errorTitle')}</h3>
    <p class="text-sm mb-4">${message}</p>
  `;

  if (onRetry) {
    const retryButton = document.createElement('button');
    retryButton.className =
      'px-5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all duration-150 shadow cursor-pointer';
    retryButton.textContent = t('board.retryButton');
    retryButton.addEventListener('click', () => onRetry());
    container.appendChild(retryButton);
  }

  return container;
}

/**
 * Generates empty state view when no concerts exist.
 */
export function createEmptyStateElement(): HTMLElement {
  const container = document.createElement('div');
  container.className =
    'col-span-full text-center py-10 px-6 bg-zinc-950 border border-dashed border-zinc-800 rounded-xl text-zinc-400';
  container.innerHTML = `
    <h3 class="text-base font-bold text-white uppercase mb-1">${t('board.emptyTitle')}</h3>
    <p class="text-xs text-zinc-400">${t('board.emptyDescription')}</p>
  `;
  return container;
}
