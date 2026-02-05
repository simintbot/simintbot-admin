// Types pour l'application Admin

// ============ UTILISATEURS ============
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  birthDate?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  interviewsCount?: number;
}

export interface UserDetails extends User {
  cv?: UserCV;
  interviews: Interview[];
}

export interface UserCV {
  title: string;
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: string[];
}

export interface Experience {
  id: number;
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface Education {
  id: number;
  degree: string;
  school: string;
  year: string;
}

// ============ ENTRETIENS ============
export interface Interview {
  id: string;
  userId?: string;
  date: string;
  time?: string;
  type: 'Simulé' | 'Réel';
  job: string;
  duration: string;
  score: number | null;
  status: 'completed' | 'scheduled' | 'cancelled';
  description?: string;
  feedback?: string;
}

// ============ DÉCORS ============
export interface Decor {
  id: string;
  name: string;
  country: string;
  image: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DecorFormData {
  name: string;
  country: string;
  image: File | string | null;
  type?: string; // asset type, e.g. 'background'
  isActive?: boolean;
}

// ============ JOBS / FICHES MÉTIERS ============
export interface Job {
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
  createdAt?: string;
  updatedAt?: string;
}

export interface JobFormData {
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

// ============ SECTEURS D'ACTIVITÉS ============
export interface Sector {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface SectorFormData {
  name: string;
  description?: string;
  isActive: boolean;
}

// ============ API RESPONSES ============
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============ FILTRES ============
export interface UserFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  page?: number;
  limit?: number;
}

export interface DecorFilters {
  search?: string;
  country?: string;
  isActive?: boolean;
}

export interface JobFilters {
  search?: string;
  sector?: string;
  language?: string;
  is_template?: boolean;
}

export interface SectorFilters {
  skip?: number;
  limit?: number;
}
