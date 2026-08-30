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
      ticketPrice: 45000,
      availableTickets: 20,
    },
    {
      id: '2',
      title: 'Rock Night',
      band: 'Green Day',
      date: '2026-09-10',
      status: 'OPEN',
      availableTickets: 0,
      isFeatured: false,
    },
    {
      id: '3',
      title: 'Underground Jam',
      status: 'SOLD_OUT',
    },
    {
      id: '4',
      status: 'CLOSED',
    },
    {
      id: '5',
      band: 'The Clash',
      status: 'SCHEDULED',
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

    expect(concerts).toHaveLength(5);
    expect(concerts[0].id).toBe('1');
    expect(concerts[0].title).toBe('Punk Festival 2026');
    expect(concerts[0].band).toBe('The Offspring');
    expect(concerts[0].date).toBeInstanceOf(Date);
    expect(concerts[0].status).toBe(ConcertStatus.LIVE);
    expect(concerts[0].isFeatured).toBe(true);

    expect(concerts[1].status).toBe(ConcertStatus.SOLD_OUT);
    expect(concerts[2].status).toBe(ConcertStatus.SOLD_OUT);
    expect(concerts[3].status).toBe(ConcertStatus.FINISHED);

    expect(concerts[3].title).toBe('Unknown Artist - Underground Live');
    expect(concerts[3].band).toBe('Unknown Artist');

    expect(concerts[4].title).toBe('The Clash - Underground Live');
    expect(concerts[4].band).toBe('The Clash');
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

  it('debe lanzar error cuando response.ok es false en getAllConcerts', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    }));

    await expect(ConcertService.getAllConcerts(0)).rejects.toThrow(
      'HTTP error while fetching concerts: status 404 (Not Found)',
    );
  });

  it('debe lanzar error cuando la respuesta JSON no es un array', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ error: 'Invalid payload' }),
    }));

    await expect(ConcertService.getAllConcerts(0)).rejects.toThrow(
      'Invalid concert response format: expected an array.',
    );
  });

  it('debe obtener ciudades desde el endpoint o retornar ciudades por defecto ante fallos', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1, code: 'SCL', name: 'Santiago' }],
    }));

    const cities = await ConcertService.getCities();
    expect(cities).toHaveLength(1);
    expect(cities[0].code).toBe('SCL');

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    const fallbackCities = await ConcertService.getCities();
    expect(fallbackCities.length).toBeGreaterThan(0);
  });

  it('debe crear un concierto exitosamente o lanzar error ante respuesta no-ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 10, band: 'Blink-182' }),
    }));

    const created = await ConcertService.createConcert({
      band: 'Blink-182',
      code: 'PUNK-002',
      cityId: 1,
      date: '2026-11-28',
      ticketPrice: 42000,
      totalTickets: 150,
    }, 'mock-token');

    expect(created.id).toBe(10);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'Invalid payload',
    }));

    await expect(ConcertService.createConcert({
      band: 'Invalid',
      code: 'PUNK-INV',
      cityId: 1,
      date: '2026-11-28',
      ticketPrice: 42000,
      totalTickets: 150,
    })).rejects.toThrow('Failed to create concert: Invalid payload');
  });

  it('debe actualizar y eliminar conciertos correctamente', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 1, band: 'The Offspring Updated' }),
    }));

    const updated = await ConcertService.updateConcert(1, {
      band: 'The Offspring Updated',
      code: 'PUNK-001',
      cityId: 1,
      date: '2026-11-20',
      ticketPrice: 38000,
      totalTickets: 120,
      status: 'OPEN',
    });

    expect(updated.band).toBe('The Offspring Updated');

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    }));

    await expect(ConcertService.deleteConcert(1)).resolves.not.toThrow();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }));

    await expect(ConcertService.deleteConcert(1)).rejects.toThrow('Failed to delete concert: status 500');
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

  it('debe obtener lugares por ciudad y crear nuevos lugares', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 10, name: 'Teatro Cariola', cityId: 1 }],
    }));

    const venues = await ConcertService.getVenuesByCity(1);
    expect(venues).toHaveLength(1);
    expect(venues[0].name).toBe('Teatro Cariola');

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: false }));
    const emptyVenues = await ConcertService.getVenuesByCity(999);
    expect(emptyVenues).toEqual([]);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 15, name: 'Blondie', cityId: 1 }),
    }));

    const createdVenue = await ConcertService.createVenue({
      cityId: 1,
      name: 'Blondie',
    });
    expect(createdVenue.id).toBe(15);
  });

  it('debe subir una imagen de portada y retornar la URL', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ imageUrl: 'data:image/jpeg;base64,mocked' }),
    }));

    const file = new File(['img'], 'poster.jpg', { type: 'image/jpeg' });
    const url = await ConcertService.uploadCoverImage(file);
    expect(url).toBe('data:image/jpeg;base64,mocked');
  });

  it('debe retornar la lista completa en getGridConcerts si la longitud es <= 1', () => {
    const single: Concert[] = [
      { id: '1', title: 'Single', band: 'B1', date: new Date(), status: ConcertStatus.LIVE, isFeatured: true },
    ];
    expect(ConcertService.getGridConcerts(single)).toEqual(single);
    expect(ConcertService.getGridConcerts([])).toEqual([]);
  });
});
