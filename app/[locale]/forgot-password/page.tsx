"use client";
import React, { useState } from 'react';
import { Link } from '@/i18n/routing';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LanguageSelector from '@/components/LanguageSelector';

export default function ForgotPasswordPage() {
  const t = useTranslations('ForgotPassword');
  const tCommon = useTranslations('Common');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const isFormValid = email?.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // TODO: Implémenter l'appel API pour réinitialisation
      console.log('Password reset request for:', email);
      
      // Simulation d'un délai
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Côté Gauche - Formulaire */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 md:p-8 lg:p-12 overflow-y-auto">
        
        {/* Header avec Logo */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-2xl font-bold flex items-center">
            SimintBot <span className="text-[#0D7BFF] ml-1">Admin</span>
          </div>
          <LanguageSelector />
        </div>

        <div className="max-w-md mx-auto w-full flex-grow flex flex-col justify-center min-h-0">
          {/* Lien retour */}
          <Link href="/login" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 w-fit">
            <ArrowLeft size={18} />
            <span>{t('back_to_login')}</span>
          </Link>

          {!isSubmitted ? (
            <>
              <h1 className="text-2xl font-bold mb-2">{t('title')}</h1>
              <p className="text-gray-500 mb-8">
                {t('subtitle')}
              </p>

              {/* Formulaire */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('email_label')}
                  </label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    placeholder={t('email_placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-[#0D7BFF] focus:ring-2 focus:ring-[#0D7BFF]/20 transition-all"
                    required 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={!isFormValid || isLoading}
                  className={`w-full py-3 rounded-xl font-bold text-base transition-all shadow-sm flex items-center justify-center gap-2 ${
                    isFormValid && !isLoading
                      ? "bg-[#0D7BFF] text-white hover:bg-[#0a6ae0] cursor-pointer" 
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>{t('sending')}</span>
                    </>
                  ) : (
                    t('submit')
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Message de confirmation */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">{t('success_title')}</h1>
              <p className="text-gray-500 mb-8">
                {t('success_message', { email })}
              </p>
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center gap-2 bg-[#0D7BFF] text-white py-3 px-6 rounded-xl font-bold hover:bg-[#0a6ae0] transition-all"
              >
                {t('back_to_login')}
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm mt-8">
          {tCommon('footer_rights')}
        </div>
      </div>

      {/* Côté Droit - Visuel */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0D7BFF] to-[#0957b3]">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4">{t('right_title')}</h2>
            <p className="text-white/80 text-lg">{t('right_description')}</p>
          </div>
        </div>
        {/* Éléments décoratifs */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute top-1/3 left-20 w-16 h-16 bg-white/5 rounded-full"></div>
      </div>
    </div>
  );
}
