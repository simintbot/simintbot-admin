"use client";
import React, { useState } from 'react';
import { Save, Loader2, Mail, Phone, MapPin } from 'lucide-react';

export default function GeneralSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: 'contact@simintbot.com',
    phone: '+33 1 23 45 67 89',
    address: '15 Avenue des Champs-Élysées, 75008 Paris, France',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulation sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    // TODO: Afficher toast de succès
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Informations Générales</h1>
        <p className="text-gray-500 text-sm mt-1">Configurez les informations de contact de la plateforme</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  Email de contact
                </div>
              </label>
              <input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-[#0D7BFF] focus:ring-2 focus:ring-[#0D7BFF]/20 transition-all"
                placeholder="contact@simintbot.com"
              />
              <p className="text-xs text-gray-400 mt-1">
                Cette adresse email sera affichée sur le site pour les contacts
              </p>
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  Numéro de téléphone
                </div>
              </label>
              <input 
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-[#0D7BFF] focus:ring-2 focus:ring-[#0D7BFF]/20 transition-all"
                placeholder="+33 1 23 45 67 89"
              />
              <p className="text-xs text-gray-400 mt-1">
                Numéro de téléphone principal pour le support
              </p>
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  Adresse
                </div>
              </label>
              <textarea 
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-[#0D7BFF] focus:ring-2 focus:ring-[#0D7BFF]/20 transition-all min-h-[100px]"
                placeholder="Adresse complète..."
              />
              <p className="text-xs text-gray-400 mt-1">
                Adresse physique de l&apos;entreprise
              </p>
            </div>
          </div>

          {/* Footer avec bouton */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
            <button 
              type="submit"
              disabled={isLoading}
              className="bg-[#0D7BFF] text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#0a6ae0] transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
