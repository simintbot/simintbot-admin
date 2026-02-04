"use client";
import React from 'react';
import { Users, Calendar, Video, TrendingUp, Activity } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { label: 'Utilisateurs', value: '1,234', icon: Users, color: 'blue', change: '+12%' },
    { label: 'Entretiens ce mois', value: '156', icon: Video, color: 'green', change: '+8%' },
    { label: 'Planifications', value: '45', icon: Calendar, color: 'purple', change: '+23%' },
    { label: 'Taux de complétion', value: '78%', icon: TrendingUp, color: 'orange', change: '+5%' },
  ];

  const colorClasses: Record<string, { bg: string; text: string; iconBg: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', iconBg: 'bg-orange-100' },
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bienvenue sur le Dashboard Admin</h1>
        <p className="text-gray-500 mt-1">Gérez votre plateforme SimintBot depuis cet espace.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colors = colorClasses[stat.color];
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center`}>
                  <Icon className={colors.text} size={22} />
                </div>
                <span className="text-green-500 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Placeholder content */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400">Contenu du dashboard à venir...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
