"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api/client';
import authService from '@/lib/api/services/auth.service';
import apiClient from '@/lib/api/client';
import { Search, Filter, Plus, MoreVertical, Edit, Trash2, Eye, EyeOff, X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { decorService, COUNTRIES } from '@/lib/services/decor.service';
import { Decor, DecorFormData } from '@/lib/types';

export default function DecorPage() {
  const [decors, setDecors] = useState<Decor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDecor, setEditingDecor] = useState<Decor | null>(null);
  const [formData, setFormData] = useState<DecorFormData>({ name: '', country: 'FR', image: null, type: 'background', isActive: true });
  const [saving, setSaving] = useState(false);
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

  // Charger les décors
  const loadDecors = useCallback(async () => {
    try {
      // Ensure apiClient has current token
      try {
        const tk = localStorage.getItem('access_token');
        if (!tk) {
          authService.clearAuth();
          router.replace('/login');
          return;
        }
        apiClient.setToken(tk);
      } catch (e) {
        // ignore
      }
      setLoading(true);
      const data = await decorService.getDecors({
        search: searchQuery || undefined,
        country: countryFilter !== 'all' ? countryFilter : undefined,
      });
      setDecors(data);
    } catch (error) {
      console.error('Erreur lors du chargement des décors:', error);
      const msg = getErrorMessage(error);
      alert(msg);
      if (error instanceof ApiError) {
        if (error.status === 401 || String(msg).toLowerCase().includes('jeton') || String(msg).toLowerCase().includes('token')) {
          authService.clearAuth();
          router.replace('/login');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, countryFilter]);

  useEffect(() => {
    loadDecors();
  }, [loadDecors]);

  // Toggle statut
  const handleToggleStatus = async (decor: Decor) => {
    try {
      const updated = await decorService.toggleDecorStatus(decor.id, decor.isActive);
      setDecors(decors.map(d => 
        d.id === decor.id ? updated : d
      ));
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      alert(getErrorMessage(error));
    }
    setOpenMenuId(null);
  };

  // Ouvrir modal création
  const openCreateModal = () => {
    setEditingDecor(null);
    setFormData({ name: '', country: 'FR', image: null, type: 'background', isActive: true });
    setIsModalOpen(true);
  };

  // Ouvrir modal édition
  const openEditModal = (decor: Decor) => {
    setEditingDecor(decor);
    setFormData({ name: decor.name, country: decor.country, image: decor.image, type: 'background', isActive: decor.isActive });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  // Supprimer décor
  const handleDeleteDecor = async (decorId: string) => {
    try {
      await decorService.deleteDecor(decorId);
      setDecors(decors.filter(d => d.id !== decorId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
    setOpenMenuId(null);
  };

  // Soumettre formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingDecor) {
        const updated = await decorService.updateDecor(editingDecor.id, formData);
        setDecors(decors.map(d => d.id === editingDecor.id ? updated : d));
      } else {
        const newDecor = await decorService.createDecor(formData);
        setDecors([...decors, newDecor]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Décors</h1>
          <p className="text-gray-500 text-sm mt-1">{decors.length} décor(s)</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-[#0D7BFF] text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#0a6ae0] transition-colors"
        >
          <Plus size={18} /> Ajouter un décor
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-2.5 gap-2">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher un décor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm flex-1 text-gray-600"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select 
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="bg-gray-50 border-0 rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-[#0D7BFF]"
            >
              <option value="all">Tous les pays</option>
              {COUNTRIES.map(country => (
                <option key={country.code} value={country.code}>{country.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grille des décors */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D7BFF]" />
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {decors.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            Aucun décor trouvé
          </div>
        ) : (
        decors.map((decor) => (
          <div key={decor.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
            {/* Image */}
            <div className="relative h-48 bg-gray-100">
              {decor.image ? (
                <img src={decor.image} alt={decor.name} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon size={48} className="text-gray-300" />
                </div>
              )}
              {/* Overlay au hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button 
                  onClick={() => openEditModal(decor)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleToggleStatus(decor)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                >
                  {decor.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Badge statut */}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  decor.isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {decor.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
            
            {/* Infos */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{decor.name}</h3>
                  <p className="text-sm text-gray-500">
                    {COUNTRIES.find(c => c.code === decor.country)?.name || decor.country}
                  </p>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === decor.id ? null : decor.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                  
                  {openMenuId === decor.id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                      <button 
                        onClick={() => openEditModal(decor)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 w-full"
                      >
                        <Edit size={14} /> Modifier
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(decor)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 w-full"
                      >
                        {decor.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                        {decor.isActive ? 'Désactiver' : 'Activer'}
                      </button>
                      <button 
                        onClick={() => handleDeleteDecor(decor.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                      >
                        <Trash2 size={14} /> Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
        )}
      </div>
      )}

      {/* Modal Création/Édition */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingDecor ? 'Modifier le décor' : 'Nouveau décor'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du décor
                </label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-[#0D7BFF] focus:ring-2 focus:ring-[#0D7BFF]/20"
                  placeholder="Ex: Bureau moderne"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pays
                </label>
                <select 
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-[#0D7BFF] focus:ring-2 focus:ring-[#0D7BFF]/20"
                >
                  {COUNTRIES.map(country => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, image: file });
                    }
                  }}
                  className="hidden"
                  id="decor-image-upload"
                />
                <label 
                  htmlFor="decor-image-upload"
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#0D7BFF] transition-colors cursor-pointer block"
                >
                  {formData.image ? (
                    <div className="space-y-2">
                      {formData.image instanceof File ? (
                        <img 
                          src={URL.createObjectURL(formData.image)} 
                          alt="Preview" 
                          className="max-h-32 mx-auto rounded-lg object-cover"
                        />
                      ) : typeof formData.image === 'string' && formData.image ? (
                        <img 
                          src={formData.image} 
                          alt="Current" 
                          className="max-h-32 mx-auto rounded-lg object-cover"
                        />
                      ) : null}
                      <p className="text-sm text-[#0D7BFF]">Cliquez pour changer l&apos;image</p>
                    </div>
                  ) : (
                    <>
                      <Upload size={32} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Cliquez pour uploader une image</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG jusqu&apos;à 5MB</p>
                    </>
                  )}
                </label>
              </div>

              <div className="flex gap-3 pt-4">
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
                  {editingDecor ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
