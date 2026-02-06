"use client";
import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Loader2, 
  Mic, 
  Clock, 
  Terminal, 
  FileText,
  MessageSquare,
  Bot,
  Plus
} from 'lucide-react';
import { settingsService, SettingItem } from '@/lib/services/settings.service';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';

// Helper to group settings nicely
const GROUP_CONFIG: Record<string, { label: string; icon: any }> = {
  'hume': { label: 'Voix & IA (Hume)', icon: Mic },
  'interview': { label: 'Configuration Entretien', icon: Clock },
  'prompt': { label: 'Stratégie & Prompts', icon: Terminal },
  'report': { label: 'Rapports & Analyse', icon: FileText },
};

// Mapping for friendly names
const FRIENDLY_NAMES: Record<string, string> = {
    'hume.apikey': 'Clé API Hume',
    'hume.secret': 'Secret Hume',
    'hume.configId': 'ID de configuration Hume',
    'interview.max_duration': 'Durée maximale (sec)',
    'prompt.system_template': 'Template Système (Prompt)',
    'prompt.strategy': 'Stratégie d\'entretien',
    'recruiter_names': 'Noms des recruteurs (JSON)',
};

const getLabel = (key: string) => {
    // Dynamic keys
    if (key.includes('hume.voice.')) {
        const lang = key.split('.').pop()?.toUpperCase() || '';
        return `Voix IA (${lang})`;
    }
    if (key.includes('interview.complement.')) {
        const lang = key.split('.').pop()?.toUpperCase() || '';
        return `Complément d'entretien (${lang})`;
    }

    if (FRIENDLY_NAMES[key]) return FRIENDLY_NAMES[key];
    
    // Fallback
    const parts = key.split('.');
    const cleanKey = parts.length > 1 ? parts.slice(1).join(' ') : parts[0];
    return cleanKey
        .split(/[._]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

function getGroupAndSubkey(key: string): { group: string; subkey: string } {
  const parts = key.split('.');
  const group = parts[0];
  return { 
    group: GROUP_CONFIG[group] ? group : 'other', 
    subkey: parts.slice(1).join('.') 
  };
}


const SUPPORTED_LANGUAGES = [
    { code: 'en', label: 'Anglais (English)' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Espagnol (Español)' },
    { code: 'de', label: 'Allemand (Deutsch)' },
    { code: 'it', label: 'Italien (Italiano)' },
    { code: 'pt', label: 'Portugais (Português)' },
    { code: 'zh', label: 'Chinois (Chinese)' },
    { code: 'ja', label: 'Japonais (Japanese)' },
    { code: 'ko', label: 'Coréen (Korean)' },
    { code: 'ru', label: 'Russe (Russian)' },
];

export default function InterviewSettingsPage() {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // Voice Modal State
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isCreatingVoice, setIsCreatingVoice] = useState(false);
  const [newVoice, setNewVoice] = useState({ 
    name: 'en', // Changed default to 'en' as it's a select now
    id: '',   // The hume voice ID
    description: '' 
  });

  // Interview Modal State
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isCreatingInterview, setIsCreatingInterview] = useState(false);
  const [newInterviewComplement, setNewInterviewComplement] = useState({
      lang: 'en',
      value: '',
  });

  // Group settings
  const groupedSettings = React.useMemo(() => {
    const groups: Record<string, SettingItem[]> = {};
    
    // Sort keys just to be consistent
    const sortedSettings = [...settings].sort((a, b) => a.key.localeCompare(b.key));

    sortedSettings.forEach(item => {
      const { group } = getGroupAndSubkey(item.key);
      if (group === 'other') return; 

      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
    });

    return groups;
  }, [settings]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsService.getAll();
        if (response && response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Impossible de charger les paramètres');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Sync modal state with settings when opening or changing selection
  useEffect(() => {
    if (isVoiceModalOpen) {
       const existing = settings.find(s => s.key === `hume.voice.${newVoice.name}`);
       if (existing) {
           setNewVoice(prev => ({ 
               ...prev, 
               id: existing.value, 
               description: existing.description 
           }));
       } else if (newVoice.id && !existing) {
            // If we switched to a non-existing one, we might want to clear, 
            // but usually this is handled by the onChange. 
            // This effect mainly targets the initial open if 'en' is default.
            // But we must be careful not to wipe user input if they are typing.
            // Since this runs on isVoiceModalOpen open, it's fine.
            // But if I add [newVoice.name] dependency, I need to be careful.
       }
    }
  }, [isVoiceModalOpen]); // Only on open

  // Sync interview modal
  useEffect(() => {
      if (isInterviewModalOpen) {
          const existing = settings.find(s => s.key === `interview.complement.${newInterviewComplement.lang}`);
          if (existing) {
              setNewInterviewComplement(prev => ({
                  ...prev,
                  value: existing.value
              }));
          } else {
               setNewInterviewComplement(prev => ({ ...prev, value: '' }));
          }
      }
  }, [isInterviewModalOpen, newInterviewComplement.lang]);

  const handleUpdate = async (key: string, newValue: string) => {
    setSavingKey(key);
    try {
      await settingsService.update(key, newValue);
      setSettings(prev => prev.map(item => 
        item.key === key ? { ...item, value: newValue } : item
      ));
      toast.success('Paramètre mis à jour');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSavingKey(null);
    }
  };

  const handleSaveVoice = async () => {
    if (!newVoice.name || !newVoice.id) {
        toast.error('Le nom et l\'ID sont requis');
        return;
    }

    setIsCreatingVoice(true);
    const formattedKey = `hume.voice.${newVoice.name}`;
    const existingItem = settings.find(s => s.key === formattedKey);

    try {
        if (existingItem) {
            await settingsService.update(formattedKey, newVoice.id);
            setSettings(prev => prev.map(item => 
                item.key === formattedKey ? { ...item, value: newVoice.id } : item
            ));
            toast.success('Voix mise à jour avec succès');
        } else {
            // Find language label for description
            const langLabel = SUPPORTED_LANGUAGES.find(l => l.code === newVoice.name)?.label || newVoice.name;

            const payload = {
                key: formattedKey,
                value: newVoice.id,
                description: newVoice.description || `Voix Hume pour ${langLabel}`
            };

            const response = await settingsService.create(payload);
            
            if (response && response.data) {
                setSettings(prev => [...prev, response.data]);
                toast.success('Nouvelle voix ajoutée');
            }
        }

        setIsVoiceModalOpen(false);
        setNewVoice({ name: 'en', id: '', description: '' });
    } catch (error) {
        console.error('Error saving voice:', error);
        toast.error('Erreur lors de l\'enregistrement de la voix');
    } finally {
        setIsCreatingVoice(false);
    }
  };

  const handleSaveInterviewComplement = async () => {
      if (!newInterviewComplement.value) {
          toast.error('Le contenu du complément est requis');
          return;
      }

      setIsCreatingInterview(true);
      const formattedKey = `interview.complement.${newInterviewComplement.lang}`;
      const existingItem = settings.find(s => s.key === formattedKey);

      try {
          if (existingItem) {
              await settingsService.update(formattedKey, newInterviewComplement.value);
              setSettings(prev => prev.map(item => 
                  item.key === formattedKey ? { ...item, value: newInterviewComplement.value } : item
              ));
              toast.success('Complément mis à jour');
          } else {
              const langLabel = SUPPORTED_LANGUAGES.find(l => l.code === newInterviewComplement.lang)?.label || newInterviewComplement.lang;
              const payload = {
                  key: formattedKey,
                  value: newInterviewComplement.value,
                  description: `Instructions complémentaires pour ${langLabel}`
              };

              const response = await settingsService.create(payload);
              
              if (response && response.data) {
                  setSettings(prev => [...prev, response.data]);
                  toast.success('Complément ajouté');
              }
          }

          setIsInterviewModalOpen(false);
          setNewInterviewComplement({ lang: 'en', value: '' });
      } catch (error) {
          console.error('Error saving interview complement:', error);
          toast.error('Erreur lors de l\'enregistrement');
      } finally {
          setIsCreatingInterview(false);
      }
  };

  // Helper component to render proper input based on content
  const renderInput = (item: SettingItem) => {
    const isLongText = item.value.length > 60 || item.value.includes('\n');
    const isJson = item.value.trim().startsWith('[') || item.value.trim().startsWith('{');
    const isNumber = !isNaN(Number(item.value)) && !item.value.includes(',');

    /*if (item.key.includes('prompt.strategy') || item.key.includes('prompt.system_template') || isLongText || isJson) {
      return (
        <textarea
          defaultValue={item.value}
          onBlur={(e) => {
            if (e.target.value !== item.value) handleUpdate(item.key, e.target.value);
          }}
          rows={isJson ? 6 : 4}
          className="w-full p-3 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#0D7BFF]/20 focus:border-[#0D7BFF] outline-none transition-all"
        />
      );
    }*/

    const handleChange = (newValue: string) => {
        if(newValue !== item.value) {
            handleUpdate(item.key, newValue);
        }
    }

    // Editable Text Area for larger content or specific keys
    if (item.key.includes('prompt.strategy') || item.key.includes('prompt.tone') || item.key.includes('prompt.system_template') || item.key.includes('recruiter_names') || item.key.includes('interview.complement')) {
         return (
             <div className="relative group">
                <textarea
                    defaultValue={item.value}
                    onBlur={(e) => handleChange(e.target.value)}
                    disabled={savingKey === item.key}
                    className={`w-full min-h-[100px] p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D7BFF]/20 focus:border-[#0D7BFF] outline-none font-mono resize-y ${savingKey === item.key ? 'bg-gray-50 text-gray-500' : ''}`}
                    rows={item.key.includes('system_template') ? 12 : 4}
                />
                 {savingKey === item.key && (
                    <div className="absolute top-2 right-2 text-[#0D7BFF] bg-white rounded-full p-1 shadow-sm border border-gray-100">
                        <Loader2 className="animate-spin" size={16} />
                    </div>
                 )}
             </div>
         )
    }

    // Duration specific handling
    if (item.key.endsWith('_duration') && item.key.startsWith('interview.')) {
        return (
            <div className="relative">
                <input
                    type="number"
                    defaultValue={item.value}
                    onBlur={(e) => handleChange(e.target.value)}
                    disabled={savingKey === item.key}
                    className={`w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D7BFF]/20 focus:border-[#0D7BFF] outline-none pr-12 ${savingKey === item.key ? 'bg-gray-50 text-gray-500' : ''}`}
                />
                 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                    sec
                 </span>
                 {savingKey === item.key && (
                    <div className="absolute top-1/2 -translate-y-1/2 right-12 text-[#0D7BFF] bg-white rounded-full p-0.5">
                        <Loader2 className="animate-spin" size={16} />
                    </div>
                 )}
            </div>
        );
    }

    // Simple Input for short values
    return (
        <div className="relative">
            <input
                type={isNumber ? "number" : "text"}
                defaultValue={item.value}
                onBlur={(e) => handleChange(e.target.value)}
                disabled={savingKey === item.key}
                className={`w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D7BFF]/20 focus:border-[#0D7BFF] outline-none pr-10 ${savingKey === item.key ? 'bg-gray-50 text-gray-500' : ''}`}
            />
             {savingKey === item.key && (
                <div className="absolute top-1/2 -translate-y-1/2 right-3 text-[#0D7BFF] bg-white rounded-full p-0.5">
                    <Loader2 className="animate-spin" size={16} />
                </div>
             )}
        </div>
    );
  };

  if (loading) {
    return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="animate-spin text-[#0D7BFF]" size={40} />
        </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="text-[#0D7BFF]" />
          Configuration Globale
        </h1>
        <p className="text-gray-500 mt-1">Gérez les constantes et prompts du système d&apos;entretien.</p>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedSettings).map(([groupKey, items]) => {
          const config = GROUP_CONFIG[groupKey] || { label: 'Autres Paramètres', icon: SettingsIcon };
          const Icon = config.icon;

          return (
            <div key={groupKey} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm text-[#0D7BFF]">
                        <Icon size={20} />
                    </div>
                    <h2 className="font-semibold text-gray-800 text-lg">{config.label}</h2>
                </div>
                {groupKey === 'hume' && (
                    <button 
                        onClick={() => setIsVoiceModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#0D7BFF] bg-[#0D7BFF]/10 rounded-lg hover:bg-[#0D7BFF]/20 transition-colors"
                    >
                        <Plus size={16} />
                        Ajouter une voix
                    </button>
                )}
                {groupKey === 'interview' && (
                    <button 
                        onClick={() => setIsInterviewModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#0D7BFF] bg-[#0D7BFF]/10 rounded-lg hover:bg-[#0D7BFF]/20 transition-colors"
                    >
                        <Plus size={16} />
                        Ajouter un complément
                    </button>
                )}
              </div>
              
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.key} className="p-6 hover:bg-gray-50/30 transition-colors">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3 space-y-1">
                        <h3 className="text-sm font-semibold text-gray-900 break-words mb-1">
                            {getLabel(item.key)}
                        </h3>
                        <p className="text-xs text-gray-400 font-mono mb-2 select-all">
                            {item.key}
                        </p>
                        <p className="text-sm text-gray-500 leading-snug">
                          {item.description}
                        </p>
                      </div>
                      
                      <div className="md:w-2/3">
                        {renderInput(item)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
                {/* Specific Action for Hume Voices (Add new) could be here if needed */}
                {groupKey === 'hume' && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-right">
                         <span className="text-xs text-gray-400 italic">Pour ajouter une voix, contactez le support technique.</span>
                    </div>
                )}
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        title="Gestion des voix Hume"
        description="Ajoutez une nouvelle voix ou mettez à jour une existante"
        footer={
            <div className="flex justify-end gap-3 w-full">
                <button
                    onClick={() => setIsVoiceModalOpen(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    Annuler
                </button>
                <button
                    onClick={handleSaveVoice}
                    disabled={isCreatingVoice || !newVoice.name || !newVoice.id}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0D7BFF] rounded-lg hover:bg-[#0056b3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isCreatingVoice && <Loader2 className="animate-spin" size={16} />}
                    {settings.some(s => s.key === `hume.voice.${newVoice.name}`) ? 'Mettre à jour' : 'Ajouter'}
                </button>
            </div>
        }
      >
        <div className="space-y-4 py-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Langue
                </label>
                <select
                    value={newVoice.name}
                    onChange={(e) => {
                        const langCode = e.target.value;
                        const existing = settings.find(s => s.key === `hume.voice.${langCode}`);
                        setNewVoice({
                            name: langCode,
                            id: existing ? existing.value : '',
                            description: existing ? existing.description : ''
                        });
                    }}
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D7BFF]/20 focus:border-[#0D7BFF] outline-none bg-white"
                >
                    {SUPPORTED_LANGUAGES.map((lang) => {
                         const exists = settings.some(s => s.key === `hume.voice.${lang.code}`);
                         return (
                            <option key={lang.code} value={lang.code}>
                                {lang.label} {exists ? '(Configuré)' : ''}
                            </option>
                        );
                    })}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                    Clé associée : <span className="font-mono text-gray-700">hume.voice.{newVoice.name}</span>
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID de la voix Hume
                </label>
                <input
                    type="text"
                    value={newVoice.id}
                    onChange={(e) => setNewVoice(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="Ex: Jean"
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D7BFF]/20 focus:border-[#0D7BFF] outline-none font-mono"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optionnel)
                </label>
                <input
                    type="text"
                    value={newVoice.description}
                    onChange={(e) => setNewVoice(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description courte de la voix"
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D7BFF]/20 focus:border-[#0D7BFF] outline-none"
                />
            </div>
        </div>
      </Modal>

      <Modal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        title="Complément de langue"
        description="Ajouter des instructions spécifiques pour une langue d'entretien"
        footer={
            <div className="flex justify-end gap-3 w-full">
                <button
                    onClick={() => setIsInterviewModalOpen(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    Annuler
                </button>
                <button
                    onClick={handleSaveInterviewComplement}
                    disabled={isCreatingInterview || !newInterviewComplement.value}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0D7BFF] rounded-lg hover:bg-[#0056b3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isCreatingInterview && <Loader2 className="animate-spin" size={16} />}
                    Enregistrer
                </button>
            </div>
        }
      >
        <div className="space-y-4 py-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Langue Cible
                </label>
                <select
                    value={newInterviewComplement.lang}
                    onChange={(e) => setNewInterviewComplement(prev => ({ ...prev, lang: e.target.value }))}
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D7BFF]/20 focus:border-[#0D7BFF] outline-none bg-white"
                >
                    {SUPPORTED_LANGUAGES.map((lang) => {
                         const exists = settings.some(s => s.key === `interview.complement.${lang.code}`);
                         return (
                            <option key={lang.code} value={lang.code}>
                                {lang.label} {exists ? '(Existe déjà)' : ''}
                            </option>
                        );
                    })}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                    Clé générée : <span className="font-mono text-gray-700">interview.complement.{newInterviewComplement.lang}</span>
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions / Complément
                </label>
                <textarea
                    value={newInterviewComplement.value}
                    onChange={(e) => setNewInterviewComplement(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Instructions spécifiques pour cette langue..."
                    rows={6}
                    className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D7BFF]/20 focus:border-[#0D7BFF] outline-none font-mono resize-y"
                />
            </div>
        </div>
      </Modal>
    </div>
  );
}
