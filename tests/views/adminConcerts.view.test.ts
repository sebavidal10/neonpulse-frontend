import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminConcertsView } from '../../src/views/adminConcerts.view';
import { ConcertService } from '../../src/services/concert.service';
import { AuthService } from '../../src/services/auth.service';
import { ConcertStatus, type Concert } from '../../src/models';

describe('AdminConcertsView', () => {
  let container: HTMLElement;

  const mockConcerts: Concert[] = [
    {
      id: '1',
      code: 'PUNK-001',
      title: 'The Offspring Live',
      band: 'The Offspring',
      date: new Date('2026-11-20'),
      status: ConcertStatus.SCHEDULED,
      ticketPrice: 38000,
      availableTickets: 84,
      totalTickets: 120,
      cityId: 1,
      cityName: 'Santiago',
      venueId: 10,
      venueName: 'Teatro Cariola',
    },
  ];

  const mockCities = [
    { id: 1, code: 'SCL', name: 'Santiago' },
    { id: 2, code: 'VAL', name: 'Valparaíso' },
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(container);
    vi.restoreAllMocks();
  });

  it('debe bloquear el acceso si el usuario no tiene rol ROLE_ADMIN', async () => {
    vi.spyOn(AuthService, 'getCurrentUser').mockReturnValue({
      id: 2,
      email: 'fan@neonpulse.io',
      fullName: 'Alex Fan',
      role: 'ROLE_USER',
    });

    const onNavigate = vi.fn();
    const view = new AdminConcertsView(container, onNavigate);
    await view.render();

    expect(container.innerHTML).toContain('Access Restricted');
    const backBtn = container.querySelector<HTMLButtonElement>('#btn-admin-unauth-back');
    backBtn?.click();
    expect(onNavigate).toHaveBeenCalled();
  });

  it('debe renderizar la tabla de administración para administradores', async () => {
    vi.spyOn(AuthService, 'getCurrentUser').mockReturnValue({
      id: 1,
      email: 'admin@mail.com',
      fullName: 'System Administrator',
      role: 'ROLE_ADMIN',
    });
    vi.spyOn(ConcertService, 'getAllConcerts').mockResolvedValue(mockConcerts);
    vi.spyOn(ConcertService, 'getCities').mockResolvedValue(mockCities);

    const onNavigate = vi.fn();
    const view = new AdminConcertsView(container, onNavigate);
    await view.render();

    expect(container.innerHTML).toContain('The Offspring');
    expect(container.innerHTML).toContain('PUNK-001');
    expect(container.innerHTML).toContain('Teatro Cariola');
    expect(container.innerHTML).toContain('$38,000');

    // Test back button
    const backBtn = container.querySelector<HTMLButtonElement>('#btn-admin-back-lineup');
    backBtn?.click();
    expect(onNavigate).toHaveBeenCalled();
  });

  it('debe navegar al editor de conciertos al hacer click en crear gig', async () => {
    vi.spyOn(AuthService, 'getCurrentUser').mockReturnValue({
      id: 1,
      email: 'admin@mail.com',
      fullName: 'System Administrator',
      role: 'ROLE_ADMIN',
    });
    vi.spyOn(ConcertService, 'getAllConcerts').mockResolvedValue(mockConcerts);
    vi.spyOn(ConcertService, 'getCities').mockResolvedValue(mockCities);

    const onNavigateToEditor = vi.fn();
    const view = new AdminConcertsView(container, undefined, onNavigateToEditor);
    await view.render();

    const createBtn = container.querySelector<HTMLButtonElement>('#btn-admin-create-gig');
    createBtn?.click();

    expect(onNavigateToEditor).toHaveBeenCalledWith();
  });

  it('debe navegar al editor con el concierto al hacer click en editar', async () => {
    vi.spyOn(AuthService, 'getCurrentUser').mockReturnValue({
      id: 1,
      email: 'admin@mail.com',
      fullName: 'System Administrator',
      role: 'ROLE_ADMIN',
    });
    vi.spyOn(ConcertService, 'getAllConcerts').mockResolvedValue(mockConcerts);
    vi.spyOn(ConcertService, 'getCities').mockResolvedValue(mockCities);

    const onNavigateToEditor = vi.fn();
    const view = new AdminConcertsView(container, undefined, onNavigateToEditor);
    await view.render();

    const editBtn = container.querySelector<HTMLButtonElement>('.btn-admin-edit');
    editBtn?.click();

    expect(onNavigateToEditor).toHaveBeenCalledWith(mockConcerts[0]);
  });

  it('debe permitir eliminar un concierto con confirmación', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(AuthService, 'getCurrentUser').mockReturnValue({
      id: 1,
      email: 'admin@mail.com',
      fullName: 'System Administrator',
      role: 'ROLE_ADMIN',
    });
    vi.spyOn(ConcertService, 'getAllConcerts').mockResolvedValue(mockConcerts);
    vi.spyOn(ConcertService, 'getCities').mockResolvedValue(mockCities);
    const deleteSpy = vi.spyOn(ConcertService, 'deleteConcert').mockResolvedValue(undefined);

    const view = new AdminConcertsView(container);
    await view.render();

    const deleteBtn = container.querySelector<HTMLButtonElement>('.btn-admin-delete');
    deleteBtn?.click();

    await vi.waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith('1');
    });
  });
});
