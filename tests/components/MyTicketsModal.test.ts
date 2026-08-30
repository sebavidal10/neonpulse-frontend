import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MyTicketsModal } from '../../src/components/MyTickets/MyTicketsModal';
import { AuthService } from '../../src/services/auth.service';
import { TicketService } from '../../src/services/ticket.service';
import { AuthModal } from '../../src/components/AuthModal/AuthModal';

describe('MyTicketsModal Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="contenedor-cartelera"></div>';
    vi.restoreAllMocks();
  });

  it('debe solicitar inicio de sesión si el usuario no está autenticado', async () => {
    vi.spyOn(AuthService, 'isAuthenticated').mockReturnValue(false);
    const authModalOpenSpy = vi.spyOn(AuthModal, 'open').mockImplementation(() => {});

    await MyTicketsModal.open();

    expect(authModalOpenSpy).toHaveBeenCalledWith('signin', expect.any(Function));
  });

  it('debe renderizar la lista de entradas cuando el usuario está autenticado y permitir imprimir', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    vi.spyOn(AuthService, 'isAuthenticated').mockReturnValue(true);
    vi.spyOn(TicketService, 'getMyTickets').mockResolvedValue([
      {
        id: 1,
        code: 'TCK-PUNK-99',
        concertId: 10,
        concertCode: 'COD-10',
        band: 'The Offspring',
        customerName: 'Johnny Silverhand',
        customerEmail: 'rocker@neonpulse.io',
        unitPrice: 35000,
        purchaseDate: '2026-08-30T10:00:00',
      },
    ]);

    await MyTicketsModal.open();

    const root = document.getElementById('my-tickets-modal-root');
    expect(root?.innerHTML).toContain('My Purchased Tickets');
    expect(root?.innerHTML).toContain('TCK-PUNK-99');
    expect(root?.innerHTML).toContain('The Offspring');

    const printBtn = root?.querySelector<HTMLButtonElement>('.btn-print-single');
    expect(printBtn).not.toBeNull();
    printBtn?.click();
    expect(printSpy).toHaveBeenCalled();
  });

  it('debe renderizar estado vacío cuando el usuario no tiene entradas y permitir explorar cartelera', async () => {
    vi.spyOn(AuthService, 'isAuthenticated').mockReturnValue(true);
    vi.spyOn(TicketService, 'getMyTickets').mockResolvedValue([]);

    await MyTicketsModal.open();

    const root = document.getElementById('my-tickets-modal-root');
    expect(root?.innerHTML).toContain('No Tickets Found');

    const exploreBtn = document.getElementById('btn-empty-explore');
    exploreBtn?.click();
    expect(document.getElementById('my-tickets-modal-root')?.innerHTML).toBe('');
  });

  it('debe renderizar estado de error y permitir reintentar', async () => {
    vi.spyOn(AuthService, 'isAuthenticated').mockReturnValue(true);
    vi.spyOn(TicketService, 'getMyTickets').mockRejectedValueOnce(new Error('Network error loading tickets'));

    await MyTicketsModal.open();

    const root = document.getElementById('my-tickets-modal-root');
    expect(root?.innerHTML).toContain('Could Not Load Passes');

    const retryBtn = document.getElementById('btn-retry-tickets');
    expect(retryBtn).not.toBeNull();
  });

  it('debe cerrar el modal al hacer click en el botón de cierre o en el backdrop', async () => {
    vi.spyOn(AuthService, 'isAuthenticated').mockReturnValue(true);
    vi.spyOn(TicketService, 'getMyTickets').mockResolvedValue([]);

    await MyTicketsModal.open();

    const closeBtn = document.getElementById('btn-close-tickets-modal') as HTMLButtonElement;
    expect(closeBtn).not.toBeNull();
    closeBtn?.click();

    expect(document.getElementById('my-tickets-modal-root')?.innerHTML).toBe('');

    await MyTicketsModal.open();
    const backdrop = document.querySelector('.fixed') as HTMLElement;
    backdrop?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(document.getElementById('my-tickets-modal-root')?.innerHTML).toBe('');
  });
});
