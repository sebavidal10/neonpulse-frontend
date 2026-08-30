import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserProfileView } from '../../src/views/userProfile.view';
import { AuthService } from '../../src/services/auth.service';
import { TicketService } from '../../src/services/ticket.service';
import { AuthModal } from '../../src/components/AuthModal';

describe('UserProfileView', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(container);
    vi.restoreAllMocks();
  });

  it('debe renderizar el gate de autenticación cuando el usuario no está autenticado', async () => {
    vi.spyOn(AuthService, 'isAuthenticated').mockReturnValue(false);
    const onNavigate = vi.fn();
    const authOpenSpy = vi.spyOn(AuthModal, 'open').mockImplementation((_, cb) => {
      if (cb) cb();
    });

    const view = new UserProfileView(container, onNavigate);
    await view.render();

    expect(container.innerHTML).toContain('Member Profile &amp; Pass Vault');
    expect(container.querySelector('#btn-gate-signin')).not.toBeNull();

    const signinBtn = container.querySelector<HTMLButtonElement>('#btn-gate-signin');
    signinBtn?.click();
    expect(authOpenSpy).toHaveBeenCalledWith('signin', expect.any(Function));

    const lineupBtn = container.querySelector<HTMLButtonElement>('#btn-gate-lineup');
    lineupBtn?.click();
    expect(onNavigate).toHaveBeenCalled();
  });

  it('debe renderizar la vista de perfil completa con la lista de pases digitales', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const onNavigate = vi.fn();

    vi.spyOn(AuthService, 'isAuthenticated').mockReturnValue(true);
    vi.spyOn(AuthService, 'getCurrentUser').mockReturnValue({
      id: 1,
      email: 'rocker@neonpulse.io',
      fullName: 'Johnny Silverhand',
      role: 'ROLE_USER',
    });

    vi.spyOn(TicketService, 'getMyTickets').mockResolvedValue([
      {
        id: 10,
        code: 'TCK-PUNK-88',
        concertId: 1,
        concertCode: 'COD-1',
        band: 'The Offspring',
        customerName: 'Johnny Silverhand',
        customerEmail: 'rocker@neonpulse.io',
        unitPrice: 35000,
        purchaseDate: '2026-08-30T20:00:00',
      },
    ]);

    const view = new UserProfileView(container, onNavigate);
    await view.render();

    expect(container.innerHTML).toContain('Johnny Silverhand');
    expect(container.innerHTML).toContain('rocker@neonpulse.io');
    expect(container.innerHTML).toContain('TCK-PUNK-88');
    expect(container.innerHTML).toContain('The Offspring');
    expect(container.innerHTML).toContain('$35,000');

    // Test print pass
    const printBtn = container.querySelector<HTMLButtonElement>('.btn-print-ticket');
    printBtn?.click();
    expect(printSpy).toHaveBeenCalled();

    // Test back to lineup
    const backBtn = container.querySelector<HTMLButtonElement>('#btn-profile-back-lineup');
    backBtn?.click();
    expect(onNavigate).toHaveBeenCalled();
  });

  it('debe renderizar estado vacío cuando el usuario no tiene entradas y permitir explorar la cartelera', async () => {
    const onNavigate = vi.fn();
    vi.spyOn(AuthService, 'isAuthenticated').mockReturnValue(true);
    vi.spyOn(AuthService, 'getCurrentUser').mockReturnValue({
      id: 2,
      email: 'alex@neonpulse.io',
      fullName: 'Alex Mercer',
      role: 'ROLE_USER',
    });
    vi.spyOn(TicketService, 'getMyTickets').mockResolvedValue([]);

    const view = new UserProfileView(container, onNavigate);
    await view.render();

    expect(container.innerHTML).toContain('No Passes Found');
    const exploreBtn = container.querySelector<HTMLButtonElement>('#btn-empty-explore-lineup');
    expect(exploreBtn).not.toBeNull();

    exploreBtn?.click();
    expect(onNavigate).toHaveBeenCalled();
  });

  it('debe manejar errores de carga y permitir reintentar con el botón Retry', async () => {
    vi.spyOn(AuthService, 'isAuthenticated').mockReturnValue(true);
    vi.spyOn(AuthService, 'getCurrentUser').mockReturnValue({
      id: 3,
      email: 'fan@neonpulse.io',
      fullName: 'Punk Fan',
      role: 'ROLE_USER',
    });
    vi.spyOn(TicketService, 'getMyTickets').mockRejectedValueOnce(new Error('Network failure'));

    const view = new UserProfileView(container);
    await view.render();

    expect(container.innerHTML).toContain('Could Not Load Passes');
    expect(container.innerHTML).toContain('Network failure');

    const retryBtn = container.querySelector<HTMLButtonElement>('#btn-profile-retry');
    expect(retryBtn).not.toBeNull();
  });
});
