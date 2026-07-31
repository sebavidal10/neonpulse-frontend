import { createElement } from 'lucide';

/**
 * Convierte una definición de icono Lucide a una cadena SVG limpia de forma segura.
 */
export function renderIcon(
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
