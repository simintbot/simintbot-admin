import apiClient from '../api/client';

export interface Document {
  id: string;
  slug: string;
  title: string;
  content: string;
  locale: string;
  updated_at: string;
  is_active: boolean;
}

const BASE_PATH = '/documents';

export const documentService = {
  getBySlug: async (slug: string, locale: string) => {
    return apiClient.get<{ data: Document }>(`${BASE_PATH}/${slug}`, { params: { locale } });
  },

  create: async (data: Partial<Document>) => {
    return apiClient.post<{ data: Document }>(BASE_PATH, data);
  },

  update: async (slug: string, data: Partial<Document>) => {
    // Ensure we send locale so backend knows which translation to update
    // The backend requires ?locale=xx in the query params for PUT requests
    return apiClient.put<{ data: Document }>(
      `${BASE_PATH}/${slug}`, 
      data,
      { params: { locale: data.locale } }
    );
  }
};
