import { type Concert, ConcertStatus } from '../models';

export class ConcertService {
  private static readonly DATA_URL = './data/concerts.json';

  /**
   * Obtiene todos los conciertos desde la fuente de datos con validación HTTP y conversión de tipos.
   */
  static async getAllConcerts(): Promise<Concert[]> {
    const response = await fetch(this.DATA_URL);

    if (!response.ok) {
      throw new Error(
        `Error HTTP al obtener los conciertos: status ${response.status} (${response.statusText})`,
      );
    }

    const rawData = await response.json();

    if (!Array.isArray(rawData)) {
      throw new Error('La respuesta de conciertos no tiene un formato válido (se esperaba un array).');
    }

    // Transformación y parseo seguro de datos (string date -> Date instance)
    return rawData.map((item: any): Concert => ({
      id: String(item.id),
      title: String(item.title || 'Evento sin título'),
      band: String(item.band || 'Artista desconocido'),
      date: item.date ? new Date(item.date) : new Date(),
      time: item.time ? String(item.time) : undefined,
      status: (Object.values(ConcertStatus).includes(item.status as ConcertStatus)
        ? item.status
        : ConcertStatus.SCHEDULED) as ConcertStatus,
      imageUrl: item.imageUrl ? String(item.imageUrl) : undefined,
      isFeatured: Boolean(item.isFeatured),
    }));
  }

  /**
   * Obtiene el concierto destacado o el primero disponible.
   */
  static getFeaturedConcert(concerts: Concert[]): Concert | null {
    if (concerts.length === 0) return null;
    return concerts.find((c) => c.isFeatured) || concerts[0];
  }

  /**
   * Filtra los conciertos para la grilla omitiendo el evento destacado si existe.
   */
  static getGridConcerts(concerts: Concert[]): Concert[] {
    if (concerts.length <= 1) return concerts;
    return concerts.filter((c) => !c.isFeatured);
  }
}
