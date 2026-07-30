/**
 * Configuración global de la aplicación NeonPulse.
 */
export const APP_CONFIG = {
  /**
   * Ruta relativa a la fuente de datos de conciertos (JSON / API).
   */
  CONCERTS_DATA_URL: './data/concerts.json',

  /**
   * Simulación de latencia de red en milisegundos para entornos de desarrollo/demostración.
   * Ajustar a 0 en entornos reales.
   */
  SIMULATED_NETWORK_DELAY_MS: 0,
} as const;
