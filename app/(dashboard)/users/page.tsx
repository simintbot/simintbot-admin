"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MoreVertical, Eye, UserCheck, UserX, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { userService } from '@/lib/services/user.service';
import { User } from '@/lib/types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Charger les utilisateurs
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setUsers(data);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Toggle statut utilisateur
  const handleToggleStatus = async (userId: string) => {
    try {
      await userService.toggleUserStatus(userId);
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      ));
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} utilisateur(s) trouvé(s)</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-2.5 gap-2">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm flex-1 text-gray-600"
            />
          </div>

          {/* Filtre statut */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="bg-gray-50 border-0 rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-[#0D7BFF]"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table des utilisateurs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#0D7BFF]" />
          </div>
        ) : (
          <>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entretiens</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inscription</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0D7BFF]/10 flex items-center justify-center text-[#0D7BFF] font-semibold text-sm">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-400">{user.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{user.interviewsCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{user.createdAt}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical size={16} className="text-gray-400" />
                      </button>
                      
                      {openMenuId === user.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                                <Link 
                                  href={`/users/${user.id}`}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                                >
                                  <Eye size={14} />
                                  Voir les détails
                                </Link>
                                <button 
                                  onClick={() => handleToggleStatus(user.id)}
                                  className={`flex items-center gap-2 px-4 py-2 text-sm w-full ${
                                    user.status === 'active' 
                                      ? 'text-red-600 hover:bg-red-50' 
                                      : 'text-green-600 hover:bg-green-50'
                                  }`}
                                >
                                  {user.status === 'active' ? (
                                    <>
                                      <UserX size={14} />
                                      Désactiver
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck size={14} />
                                      Activer
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Affichage de 1 à {users.length} sur {users.length} résultats
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1.5 bg-[#0D7BFF] text-white rounded-lg text-sm font-medium">1</button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50" disabled>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
