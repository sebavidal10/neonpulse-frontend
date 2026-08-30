import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminConcertEditorView } from '../../src/views/adminConcertEditor.view';
import { ConcertService } from '../../src/services/concert.service';
import { AuthService } from '../../src/services/auth.service';
import { ConcertStatus, type Concert, type Venue } from '../../src/models';

describe('AdminConcertEditorView', () => {
  let container: HTMLElement;

  const mockCities = [
    { id: 1, code: 'SCL', name: 'Santiago' },
    { id: 2, code: 'VAL', name: 'Valparaíso' },
  ];

  const mockVenuesScl: Venue[] = [
    { id: 10, cityId: 1, name: 'Teatro Cariola', address: 'San Diego 246', capacity: 1200 },
    { id: 11, cityId: 1, name: 'Blondie', address: 'Alameda 2879', capacity: 1500 },
  ];

  const mockVenuesVal: Venue[] = [
    { id: 20, cityId: 2, name: 'Muelle Barón', address: 'Av Errazuriz', capacity: 900 },
  ];

  const mockConcert: Concert = {
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
    imageUrl: '/images/punk1.png',
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(container);
    vi.restoreAllMocks();
  });

  it('debe bloquear el acceso a no administradores', async () => {
    vi.spyOn(AuthService, 'getCurrentUser').mockReturnValue({
      id: 2,
      email: 'fan@neonpulse.io',
      fullName: 'Alex Fan',
      role: 'ROLE_USER',
    });

    const onBack = vi.fn();
    const editor = new AdminConcertEditorView(container, onBack);
    await editor.render();

    expect(container.innerHTML).toContain('Access Denied');
    const backBtn = container.querySelector<HTMLButtonElement>('#btn-editor-unauth-back');
    backBtn?.click();
    expect(onBack).toHaveBeenCalled();
  });

  it('debe renderizar el formulario de creación y actualizar la previsualización en vivo', async () => {
    vi.spyOn(AuthService, 'getCurrentUser').mockReturnValue({
      id: 1,
      email: 'admin@mail.com',
      fullName: 'System Administrator',
      role: 'ROLE_ADMIN',
    });
    vi.spyOn(ConcertService, 'getCities').mockResolvedValue(mockCities);
    vi.spyOn(ConcertService, 'getVenuesByCity').mockResolvedValue(mockVenuesScl);

    const onBack = vi.fn();
    const editor = new AdminConcertEditorView(container, onBack);
    await editor.render();

    expect(container.innerHTML).toContain('Create Underground Gig');
    expect(container.innerHTML).toContain('Live Card Preview');

    const bandInput = container.querySelector<HTMLInputElement>('#editor-input-band');
    expect(bandInput).not.toBeNull();
    if (bandInput) {
      bandInput.value = 'Green Day';
      bandInput.dispatchEvent(new Event('input'));
    }

    const bandPreview = container.querySelector('#preview-card-band');
    expect(bandPreview?.textContent).toBe('Green Day');

    // Test back button
    const backBtn = container.querySelector<HTMLButtonElement>('#btn-editor-back');
    backBtn?.click();
    expect(onBack).toHaveBeenCalled();
  });

  it('debe cargar y filtrar lugares en cascada al cambiar la ciudad', async () => {
    vi.spyOn(AuthService, 'getCurrentUser').mockReturnValue({
      id: 1,
      email: 'admin@mail.com',
      fullName: 'System Administrator',
      role: 'ROLE_ADMIN',
    });
    vi.spyOn(ConcertService, 'getCities').mockResolvedValue(mockCities);
    const venuesSpy = vi.spyOn(ConcertService, 'getVenuesByCity')
      .mockResolvedValueOnce(mockVenuesScl)
      .mockResolvedValueOnce(mockVenuesVal);

    const editor = new AdminConcertEditorView(container, vi.fn());
    await editor.render();

    const citySelect = container.querySelector<HTMLSelectElement>('#editor-select-city');
    expect(citySelect).not.toBeNull();

    if (citySelect) {
      citySelect.value = '2';
      citySelect.dispatchEvent(new Event('change'));
    }

    await vi.waitFor(() => {
      expect(venuesSpy).toHaveBeenCalledWith(2);
      const venueSelect = container.querySelector<HTMLSelectElement>('#editor-select-venue');
      expect(venueSelect?.innerHTML).toContain('Muelle Barón');
    });
  });

  it('debe permitir crear un nuevo lugar inline', async () => {
    vi.spyOn(AuthService, 'getCurrentUser').mockReturnValue({
      id: 1,
      email: 'admin@mail.com',
      fullName: 'System Administrator',
      role: 'ROLE_ADMIN',
    });
    vi.spyOn(ConcertService, 'getCities').mockResolvedValue(mockCities);
    vi.spyOn(ConcertService, 'getVenuesByCity').mockResolvedValue(mockVenuesScl);
    const createVenueSpy = vi.spyOn(ConcertService, 'createVenue').mockResolvedValue({
      id: 99,
      cityId: 1,
      name: 'Teatro Caupolicán',
      address: 'San Diego 850',
      capacity: 4000,
    });

    const editor = new AdminConcertEditorView(container, vi.fn());
    await editor.render();

    const toggleBtn = container.querySelector<HTMLButtonElement>('#btn-toggle-inline-venue');
    toggleBtn?.click();

    const nameInput = container.querySelector<HTMLInputElement>('#inline-venue-name');
    if (nameInput) nameInput.value = 'Teatro Caupolicán';

    const saveBtn = container.querySelector<HTMLButtonElement>('#btn-save-inline-venue');
    saveBtn?.click();

    await vi.waitFor(() => {
      expect(createVenueSpy).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Teatro Caupolicán', cityId: 1 })
      );
    });
  });

  it('debe enviar la actualización de un concierto existente', async () => {
    vi.spyOn(AuthService, 'getCurrentUser').mockReturnValue({
      id: 1,
      email: 'admin@mail.com',
      fullName: 'System Administrator',
      role: 'ROLE_ADMIN',
    });
    vi.spyOn(ConcertService, 'getCities').mockResolvedValue(mockCities);
    vi.spyOn(ConcertService, 'getVenuesByCity').mockResolvedValue(mockVenuesScl);
    const updateSpy = vi.spyOn(ConcertService, 'updateConcert').mockResolvedValue({ id: 1 });

    const onBack = vi.fn();
    const editor = new AdminConcertEditorView(container, onBack);
    await editor.render(mockConcert);

    expect(container.innerHTML).toContain('Edit Gig: The Offspring');

    const form = container.querySelector<HTMLFormElement>('#form-concert-editor');
    form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    await vi.waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          band: 'The Offspring',
          code: 'PUNK-001',
          cityId: 1,
        })
      );
      expect(onBack).toHaveBeenCalled();
    });
  });

  it('debe subir y aplicar una imagen personalizada', async () => {
    vi.spyOn(AuthService, 'getCurrentUser').mockReturnValue({
      id: 1,
      email: 'admin@mail.com',
      fullName: 'System Administrator',
      role: 'ROLE_ADMIN',
    });
    vi.spyOn(ConcertService, 'getCities').mockResolvedValue(mockCities);
    vi.spyOn(ConcertService, 'getVenuesByCity').mockResolvedValue(mockVenuesScl);
    const uploadSpy = vi.spyOn(ConcertService, 'uploadCoverImage').mockResolvedValue('data:image/png;base64,mock');

    const editor = new AdminConcertEditorView(container, vi.fn());
    await editor.render();

    const fileInput = container.querySelector<HTMLInputElement>('#editor-file-upload');
    const fakeFile = new File(['content'], 'custom-poster.png', { type: 'image/png' });

    Object.defineProperty(fileInput, 'files', {
      value: [fakeFile],
    });
    fileInput?.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(uploadSpy).toHaveBeenCalledWith(fakeFile);
      const previewImg = container.querySelector<HTMLImageElement>('#preview-card-image');
      expect(previewImg?.src).toContain('data:image/png;base64,mock');
    });
  });
});
