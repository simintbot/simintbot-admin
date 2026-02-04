// Service pour la gestion des utilisateurs

import apiClient from '../api/client';
import { User, UserDetails, UserFilters, PaginatedResponse, ApiResponse } from '../types';

// ============ DONNÉES MOCKÉES (à remplacer par appels API) ============
const mockUsers: User[] = [
  { id: '1', firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@email.com', phone: '+33 6 12 34 56 78', status: 'active', createdAt: '2025-01-15', interviewsCount: 12 },
  { id: '2', firstName: 'Marie', lastName: 'Martin', email: 'marie.martin@email.com', phone: '+33 6 98 76 54 32', status: 'active', createdAt: '2025-01-20', interviewsCount: 8 },
  { id: '3', firstName: 'Pierre', lastName: 'Bernard', email: 'pierre.bernard@email.com', phone: '+33 6 11 22 33 44', status: 'inactive', createdAt: '2025-02-01', interviewsCount: 3 },
  { id: '4', firstName: 'Sophie', lastName: 'Petit', email: 'sophie.petit@email.com', phone: '+33 6 55 66 77 88', status: 'active', createdAt: '2025-02-03', interviewsCount: 15 },
  { id: '5', firstName: 'Lucas', lastName: 'Robert', email: 'lucas.robert@email.com', phone: '+33 6 99 88 77 66', status: 'active', createdAt: '2025-01-10', interviewsCount: 6 },
  { id: '6', firstName: 'Emma', lastName: 'Richard', email: 'emma.richard@email.com', phone: '+33 6 44 33 22 11', status: 'inactive', createdAt: '2025-01-25', interviewsCount: 2 },
];

const mockUserDetails: Record<string, UserDetails> = {
  '1': {
    id: '1',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@email.com',
    phone: '+33 6 12 34 56 78',
    address: '15 Rue de la Paix, 75001 Paris',
    birthDate: '1995-05-15',
    status: 'active',
    createdAt: '2025-01-15',
    cv: {
      title: 'Développeur Full Stack',
      summary: 'Développeur passionné avec 5 ans d\'expérience dans le développement web et mobile.',
      experiences: [
        { id: 1, title: 'Développeur Senior', company: 'TechCorp', period: '2022 - Présent', description: 'Développement d\'applications React et Node.js' },
        { id: 2, title: 'Développeur Junior', company: 'StartupXYZ', period: '2020 - 2022', description: 'Développement front-end et maintenance' },
      ],
      education: [
        { id: 1, degree: 'Master Informatique', school: 'Université Paris-Saclay', year: '2020' },
        { id: 2, degree: 'Licence Informatique', school: 'Université Paris-Saclay', year: '2018' },
      ],
      skills: ['React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'Docker'],
    },
    interviews: [
      { id: '1', date: '2026-02-03', time: '10:00', type: 'Simulé', job: 'Développeur React', duration: '25 min', score: 85, status: 'completed', description: 'Entretien technique sur React et les hooks', feedback: 'Bonne maîtrise des concepts React, à améliorer sur les patterns avancés.' },
      { id: '2', date: '2026-01-28', time: '14:30', type: 'Simulé', job: 'Chef de Projet', duration: '30 min', score: 72, status: 'completed', description: 'Simulation gestion de projet Agile', feedback: 'Bonne communication, améliorer la gestion des priorités.' },
      { id: '3', date: '2026-01-20', time: '09:00', type: 'Réel', job: 'Développeur Full Stack', duration: '45 min', score: null, status: 'completed', description: 'Entretien avec TechCorp pour un poste senior' },
      { id: '4', date: '2026-02-10', time: '11:00', type: 'Simulé', job: 'Product Owner', duration: '30 min', score: null, status: 'scheduled', description: 'Préparation au rôle de Product Owner' },
      { id: '5', date: '2026-02-15', time: '15:00', type: 'Réel', job: 'Lead Developer', duration: '60 min', score: null, status: 'scheduled', description: 'Entretien final chez InnovateTech' },
      { id: '6', date: '2026-02-20', time: '10:30', type: 'Simulé', job: 'Architecte Solution', duration: '45 min', score: null, status: 'scheduled', description: 'Simulation architecture cloud' },
    ],
  },
};

// Flag pour utiliser les données mockées ou l'API réelle
const USE_MOCK_DATA = true;

// ============ SERVICE ============
export const userService = {
  /**
   * Récupérer la liste des utilisateurs avec filtres
   */
  async getUsers(filters?: UserFilters): Promise<User[]> {
    if (USE_MOCK_DATA) {
      // Simulation avec données mockées
      let filtered = [...mockUsers];
      
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(user => 
          user.firstName.toLowerCase().includes(search) ||
          user.lastName.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
        );
      }
      
      if (filters?.status && filters.status !== 'all') {
        filtered = filtered.filter(user => user.status === filters.status);
      }
      
      return filtered;
    }
    
    // Appel API réel
    return apiClient.get<User[]>('/users', {
      params: {
        search: filters?.search,
        status: filters?.status,
        page: filters?.page,
        limit: filters?.limit,
      },
    });
  },

  /**
   * Récupérer les détails d'un utilisateur
   */
  async getUserById(id: string): Promise<UserDetails> {
    if (USE_MOCK_DATA) {
      const user = mockUserDetails[id];
      if (!user) {
        // Créer un user par défaut basé sur mockUsers
        const basicUser = mockUsers.find(u => u.id === id);
        if (basicUser) {
          return {
            ...basicUser,
            interviews: [],
          };
        }
        throw new Error('Utilisateur non trouvé');
      }
      return user;
    }
    
    return apiClient.get<UserDetails>(`/users/${id}`);
  },

  /**
   * Activer/Désactiver un utilisateur
   */
  async toggleUserStatus(id: string): Promise<User> {
    if (USE_MOCK_DATA) {
      const userIndex = mockUsers.findIndex(u => u.id === id);
      if (userIndex !== -1) {
        mockUsers[userIndex].status = mockUsers[userIndex].status === 'active' ? 'inactive' : 'active';
        return mockUsers[userIndex];
      }
      throw new Error('Utilisateur non trouvé');
    }
    
    return apiClient.patch<User>(`/users/${id}/toggle-status`);
  },

  /**
   * Mettre à jour un utilisateur
   */
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    if (USE_MOCK_DATA) {
      const userIndex = mockUsers.findIndex(u => u.id === id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...data };
        return mockUsers[userIndex];
      }
      throw new Error('Utilisateur non trouvé');
    }
    
    return apiClient.put<User>(`/users/${id}`, data);
  },

  /**
   * Supprimer un utilisateur
   */
  async deleteUser(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      const userIndex = mockUsers.findIndex(u => u.id === id);
      if (userIndex !== -1) {
        mockUsers.splice(userIndex, 1);
        return;
      }
      throw new Error('Utilisateur non trouvé');
    }
    
    return apiClient.delete(`/users/${id}`);
  },
};

export default userService;
