export interface Venue {
  _id: string;
  owner: string;
  name: string;
  description?: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: number[];
  };
  commissionPercentage: number;
  amenities: string[];
  sportsTypes: string[];
  images: string[];
  country: string;
  currency: string;
  managers: {
    user: string;
    role: 'manager' | 'assistant' | 'staff';
  }[];
  status: 'pending' | 'approved' | 'rejected';
  stripeAccountId?: string | null;
  stripeOnboardingComplete: boolean;
  ratingAverage: number;
  ratingCount: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  createdAt?: string;
  updatedAt?: string;
}