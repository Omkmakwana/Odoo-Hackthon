import type { City, Trip } from '@/lib/types';

export const mockCities: City[] = [
  { id: '1', name: 'Kyoto', country: 'Japan', costIndex: 'moderate', popularity: 95 },
  { id: '2', name: 'Paris', country: 'France', costIndex: 'luxury', popularity: 90 }
];

export const mockTrips: Trip[] = [
  {
    id: 'trip-1',
    userId: 'user-1',
    name: 'Kyoto Chronicle',
    description: 'A seven day exploration through the ancient capital.',
    startDate: '2026-10-12',
    endDate: '2026-10-19',
    status: 'ongoing',
    stops: []
  }
];
