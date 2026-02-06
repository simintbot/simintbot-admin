import apiClient from '../api/client';

export interface DashboardKPIs {
  total_users: number;
  new_users_30d: number;
  total_interviews: number;
  completed_interviews: number;
  completion_rate: number;
}

export interface ActivityData {
  date: string;
  count: number;
}

export interface SectorData {
  name: string;
  value: number;
}

export interface RecentActivity {
  id: string;
  user_name: string;
  user_email: string;
  date: string;
  status: string;
  score: number;
  type: string;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  charts: {
    activity_30d: ActivityData[];
    sectors: SectorData[];
  };
  recent_activity: RecentActivity[];
}

export const dashboardService = {
  getStats: async () => {
    return apiClient.get<{ data: DashboardData }>('/dashboard/admin');
  }
};
