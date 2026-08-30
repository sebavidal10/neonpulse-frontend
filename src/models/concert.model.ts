export enum ConcertStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
  SOLD_OUT = 'SOLD_OUT',
}

export interface Venue {
  id: number;
  cityId: number;
  cityName?: string;
  name: string;
  address?: string;
  capacity?: number;
}

export interface Concert {
  id: string;
  code?: string;
  title: string;
  band: string;
  date: Date;
  time?: string;
  status: ConcertStatus;
  ticketPrice: number;
  availableTickets?: number;
  totalTickets?: number;
  cityId?: number;
  cityCode?: string;
  cityName?: string;
  venueId?: number;
  venueName?: string;
  venueAddress?: string;
  imageUrl?: string;
  isFeatured?: boolean;
}
