import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartDrawer } from '../../src/components/CartDrawer/CartDrawer';
import { TicketService } from '../../src/services/ticket.service';
import { AuthService } from '../../src/services/auth.service';
import { ConcertStatus, type Concert } from '../../src/models';

describe('CartDrawer Component', () => {
  const mockConcert: Concert = {
    id: '1',
    title: 'The Offspring Live',
    band: 'The Offspring',
    date: new Date('2026-11-20'),
    time: '20:00',
    status: ConcertStatus.SCHEDULED,
    ticketPrice: 38000,
    availableTickets: 50,
    totalTickets: 100,
    cityName: 'Santiago Underground',
    imageUrl: '/images/punk1.png',
  };

  beforeEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    CartDrawer.init();
    CartDrawer.close();
  });

  it('debe inicializar el botón flotante del carrito en el DOM', () => {
    const toggleBtn = document.getElementById('btn-floating-cart-toggle');
    expect(toggleBtn).not.toBeNull();
  });

  it('debe abrir el drawer y mostrar estado vacío si no hay concierto seleccionado', () => {
    CartDrawer.open();
    const backdrop = document.getElementById('cart-drawer-backdrop');
    expect(backdrop).not.toBeNull();
    expect(backdrop?.innerHTML).toContain('Your Cart is Empty');
  });

  it('debe agregar un concierto y permitir ajustar la cantidad', () => {
    CartDrawer.addGig(mockConcert, true);

    const qtyDisplay = document.getElementById('cart-qty-display');
    expect(qtyDisplay?.textContent).toBe('1');

    const totalDisplay = document.getElementById('cart-total-display');
    expect(totalDisplay?.textContent).toBe('$38,000');

    // Test increase quantity
    const plusBtn = document.getElementById('btn-cart-qty-plus');
    plusBtn?.click();
    expect(document.getElementById('cart-qty-display')?.textContent).toBe('2');
    expect(document.getElementById('cart-total-display')?.textContent).toBe('$76,000');

    // Test decrease quantity
    const minusBtn = document.getElementById('btn-cart-qty-minus');
    minusBtn?.click();
    expect(document.getElementById('cart-qty-display')?.textContent).toBe('1');
  });

  it('debe completar el flujo de compra exitosamente y mostrar pantalla de confirmación', async () => {
    vi.spyOn(AuthService, 'getCurrentUser').mockReturnValue({
      id: 1,
      email: 'rocker@neonpulse.io',
      fullName: 'Johnny Silverhand',
      role: 'ROLE_USER',
    });

    vi.spyOn(TicketService, 'purchaseTickets').mockResolvedValue({
      message: 'Tickets reserved',
      concertId: 1,
      concertCode: 'PUNK-001',
      band: 'The Offspring',
      purchasedCount: 1,
      totalPaid: 38000,
      tickets: [
        {
          id: 10,
          code: 'TCK-DEMO-1',
          concertId: 1,
          concertCode: 'PUNK-001',
          band: 'The Offspring',
          customerName: 'Johnny Silverhand',
          customerEmail: 'rocker@neonpulse.io',
          unitPrice: 38000,
          purchaseDate: '2026-08-30T20:00:00',
        },
      ],
    });

    CartDrawer.addGig(mockConcert, true);

    const form = document.querySelector<HTMLFormElement>('#form-cart-checkout');
    form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    await vi.waitFor(() => {
      expect(document.body.innerHTML).toContain('Payment Successful!');
      expect(document.body.innerHTML).toContain('The Offspring');
    });

    // Test View in Passes navigation
    let navigatedView = '';
    window.addEventListener('neonpulse:navigate', (e: any) => {
      navigatedView = e.detail?.view;
    });

    const viewPassesBtn = document.getElementById('btn-cart-view-passes');
    viewPassesBtn?.click();
    expect(navigatedView).toBe('profile');
  });

  it('debe validar campo obligatorio y mostrar error si el email está vacío o es inválido', () => {
    CartDrawer.addGig(mockConcert, true);

    const emailInput = document.getElementById('cart-email') as HTMLInputElement;
    emailInput.value = '';

    const form = document.querySelector<HTMLFormElement>('#form-cart-checkout');
    form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    const errorBlock = document.getElementById('cart-error-block');
    expect(errorBlock?.classList.contains('hidden')).toBe(false);
  });
});
