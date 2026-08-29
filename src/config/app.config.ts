/**
 * Resuelve la URL de la API de conciertos con fallback seguro.
 */
export function getConcertsDataUrl(envUrl?: string): string {
  return envUrl || 'http://localhost:8080/api/v1/concerts';
}

/**
 * Configuración global de la aplicación NeonPulse.
 */
export const APP_CONFIG = {
  /**
   * URL de la API de conciertos obtenida desde variable de entorno de Vite o fallback seguro.
   */
  CONCERTS_DATA_URL: getConcertsDataUrl(import.meta.env?.VITE_API_URL),
  /**
   * Simulación de latencia de red en milisegundos para entornos de desarrollo/demostración.
   * Ajustar a 0 en entornos reales.
   */
  SIMULATED_NETWORK_DELAY_MS: 0,
} as const;


