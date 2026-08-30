import { describe, it, expect } from 'vitest';
import { APP_CONFIG, getConcertsDataUrl, getBaseApiUrl } from '../../src/config/app.config';

describe('app.config', () => {
  it('debe tener definida la ruta de datos y el retardo simulado', () => {
    expect(APP_CONFIG.CONCERTS_DATA_URL).toBe('http://localhost:8080/api/v1/concerts');
    expect(APP_CONFIG.BASE_API_URL).toBe('http://localhost:8080/api/v1');
    expect(typeof APP_CONFIG.SIMULATED_NETWORK_DELAY_MS).toBe('number');
    expect(typeof APP_CONFIG.SIMULATED_PAYMENT_DELAY_MS).toBe('number');
  });

  it('debe resolver la URL provista por variable de entorno', () => {
    expect(getConcertsDataUrl('http://custom-api:9000/api/v1/concerts')).toBe(
      'http://custom-api:9000/api/v1/concerts',
    );
    expect(getBaseApiUrl('http://custom-api:9000/api/v1')).toBe(
      'http://custom-api:9000/api/v1',
    );
  });

  it('debe resolver el fallback por defecto si no se especifica variable de entorno', () => {
    expect(getConcertsDataUrl(undefined)).toBe('http://localhost:8080/api/v1/concerts');
    expect(getConcertsDataUrl('')).toBe('http://localhost:8080/api/v1/concerts');
    expect(getBaseApiUrl(undefined)).toBe('http://localhost:8080/api/v1');
    expect(getBaseApiUrl('')).toBe('http://localhost:8080/api/v1');
  });
});
