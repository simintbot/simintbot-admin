"use client";
import React, { useEffect, useState } from 'react';
import { Users, Calendar, Video, TrendingUp, Activity, CheckCircle, PieChart, BarChart2 } from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart as RePieChart,
    Pie,
    Cell
} from 'recharts';
import { dashboardService, DashboardData } from '@/lib/services/dashboard.service';
import toast from 'react-hot-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#0D7BFF'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await dashboardService.getStats();
            if (response && response.data) {
                setData(response.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Impossible de charger les données du dashboard');
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  if (loading) {
      return (
          <div className="flex h-96 items-center justify-center">
              <Activity className="animate-spin text-[#0D7BFF]" size={40} />
          </div>
      )
  }

  if (!data) return null;

  const stats = [
    { 
        label: 'Utilisateurs Total', 
        value: data.kpis.total_users, 
        subtext: `+${data.kpis.new_users_30d} derniers 30j`,
        icon: Users, 
        color: 'blue' 
    },
    { 
        label: 'Entretiens lancés', 
        value: data.kpis.total_interviews, 
        subtext: 'Depuis le début',
        icon: Video, 
        color: 'purple' 
    },
    { 
        label: 'Terminés', 
        value: data.kpis.completed_interviews, 
        subtext: 'Entretiens complétés',
        icon: CheckCircle, 
        color: 'green' 
    },
    { 
        label: 'Taux de complétion', 
        value: `${data.kpis.completion_rate}%`, 
        subtext: 'Performance globale',
        icon: TrendingUp, 
        color: 'orange' 
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; iconBg: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', iconBg: 'bg-orange-100' },
  };

  const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' }).format(date);
  }

  const formatFullDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('fr-FR', { 
          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
      }).format(date);
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
        <p className="text-gray-500 mt-1">Vue d'ensemble de l'activité sur SimintBot.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colors = colorClasses[stat.color];
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center`}>
                  <Icon className={colors.text} size={22} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center justify-between mt-1">
                    <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                        {stat.subtext}
                    </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
             <div className="flex items-center gap-2 mb-6">
                 <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                     <BarChart2 size={20} />
                 </div>
                 <h2 className="font-semibold text-gray-800">Activité des 30 derniers jours</h2>
             </div>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.charts.activity_30d}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={formatDate} 
                            tick={{fontSize: 12, fill: '#6B7280'}} 
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis 
                            tick={{fontSize: 12, fill: '#6B7280'}} 
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip 
                            cursor={{fill: '#F3F4F6'}}
                            contentStyle={{borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                            labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <Bar dataKey="count" fill="#0D7BFF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
             <div className="flex items-center gap-2 mb-6">
                 <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                     <PieChart size={20} />
                 </div>
                 <h2 className="font-semibold text-gray-800">Secteurs Populaires</h2>
             </div>
             <div className="h-[300px] w-full flex flex-col items-center justify-center">
                {data.charts.sectors && data.charts.sectors.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                            <Pie
                                data={data.charts.sectors.slice(0, 5)} // Limit to top 5
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.charts.sectors.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </RePieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-gray-400 text-sm italic">Aucune donnée de secteur</div>
                )}
                
                {/* Legend */}
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {data.charts.sectors.slice(0, 5).map((sector, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs">
                            <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}} />
                            <span className="text-gray-600 font-medium">{sector.name}</span>
                            <span className="text-gray-400">({sector.value})</span>
                        </div>
                    ))}
                </div>
             </div>
          </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="font-semibold text-gray-800">Activité Récente</h2>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-gray-500 bg-gray-50/50 uppercase text-xs">
                    <tr>
                        <th className="px-6 py-3 font-medium">Utilisateur</th>
                        <th className="px-6 py-3 font-medium">Type</th>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium text-center">Score</th>
                        <th className="px-6 py-3 font-medium text-right">Statut</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.recent_activity.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{item.user_name}</div>
                                <div className="text-xs text-gray-500">{item.user_email}</div>
                            </td>
                            <td className="px-6 py-4 capitalize text-gray-600">
                                {item.type}
                            </td>
                            <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                {formatFullDate(item.date)}
                            </td>
                            <td className="px-6 py-4 text-center">
                                {item.score > 0 ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                        {item.score}/100
                                    </span>
                                ) : (
                                    <span className="text-gray-400">-</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize 
                                    ${item.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                      item.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {item.status === 'completed' ? 'Terminé' : item.status === 'in_progress' ? 'En cours' : item.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {data.recent_activity.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">
                                Aucune activité récente
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
