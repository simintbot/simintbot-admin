"use client";
import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, User, FileText, History, Mail, Phone, MapPin, 
  Calendar, Briefcase, GraduationCap, Award, Video, Clock,
  CheckCircle, XCircle, ChevronLeft, ChevronRight, Plus, TrendingUp, X
} from 'lucide-react';

// Types
interface Interview {
  id: string;
  date: string;
  time?: string;
  type: string;
  job: string;
  duration: string;
  score: number | null;
  status: 'completed' | 'scheduled' | 'cancelled';
  description?: string;
  feedback?: string;
}

// Données mockées utilisateur
const mockUserDetails = {
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
  ] as Interview[],
};

type TabType = 'info' | 'cv' | 'history' | 'planifications';

// Helpers pour le calendrier
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  // Convertir dimanche (0) en 6, lundi (1) en 0, etc.
  return day === 0 ? 6 : day - 1;
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseDate(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month: month - 1, day };
}

export default function UserDetailsPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const user = mockUserDetails;
  
  // État du calendrier
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  // Créer un map des entretiens par date
  const interviewsByDate = useMemo(() => {
    const map: Record<string, Interview[]> = {};
    user.interviews.forEach(interview => {
      if (!map[interview.date]) {
        map[interview.date] = [];
      }
      map[interview.date].push(interview);
    });
    return map;
  }, [user.interviews]);

  // Navigation du calendrier
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  // Générer les jours du calendrier
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days: Array<{ day: number; isCurrentMonth: boolean; dateKey: string }> = [];

    // Jours du mois précédent
    const prevMonthDays = getDaysInMonth(
      currentMonth === 0 ? currentYear - 1 : currentYear,
      currentMonth === 0 ? 11 : currentMonth - 1
    );
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const month = currentMonth === 0 ? 11 : currentMonth - 1;
      const year = currentMonth === 0 ? currentYear - 1 : currentYear;
      days.push({ day, isCurrentMonth: false, dateKey: formatDateKey(year, month, day) });
    }

    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, isCurrentMonth: true, dateKey: formatDateKey(currentYear, currentMonth, day) });
    }

    // Jours du mois suivant pour compléter la grille (6 lignes x 7 jours = 42)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const month = currentMonth === 11 ? 0 : currentMonth + 1;
      const year = currentMonth === 11 ? currentYear + 1 : currentYear;
      days.push({ day, isCurrentMonth: false, dateKey: formatDateKey(year, month, day) });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Vérifier si c'est aujourd'hui
  const isToday = (dateKey: string): boolean => {
    return dateKey === formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  };

  // Gérer le clic sur un jour
  const handleDayClick = (dateKey: string, interviews: Interview[]) => {
    setSelectedDate(dateKey);
    if (interviews.length === 1) {
      setSelectedInterview(interviews[0]);
    } else if (interviews.length > 1) {
      // Si plusieurs entretiens, on affiche le premier par défaut
      setSelectedInterview(interviews[0]);
    }
  };

  // Fermer le modal
  const closeModal = () => {
    setSelectedInterview(null);
    setSelectedDate(null);
  };

  const tabs = [
    { id: 'info' as TabType, label: 'Informations', icon: User },
    { id: 'cv' as TabType, label: 'CV Complet', icon: FileText },
    { id: 'history' as TabType, label: 'Historique Entretiens', icon: History },
    { id: 'planifications' as TabType, label: 'Planifications', icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      {/* Header avec retour */}
      <div className="flex items-center gap-4">
        <Link 
          href="/users"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
          user.status === 'active' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {user.status === 'active' ? 'Actif' : 'Inactif'}
        </span>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100">
          <nav className="flex justify-between px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 border-b-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-[#0D7BFF] text-[#0D7BFF]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab: Informations */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Informations personnelles</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-gray-600">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-gray-600">{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-gray-600">{user.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-600">Né le {user.birthDate}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Statistiques</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0D7BFF]/10 rounded-xl p-4">
                    <p className="text-2xl font-bold text-[#0D7BFF]">{user.interviews.length}</p>
                    <p className="text-sm text-gray-600">Entretiens</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-green-600">
                      {user.interviews.filter(i => i.score).length > 0 
                        ? Math.round(user.interviews.filter(i => i.score).reduce((acc, i) => acc + (i.score || 0), 0) / user.interviews.filter(i => i.score).length)
                        : 0}%
                    </p>
                    <p className="text-sm text-gray-600">Score moyen</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Inscrit le {user.createdAt}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab: CV */}
          {activeTab === 'cv' && (
            <div className="space-y-8">
              {/* En-tête CV */}
              <div className="border-b border-gray-100 pb-6">
                <h3 className="text-xl font-bold text-gray-900">{user.cv.title}</h3>
                <p className="text-gray-600 mt-2">{user.cv.summary}</p>
              </div>

              {/* Expériences */}
              <div>
                <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <Briefcase size={18} />
                  Expériences professionnelles
                </h4>
                <div className="space-y-4">
                  {user.cv.experiences.map((exp) => (
                    <div key={exp.id} className="border-l-2 border-[#0D7BFF]/30 pl-4">
                      <p className="font-medium text-gray-900">{exp.title}</p>
                      <p className="text-sm text-[#0D7BFF]">{exp.company} • {exp.period}</p>
                      <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formation */}
              <div>
                <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <GraduationCap size={18} />
                  Formation
                </h4>
                <div className="space-y-3">
                  {user.cv.education.map((edu) => (
                    <div key={edu.id} className="flex items-start gap-3">
                      <Award size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">{edu.degree}</p>
                        <p className="text-sm text-gray-600">{edu.school} • {edu.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compétences */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Compétences</h4>
                <div className="flex flex-wrap gap-2">
                  {user.cv.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Historique entretiens */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {user.interviews.map((interview) => (
                <div 
                  key={interview.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      interview.status === 'completed' ? 'bg-[#0D7BFF]/10' : 'bg-orange-100'
                    }`}>
                      <Video size={20} className={interview.status === 'completed' ? 'text-[#0D7BFF]' : 'text-orange-600'} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{interview.job}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{interview.date}</span>
                        <span>•</span>
                        <span>{interview.type}</span>
                        {interview.duration !== '-' && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {interview.duration}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {interview.score !== null ? (
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        interview.score >= 80 ? 'bg-green-100 text-green-700' :
                        interview.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {interview.score}%
                      </div>
                    ) : interview.status === 'scheduled' ? (
                      <span className="text-sm text-orange-600 font-medium">Planifié</span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                    {interview.status === 'completed' ? (
                      <CheckCircle size={18} className="text-green-500" />
                    ) : (
                      <Clock size={18} className="text-orange-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Planifications */}
          {activeTab === 'planifications' && (
            <div className="space-y-8">
              {/* Layout principal - Calendrier + Sidebar */}
              <div className="flex flex-col xl:flex-row gap-6">
                
                {/* Calendrier principal */}
                <div className="flex-1">
                  {/* Header calendrier */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        {MONTHS_FR[currentMonth]} {currentYear}
                      </h3>
                      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                        <button 
                          onClick={goToPreviousMonth}
                          className="p-2 hover:bg-white rounded-lg transition-all shadow-sm hover:shadow"
                        >
                          <ChevronLeft size={18} className="text-gray-600" />
                        </button>
                        <button 
                          onClick={goToToday}
                          className="px-3 py-2 bg-white rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Aujourd&apos;hui
                        </button>
                        <button 
                          onClick={goToNextMonth}
                          className="p-2 hover:bg-white rounded-lg transition-all shadow-sm hover:shadow"
                        >
                          <ChevronRight size={18} className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-3 h-3 rounded-full bg-[#0D7BFF]"></span>
                        Terminé
                      </span>
                      <span className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                        Planifié
                      </span>
                    </div>
                  </div>

                  {/* Grille du calendrier */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    {/* Jours de la semaine */}
                    <div className="grid grid-cols-7 bg-gradient-to-r from-[#0D7BFF] to-[#0a6ae0]">
                      {DAYS_FR.map((day) => (
                        <div key={day} className="py-3 text-center text-xs font-semibold text-white/90 uppercase tracking-wider">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Grille des jours */}
                    <div className="grid grid-cols-7">
                      {calendarDays.map((dayInfo, i) => {
                        const dayInterviews = interviewsByDate[dayInfo.dateKey] || [];
                        const hasScheduled = dayInterviews.some(int => int.status === 'scheduled');
                        const hasCompleted = dayInterviews.some(int => int.status === 'completed');
                        const hasEvent = dayInterviews.length > 0;
                        const isTodayDate = isToday(dayInfo.dateKey);
                        
                        return (
                          <div 
                            key={i} 
                            onClick={() => hasEvent && handleDayClick(dayInfo.dateKey, dayInterviews)}
                            className={`relative min-h-[100px] p-2 border-b border-r border-gray-100 transition-all duration-200 group ${
                              !dayInfo.isCurrentMonth ? 'bg-gray-50/50' : 'bg-white hover:bg-[#0D7BFF]/5'
                            } ${isTodayDate ? 'bg-[#0D7BFF]/10' : ''} ${hasEvent ? 'cursor-pointer' : ''}`}
                          >
                            {/* Numéro du jour */}
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${
                              isTodayDate 
                                ? 'bg-gradient-to-r from-[#0D7BFF] to-[#0a6ae0] text-white shadow-lg shadow-[#0D7BFF]/30' 
                                : !dayInfo.isCurrentMonth
                                  ? 'text-gray-300'
                                  : hasEvent 
                                    ? 'text-gray-900 font-bold' 
                                    : 'text-gray-500 group-hover:text-gray-700'
                            }`}>
                              {dayInfo.day}
                            </div>
                            
                            {/* Événements */}
                            {dayInfo.isCurrentMonth && dayInterviews.map((interview, idx) => (
                              <div 
                                key={interview.id}
                                className={`mt-1 p-1.5 rounded-lg cursor-pointer hover:scale-[1.02] transition-all ${
                                  interview.status === 'scheduled' 
                                    ? 'bg-amber-100/80 border border-amber-200/60 hover:bg-amber-100' 
                                    : 'bg-[#0D7BFF]/10 border border-[#0D7BFF]/20 hover:bg-[#0D7BFF]/20'
                                }`}
                              >
                                <p className={`text-[10px] font-semibold truncate ${
                                  interview.status === 'scheduled' ? 'text-amber-700' : 'text-[#0D7BFF]'
                                }`}>
                                  {interview.job}
                                </p>
                                <p className={`text-[9px] flex items-center gap-1 ${
                                  interview.status === 'scheduled' ? 'text-amber-600/70' : 'text-[#0D7BFF]/70'
                                }`}>
                                  <Clock size={8} />
                                  {interview.time || '10:00'}
                                </p>
                              </div>
                            ))}
                            
                            {/* Indicateur hover pour jours sans événement */}
                            {dayInfo.isCurrentMonth && !hasEvent && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="w-6 h-6 rounded-full bg-gray-200/50 flex items-center justify-center mt-8">
                                  <Plus size={12} className="text-gray-400" />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Sidebar - Événements */}
                <div className="xl:w-80 space-y-6">
                  {/* Prochains entretiens */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                          <Clock size={16} className="text-white" />
                        </div>
                        À venir
                      </h4>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                        {user.interviews.filter(i => i.status === 'scheduled').length} planifié(s)
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {user.interviews.filter(i => i.status === 'scheduled').length > 0 ? (
                        user.interviews.filter(i => i.status === 'scheduled').map((interview) => (
                          <div 
                            key={interview.id} 
                            onClick={() => setSelectedInterview(interview)}
                            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-orange-100/50 hover:border-orange-200"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Video size={20} className="text-orange-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{interview.job}</p>
                                <p className="text-sm text-gray-500 mt-0.5">{interview.type}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-md font-medium flex items-center gap-1">
                                    <Calendar size={10} />
                                    {interview.date} - {interview.time}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Calendar size={20} className="text-orange-400" />
                          </div>
                          <p className="text-sm text-gray-500">Aucun entretien planifié</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Statistiques rapides */}
                  <div className="bg-gradient-to-br from-[#0D7BFF]/10 to-[#0D7BFF]/5 rounded-2xl p-5 border border-[#0D7BFF]/20">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#0D7BFF] to-[#0a6ae0] rounded-lg flex items-center justify-center">
                        <TrendingUp size={16} className="text-white" />
                      </div>
                      Statistiques
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                        <p className="text-3xl font-bold bg-gradient-to-r from-[#0D7BFF] to-[#0a6ae0] bg-clip-text text-transparent">
                          {user.interviews.length}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Total entretiens</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                        <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                          {user.interviews.filter(i => i.status === 'completed').length}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Complétés</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center shadow-sm col-span-2">
                        <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                          {Math.round(user.interviews.filter(i => i.score).reduce((acc, i) => acc + (i.score || 0), 0) / (user.interviews.filter(i => i.score).length || 1))}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Score moyen</p>
                        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.round(user.interviews.filter(i => i.score).reduce((acc, i) => acc + (i.score || 0), 0) / (user.interviews.filter(i => i.score).length || 1))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Derniers entretiens */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                        <History size={16} className="text-white" />
                      </div>
                      Récemment
                    </h4>
                    
                    <div className="space-y-3">
                      {user.interviews.filter(i => i.status === 'completed').slice(0, 3).map((interview) => (
                        <div 
                          key={interview.id} 
                          onClick={() => setSelectedInterview(interview)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="relative">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              interview.score && interview.score >= 80 ? 'bg-green-100' :
                              interview.score && interview.score >= 60 ? 'bg-yellow-100' :
                              'bg-[#0D7BFF]/10'
                            }`}>
                              <Video size={16} className={
                                interview.score && interview.score >= 80 ? 'text-green-600' :
                                interview.score && interview.score >= 60 ? 'text-yellow-600' :
                                'text-[#0D7BFF]'
                              } />
                            </div>
                            {interview.score && (
                              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center text-white ${
                                interview.score >= 80 ? 'bg-green-500' :
                                interview.score >= 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}>
                                {interview.score}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{interview.job}</p>
                            <p className="text-xs text-gray-400">{interview.date}</p>
                          </div>
                          <ChevronRight size={14} className="text-gray-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal détails entretien */}
      {selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header du modal */}
            <div className={`p-6 ${
              selectedInterview.status === 'scheduled' 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                : 'bg-gradient-to-r from-[#0D7BFF] to-[#0a6ae0]'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <Video size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedInterview.job}</h3>
                    <p className="text-white/80 text-sm mt-1">{selectedInterview.type}</p>
                  </div>
                </div>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Contenu du modal */}
            <div className="p-6 space-y-6">
              {/* Infos principales */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Calendar size={14} />
                    Date
                  </div>
                  <p className="font-semibold text-gray-900">{selectedInterview.date}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Clock size={14} />
                    Heure
                  </div>
                  <p className="font-semibold text-gray-900">{selectedInterview.time || '-'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Clock size={14} />
                    Durée
                  </div>
                  <p className="font-semibold text-gray-900">{selectedInterview.duration}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Briefcase size={14} />
                    Statut
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    selectedInterview.status === 'scheduled' 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {selectedInterview.status === 'scheduled' ? (
                      <>
                        <Clock size={10} />
                        Planifié
                      </>
                    ) : (
                      <>
                        <CheckCircle size={10} />
                        Terminé
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Score si complété */}
              {selectedInterview.score !== null && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Score obtenu</span>
                    <span className={`text-2xl font-bold ${
                      selectedInterview.score >= 80 ? 'text-green-600' :
                      selectedInterview.score >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {selectedInterview.score}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        selectedInterview.score >= 80 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                        selectedInterview.score >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                        'bg-gradient-to-r from-red-400 to-red-500'
                      }`}
                      style={{ width: `${selectedInterview.score}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedInterview.description && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-xl p-4">
                    {selectedInterview.description}
                  </p>
                </div>
              )}

              {/* Feedback */}
              {selectedInterview.feedback && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Feedback</h4>
                  <p className="text-gray-600 text-sm leading-relaxed bg-green-50 rounded-xl p-4 border border-green-100">
                    {selectedInterview.feedback}
                  </p>
                </div>
              )}
            </div>

            {/* Footer du modal */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
              {selectedInterview.status === 'completed' && (
                <button 
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0D7BFF] rounded-xl hover:bg-[#0a6ae0] transition-colors"
                >
                  Voir le replay
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
