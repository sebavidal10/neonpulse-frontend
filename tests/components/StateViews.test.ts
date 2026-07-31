import { describe, it, expect, vi } from 'vitest';
import {
  createErrorStateElement,
  createEmptyStateElement,
} from '../../src/components/StateViews/StateViews';

describe('StateViews Components', () => {
  it('debe crear un elemento de estado de error con mensaje y botón de reintento', () => {
    const onRetry = vi.fn();
    const el = createErrorStateElement('Error al cargar la API', onRetry);

    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.innerHTML).toContain('Error al cargar la API');

    const button = el.querySelector('button');
    expect(button).not.toBeNull();
    button?.click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('debe crear un elemento de estado de error sin botón cuando no se proporciona onRetry', () => {
    const el = createErrorStateElement('Error de conexión');
    expect(el.innerHTML).toContain('Error de conexión');
    expect(el.querySelector('button')).toBeNull();
  });

  it('debe crear un elemento de estado vacío', () => {
    const el = createEmptyStateElement();
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.innerHTML).toContain('No hay conciertos programados por el momento.');
  });
});
