import { APP_CONFIG } from '../config/app.config';
import type { PurchaseResponse, Ticket } from '../models';
import { AuthService } from './auth.service';

export class TicketService {
  /**
   * Helper to simulate brief payment processing for the happy-path demo.
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Purchases tickets for a specified concert with simulated payment delay and authorization.
   */
  static async purchaseTickets(
    concertId: string | number,
    customerName: string,
    customerEmail: string,
    quantity: number,
  ): Promise<PurchaseResponse> {
    if (APP_CONFIG.SIMULATED_PAYMENT_DELAY_MS > 0) {
      await this.delay(APP_CONFIG.SIMULATED_PAYMENT_DELAY_MS);
    }

    const response = await AuthService.fetchWithAuth(
      `${APP_CONFIG.CONCERTS_DATA_URL}/${concertId}/purchase`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName,
          customerEmail,
          quantity,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to complete ticket reservation.');
    }

    return (await response.json()) as PurchaseResponse;
  }

  /**
   * Fetches all tickets purchased by the authenticated user.
   */
  static async getMyTickets(): Promise<Ticket[]> {
    const response = await AuthService.fetchWithAuth(
      `${APP_CONFIG.USERS_API_URL}/me/tickets`,
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 404) {
        AuthService.logout();
        throw new Error('Session expired or user not found. Please sign in again.');
      }
      throw new Error('Could not load your tickets. Please try again later.');
    }

    return (await response.json()) as Ticket[];
  }
}
