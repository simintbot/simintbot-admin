// Service pour la gestion des secteurs d'activités

import apiClient from '../api/client';
import { Sector, SectorFormData, SectorFilters } from '../types';

// ============ SERVICE ============
export const sectorService = {
  /**
   * Récupérer la liste des secteurs avec pagination
   */
  async getSectors(filters?: SectorFilters): Promise<Sector[]> {
    const res = await apiClient.get<{ success?: boolean; message?: string; data?: Sector[] }>('/sectors', {
      params: {
        skip: filters?.skip ?? 0,
        limit: filters?.limit ?? 100,
      },
    });

    const list = Array.isArray(res) ? (res as any) : (res && Array.isArray((res as any).data) ? (res as any).data : []);
    return list.map((s: any) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      isActive: s.is_active,
    }));
  },

  /**
   * Créer un secteur
   */
  async createSector(data: SectorFormData): Promise<Sector> {
    const res = await apiClient.post<{ success?: boolean; message?: string; data?: any }>('/sectors', {
      name: data.name,
      description: data.description,
      is_active: data.isActive,
    });
    const payload = (res && (res as any).data) ? (res as any).data : res;
    return {
      id: payload.id,
      name: payload.name,
      description: payload.description,
      isActive: payload.is_active,
    };
  },

  /**
   * Mettre à jour un secteur
   */
  async updateSector(id: string, data: SectorFormData): Promise<Sector> {
    const res = await apiClient.put<{ success?: boolean; message?: string; data?: any }>(`/sectors/${id}`, {
      name: data.name,
      description: data.description,
      is_active: data.isActive,
    });
    const payload = (res && (res as any).data) ? (res as any).data : res;
    return {
      id: payload.id,
      name: payload.name,
      description: payload.description,
      isActive: payload.is_active,
    };
  },

  /**
   * Activer/Désactiver un secteur
   */
  async toggleSectorStatus(sector: Sector): Promise<Sector> {
    return this.updateSector(sector.id, {
      name: sector.name,
      description: sector.description,
      isActive: !sector.isActive,
    });
  },

  /**
   * Supprimer un secteur
   */
  async deleteSector(id: string): Promise<void> {
    await apiClient.delete(`/sectors/${id}`);
  },
};

export default sectorService;
