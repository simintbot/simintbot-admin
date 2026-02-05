"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Video, Settings,
  ChevronDown, ChevronUp, X, LogOut
} from 'lucide-react';
import { useMobileSidebar } from './MobileSidebarContext';
import apiClient from '@/lib/api/client';

// Composant pour le contenu de la sidebar
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Ouvrir automatiquement les dropdowns si on est sur une page concernée
  useEffect(() => {
    if (pathname.includes('/interview')) {
      setIsInterviewOpen(true);
    }
    if (pathname.includes('/settings')) {
      setIsSettingsOpen(true);
    }
  }, [pathname]);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Utilisateurs', icon: Users, href: '/users' },
    { 
      name: 'Interview', 
      icon: Video, 
      href: '/interview',
      hasSub: true,
      isOpen: isInterviewOpen,
      setIsOpen: setIsInterviewOpen,
      subItems: [
        { name: 'Décor', href: '/interview/decor' },
        { name: 'Secteurs d\'activités', href: '/interview/sectors' },
        { name: 'Jobs', href: '/interview/jobs' },
        { name: 'Paramètres', href: '/interview/settings' }
      ]
    },
    { 
      name: 'Paramètres', 
      icon: Settings, 
      href: '/settings',
      hasSub: true,
      isOpen: isSettingsOpen,
      setIsOpen: setIsSettingsOpen,
      subItems: [
        { name: 'Informations générales', href: '/settings/general' },
        { name: 'Informations légales', href: '/settings/legal' }
      ]
    },
  ];

  const handleLinkClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  const handleLogout = () => {
    const ok = confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
    if (!ok) return;

    try {
      apiClient.setToken(null);
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.replace('/login');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Titre SimInt-Bot Admin avec icône robot - même format que l'app */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-2">
        <span className="text-[17px] font-bold tracking-tight text-white">
          Sim<span className="text-white/80">Int</span>-Bot
        </span>
        <img src="/icons/titlerobot.png" alt="Robot" className="w-5 h-5" />
        <span className="text-[10px] font-semibold text-[#0D7BFF] bg-white px-2 py-0.5 rounded-full ml-1">
          ADMIN
        </span>
      </div>

      {/* Séparateur subtil */}
      <div className="mx-4 mb-3">
        <div className="h-px bg-white/20"></div>
      </div>

      {/* Section profil admin */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl mb-4">
          <div className="flex-shrink-0">
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-[#0D7BFF] font-bold text-base shadow-md">
              A
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-white truncate">
              Administrateur
            </p>
            <p className="text-xs text-white/70">Super Admin</p>
          </div>
          <ChevronDown size={16} className="text-white/50 flex-shrink-0" />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          
          if (item.hasSub) {
            const isSubActive = item.subItems?.some(sub => pathname.includes(sub.href));
            return (
              <div key={item.href}>
                <button 
                  onClick={() => item.setIsOpen?.(!item.isOpen)}
                  className={`relative flex items-center justify-between w-full px-5 py-2.5 transition-all ${
                    isSubActive 
                      ? 'bg-white/20 text-white font-medium' 
                      : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} strokeWidth={1.5} />
                    <span className="text-[13px]">{item.name}</span>
                  </div>
                  {item.isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                
                {item.isOpen && item.subItems && (
                  <div className="mt-0.5">
                    {item.subItems.map((subItem) => {
                      const isSubItemActive = pathname.includes(subItem.href);
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={handleLinkClick}
                          className={`relative flex items-center pl-14 pr-5 py-2 transition-all text-[13px] ${
                            isSubItemActive 
                              ? 'text-white font-medium' 
                              : 'text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {isSubItemActive && (
                            <span className="absolute right-0 top-0 bottom-0 w-1 bg-yellow-400 rounded-l" />
                          )}
                          {subItem.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={handleLinkClick}
              className={`relative flex items-center px-5 py-2.5 transition-all ${
                isActive 
                  ? 'bg-white/20 text-white font-medium' 
                  : 'text-white/70 hover:bg-white/10'
              }`}
            >
              {isActive && (
                <span className="absolute right-0 top-0 bottom-0 w-1 bg-yellow-400 rounded-l" />
              )}
              <div className="flex items-center gap-3">
                <Icon size={18} strokeWidth={1.5} />
                <span className="text-[13px]">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer avec bouton déconnexion */}
      <div className="p-4 mt-auto border-t border-white/20">
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all">
          <LogOut size={18} strokeWidth={1.5} />
          <span className="text-[13px]">Déconnexion</span>
        </button>
      </div>
    </div>
  );
}

// Sidebar Desktop
function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0D7BFF] h-screen">
      <SidebarContent />
    </aside>
  );
}

// Sidebar Mobile (Overlay)
function MobileSidebar() {
  const { isOpen, close } = useMobileSidebar();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={close}
      />
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 z-50 flex flex-col w-64 bg-[#0D7BFF] h-screen lg:hidden animate-in slide-in-from-left duration-300">
        <button 
          onClick={close}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full"
        >
          <X size={20} className="text-white" />
        </button>
        <SidebarContent onNavigate={close} />
      </aside>
    </>
  );
}

export default function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}
