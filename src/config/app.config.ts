/**
 * Resolves base API URL with fallback.
 */
export function getBaseApiUrl(envUrl?: string): string {
  if (envUrl) {
    return envUrl.endsWith('/concerts') ? envUrl.replace('/concerts', '') : envUrl;
  }
  return 'http://localhost:8080/api/v1';
}

/**
 * Resolves concerts endpoint URL with fallback.
 */
export function getConcertsDataUrl(envUrl?: string): string {
  if (envUrl) {
    return envUrl.endsWith('/concerts') ? envUrl : `${envUrl}/concerts`;
  }
  return 'http://localhost:8080/api/v1/concerts';
}

const BASE_URL = getBaseApiUrl(import.meta.env?.VITE_API_URL);

/**
 * Global NeonPulse configuration.
 */
export const APP_CONFIG = {
  BASE_API_URL: BASE_URL,
  CONCERTS_DATA_URL: getConcertsDataUrl(import.meta.env?.VITE_API_URL),
  AUTH_API_URL: `${BASE_URL}/auth`,
  USERS_API_URL: `${BASE_URL}/users`,
  SIMULATED_NETWORK_DELAY_MS: 0,
  SIMULATED_PAYMENT_DELAY_MS: 1400,
} as const;
