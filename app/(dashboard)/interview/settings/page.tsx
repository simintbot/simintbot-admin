"use client";
import React from 'react';
import { Settings, Construction } from 'lucide-react';

export default function InterviewSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres Interview</h1>
        <p className="text-gray-500 text-sm mt-1">Configurez les paramètres des entretiens</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Construction size={36} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Page en construction</h2>
          <p className="text-gray-500 max-w-md">
            Les paramètres des interviews seront bientôt disponibles. 
            Vous pourrez configurer la durée, les options et d&apos;autres réglages.
          </p>
        </div>
      </div>
    </div>
  );
}
