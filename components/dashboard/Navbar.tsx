"use client";
import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Menu, Settings } from 'lucide-react';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import { useMobileSidebar } from './MobileSidebarContext';
import { userService, User as AppUser } from '@/lib/services/user.service';
import authService from '@/lib/api/services/auth.service';
import { useTranslations } from 'next-intl';
import LanguageSelector from '../LanguageSelector';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  cancelText: string;
  confirmText: string;
}

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, cancelText, confirmText }: ConfirmationModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100 border border-gray-100">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
            <LogOut size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-gray-200 outline-none"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all focus:ring-2 focus:ring-red-500 outline-none"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const t = useTranslations('Navbar');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { open } = useMobileSidebar();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await userService.getCurrentUser();
        if (res.data) {
          setCurrentUser(res.data);
        }
      } catch (err) {
        console.error("Failed to load admin profile", err);
      }
    };
    fetchMe();
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setIsProfileOpen(false);
  };

  const handleLogoutConfirm = () => {
    try {
      authService.clearAuth();
    } catch (e) {
      // ignore
    }
    setShowLogoutModal(false);
    router.replace('/login');
  };

  // Déterminer le titre de la page
  const getPageTitle = () => {
    if (pathname.includes('/users')) return t('page_titles.users');
    if (pathname.includes('/planifications')) return t('page_titles.planifications');
    if (pathname.includes('/interview/decor')) return t('page_titles.decor');
    if (pathname.includes('/interview/jobs')) return t('page_titles.jobs');
    if (pathname.includes('/interview/settings')) return t('page_titles.interview_settings');
    if (pathname.includes('/settings/general')) return t('page_titles.general_settings');
    if (pathname.includes('/settings/legal')) return t('page_titles.legal_settings');
    return t('page_titles.dashboard');
  };

  return (
    <>
      <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {/* Menu burger mobile */}
            <button 
              onClick={open}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-gray-800">{getPageTitle()}</h1>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Language Selector */}
            <div className="hidden sm:block">
              <LanguageSelector variant="bordered" />
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#0D7BFF] flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                    {currentUser?.profile_picture_url && currentUser.profile_picture_url !== "string" ? (
                        <img src={currentUser.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span>
                          {currentUser ? (currentUser.first_name?.[0] || '') + (currentUser.last_name?.[0] || '') || 'A' : 'A'}
                        </span>
                    )}
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-semibold text-sm text-gray-800">
                        {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : t('admin_label')}
                    </p>
                    <p className="text-xs text-gray-400">{currentUser?.email || t('admin_email_fallback')}</p>
                  </div>
                  <Link 
                    href="/settings/general"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Settings size={16} />
                    {t('settings')}
                  </Link>
                  <button 
                    onClick={handleLogoutClick}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut size={16} />
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        title={t('logout_modal.title')}
        message={t('logout_modal.message')}
        cancelText={t('logout_modal.cancel')}
        confirmText={t('logout_modal.confirm')}
      />
    </>
  );
}
