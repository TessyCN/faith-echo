import { TestimonyType } from "@/components/TestimonyCard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { TestimonyCategory } from "@/types";


// const API_URL =   import.meta.env.VITE_API_URL;
const API_URL = 'http://localhost:5000';
const getTestimonies = async () => {
  const response = await axios.get(`${API_URL}/testimonies`);
  return response.data;
};
export const createTestimony = async (testimony: TestimonyType) => {
  const response = await axios.post(`${API_URL}/testimonies`, testimony);
  return response.data;
};

export const getCategories = async () => {
  const response = await axios.get(`${API_URL}/categories`);
  return response.data;
};

export const createTestimonial = async (testimony: TestimonyType) => {
  const response = await axios.post(`${API_URL}/testimonies`, testimony);
  return response.data;
};

export const getPublishedTestimonies = async ({
  search = "",
  page = 1,
  limit = 10,
  categorySlug = "",
}: GetTestimoniesParams) => {
  const response = await axios.get(`${API_URL}/testimonies/approved`, {
    params: { search, page, limit, categorySlug },
  });

  return response.data;
};
export const getTestimonyById = async (id: string) => {
  const response = await axios.get(`${API_URL}/testimonies/${id}`);
  return response.data;
};


export const getDashboardStats = async () => {
    const response = await axios.post(`${API_URL}/admin/dashboard-stats`);
    return response.data;
};

export const getPendingTestimonies = async () => {
    const response = await axios.get(`${API_URL}/testimonies/pending`);
    return response.data;
};

export const getApprovedTestimonies = async () => {
    const response = await axios.get(`${API_URL}/testimonies/approved`);
    return response.data;
};

export const getRejectedTestimonies = async () => {
    const response = await axios.get(`${API_URL}/testimonies/rejected`);
    return response.data;
};

export const updateTestimonyStatus = async (id: number, data: { status: string, rejectionNote?: string }) => {
    const response = await axios.patch(`${API_URL}/testimonies/${id}/status`, data);
    return response.data;
};

export const updateTestimony = async (id: number, data: { title: string, content: string, categoryId: number }) => {
    const response = await axios.patch(`${API_URL}/testimonies/${id}`, data);
    return response.data;
};

export const createcategory = async (category: TestimonyCategory) => {
    const response = await axios.post(`${API_URL}/categories`, category);
    return response.data;
};
export const updatecategory = async (id: number, category: Partial<TestimonyCategory>) => {
    const response = await axios.patch(`${API_URL}/categories/${id}`, category);
    return response.data;
};
export const deletecategory = async (id: number) => {
    const response = await axios.delete(`${API_URL}/categories/${id}`);
    return response.data;
};



// ==> HOOKS <==
export const useTestimonies = () => {
  return useQuery({
    queryKey: ["testimonies"],
    queryFn: getTestimonies,
  });
};

export const useCreaateTestimony = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTestimony,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["testimonies"] });
        },
    });

  }
  export const useGetCategories = () => {
   return useQuery({
      queryKey: ["categories"],
      queryFn: getCategories,
    });
  }

  export const useCreateTestimonial = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: createTestimonial,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["testimonies"] });
        },
    });
  }

  export const useGetPublishedTestimonies = (params: GetTestimoniesParams) => {
    return useQuery({
      queryKey: ["publishedTestimonies", params],
      queryFn: () => getPublishedTestimonies(params),
    });
  }

  export const useGetDashboardStats = () => {
    return useQuery({
        queryKey: ["dashboardStats"],
        queryFn: getDashboardStats,
    });
};

export const useGetPendingTestimonies = () => {
    return useQuery({
        queryKey: ["pendingTestimonies"],
        queryFn: getPendingTestimonies,
    });
};

export const useGetApprovedTestimonies = () => {
    return useQuery({
        queryKey: ["approvedTestimonies"],
        queryFn: getApprovedTestimonies,
    });
};

export const useGetRejectedTestimonies = () => {
    return useQuery({
        queryKey: ["rejectedTestimonies"],
        queryFn: getRejectedTestimonies,
    });
};


 export const useGetTestimonyById = (id: string) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["testimony", id],
    queryFn: () => getTestimonyById(id),
    enabled: !!id,
  });
}

export const useUpdateTestimonyStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { id: number, status: string, rejectionNote?: string }) => updateTestimonyStatus(data.id, { status: data.status, rejectionNote: data.rejectionNote }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pendingTestimonies"] });
            queryClient.invalidateQueries({ queryKey: ["approvedTestimonies"] });
            queryClient.invalidateQueries({ queryKey: ["rejectedTestimonies"] });
            queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
        },
    });
};

export const useUpdateTestimony = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { id: number, title: string, content: string, categoryId: number }) => updateTestimony(data.id, { title: data.title, content: data.content, categoryId: data.categoryId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pendingTestimonies"] });
            queryClient.invalidateQueries({ queryKey: ["approvedTestimonies"] });
            queryClient.invalidateQueries({ queryKey: ["rejectedTestimonies"] });
        },
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createcategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });
}   
export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, category}: {id: number, category: Partial<TestimonyCategory>}) => updatecategory(id, category),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });
}
export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deletecategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });
}
  type GetTestimoniesParams = {
  search?: string;
  page?: number;
  limit?: number;
  categorySlug?: string;
};