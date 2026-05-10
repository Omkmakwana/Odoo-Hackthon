import { mockTrips } from '@/lib/mockData';

export function useTrips() {
  return {
    trips: mockTrips,
    isLoading: false,
    error: null
  };
}
