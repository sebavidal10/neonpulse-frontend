import { describe, it, expect } from 'vitest';
import { formatDate, getTime } from '../../src/utils/date.utils';

describe('date.utils', () => {
  describe('formatDate', () => {
    it('debe retornar "Fecha por confirmar" si no se proporciona fecha', () => {
      expect(formatDate(undefined)).toBe('Fecha por confirmar');
    });

    it('debe retornar "Fecha por confirmar" si se proporciona un objeto fecha inválido', () => {
      const invalidDate = new Date('fecha-invalida');
      expect(formatDate(invalidDate)).toBe('Fecha por confirmar');
    });

    it('debe retornar "Fecha por confirmar" si el argumento no es una instancia de Date', () => {
      // @ts-expect-error testing invalid type
      expect(formatDate('2026-08-15')).toBe('Fecha por confirmar');
    });

    it('debe formatear correctamente una fecha válida en español', () => {
      const date = new Date(2026, 7, 15); // 15 de agosto de 2026
      const result = formatDate(date);
      expect(result).toContain('15');
      expect(result).toContain('agosto');
      expect(result).toContain('2026');
    });

    it('debe manejar excepciones en toLocaleDateString y retornar fallback', () => {
      const mockDate = new Date();
      mockDate.toLocaleDateString = () => {
        throw new Error('Locale error');
      };
      expect(formatDate(mockDate)).toBe('Fecha por confirmar');
    });
  });

  describe('getTime', () => {
    it('debe retornar "Hora por confirmar" si no se proporciona fecha', () => {
      expect(getTime(undefined)).toBe('Hora por confirmar');
    });

    it('debe retornar "Hora por confirmar" si se proporciona un objeto fecha inválido', () => {
      const invalidDate = new Date('fecha-invalida');
      expect(getTime(invalidDate)).toBe('Hora por confirmar');
    });

    it('debe retornar "Hora por confirmar" si el argumento no es una instancia de Date', () => {
      // @ts-expect-error testing invalid type
      expect(getTime('20:00')).toBe('Hora por confirmar');
    });

    it('debe formatear correctamente la hora de una fecha válida', () => {
      const date = new Date(2026, 7, 15, 21, 30);
      const result = getTime(date);
      expect(result).toContain('21');
      expect(result).toContain('30');
    });

    it('debe manejar excepciones en toLocaleTimeString y retornar fallback', () => {
      const mockDate = new Date();
      mockDate.toLocaleTimeString = () => {
        throw new Error('Time error');
      };
      expect(getTime(mockDate)).toBe('Hora por confirmar');
    });
  });
});

