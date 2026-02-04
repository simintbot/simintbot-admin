"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFormValid = formData.email?.trim() !== '' && formData.password?.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // TODO: Implémenter l'appel API de connexion admin
      console.log('Login attempt:', formData);
      
      // Simulation d'un délai de connexion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirection vers le dashboard admin
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Côté Gauche - Formulaire de connexion */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 md:p-8 lg:p-12 overflow-y-auto">
        
        {/* Header avec Logo */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-2xl font-bold flex items-center">
            SimintBot <span className="text-[#0D7BFF] ml-1">Admin</span>
          </div>
        </div>

        <div className="max-w-md mx-auto w-full flex-grow flex flex-col justify-center min-h-0">
          <h1 className="text-2xl font-bold text-center mb-2">Connexion Admin</h1>
          <p className="text-gray-500 text-center mb-8">Accédez à votre espace d&apos;administration</p>

          {/* Formulaire de connexion */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  placeholder="admin@simintbot.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-[#0D7BFF] focus:ring-2 focus:ring-[#0D7BFF]/20 transition-all"
                  required 
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <input 
                  type="password" 
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-[#0D7BFF] focus:ring-2 focus:ring-[#0D7BFF]/20 transition-all"
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!isFormValid || isLoading}
              className={`w-full py-3 rounded-xl font-bold text-base transition-all shadow-sm mt-2 flex items-center justify-center gap-2 ${
                isFormValid && !isLoading
                  ? "bg-[#0D7BFF] text-white hover:bg-[#0a6ae0] cursor-pointer" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Connexion en cours...</span>
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Lien mot de passe oublié */}
          <div className="text-center mt-6">
            <Link href="/forgot-password" className="text-[#0D7BFF] text-sm hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm mt-8">
          © 2026 SimintBot. Tous droits réservés.
        </div>
      </div>

      {/* Côté Droit - Image illustrative */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-[#0D7BFF]">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4">Espace Administration</h2>
            <p className="text-white/80 text-lg">
              Gérez les utilisateurs, les simulations et les paramètres de la plateforme SimintBot.
            </p>
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
