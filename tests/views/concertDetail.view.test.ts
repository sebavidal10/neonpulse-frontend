import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConcertDetailView } from '../../src/views/concertDetail.view';
import { ConcertStatus, type Concert } from '../../src/models';

describe('ConcertDetailView', () => {
  let container: HTMLElement;

  const mockConcert: Concert = {
    id: '1',
    title: 'The Offspring Smash Reunion',
    band: 'The Offspring',
    date: new Date('2026-11-20'),
    time: '22:00',
    status: ConcertStatus.SCHEDULED,
    ticketPrice: 35000,
    availableTickets: 40,
    totalTickets: 100,
    cityName: 'Santiago Underground Club',
    imageUrl: '/images/punk1.png',
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(container);
    vi.restoreAllMocks();
  });

  it('debe renderizar la vista de detalle completa en una página independiente', () => {
    const onNavigate = vi.fn();
    const view = new ConcertDetailView(container, onNavigate);

    view.render(mockConcert);

    expect(container.innerHTML).toContain('The Offspring Smash Reunion');
    expect(container.innerHTML).toContain('The Offspring');
    expect(container.innerHTML).toContain('Santiago Underground Club');
    expect(container.innerHTML).toContain('$35,000');
    expect(container.innerHTML).toContain('40 of 100 passes available');
    expect(container.querySelector('#btn-detail-buy-ticket')).not.toBeNull();

    const backBtn = container.querySelector<HTMLButtonElement>('#btn-detail-back-lineup');
    expect(backBtn).not.toBeNull();
    backBtn?.click();
    expect(onNavigate).toHaveBeenCalled();
  });

  it('debe renderizar el badge LIVE NOW cuando el concierto está en vivo', () => {
    const liveConcert: Concert = {
      ...mockConcert,
      status: ConcertStatus.LIVE,
    };

    const view = new ConcertDetailView(container);
    view.render(liveConcert);

    expect(container.innerHTML).toContain('LIVE NOW');
  });

  it('debe despachar evento neonpulse:add-to-cart al hacer clic en Buy Tickets Now', () => {
    let capturedConcert: Concert | null = null;
    window.addEventListener('neonpulse:add-to-cart', (e: any) => {
      capturedConcert = e.detail?.concert;
    });

    const view = new ConcertDetailView(container);
    view.render(mockConcert);

    const buyBtn = container.querySelector<HTMLButtonElement>('#btn-detail-buy-ticket');
    buyBtn?.click();

    expect(capturedConcert).not.toBeNull();
    expect(capturedConcert!.id).toBe(mockConcert.id);
  });
});
