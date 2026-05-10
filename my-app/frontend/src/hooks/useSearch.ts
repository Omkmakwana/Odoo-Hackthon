import { mockCities } from '@/lib/mockData';

export function useSearch() {
  return {
    query: '',
    cities: mockCities,
    activities: [],
    isLoading: false
  };
}
