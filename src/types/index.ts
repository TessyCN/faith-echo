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


export interface DashboardStatsResponse {
  totalTestimonies: number;
  approvedTestimonies: number;
  rejectedTestimonies: number;
  pendingTestimonies: number;
  totalCategories: number;
  totalAdmins: number;
  submitionsThisWeek: number; // Keeping your spelling from the JSON
  submitionsToday: number;
  totalViews: TotalSumValue<"views">;
  totalShares: TotalSumValue<"shared">;
  categorieswithcount: CategoryCount[];
}

interface CategoryCount {
  categoryId: number;
  categoryName: string;
  count: number;
}

/**
 * A generic interface to handle the nested "_sum" pattern 
 * found in totalViews and totalShares.
 */
interface TotalSumValue<K extends string> {
  _sum: {
    [P in K]: number;
  };
}

export interface BackendTestimony {
  id: number;
  title: string;
  content: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  authorEmail: string;
  authorName: string;
  updatedByEmail: string | null;
  isFeatured: boolean;
  featuredAt: string | null;
  views: number;
  shared: number;
  categoryId: number;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  rejectionNote?: string;
}