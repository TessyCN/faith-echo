export interface TestimonyCategory {
  id?: number;
  name: string;
  slug: string;
  description: string;
  createdAt?: string; // or Date if you parse it
  updatedAt?: string;
  _count?: {
    testimonies: number;
  };
}