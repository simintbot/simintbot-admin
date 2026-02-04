// Service pour la gestion des décors

import apiClient from '../api/client';
import { Decor, DecorFormData, DecorFilters, ApiResponse } from '../types';

// ============ DONNÉES MOCKÉES (à remplacer par appels API) ============
let mockDecors: Decor[] = [
  { id: '1', name: 'Bureau moderne', country: 'FR', image: '/img/decor-1.jpg', isActive: true, createdAt: '2025-01-15' },
  { id: '2', name: 'Salle de réunion', country: 'FR', image: '/img/decor-2.jpg', isActive: true, createdAt: '2025-01-16' },
  { id: '3', name: 'Open Space Tech', country: 'US', image: '/img/decor-3.jpg', isActive: true, createdAt: '2025-01-17' },
  { id: '4', name: 'Startup Loft', country: 'US', image: '/img/decor-4.jpg', isActive: false, createdAt: '2025-01-18' },
  { id: '5', name: 'Corporate Office', country: 'GB', image: '/img/decor-5.jpg', isActive: true, createdAt: '2025-01-19' },
  { id: '6', name: 'Coworking Space', country: 'DE', image: '/img/decor-6.jpg', isActive: true, createdAt: '2025-01-20' },
  { id: '7', name: 'Bureau Élégant', country: 'FR', image: '/img/decor-7.jpg', isActive: true, createdAt: '2025-01-21' },
  { id: '8', name: 'Salle de Conférence', country: 'ES', image: '/img/decor-8.jpg', isActive: true, createdAt: '2025-01-22' },
];

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

// Flag pour utiliser les données mockées ou l'API réelle
const USE_MOCK_DATA = true;

// ============ SERVICE ============
export const decorService = {
  /**
   * Récupérer la liste des décors avec filtres
   */
  async getDecors(filters?: DecorFilters): Promise<Decor[]> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockDecors];
      
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(decor => 
          decor.name.toLowerCase().includes(search)
        );
      }
      
      if (filters?.country && filters.country !== 'all') {
        filtered = filtered.filter(decor => decor.country === filters.country);
      }
      
      if (filters?.isActive !== undefined) {
        filtered = filtered.filter(decor => decor.isActive === filters.isActive);
      }
      
      return filtered;
    }
    
    return apiClient.get<Decor[]>('/decors', {
      params: {
        search: filters?.search,
        country: filters?.country,
        isActive: filters?.isActive,
      },
    });
  },

  /**
   * Récupérer un décor par ID
   */
  async getDecorById(id: string): Promise<Decor> {
    if (USE_MOCK_DATA) {
      const decor = mockDecors.find(d => d.id === id);
      if (!decor) {
        throw new Error('Décor non trouvé');
      }
      return decor;
    }
    
    return apiClient.get<Decor>(`/decors/${id}`);
  },

  /**
   * Créer un nouveau décor
   */
  async createDecor(data: DecorFormData): Promise<Decor> {
    if (USE_MOCK_DATA) {
      const newDecor: Decor = {
        id: Date.now().toString(),
        ...data,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
      };
      mockDecors.push(newDecor);
      return newDecor;
    }
    
    return apiClient.post<Decor>('/decors', data);
  },

  /**
   * Mettre à jour un décor
   */
  async updateDecor(id: string, data: Partial<DecorFormData>): Promise<Decor> {
    if (USE_MOCK_DATA) {
      const index = mockDecors.findIndex(d => d.id === id);
      if (index === -1) {
        throw new Error('Décor non trouvé');
      }
      mockDecors[index] = { 
        ...mockDecors[index], 
        ...data,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      return mockDecors[index];
    }
    
    return apiClient.put<Decor>(`/decors/${id}`, data);
  },

  /**
   * Activer/Désactiver un décor
   */
  async toggleDecorStatus(id: string): Promise<Decor> {
    if (USE_MOCK_DATA) {
      const index = mockDecors.findIndex(d => d.id === id);
      if (index === -1) {
        throw new Error('Décor non trouvé');
      }
      mockDecors[index].isActive = !mockDecors[index].isActive;
      return mockDecors[index];
    }
    
    return apiClient.patch<Decor>(`/decors/${id}/toggle-status`);
  },

  /**
   * Supprimer un décor
   */
  async deleteDecor(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      const index = mockDecors.findIndex(d => d.id === id);
      if (index === -1) {
        throw new Error('Décor non trouvé');
      }
      mockDecors.splice(index, 1);
      return;
    }
    
    return apiClient.delete(`/decors/${id}`);
  },

  /**
   * Upload d'image pour un décor
   */
  async uploadImage(file: File): Promise<{ url: string }> {
    if (USE_MOCK_DATA) {
      // Simulation d'upload
      return { url: `/img/decor-${Date.now()}.jpg` };
    }
    
    return apiClient.upload<{ url: string }>('/decors/upload', file, 'image');
  },

  /**
   * Récupérer la liste des pays
   */
  getCountries() {
    return COUNTRIES;
  },
};

export default decorService;
