// Service pour la gestion des fiches métiers
import apiClient from '../api/client';

export interface JobSheet {
  id: string;
  title: string;
  sector: string;
  sector_id: string;
  description: string;
  skills_required: string[];
  missions: string[];
  qualifications: string;
  salary_min: number;
  salary_max: number;
  currency: string;
  language: string;
  is_template: boolean;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface JobFilters {
  sector?: string;
  page?: number;
  size?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

const BASE_PATH = '/interviews/jobs';

export const jobServices = {
  getAll: async (filters?: JobFilters) => {
    try {
      const params = new URLSearchParams();
      if (filters?.sector) params.append('sector', filters.sector);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.size) params.append('size', filters.size.toString());

      const response = await apiClient.get<{ data: PaginatedResponse<JobSheet> }>(`${BASE_PATH}?${params.toString()}`);
      return response;
    } catch (error) {
       console.error("Error fetching jobs", error)
       throw error
    }
  },

  getById: async (id: string) => {
     return await apiClient.get<JobSheet>(`${BASE_PATH}/${id}`);
  },

  create: async (data: any) => {
     return await apiClient.post(BASE_PATH, data);
  },

  update: async (id: string, data: any) => {
     return await apiClient.put(`${BASE_PATH}/${id}`, data);
  },

  delete: async (id: string) => {
     return await apiClient.delete(`${BASE_PATH}/${id}`);
  }
};

export default jobServices;
