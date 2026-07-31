import { describe, it, expect } from 'vitest';
import { APP_CONFIG } from '../../src/config/app.config';

describe('app.config', () => {
  it('debe tener definida la ruta de datos y el retardo simulado', () => {
    expect(APP_CONFIG.CONCERTS_DATA_URL).toBe('./data/concerts.json');
    expect(typeof APP_CONFIG.SIMULATED_NETWORK_DELAY_MS).toBe('number');
  });
});
