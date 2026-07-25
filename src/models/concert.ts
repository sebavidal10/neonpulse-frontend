// definir enum con valores
export enum ConcertStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

// Definir interfaz de concierto
export interface Concert {
  id: string;
  title: string;
  band: string;
  date: Date;
  time?: string; // HH:mm
  status: ConcertStatus;
}
