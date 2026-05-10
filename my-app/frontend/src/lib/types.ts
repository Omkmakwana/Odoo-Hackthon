export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
  city?: string;
  country?: string;
  phone?: string;
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  coverPhoto?: string;
  status: 'ongoing' | 'upcoming' | 'completed';
  stops: Stop[];
  totalBudget?: number;
}

export interface Stop {
  id: string;
  tripId: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  order: number;
  activities: Activity[];
}

export interface Activity {
  id: string;
  stopId: string;
  name: string;
  type: 'sightseeing' | 'food' | 'adventure' | 'transport' | 'stay' | 'other';
  cost: number;
  duration?: string;
  description?: string;
  time?: string;
}

export interface Budget {
  tripId: string;
  total: number;
  spent: number;
  transport: number;
  stay: number;
  activities: number;
  meals: number;
  other: number;
}

export interface ChecklistItem {
  id: string;
  tripId: string;
  label: string;
  category: 'clothing' | 'documents' | 'electronics' | 'other';
  packed: boolean;
}

export interface Note {
  id: string;
  tripId: string;
  stopId?: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  tripId: string;
  tripName: string;
  description: string;
  cities: string[];
  likes: number;
  createdAt: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  costIndex: 'budget' | 'moderate' | 'luxury';
  popularity: number;
  image?: string;
}
