import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TicketService } from '../../src/services/ticket.service';
import { AuthService } from '../../src/services/auth.service';

describe('TicketService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('debe comprar entradas exitosamente', async () => {
    const mockPurchaseResponse = {
      message: 'Tickets booked successfully',
      concertId: 1,
      concertCode: 'COD-1',
      band: 'The Clash',
      purchasedCount: 2,
      totalPaid: 50000,
      tickets: [
        {
          id: 101,
          code: 'TCK-001',
          concertId: 1,
          concertCode: 'COD-1',
          band: 'The Clash',
          customerName: 'Johnny Silver',
          customerEmail: 'rocker@neonpulse.io',
          unitPrice: 25000,
          purchaseDate: '2026-08-30',
        },
      ],
    };

    vi.spyOn(AuthService, 'fetchWithAuth').mockResolvedValue({
      ok: true,
      json: async () => mockPurchaseResponse,
    } as any);

    const result = await TicketService.purchaseTickets(1, 'Johnny Silver', 'rocker@neonpulse.io', 2);

    expect(result.purchasedCount).toBe(2);
    expect(result.tickets).toHaveLength(1);
    expect(result.tickets[0].code).toBe('TCK-001');
  });

  it('debe lanzar error cuando purchaseTickets falla', async () => {
    vi.spyOn(AuthService, 'fetchWithAuth').mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Concert is sold out' }),
    } as any);

    await expect(
      TicketService.purchaseTickets(1, 'Johnny Silver', 'rocker@neonpulse.io', 2),
    ).rejects.toThrow('Concert is sold out');
  });

  it('debe obtener las entradas del usuario autenticado', async () => {
    const mockTickets = [
      {
        id: 101,
        code: 'TCK-001',
        concertId: 1,
        concertCode: 'COD-1',
        band: 'The Clash',
        customerName: 'Johnny Silver',
        customerEmail: 'rocker@neonpulse.io',
        unitPrice: 25000,
        purchaseDate: '2026-08-30',
      },
    ];

    vi.spyOn(AuthService, 'fetchWithAuth').mockResolvedValue({
      ok: true,
      json: async () => mockTickets,
    } as any);

    const tickets = await TicketService.getMyTickets();
    expect(tickets).toHaveLength(1);
    expect(tickets[0].band).toBe('The Clash');
  });

  it('debe lanzar error de autenticación si el endpoint responde 401', async () => {
    vi.spyOn(AuthService, 'fetchWithAuth').mockResolvedValue({
      ok: false,
      status: 401,
    } as any);

    await expect(TicketService.getMyTickets()).rejects.toThrow('Session expired or user not found. Please sign in again.');
  });

  it('debe lanzar error genérico si el endpoint responde 500', async () => {
    vi.spyOn(AuthService, 'fetchWithAuth').mockResolvedValue({
      ok: false,
      status: 500,
    } as any);

    await expect(TicketService.getMyTickets()).rejects.toThrow(
      'Could not load your tickets. Please try again later.',
    );
  });
});
