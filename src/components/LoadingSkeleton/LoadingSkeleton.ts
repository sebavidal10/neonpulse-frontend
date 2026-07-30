/**
 * Genera el esqueleto de carga (skeleton loader) para el banner destacado.
 */
export function createBannerSkeletonElement(): HTMLElement {
  const skeleton = document.createElement('div');
  skeleton.className =
    'w-full h-48 md:h-64 mb-6 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse flex flex-col justify-end p-6 gap-3';
  skeleton.innerHTML = `
    <div class="h-4 w-32 bg-zinc-800 rounded"></div>
    <div class="h-8 w-3/4 md:w-1/2 bg-zinc-800 rounded"></div>
    <div class="h-4 w-1/3 bg-zinc-800 rounded"></div>
  `;
  return skeleton;
}

/**
 * Genera esqueletos de carga para la grilla de conciertos.
 */
export function createGridSkeletonElement(count: number = 3): DocumentFragment {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className =
      'h-72 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse p-4 flex flex-col justify-between';
    card.innerHTML = `
      <div class="h-32 w-full bg-zinc-800 rounded-lg mb-3"></div>
      <div class="space-y-2">
        <div class="h-5 w-3/4 bg-zinc-800 rounded"></div>
        <div class="h-4 w-1/2 bg-zinc-800 rounded"></div>
      </div>
      <div class="h-8 w-full bg-zinc-800 rounded mt-3"></div>
    `;
    fragment.appendChild(card);
  }

  return fragment;
}
