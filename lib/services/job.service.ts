// Service pour la gestion des fiches métiers

import apiClient from '../api/client';

// Types pour les fiches métiers
export interface JobSheet {
  id: string;
  title: string;
  sector: string;
  description: string;
  skills_required: string[];
  missions: string[];
  qualifications: string;
  salary_min: number;
  salary_max: number;
  currency: string;
  language: string;
  is_template: boolean;
}

export interface JobSheetFormData {
  title: string;
  sector: string;
  description: string;
  skills_required: string[];
  missions: string[];
  qualifications: string;
  salary_min: number;
  salary_max: number;
  currency: string;
  language: string;
  is_template: boolean;
}

export interface JobFilters {
  search?: string;
  sector?: string;
}

// ============ DONNÉES MOCKÉES (à remplacer par appels API) ============
let mockJobs: JobSheet[] = [
  { 
    id: '1', 
    title: 'Développeur Full Stack', 
    sector: 'Technologie', 
    description: 'Développe des applications web complètes côté front-end et back-end.',
    skills_required: ['JavaScript', 'React', 'Node.js', 'SQL'],
    missions: ['Développer des fonctionnalités', 'Participer aux code reviews', 'Rédiger la documentation'],
    qualifications: 'Bac+5 en informatique ou équivalent',
    salary_min: 40000,
    salary_max: 65000,
    currency: 'EUR',
    language: 'fr',
    is_template: true 
  },
  { 
    id: '2', 
    title: 'Chef de Projet Digital', 
    sector: 'Marketing', 
    description: 'Pilote les projets digitaux de l\'entreprise.',
    skills_required: ['Gestion de projet', 'Agile', 'Communication', 'Leadership'],
    missions: ['Coordonner les équipes', 'Gérer le budget', 'Reporting'],
    qualifications: 'Bac+5 école de commerce ou ingénieur',
    salary_min: 45000,
    salary_max: 70000,
    currency: 'EUR',
    language: 'fr',
    is_template: true 
  },
  { 
    id: '3', 
    title: 'Data Analyst', 
    sector: 'Technologie', 
    description: 'Analyse les données pour aider à la prise de décision.',
    skills_required: ['Python', 'SQL', 'Tableau', 'Excel', 'Statistics'],
    missions: ['Collecter les données', 'Créer des dashboards', 'Présenter les insights'],
    qualifications: 'Bac+5 en statistiques, mathématiques ou informatique',
    salary_min: 38000,
    salary_max: 55000,
    currency: 'EUR',
    language: 'fr',
    is_template: false 
  },
  { 
    id: '4', 
    title: 'Product Manager', 
    sector: 'Technologie', 
    description: 'Définit la vision produit et la roadmap.',
    skills_required: ['Product Management', 'UX', 'Agile', 'Data Analysis'],
    missions: ['Définir la stratégie produit', 'Prioriser le backlog', 'Collaborer avec les équipes'],
    qualifications: 'Bac+5 avec expérience en gestion de produit',
    salary_min: 50000,
    salary_max: 80000,
    currency: 'EUR',
    language: 'en',
    is_template: true 
  },
];

// Langues disponibles
export const LANGUAGES = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
];

// Secteurs
export const SECTORS = [
  'Technologie',
  'Finance',
  'Santé',
  'Marketing',
  'Ressources Humaines',
  'Commerce',
  'Industrie',
  'Education',
];

// Flag pour utiliser les données mockées ou l'API réelle
const USE_MOCK_DATA = true;

// ============ SERVICE ============
export const jobService = {
  /**
   * Récupérer la liste des fiches métiers avec filtres
   */
  async getJobs(filters?: JobFilters): Promise<JobSheet[]> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockJobs];
      
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(job => 
          job.title.toLowerCase().includes(search)
        );
      }
      
      if (filters?.sector && filters.sector !== 'all') {
        filtered = filtered.filter(job => job.sector === filters.sector);
      }
      
      return filtered;
    }
    
    return apiClient.get<JobSheet[]>('/jobs', {
      params: {
        search: filters?.search,
        sector: filters?.sector,
      },
    });
  },

  /**
   * Récupérer une fiche métier par ID
   */
  async getJobById(id: string): Promise<JobSheet> {
    if (USE_MOCK_DATA) {
      const job = mockJobs.find(j => j.id === id);
      if (!job) {
        throw new Error('Fiche métier non trouvée');
      }
      return job;
    }
    
    return apiClient.get<JobSheet>(`/jobs/${id}`);
  },

  /**
   * Créer une nouvelle fiche métier
   */
  async createJob(data: JobSheetFormData): Promise<JobSheet> {
    if (USE_MOCK_DATA) {
      const newJob: JobSheet = {
        id: Date.now().toString(),
        ...data,
      };
      mockJobs.push(newJob);
      return newJob;
    }
    
    return apiClient.post<JobSheet>('/jobs', data);
  },

  /**
   * Mettre à jour une fiche métier
   */
  async updateJob(id: string, data: Partial<JobSheetFormData>): Promise<JobSheet> {
    if (USE_MOCK_DATA) {
      const index = mockJobs.findIndex(j => j.id === id);
      if (index === -1) {
        throw new Error('Fiche métier non trouvée');
      }
      mockJobs[index] = { 
        ...mockJobs[index], 
        ...data,
      } as JobSheet;
      return mockJobs[index];
    }
    
    return apiClient.put<JobSheet>(`/jobs/${id}`, data);
  },

  /**
   * Supprimer une fiche métier
   */
  async deleteJob(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      const index = mockJobs.findIndex(j => j.id === id);
      if (index === -1) {
        throw new Error('Fiche métier non trouvée');
      }
      mockJobs.splice(index, 1);
      return;
    }
    
    return apiClient.delete(`/jobs/${id}`);
  },

  /**
   * Récupérer la liste des secteurs
   */
  getSectors() {
    return SECTORS;
  },

  /**
   * Récupérer la liste des langues
   */
  getLanguages() {
    return LANGUAGES;
  },
};

export default jobService;
