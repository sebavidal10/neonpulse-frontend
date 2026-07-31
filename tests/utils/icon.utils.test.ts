import { describe, it, expect, vi } from 'vitest';
import { renderIcon } from '../../src/utils/icon.utils';
import { Music } from 'lucide';
import * as lucide from 'lucide';

describe('icon.utils', () => {
  it('debe retornar cadena vacía si no se pasa definición de icono', () => {
    // @ts-expect-error testing undefined
    expect(renderIcon(undefined)).toBe('');
  });

  it('debe renderizar un icono válido de Lucide a SVG en HTML', () => {
    const result = renderIcon(Music);
    expect(result).toContain('<svg');
    expect(result).toContain('</svg>');
  });

  it('debe agregar clases adicionales al icono renderizado', () => {
    const result = renderIcon(Music, 'w-4 h-4 text-red-500');
    expect(result).toContain('w-4');
    expect(result).toContain('h-4');
    expect(result).toContain('text-red-500');
  });

  it('debe manejar errores al renderizar y retornar cadena vacía', () => {
    const invalidIcon = [Symbol('invalid') as unknown as string, {}] as unknown as Parameters<
      typeof renderIcon
    >[0];

    const result = renderIcon(invalidIcon);
    expect(result).toBe('');
  });
});
