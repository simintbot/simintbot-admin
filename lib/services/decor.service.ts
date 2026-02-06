// Service pour la gestion des décors

import apiClient from '../api/client';
import { Decor, DecorFormData, DecorFilters, ApiResponse } from '../types';
import interviewApi from '../api/services/interview.service';

// Pays disponibles
export const COUNTRIES = [
  { code: 'FR', name: 'France' },
  { code: 'US', name: 'États-Unis' },
  { code: 'GB', name: 'Royaume-Uni' },
  { code: 'DE', name: 'Allemagne' },
  { code: 'ES', name: 'Espagne' },
  { code: 'IT', name: 'Italie' },
  { code: 'CA', name: 'Canada' },
  { code: 'CH', name: 'Suisse' },
  { code: 'BE', name: 'Belgique' },
];

// ============ SERVICE ============
export const decorService = {
  // Normalize image URL returned by API to an absolute URL usable in <img src>
  _resolveImageUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api\/v1\/?$/,'');
    if (!apiBase) return url;
    return apiBase + (url.startsWith('/') ? '' : '/') + url;
  },
  /**
   * Récupérer la liste des décors avec filtres
   */
  async getDecors(filters?: DecorFilters): Promise<Decor[]> {
    const assets = await interviewApi.listAssets({
      asset_type: 'background',
      country_code: filters?.country && filters.country !== 'all' ? filters?.country : undefined,
      is_active: filters?.isActive === undefined ? null : filters?.isActive,
      search: filters?.search,
    });

    console.log('[decorService.getDecors] API response:', assets);

    const list = Array.isArray(assets) ? assets : (assets && (assets as any).data && Array.isArray((assets as any).data) ? (assets as any).data : []);
    console.log('[decorService.getDecors] Parsed list:', list);

    return list.map((a: any) => ({
      id: a.id,
      name: a.name,
      country: a.country_code,
      image: this._resolveImageUrl(a.image_url),
      isActive: a.is_active,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    }));
  },

  /**
   * Récupérer un décor par ID
   */
  async getDecorById(id: string): Promise<Decor> {
    const res = await apiClient.get<any>(`/interviews/assets/${id}`);
    const payload = (res && (res as any).data) ? (res as any).data : res;
    return {
      id: payload.id,
      name: payload.name,
      country: payload.country_code,
      image: (decorService as any)._resolveImageUrl ? (decorService as any)._resolveImageUrl(payload.image_url) : payload.image_url,
      isActive: payload.is_active,
      createdAt: payload.created_at,
      updatedAt: payload.updated_at,
    };
  },

  /**
   * Créer un nouveau décor
   */
  async createDecor(data: DecorFormData): Promise<Decor> {
    const imageFile = (data.image instanceof File) ? data.image : undefined;
    if (!imageFile) {
      throw new Error('Image file is required');
    }

    const res = await interviewApi.createAsset({
      type: data.type ?? 'background',
      name: data.name,
      country_code: data.country,
      is_active: data.isActive === undefined ? true : !!data.isActive,
      image: imageFile,
    });

    const payload = (res && (res as any).data) ? (res as any).data : res;

    return {
      id: payload.id,
      name: payload.name,
      country: payload.country_code,
      image: (decorService as any)._resolveImageUrl ? (decorService as any)._resolveImageUrl(payload.image_url) : payload.image_url,
      isActive: payload.is_active,
      createdAt: payload.created_at,
      updatedAt: payload.updated_at,
    };
  },

  /**
   * Mettre à jour un décor
   * L'API utilise PATCH avec multipart/form-data
   */
  async updateDecor(id: string, data: Partial<DecorFormData>): Promise<Decor> {
    // Build FormData for PATCH request
    const formData = new FormData();
    
    // Add fields if provided
    if (data.name !== undefined && data.name !== '') {
      formData.append('name', data.name);
    }
    if (data.country !== undefined && data.country !== '') {
      formData.append('country_code', data.country);
    }
    if ((data as any).isActive !== undefined) {
      formData.append('is_active', String((data as any).isActive));
    }
    if ((data as any).type !== undefined) {
      formData.append('type', (data as any).type);
    }
    // Add image if it's a File
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }

    // Use fetch directly for multipart PATCH
    const url = `/api/interviews/assets/${id}`;
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };
    
    // Get token from apiClient
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: formData,
    });

    const text = await response.text();
    let res: any = null;
    try {
      res = text ? JSON.parse(text) : null;
    } catch (e) {
      res = text;
    }

    if (!response.ok) {
      throw new Error(res?.message || res?.detail?.[0]?.msg || `Error ${response.status}`);
    }

    const payload = (res && res.data) ? res.data : res;
    return {
      id: payload.id,
      name: payload.name,
      country: payload.country_code,
      image: this._resolveImageUrl(payload.image_url),
      isActive: payload.is_active,
      createdAt: payload.created_at,
      updatedAt: payload.updated_at,
    };
  },

  /**
   * Activer/Désactiver un décor
   * Utilise PATCH avec multipart/form-data
   */
  async toggleDecorStatus(id: string, currentIsActive?: boolean): Promise<Decor> {
    // If currentIsActive is not provided, fetch current asset first
    let newStatus: boolean;
    if (currentIsActive !== undefined) {
      newStatus = !currentIsActive;
    } else {
      const current = await this.getDecorById(id);
      newStatus = !current.isActive;
    }
    
    // Build FormData for PATCH request
    const formData = new FormData();
    formData.append('is_active', String(newStatus));

    const url = `/api/interviews/assets/${id}`;
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: formData,
    });

    const text = await response.text();
    let res: any = null;
    try {
      res = text ? JSON.parse(text) : null;
    } catch (e) {
      res = text;
    }

    if (!response.ok) {
      throw new Error(res?.message || res?.detail?.[0]?.msg || `Error ${response.status}`);
    }

    const payload = (res && res.data) ? res.data : res;
    return {
      id: payload.id,
      name: payload.name,
      country: payload.country_code,
      image: this._resolveImageUrl(payload.image_url),
      isActive: payload.is_active,
      createdAt: payload.created_at,
      updatedAt: payload.updated_at,
    };
  },

  /**
   * Supprimer un décor
   */
  async deleteDecor(id: string): Promise<void> {
    await apiClient.delete(`/interviews/assets/${id}`);
  },



  /**
   * Récupérer la liste des pays
   */
  getCountries() {
    return COUNTRIES;
  },
};

export default decorService;
