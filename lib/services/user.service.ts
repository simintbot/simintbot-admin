// Service pour la gestion des utilisateurs

import apiClient from '../api/client';

export interface SocialLinks {
  [key: string]: string;
}

export interface User {
  id: string;
  unique_uid: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  phone_country_code: string;
  auth_provider: string;
  is_active: boolean;
  created_at: string;
  biography: string;
  gender: string;
  nationality: string;
  birth_date: string;
  address: string;
  profile_picture_url: string;
  cover_picture_url: string;
  social_links: SocialLinks;
  interview_count: number;
  average_score: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface UserFilters {
  page?: number;
  size?: number;
}

const BASE_PATH = '/users';

export const userService = {
  getUsers: async (filters?: UserFilters) => {
    try {
        const params = new URLSearchParams();
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.size) params.append('size', filters.size.toString());

        return await apiClient.get<{ data: PaginatedResponse<User> }>(`${BASE_PATH}?${params.toString()}`);
    } catch (error) {
        console.error("Error fetching users", error);
        throw error;
    }
  },

  getUserById: async (id: string) => {
     return await apiClient.get<{ data: User }>(`${BASE_PATH}/${id}`);
  },

  toggleUserStatus: async (id: string) => {
      // Placeholder: assuming PATCH /users/:id { is_active: !prev } logic is handled by caller or backend
      // But we can just define the call structure
      return apiClient.patch<{ data: User }>(`${BASE_PATH}/${id}`, { /* toggle logic usually requires knowing current state or backend handles 'toggle' */ }); 
  }
};
