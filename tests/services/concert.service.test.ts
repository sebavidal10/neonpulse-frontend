import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConcertService } from '../../src/services/concert.service';
import { ConcertStatus, type Concert } from '../../src/models';

describe('ConcertService', () => {
  const mockConcertsRaw = [
    {
      id: '1',
      title: 'Punk Festival 2026',
      band: 'The Offspring',
      date: '2026-08-15',
      time: '21:00',
      status: 'LIVE',
      imageUrl: '/images/punk1.png',
      isFeatured: true,
    },
    {
      id: '2',
      title: 'Rock Night',
      band: 'Green Day',
      date: '2026-09-10',
      status: 'SCHEDULED',
      isFeatured: false,
    },
    {
      id: '3',
      title: 'Underground Jam',
      status: 'INVALID_STATUS',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('debe obtener y mapear correctamente los conciertos desde la API/JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockConcertsRaw,
    }));

    const concerts = await ConcertService.getAllConcerts(0);

    expect(concerts).toHaveLength(3);
    expect(concerts[0].id).toBe('1');
    expect(concerts[0].title).toBe('Punk Festival 2026');
    expect(concerts[0].band).toBe('The Offspring');
    expect(concerts[0].date).toBeInstanceOf(Date);
    expect(concerts[0].status).toBe(ConcertStatus.LIVE);
    expect(concerts[0].isFeatured).toBe(true);

    // Mapeo de valores por defecto cuando faltan propiedades
    expect(concerts[2].title).toBe('Underground Jam');
    expect(concerts[2].band).toBe('Artista desconocido');
    expect(concerts[2].time).toBeUndefined();
    expect(concerts[2].status).toBe(ConcertStatus.SCHEDULED);
    expect(concerts[2].imageUrl).toBeUndefined();
  });

  it('debe aplicar retardo simulado cuando delayMs > 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }));

    const startTime = Date.now();
    await ConcertService.getAllConcerts(10);
    const elapsedTime = Date.now() - startTime;

    expect(elapsedTime).toBeGreaterThanOrEqual(5);
  });

  it('debe lanzar error cuando response.ok es false', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    }));

    await expect(ConcertService.getAllConcerts(0)).rejects.toThrow(
      'Error HTTP al obtener los conciertos: status 404 (Not Found)',
    );
  });

  it('debe lanzar error cuando la respuesta JSON no es un array', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ error: 'Invalid payload' }),
    }));

    await expect(ConcertService.getAllConcerts(0)).rejects.toThrow(
      'La respuesta de conciertos no tiene un formato válido (se esperaba un array).',
    );
  });

  it('debe obtener el concierto destacado correctamente', () => {
    const list: Concert[] = [
      { id: '1', title: 'Regular', band: 'B1', date: new Date(), status: ConcertStatus.SCHEDULED, isFeatured: false },
      { id: '2', title: 'Featured', band: 'B2', date: new Date(), status: ConcertStatus.LIVE, isFeatured: true },
    ];

    const featured = ConcertService.getFeaturedConcert(list);
    expect(featured?.id).toBe('2');
  });

  it('debe retornar el primer concierto si ninguno tiene isFeatured=true', () => {
    const list: Concert[] = [
      { id: '1', title: 'First', band: 'B1', date: new Date(), status: ConcertStatus.SCHEDULED, isFeatured: false },
    ];

    const featured = ConcertService.getFeaturedConcert(list);
    expect(featured?.id).toBe('1');
  });

  it('debe retornar null si la lista de conciertos está vacía en getFeaturedConcert', () => {
    expect(ConcertService.getFeaturedConcert([])).toBeNull();
  });

  it('debe filtrar los conciertos para la grilla omitiendo el destacado', () => {
    const list: Concert[] = [
      { id: '1', title: 'Featured', band: 'B1', date: new Date(), status: ConcertStatus.LIVE, isFeatured: true },
      { id: '2', title: 'Grid 1', band: 'B2', date: new Date(), status: ConcertStatus.SCHEDULED, isFeatured: false },
      { id: '3', title: 'Grid 2', band: 'B3', date: new Date(), status: ConcertStatus.SCHEDULED, isFeatured: false },
    ];

    const grid = ConcertService.getGridConcerts(list);
    expect(grid).toHaveLength(2);
    expect(grid.map((c) => c.id)).toEqual(['2', '3']);
  });

  it('debe retornar la lista completa en getGridConcerts si la longitud es <= 1', () => {
    const single: Concert[] = [
      { id: '1', title: 'Single', band: 'B1', date: new Date(), status: ConcertStatus.LIVE, isFeatured: true },
    ];
    expect(ConcertService.getGridConcerts(single)).toEqual(single);
    expect(ConcertService.getGridConcerts([])).toEqual([]);
  });
});
