import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConcertService } from '../../src/services/concert.service';
import { ConcertStatus } from '../../src/models';

describe('Concert Contract & Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('debe procesar fielmente el payload real del backend Spring Boot (ConcertResponseDto)', async () => {
    const springBootPayload = [
      {
        id: 1,
        code: 'COD-001',
        band: 'The Clash',
        date: '2026-10-15',
        status: 'OPEN',
        totalTickets: 100,
        availableTickets: 50,
        ticketPrice: 25000,
        cityId: 1,
        cityCode: 'SCL',
        cityName: 'Santiago',
      },
      {
        id: 2,
        code: 'COD-002',
        band: 'Sex Pistols',
        date: '2026-11-20',
        status: 'CLOSED',
        totalTickets: 200,
        availableTickets: 0,
        ticketPrice: 30000,
        cityId: 2,
        cityCode: 'VAL',
        cityName: 'Valparaíso',
      },
    ];

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => springBootPayload,
      }),
    );

    const concerts = await ConcertService.getAllConcerts(0);

    expect(concerts).toHaveLength(2);

    // Event 1 (OPEN -> SCHEDULED)
    expect(concerts[0].id).toBe('1');
    expect(concerts[0].band).toBe('The Clash');
    expect(concerts[0].title).toBe('The Clash - Live in Santiago');
    expect(concerts[0].status).toBe(ConcertStatus.SCHEDULED);
    expect(concerts[0].date).toBeInstanceOf(Date);

    // Event 2 (CLOSED -> FINISHED)
    expect(concerts[1].id).toBe('2');
    expect(concerts[1].band).toBe('Sex Pistols');
    expect(concerts[1].title).toBe('Sex Pistols - Live in Valparaíso');
    expect(concerts[1].status).toBe(ConcertStatus.FINISHED);
  });
});
