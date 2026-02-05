"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Filter, Plus, MoreVertical, Edit, Trash2, Eye, EyeOff, X, Loader2 } from 'lucide-react';
import { Sector, SectorFormData } from '@/lib/types';
import { sectorService } from '@/lib/services/sector.service';
import apiClient, { ApiError } from '@/lib/api/client';
import authService from '@/lib/api/services/auth.service';
import { useRouter } from 'next/navigation';

export default function SectorsPage() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [formData, setFormData] = useState<SectorFormData>({ name: '', description: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const router = useRouter();

  const getErrorMessage = (error: unknown) => {
    if (error instanceof ApiError) {
      return error.body?.message ?? error.message ?? String(error);
    }
    if (error && typeof error === 'object' && 'message' in (error as any)) {
      return (error as any).message;
    }
    return String(error ?? 'Erreur inconnue');
  };

  const ensureToken = () => {
    try {
      const tk = localStorage.getItem('access_token');
      if (!tk) {
        authService.clearAuth();
        router.replace('/login');
        return false;
      }
      apiClient.setToken(tk);
      return true;
    } catch (e) {
      return false;
    }
  };

  const loadSectors = useCallback(async () => {
    try {
      if (!ensureToken()) return;
      setLoading(true);
      const data = await sectorService.getSectors({
        skip: (page - 1) * limit,
        limit,
      });
      setSectors(data);
      setHasMore(data.length === limit);
    } catch (error) {
      console.error('Erreur lors du chargement des secteurs:', error);
      const msg = getErrorMessage(error);
      alert(msg);
      if (error instanceof ApiError && error.status === 401) {
        authService.clearAuth();
        router.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    loadSectors();
  }, [loadSectors]);

  const filteredSectors = useMemo(() => {
    let list = [...sectors];
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();
      list = list.filter((item) =>
        item.name.toLowerCase().includes(s) ||
        (item.description || '').toLowerCase().includes(s)
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter((item) => (statusFilter === 'active' ? item.isActive : !item.isActive));
    }
    return list;
  }, [sectors, searchQuery, statusFilter]);

  const openCreateModal = () => {
    setEditingSector(null);
    setFormData({ name: '', description: '', isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (sector: Sector) => {
    setEditingSector(sector);
    setFormData({ name: sector.name, description: sector.description || '', isActive: sector.isActive });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleToggleStatus = async (sector: Sector) => {
    try {
      if (!ensureToken()) return;
      const updated = await sectorService.toggleSectorStatus(sector);
      setSectors(sectors.map((s) => (s.id === sector.id ? updated : s)));
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      alert(getErrorMessage(error));
    }
    setOpenMenuId(null);
  };

  const handleDeleteSector = async (sectorId: string) => {
    const ok = confirm('Supprimer ce secteur ?');
    if (!ok) return;
    try {
      if (!ensureToken()) return;
      await sectorService.deleteSector(sectorId);
      setSectors(sectors.filter((s) => s.id !== sectorId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert(getErrorMessage(error));
    }
    setOpenMenuId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!ensureToken()) return;
      if (editingSector) {
        const updated = await sectorService.updateSector(editingSector.id, formData);
        setSectors(sectors.map((s) => (s.id === editingSector.id ? updated : s)));
      } else {
        const created = await sectorService.createSector(formData);
        setSectors([created, ...sectors]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Secteurs d&apos;activités</h1>
          <p className="text-gray-500 text-sm mt-1">{filteredSectors.length} secteur(s)</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-[#0D7BFF] text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#0a6ae0] transition-colors"
        >
          <Plus size={18} /> Nouveau secteur
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-2.5 gap-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un secteur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm flex-1 text-gray-600"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-gray-50 border-0 rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-[#0D7BFF]"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#0D7BFF]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500">
                  <th className="px-6 py-4">Nom</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSectors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                      Aucun secteur trouvé
                    </td>
                  </tr>
                ) : (
                  filteredSectors.map((sector) => (
                    <tr key={sector.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{sector.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 line-clamp-2">{sector.description || '—'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${sector.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {sector.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(sector)}
                            title="Modifier"
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Edit size={16} className="text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(sector)}
                            title={sector.isActive ? 'Désactiver' : 'Activer'}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            {sector.isActive ? (
                              <EyeOff size={16} className="text-gray-500" />
                            ) : (
                              <Eye size={16} className="text-gray-500" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteSector(sector.id)}
                            title="Supprimer"
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Page {page}</p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Précédent
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingSector ? 'Modifier le secteur' : 'Nouveau secteur'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-[#0D7BFF] focus:ring-2 focus:ring-[#0D7BFF]/20"
                  placeholder="Ex: Technologie"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-[#0D7BFF] focus:ring-2 focus:ring-[#0D7BFF]/20"
                  placeholder="Décrivez le secteur..."
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="sector-active"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-[#0D7BFF] focus:ring-[#0D7BFF]"
                />
                <label htmlFor="sector-active" className="text-sm text-gray-700">Secteur actif</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-[#0D7BFF] rounded-xl hover:bg-[#0a6ae0] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {editingSector ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
