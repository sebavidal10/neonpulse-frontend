/**
 * Formatea una fecha a una cadena legible en español (ej. "14 de agosto de 2026").
 */
export function formatDate(date?: Date): string {
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
