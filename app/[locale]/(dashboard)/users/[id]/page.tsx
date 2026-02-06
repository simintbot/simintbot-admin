"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { 
  ArrowLeft, User as UserIcon, FileText, History, Mail, Phone, MapPin, 
  Calendar, Briefcase, GraduationCap, Award, Video, Clock,
  CheckCircle, XCircle, ChevronLeft, ChevronRight, Plus, TrendingUp, X, Loader2
} from 'lucide-react';
import { userService, User as ServiceUser, CVProfile, InterviewSession, InterviewSessionDetail, AgendaEvent } from '@/lib/services/user.service';
import { useLocale, useTranslations } from 'next-intl';

// Types
interface Interview {
  id: string;
  date: string;
  time?: string;
  type: string;
  job: string;
  duration: string;
  score: number | null;
  status: 'completed' | 'scheduled' | 'cancelled' | 'in_progress';
  description?: string;
  feedback?: string;
}

interface User extends ServiceUser {
  cv?: any;
  interviews?: Interview[];
}

// Mock data for other tabs that aren't integrated yet
const mockCV = {
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
  };

const mockInterviews = [
    { id: '1', date: '2026-02-03', time: '10:00', type: 'Simulé', job: 'Développeur React', duration: '25 min', score: 85, status: 'completed', description: 'Entretien technique sur React et les hooks', feedback: 'Bonne maîtrise des concepts React, à améliorer sur les patterns avancés.' },
    { id: '2', date: '2026-01-28', time: '14:30', type: 'Simulé', job: 'Chef de Projet', duration: '30 min', score: 72, status: 'completed', description: 'Simulation gestion de projet Agile', feedback: 'Bonne communication, améliorer la gestion des priorités.' },
    { id: '3', date: '2026-01-20', time: '09:00', type: 'Réel', job: 'Développeur Full Stack', duration: '45 min', score: null, status: 'completed', description: 'Entretien avec TechCorp pour un poste senior' },
    { id: '4', date: '2026-02-10', time: '11:00', type: 'Simulé', job: 'Product Owner', duration: '30 min', score: null, status: 'scheduled', description: 'Préparation au rôle de Product Owner' },
    { id: '5', date: '2026-02-15', time: '15:00', type: 'Réel', job: 'Lead Developer', duration: '60 min', score: null, status: 'scheduled', description: 'Entretien final chez InnovateTech' },
    { id: '6', date: '2026-02-20', time: '10:30', type: 'Simulé', job: 'Architecte Solution', duration: '45 min', score: null, status: 'scheduled', description: 'Simulation architecture cloud' },
  ] as Interview[];

type TabType = 'info' | 'cv' | 'history' | 'planifications';

// Helpers pour le calendrier

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
  const t = useTranslations('UserDetails');
  const locale = useLocale();
  const userId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [user, setUser] = useState<User | null>(null);
  const [cvData, setCvData] = useState<CVProfile | null>(null);
  const [interviewsData, setInterviewsData] = useState<{items: InterviewSession[], total: number} | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<AgendaEvent[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingCV, setLoadingCV] = useState(false);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // État du calendrier
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<InterviewSessionDetail | any | null>(null);

  const weekdayLabels = useMemo(() => {
    const baseDate = new Date(2021, 5, 7);
    return Array.from({ length: 7 }, (_, i) =>
      new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + i)
        .toLocaleDateString(locale, { weekday: 'short' })
    );
  }, [locale]);

  // Fetch User & Stats
  useEffect(() => {
    const fetchUser = async () => {
        try {
            setLoading(true);
            const response = await userService.getUserById(userId);
            const userData = response.data || response;
            
            // Fetch stats separately to ensure accuracy if API user object doesn't have them updated
            try {
                const statsResponse = await userService.getUserInterviews(userId, { size: 100 }); // Fetch up to 100 for stats
                // @ts-ignore
                const interviews = statsResponse.data?.items || statsResponse.data || statsResponse.items || [];
                // @ts-ignore
                const total = statsResponse.data?.total || interviews.length;
                
                // Calculate average score
                const scoredInterviews = interviews.filter((i: any) => i.status === 'completed' && typeof i.score === 'number'); 
                
                const avgScore = scoredInterviews.length > 0 
                    ? Math.round(scoredInterviews.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0) / scoredInterviews.length)
                    : (userData.average_score || 0);

                setUser({
                    ...userData,
                    interview_count: total,
                    average_score: avgScore
                });
            } catch (statsErr) {
                 console.error("Error fetching stats fallback", statsErr);
                 setUser(userData); 
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    if (userId) {
        fetchUser();
    }
  }, [userId]);

  useEffect(() => {
    const fetchCV = async () => {
        if (activeTab === 'cv' && !cvData && userId) {
            try {
                setLoadingCV(true);
                const response = await userService.getUserCV(userId);
                // @ts-ignore
                setCvData(response.data || response);
            } catch (error) {
                console.error("Error fetching CV", error);
            } finally {
                setLoadingCV(false);
            }
        }
    }
    fetchCV();
  }, [activeTab, userId, cvData]);

  // Fetch Interviews
  useEffect(() => {
    const fetchInterviews = async () => {
        if (activeTab === 'history' && !interviewsData && userId) {
            try {
                setLoadingInterviews(true);
                const response = await userService.getUserInterviews(userId, { page: 1, size: 20 });
                 // @ts-ignore
                const data = response.data || response;
                setInterviewsData(data);
            } catch (error) {
                console.error("Error fetching interviews", error);
            } finally {
                setLoadingInterviews(false);
            }
        }
    }
    fetchInterviews();
  }, [activeTab, userId, interviewsData]);

  // Fetch Calendar Events
  useEffect(() => {
    const fetchAgenda = async () => {
        if (activeTab === 'planifications' && userId) {
            try {
                setLoadingCalendar(true);
                // Calculate start/end based on current month view, or fetch a broader range
                const startDate = new Date(currentYear, currentMonth, 1).toISOString();
                const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString();
                
                const response = await userService.getUserAgendaEvents(userId, startDate, endDate);
                 // @ts-ignore
                const data = response.data || response;
                // @ts-ignore
                setCalendarEvents(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching agenda", error);
            } finally {
                setLoadingCalendar(false);
            }
        }
    }
    fetchAgenda();
  }, [activeTab, userId, currentYear, currentMonth]);

  // Click on interview to fetch details
  const handleInterviewClick = async (sessionId: string) => {
      try {
          setLoadingDetail(true);
          const response = await userService.getInterviewSession(sessionId);
           // @ts-ignore
          setSelectedInterview(response.data || response);
      } catch (e) {
          console.error("Error fetching session detail", e);
      } finally {
          setLoadingDetail(false);
      }
  }

  // Créer un map des events par date (replacing mockInterviews usage)
  const eventsByDate = useMemo(() => {
    const map: Record<string, AgendaEvent[]> = {};
    calendarEvents.forEach(event => {
      const dateKey = event.start_time.split('T')[0];
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(event);
    });
    return map;
  }, [calendarEvents]);

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
  const handleDayClick = (dateKey: string, events: AgendaEvent[]) => {
    setSelectedDate(dateKey);
    // Note: detailed view logic for AgendaEvent is simpler or distinct from InterviewSessionDetail
    // For now we just select date to show sidebar list or similar
  };

  // Fermer le modal
  const closeModal = () => {
    setSelectedInterview(null);
    setSelectedDate(null);
  };

  const tabs = [
    { id: 'info' as TabType, label: t('tabs.info'), icon: UserIcon },
    { id: 'cv' as TabType, label: t('tabs.cv'), icon: FileText },
    { id: 'history' as TabType, label: t('tabs.history'), icon: History },
    { id: 'planifications' as TabType, label: t('tabs.planifications'), icon: Calendar },
  ];

  if (loading) {
    return (
        <div className="flex h-screen items-center justify-center">
             <Loader2 className="w-8 h-8 animate-spin text-[#0D7BFF]" />
        </div>
    )
  }

  if (!user) {
    return <div className="p-8">{t('not_found')}</div>;
  }

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
          <h1 className="text-2xl font-bold text-gray-900">{user.first_name} {user.last_name}</h1>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
          user.is_active 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {user.is_active ? t('status.active') : t('status.inactive')}
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
              <div className="space-y-6">
                <div>
                   <h3 className="font-semibold text-gray-900 mb-4">{t('sections.personal')}</h3>
                   <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-400 w-5 font-semibold">ID</span>
                      <span className="text-gray-600 font-mono text-xs bg-gray-50 p-1 rounded select-all">{user.unique_uid || user.id}</span>
                    </div>
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
                      <span className="text-gray-600">{user.address || t('labels.not_provided')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-gray-600">
                        {user.birth_date
                          ? t('labels.born', { date: new Date(user.birth_date).toLocaleDateString(locale) })
                          : t('labels.not_provided')}
                      </span>
                    </div>
                    {user.nationality && (
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-gray-400 w-5 font-semibold">NAT</span>
                            <span className="text-gray-600">{user.nationality}</span>
                        </div>
                    )}
                   </div>
                </div>

                {user.biography && (
                    <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('sections.biography')}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
                            {user.biography}
                        </p>
                    </div>
                )}
                
                {user.social_links && Object.keys(user.social_links).length > 0 && (
                    <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('sections.social')}</h3>
                        <div className="flex gap-2 flex-wrap">
                            {Object.entries(user.social_links).map(([platform, link]) => (
                                <a 
                                    key={platform}
                                    href={link as string}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors capitalize"
                                >
                                    {platform}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">{t('sections.stats')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0D7BFF]/10 rounded-xl p-4">
                    <p className="text-2xl font-bold text-[#0D7BFF]">{user.interview_count || 0}</p>
                    <p className="text-sm text-gray-600">{t('labels.interviews')}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-green-600">
                      {user.average_score || 0}%
                    </p>
                    <p className="text-sm text-gray-600">{t('labels.avg_score')}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <p>
                    {user.created_at
                      ? t('labels.signed_up', { date: new Date(user.created_at).toLocaleDateString(locale) })
                      : t('labels.signed_up', { date: '-' })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab: CV */}
          {activeTab === 'cv' && (
            loadingCV ? (
                <div className="flex justify-center p-10">
                     <Loader2 className="w-8 h-8 animate-spin text-[#0D7BFF]" />
                </div>
            ) : !cvData ? (
                 <div className="text-center p-10 text-gray-500">
                  {t('cv.empty')}
                 </div>
            ) : (
            <div className="space-y-8">
              {/* En-tête CV */}
              <div className="border-b border-gray-100 pb-6 flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{cvData.headline}</h3>
                    <p className="text-gray-600 mt-2">{cvData.summary}</p>
                    <div className="flex gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Briefcase size={14} /> {t('cv.experience_years', { count: cvData.years_of_experience })}
                        </span>
                        <span className="flex items-center gap-1">
                             <Award size={14} /> {cvData.primary_domain}
                        </span>
                    </div>
                </div>
                {cvData.resume_file_url && (
                    <a 
                        href={`${process.env.NEXT_PUBLIC_IMAGE_URL}${cvData.resume_file_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[#0D7BFF] text-white rounded-lg text-sm font-medium hover:bg-[#0b66d6] transition-colors"
                    >
                        <FileText size={16} />
                      {t('cv.original')}
                    </a>
                )}
              </div>

              {/* Expériences */}
              <div>
                <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <Briefcase size={18} />
                  {t('cv.experience_title')}
                </h4>
                <div className="space-y-6">
                  {cvData.experiences.map((exp, index) => (
                    <div key={index} className="border-l-2 border-[#0D7BFF]/30 pl-4 pb-2">
                      <p className="font-medium text-gray-900 text-lg">{exp.role}</p>
                      <p className="text-sm text-[#0D7BFF] font-medium mb-2">{exp.company} • {exp.start_date} - {exp.end_date}</p>
                      
                      {exp.description && (
                          <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">{exp.description}</p>
                      )}

                      {exp.tech_stack && exp.tech_stack.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                              {exp.tech_stack.map(tech => (
                                  <span key={tech} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                                      {tech}
                                  </span>
                              ))}
                          </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Projets */}
              {cvData.projects && cvData.projects.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                      <Briefcase size={18} />
                      {t('cv.projects')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {cvData.projects.map((project, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <div className="flex justify-between items-start">
                                    <h5 className="font-semibold text-gray-900">{project.title}</h5>
                                    {project.link && (
                                        <a href={project.link} target="_blank" rel="noreferrer" className="text-[#0D7BFF] hover:underline text-xs">
                                        {t('cv.view')}
                                        </a>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mt-2 mb-3 line-clamp-3">{project.description}</p>
                                {project.technologies && (
                                    <div className="flex flex-wrap gap-1">
                                        {project.technologies.slice(0, 3).map(t => (
                                            <span key={t} className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-500">
                                                {t}
                                            </span>
                                        ))}
                                        {project.technologies.length > 3 && (
                                            <span className="text-[10px] text-gray-400 self-center">+{project.technologies.length - 3}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                  </div>
              )}

              {/* Formation */}
              <div>
                <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <GraduationCap size={18} />
                  {t('cv.education')}
                </h4>
                <div className="space-y-4">
                  {cvData.education.map((edu, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1 bg-gray-100 p-2 rounded-lg">
                          <Award size={16} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{edu.degree}</p>
                        <p className="text-sm text-gray-600">{edu.school}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                             <span>{edu.year}</span>
                             <span>•</span>
                             <span>{edu.field}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compétences & Langues */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('cv.hard_skills')}</h4>
                    <div className="flex flex-wrap gap-2">
                        {cvData.skills.hard_skills.map((skill) => (
                            <span key={skill} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm border border-gray-200">
                            {skill}
                            </span>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('cv.soft_skills')}</h4>
                    <div className="flex flex-wrap gap-2">
                        {cvData.skills.soft_skills.map((skill) => (
                            <span key={skill} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">
                            {skill}
                            </span>
                        ))}
                    </div>
                  </div>
              </div>

              {/* Langues */}
              {cvData.languages && cvData.languages.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('cv.languages')}</h4>
                      <div className="flex gap-4">
                          {cvData.languages.map((lang, idx) => (
                              <div key={idx} className="flex flex-col items-center bg-gray-50 p-3 rounded-xl min-w-[100px]">
                                   <span className="font-medium text-gray-900">{lang.lang}</span>
                                   <span className="text-xs text-gray-500">{lang.level}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
            </div>
            )
          )}

          {/* Tab: Historique entretiens */}
          {activeTab === 'history' && (
             loadingInterviews ? (
                <div className="flex justify-center p-10">
                     <Loader2 className="w-8 h-8 animate-spin text-[#0D7BFF]" />
                </div>
            ) : !interviewsData || interviewsData.items.length === 0 ? (
                 <div className="text-center p-10 text-gray-500">
                  {t('history.empty')}
                 </div>
            ) : (
            <div className="space-y-4">
              {interviewsData.items.map((interview) => (
                <div 
                  key={interview.id} 
                  onClick={() => handleInterviewClick(interview.id)}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      interview.status === 'completed' ? 'bg-[#0D7BFF]/10' : 'bg-orange-100'
                    }`}>
                      <Video size={20} className={interview.status === 'completed' ? 'text-[#0D7BFF]' : 'text-orange-600'} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {t('history.interview_label', { date: new Date(interview.created_at).toLocaleDateString(locale) })}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{interview.recruiter_name}</span>
                        <span>•</span>
                        <span className="capitalize">{interview.flow_type}</span>
                        {interview.duration_minutes > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {interview.duration_minutes} {t('units.minutes_short')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        interview.status === 'completed' ? 'bg-green-100 text-green-700' :
                        interview.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {interview.status === 'completed'
                          ? t('history.status.completed')
                          : interview.status === 'in_progress'
                            ? t('history.status.in_progress')
                            : interview.status === 'scheduled'
                              ? t('history.status.scheduled')
                              : interview.status}
                    </span>
                    {interview.status === 'completed' ? (
                      <CheckCircle size={18} className="text-green-500" />
                    ) : (
                      <Clock size={18} className="text-orange-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            )
          )}

          {/* Tab: Planifications */}
          {activeTab === 'planifications' && (
            loadingCalendar ? (
                 <div className="flex justify-center p-10">
                     <Loader2 className="w-8 h-8 animate-spin text-[#0D7BFF]" />
                </div>
            ) : (
            <div className="space-y-8">
              {/* Layout principal - Calendrier + Sidebar */}
              <div className="flex flex-col xl:flex-row gap-6">
                
                {/* Calendrier principal */}
                <div className="flex-1">
                  {/* Header calendrier */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        {new Date(currentYear, currentMonth, 1).toLocaleString(locale, { month: 'long' })} {currentYear}
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
                          {t('calendar.today')}
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
                        {t('calendar.completed')}
                      </span>
                      <span className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                        {t('calendar.planned')}
                      </span>
                    </div>
                  </div>

                  {/* Grille du calendrier */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    {/* Jours de la semaine */}
                    <div className="grid grid-cols-7 bg-gradient-to-r from-[#0D7BFF] to-[#0a6ae0]">
                      {weekdayLabels.map((day) => (
                        <div key={day} className="py-3 text-center text-xs font-semibold text-white/90 uppercase tracking-wider">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Grille des jours */}
                    <div className="grid grid-cols-7">
                      {calendarDays.map((dayInfo, i) => {
                        const dayEvents = eventsByDate[dayInfo.dateKey] || [];
                        const hasScheduled = dayEvents.some(evt => evt.status === 'scheduled');
                        const hasCompleted = dayEvents.some(evt => evt.status === 'completed');
                        const hasEvent = dayEvents.length > 0;
                        const isTodayDate = isToday(dayInfo.dateKey);
                        
                        return (
                          <div 
                            key={i} 
                            onClick={() => hasEvent && handleDayClick(dayInfo.dateKey, dayEvents)}
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
                            {dayInfo.isCurrentMonth && dayEvents.map((event, idx) => (
                              <div 
                                key={event.id}
                                className={`mt-1 p-1.5 rounded-lg cursor-pointer hover:scale-[1.02] transition-all ${
                                  event.status === 'scheduled' 
                                    ? 'bg-amber-100/80 border border-amber-200/60 hover:bg-amber-100' 
                                    : 'bg-[#0D7BFF]/10 border border-[#0D7BFF]/20 hover:bg-[#0D7BFF]/20'
                                }`}
                              >
                                <p className={`text-[10px] font-semibold truncate ${
                                  event.status === 'scheduled' ? 'text-amber-700' : 'text-[#0D7BFF]'
                                }`}>
                                  {event.title || t('calendar.default_title')}
                                </p>
                                <p className={`text-[9px] flex items-center gap-1 ${
                                  event.status === 'scheduled' ? 'text-amber-600/70' : 'text-[#0D7BFF]/70'
                                }`}>
                                  <Clock size={8} />
                                  {new Date(event.start_time).toLocaleTimeString(locale, {hour: '2-digit', minute:'2-digit'})}
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
                  {/* Prochains entretiens / Events du jour sélectionné */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                          <Clock size={16} className="text-white" />
                        </div>
                        {selectedDate
                          ? t('calendar.selected_date', { date: new Date(selectedDate).toLocaleDateString(locale) })
                          : t('calendar.upcoming_month')}
                      </h4>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                         {t('calendar.events_count', {
                          count: selectedDate
                            ? (eventsByDate[selectedDate]?.length || 0)
                            : calendarEvents.filter(e => e.status === 'scheduled').length
                         })}
                      </span>
                    </div>
                    
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {(selectedDate ? (eventsByDate[selectedDate] || []) : calendarEvents.filter(e => e.status === 'scheduled')).length > 0 ? (
                        (selectedDate ? (eventsByDate[selectedDate] || []) : calendarEvents.filter(e => e.status === 'scheduled')).map((event) => (
                          <div 
                            key={event.id} 
                            // onClick={() => setSelectedInterview(event)} // Could fetch session if we want
                            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-orange-100/50 hover:border-orange-200"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Video size={20} className="text-orange-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{event.title || t('calendar.default_title')}</p>
                                <p className="text-sm text-gray-500 mt-0.5">{event.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-md font-medium flex items-center gap-1">
                                    <Calendar size={10} />
                                    {new Date(event.start_time).toLocaleDateString(locale)} - {new Date(event.start_time).toLocaleTimeString(locale, {hour: '2-digit', minute:'2-digit'})}
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
                          <p className="text-sm text-gray-500">{t('calendar.no_events')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )
          )}
        </div>
      </div>

      {/* Modal détails entretien */}
      {loadingDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
             <Loader2 className="w-10 h-10 animate-spin text-white" />
          </div>
      )}

      {selectedInterview && !loadingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header du modal */}
            <div className={`p-6 ${
              // @ts-ignore
              selectedInterview.status === 'scheduled' || selectedInterview.status === 'in_progress'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                : 'bg-gradient-to-r from-[#0D7BFF] to-[#0a6ae0]'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <Video size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                        {/* @ts-ignore */}
                      {selectedInterview.job_position?.title || selectedInterview.job || t('calendar.default_title')}
                    </h3>
                    <p className="text-white/80 text-sm mt-1">
                        {/* @ts-ignore */}
                      {selectedInterview.recruiter_name
                        ? t('modal.with_recruiter', { name: selectedInterview.recruiter_name })
                        : selectedInterview.type}
                    </p>
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
                    {t('modal.date')}
                  </div>
                  <p className="font-semibold text-gray-900">
                    {/* @ts-ignore */}
                    {new Date(selectedInterview.started_at || selectedInterview.date).toLocaleDateString(locale)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Clock size={14} />
                    {t('modal.time')}
                  </div>
                  <p className="font-semibold text-gray-900">
                    {/* @ts-ignore */}
                    {selectedInterview.started_at
                      ? new Date(selectedInterview.started_at).toLocaleTimeString(locale, {hour: '2-digit', minute:'2-digit'})
                      : selectedInterview.time || '-'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Clock size={14} />
                    {t('modal.duration')}
                  </div>
                  <p className="font-semibold text-gray-900">
                    {/* @ts-ignore */}
                    {selectedInterview.duration_minutes
                      ? `${selectedInterview.duration_minutes} ${t('units.minutes_short')}`
                      : selectedInterview.duration}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Briefcase size={14} />
                    {t('modal.status')}
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    selectedInterview.status === 'scheduled' || selectedInterview.status === 'in_progress'
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {selectedInterview.status === 'scheduled' || selectedInterview.status === 'in_progress' ? (
                      <>
                        <Clock size={10} />
                        {selectedInterview.status === 'in_progress' ? t('modal.in_progress') : t('modal.scheduled')}
                      </>
                    ) : (
                      <>
                        <CheckCircle size={10} />
                        {t('modal.completed')}
                      </>
                    )}
                  </span>
                </div>
              </div>

               {/* Description */}
              {/* @ts-ignore */}
              {(selectedInterview.report_data?.gpt_report || selectedInterview.description) && (
                <div className="max-h-60 overflow-y-auto">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">{t('modal.report')}</h4>
                  <div className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-xl p-4 whitespace-pre-wrap">
                    {/* @ts-ignore */}
                    {selectedInterview.report_data?.gpt_report || selectedInterview.description}
                  </div>
                </div>
              )}
            </div>

            {/* Footer du modal */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {t('modal.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
