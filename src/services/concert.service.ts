import { type Concert, type Venue, ConcertStatus } from '../models';
import { APP_CONFIG } from '../config/app.config';
import { AuthService } from './auth.service';

export interface CityDto {
  id: number;
  code: string;
  name: string;
}

export const COVER_IMAGE_PRESETS = [
  '/images/punk1.png',
  '/images/punk2.png',
  '/images/punk3.png',
  '/images/punk4.jpg',
  '/images/punk5.jpg',
  '/images/punk6.jpg',
  '/images/punk7.jpg',
  '/images/card1.png',
];

export class ConcertService {
  private static readonly DATA_URL = APP_CONFIG.CONCERTS_DATA_URL;

  /**
   * Private utility for simulated network latency.
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retrieves all concerts from the backend REST API.
   */
  static async getAllConcerts(
    delayMs: number = APP_CONFIG.SIMULATED_NETWORK_DELAY_MS,
  ): Promise<Concert[]> {
    if (delayMs > 0) {
      await this.delay(delayMs);
    }

    const response = await fetch(this.DATA_URL);

    if (!response.ok) {
      throw new Error(
        `HTTP error while fetching concerts: status ${response.status} (${response.statusText})`,
      );
    }

    const rawData = await response.json();
    if (!Array.isArray(rawData)) {
      throw new Error('Invalid concert response format: expected an array.');
    }

    return rawData.map((item: any, idx: number): Concert => {
      let resolvedStatus = ConcertStatus.SCHEDULED;
      if (item.status === 'OPEN') {
        resolvedStatus = item.availableTickets === 0 ? ConcertStatus.SOLD_OUT : ConcertStatus.SCHEDULED;
      } else if (item.status === 'SOLD_OUT') {
        resolvedStatus = ConcertStatus.SOLD_OUT;
      } else if (item.status === 'CLOSED' || item.status === 'CANCELLED') {
        resolvedStatus = ConcertStatus.FINISHED;
      } else if (Object.values(ConcertStatus).includes(item.status as ConcertStatus)) {
        resolvedStatus = item.status as ConcertStatus;
      }

      const band = item.band ? String(item.band) : 'Unknown Artist';
      const cityName = item.cityName ? String(item.cityName) : undefined;
      const venueName = item.venueName ? String(item.venueName) : undefined;
      const venueAddress = item.venueAddress ? String(item.venueAddress) : undefined;
      
      const title = item.title
        ? String(item.title)
        : venueName
        ? `${band} @ ${venueName}`
        : cityName
        ? `${band} - Live in ${cityName}`
        : `${band} - Underground Live`;

      // Fallback to preset images if not specified
      const defaultCover = COVER_IMAGE_PRESETS[idx % COVER_IMAGE_PRESETS.length];
      const imageUrl = item.imageUrl ? String(item.imageUrl) : defaultCover;

      return {
        id: String(item.id),
        code: item.code ? String(item.code) : undefined,
        title,
        band,
        date: item.date ? new Date(item.date) : new Date(),
        time: item.time ? String(item.time) : '20:00 EST',
        status: resolvedStatus,
        ticketPrice: typeof item.ticketPrice === 'number' ? item.ticketPrice : 35000,
        availableTickets: typeof item.availableTickets === 'number' ? item.availableTickets : 0,
        totalTickets: typeof item.totalTickets === 'number' ? item.totalTickets : 100,
        cityId: item.cityId,
        cityCode: item.cityCode,
        cityName,
        venueId: item.venueId,
        venueName,
        venueAddress,
        imageUrl,
        isFeatured: Boolean(item.isFeatured) || idx === 0,
      };
    });
  }

  /**
   * Fetches the list of all available regional cities from the API.
   */
  static async getCities(): Promise<CityDto[]> {
    const response = await fetch(`${APP_CONFIG.BASE_API_URL}/cities`);
    if (!response.ok) {
      return [
        { id: 1, code: 'SCL', name: 'Santiago' },
        { id: 2, code: 'VAL', name: 'Valparaíso' },
        { id: 3, code: 'CCP', name: 'Concepción' },
        { id: 4, code: 'BUE', name: 'Buenos Aires' },
        { id: 5, code: 'LDN', name: 'London' },
      ];
    }
    return response.json();
  }

  /**
   * Fetches all venues located in a specific city.
   */
  static async getVenuesByCity(cityId: number): Promise<Venue[]> {
    const response = await fetch(`${APP_CONFIG.BASE_API_URL}/cities/${cityId}/venues`);
    if (!response.ok) {
      return [];
    }
    return response.json();
  }

  /**
   * Admin: Creates a new venue inside a city.
   */
  static async createVenue(payload: {
    cityId: number;
    name: string;
    address?: string;
    capacity?: number;
  }): Promise<Venue> {
    const token = AuthService.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${APP_CONFIG.BASE_API_URL}/venues`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to create venue: ${errorBody || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Admin: Uploads a custom cover artwork file and returns the data/image URL.
   */
  static async uploadCoverImage(file: File): Promise<string> {
    const token = AuthService.getToken();
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${APP_CONFIG.BASE_API_URL}/concerts/upload-cover`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image: status ${response.status}`);
    }

    const data = await response.json();
    return data.imageUrl;
  }

  /**
   * Admin: Creates a new concert via POST /api/v1/concerts.
   */
  static async createConcert(
    payload: {
      code: string;
      band: string;
      date: string;
      status?: string;
      totalTickets: number;
      ticketPrice: number;
      cityId: number;
      venueId?: number;
      imageUrl?: string;
    },
    token?: string,
  ): Promise<any> {
    const authToken = token || AuthService.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${APP_CONFIG.BASE_API_URL}/concerts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to create concert: ${errorBody || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Admin: Updates an existing concert via PUT /api/v1/concerts/{id}.
   */
  static async updateConcert(
    id: string | number,
    payload: {
      code: string;
      band: string;
      date: string;
      status: string;
      totalTickets: number;
      ticketPrice: number;
      cityId: number;
      venueId?: number;
      imageUrl?: string;
    },
    token?: string,
  ): Promise<any> {
    const authToken = token || AuthService.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${APP_CONFIG.BASE_API_URL}/concerts/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to update concert: ${errorBody || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Admin: Deletes a concert via DELETE /api/v1/concerts/{id}.
   */
  static async deleteConcert(id: string | number, token?: string): Promise<void> {
    const authToken = token || AuthService.getToken();
    const headers: Record<string, string> = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${APP_CONFIG.BASE_API_URL}/concerts/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok && response.status !== 204) {
      throw new Error(`Failed to delete concert: status ${response.status}`);
    }
  }

  /**
   * Retrieves the featured concert or first available.
   */
  static getFeaturedConcert(concerts: Concert[]): Concert | null {
    if (concerts.length === 0) return null;
    return concerts.find((c) => c.isFeatured) || concerts[0];
  }

  /**
   * Filters concerts for grid display.
   */
  static getGridConcerts(concerts: Concert[]): Concert[] {
    if (concerts.length <= 1) return concerts;
    return concerts.filter((c) => !c.isFeatured);
  }
}
