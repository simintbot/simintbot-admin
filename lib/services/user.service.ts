// Service pour la gestion des utilisateurs

import apiClient from '../api/client';

export interface SocialLinks {
  [key: string]: string;
}

export interface User {
  id: string;
  unique_uid: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  phone_country_code: string;
  auth_provider: string;
  is_active: boolean;
  created_at: string;
  biography: string;
  gender: string;
  nationality: string;
  birth_date: string;
  address: string;
  profile_picture_url: string;
  cover_picture_url: string;
  social_links: SocialLinks;
  interview_count: number;
  average_score: number;
}

export interface CVProfile {
  id: string;
  user_id: string;
  resume_file_url: string;
  resume_file_name: string;
  is_parsed: boolean;
  headline: string;
  summary: string | null;
  years_of_experience: number;
  primary_domain: string;
  languages: Array<{ lang: string; level: string }>;
  skills: {
    hard_skills: string[];
    soft_skills: string[];
  };
  experiences: Array<{
    role: string;
    company: string;
    start_date: string;
    end_date: string;
    description: string;
    tech_stack: string[];
    kpis: any[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    field: string;
    year: number;
  }>;
  projects: Array<{
    title: string;
    description: string;
    link: string | null;
    technologies: string[];
  }>;
  created_at: string;
  updated_at: string;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  cv_profile_id: string;
  job_position_id: string;
  interview_type: string;
  difficulty_level: string;
  flow_type: string;
  attempt_count: number;
  duration_minutes: number;
  language_code: string;
  recruiter_name: string;
  status: 'completed' | 'in_progress' | 'cancelled';
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InterviewSessionDetail extends InterviewSession {
    user: any;
    cv_profile: any;
    job_position: {
        id: string;
        title: string;
        sector: string;
        description: string;
        skills_required: string[];
        qualifications: string;
        salary_min: number;
        salary_max: number;
        currency: string;
    };
    selected_decor: {
        id: string;
        name: string;
        image_url: string;
    } | null;
    report_data?: {
        job: any;
        model: string;
        candidate: any;
        gpt_report: string;
        generated_at: string;
        voice_analysis_summary?: {
             dominant_emotions: Array<{emotion: string, average_score: number}>;
             overall_sentiment: string;
             stress_assessment: string;
             average_stress_level: number;
        }
    }
}

export interface AgendaEvent {
  id: string;
  user_id: string;
  interview_session_id: string;
  title: string;
  description: string;
  event_type: 'simulation' | 'real_interview' | string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  reminder_sent: boolean;
  google_calendar_link: string;
  ics_file_name: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface UserFilters {
  page?: number;
  size?: number;
}

const BASE_PATH = '/users';

export const userService = {
  getUsers: async (filters?: UserFilters) => {
    try {
        const params = new URLSearchParams();
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.size) params.append('size', filters.size.toString());

        return await apiClient.get<{ data: PaginatedResponse<User> }>(`${BASE_PATH}?${params.toString()}`);
    } catch (error) {
        console.error("Error fetching users", error);
        throw error;
    }
  },

  getUserById: async (id: string) => {
     return await apiClient.get<{ data: User }>(`${BASE_PATH}/${id}`);
  },

  toggleUserStatus: async (id: string) => {
      // Placeholder: assuming PATCH /users/:id { is_active: !prev } logic is handled by caller or backend
      // But we can just define the call structure
      return apiClient.patch<{ data: User }>(`${BASE_PATH}/${id}`, { /* toggle logic usually requires knowing current state or backend handles 'toggle' */ }); 
  },

  getUserCV: async (userId: string) => {
      return await apiClient.get<{ data: CVProfile }>(`/cv/user/${userId}`);
  },

  getUserInterviews: async (userId: string, filters?: { page?: number, size?: number }) => {
    const params = new URLSearchParams();
    params.append('user_id', userId);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.size) params.append('size', filters.size.toString());

    return await apiClient.get<{ data: PaginatedResponse<InterviewSession> }>(`/interviews/sessions?${params.toString()}`);
  },

  getInterviewSession: async (sessionId: string) => {
     return await apiClient.get<{ data: InterviewSessionDetail }>(`/interviews/session/${sessionId}`);
  },

  getCurrentUser: async () => {
      return await apiClient.get<{ data: User }>(`${BASE_PATH}/me`);
  },

  getUserAgendaEvents: async (userId: string, startDate: string, endDate: string) => {
      const params = new URLSearchParams();
      params.append('user_id', userId);
      params.append('start_date', startDate);
      params.append('end_date', endDate);
      return await apiClient.get<{ data: AgendaEvent[] }>(`/agenda/events?${params.toString()}`);
  }
};
