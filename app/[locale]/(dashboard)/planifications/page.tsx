"use client";
import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, Video, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function PlanificationsPage() {
  const t = useTranslations('Planifications');
  const days = [t('days.mon'), t('days.tue'), t('days.wed'), t('days.thu'), t('days.fri'), t('days.sat'), t('days.sun')];
  const daysShort = [t('days_short.mon'), t('days_short.tue'), t('days_short.wed'), t('days_short.thu'), t('days_short.fri'), t('days_short.sat'), t('days_short.sun')];

  // Données mockées pour les événements
  const events = [
    { id: 1, day: 18, title: t('event_title', { name: 'Jean Dupont' }), time: '10:00 - 10:30', type: 'simulated' },
    { id: 2, day: 22, title: t('event_title', { name: 'Marie Martin' }), time: '14:00 - 14:45', type: 'real' },
    { id: 3, day: 25, title: t('event_title', { name: 'Pierre Bernard' }), time: '09:00 - 09:30', type: 'simulated' },
  ];

  const todayEvents = [
    { id: 1, user: 'Jean Dupont', job: t('jobs.react_dev'), time: '10:00 - 10:30', type: 'simulated' },
    { id: 2, user: 'Sophie Petit', job: t('jobs.project_manager'), time: '15:00 - 15:45', type: 'real' },
  ];

  const upcomingEvents = [
    { id: 1, user: 'Marie Martin', date: t('dates.feb_22'), job: t('jobs.product_manager'), time: '14:00' },
    { id: 2, user: 'Lucas Robert', date: t('dates.feb_24'), job: t('jobs.ux_designer'), time: '11:00' },
    { id: 3, user: 'Emma Richard', date: t('dates.feb_25'), job: t('jobs.data_analyst'), time: '16:00' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* --- PARTIE GAUCHE : CALENDRIER PRINCIPAL --- */}
      <div className="flex-1 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">{t('calendar_title')}</h2>
          <div className="flex items-center gap-4">
            <div className="flex border rounded-xl overflow-hidden">
              <button className="p-2 hover:bg-gray-50 border-r"><ChevronLeft size={18} /></button>
              <button className="p-2 hover:bg-gray-50"><ChevronRight size={18} /></button>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
              <Plus size={18} /> {t('new_plan')}
            </button>
          </div>
        </div>

        {/* Grille du Calendrier */}
        <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
          {days.map(day => (
            <div key={day} className="bg-gray-50 p-4 text-center text-xs font-bold text-gray-400 uppercase">{day}</div>
          ))}
          {Array.from({ length: 28 }).map((_, i) => {
            const dayNumber = i + 1;
            const dayEvents = events.filter(e => e.day === dayNumber);
            return (
              <div key={i} className="bg-white min-h-[120px] p-2 relative group hover:bg-blue-50/30 transition-colors">
                <span className={`text-sm font-medium ${dayNumber === 18 ? 'bg-blue-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center' : 'text-gray-400'}`}>
                  {dayNumber}
                </span>
                {dayEvents.map(event => (
                  <div 
                    key={event.id}
                    className={`mt-2 p-2 rounded-lg border-l-4 ${
                      event.type === 'simulated' 
                        ? 'bg-blue-100 border-blue-600' 
                        : 'bg-green-100 border-green-600'
                    }`}
                  >
                    <p className={`text-[10px] font-bold ${event.type === 'simulated' ? 'text-blue-700' : 'text-green-700'}`}>
                      {event.title}
                    </p>
                    <p className={`text-[8px] ${event.type === 'simulated' ? 'text-blue-500' : 'text-green-500'}`}>
                      {event.time}
                    </p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Légende */}
        <div className="flex items-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span className="text-sm text-gray-600">{t('legend.simulated')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span className="text-sm text-gray-600">{t('legend.real')}</span>
          </div>
        </div>
      </div>

      {/* --- PARTIE DROITE : MINI CAL & TODAY --- */}
      <div className="w-full lg:w-80 space-y-6">
        {/* Mini Calendrier */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-sm">{t('month_label', { month: t('months.february'), year: 2026 })}</span>
            <div className="flex gap-2">
              <ChevronLeft size={14} className="text-gray-400 cursor-pointer hover:text-gray-600" />
              <ChevronRight size={14} className="text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-[10px]">
            {daysShort.map((d, i) => (
              <div key={i} className="font-bold text-gray-300">{d}</div>
            ))}
            {Array.from({ length: 28 }).map((_, i) => (
              <div 
                key={i} 
                className={`py-1 rounded-full cursor-pointer transition-colors ${
                  i + 1 === 18 ? 'bg-blue-600 text-white font-bold' : 
                  [22, 25].includes(i + 1) ? 'bg-blue-100 text-blue-600' :
                  'hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Événements du jour */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900">{t('today')}</h3>
          {todayEvents.map(event => (
            <div key={event.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <Video size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-blue-600">{event.user}</p>
                <p className="text-xs text-gray-600">{event.job}</p>
                <div className="flex items-center gap-1 text-gray-400 text-[10px] mt-1">
                  <Clock size={10} /> {event.time}
                </div>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full ${
                event.type === 'simulated' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
              }`}>
                {event.type === 'simulated' ? t('legend.simulated') : t('legend.real')}
              </span>
            </div>
          ))}
        </div>

        {/* Prochains événements */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900">{t('upcoming')}</h3>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {upcomingEvents.map(event => (
              <div key={event.id} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Users size={16} className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.user}</p>
                  <p className="text-xs text-gray-500">{event.job}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-900">{event.date}</p>
                  <p className="text-[10px] text-gray-400">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
