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
import { useTranslations } from 'next-intl';

const SUPPORTED_LANGUAGE_CODES = ['en', 'fr', 'es', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ru'];

export default function InterviewSettingsPage() {
    const t = useTranslations('InterviewSettings');
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

    const groupConfig = React.useMemo(() => ({
        hume: { label: t('groups.hume'), icon: Mic },
        interview: { label: t('groups.interview'), icon: Clock },
        prompt: { label: t('groups.prompt'), icon: Terminal },
        report: { label: t('groups.report'), icon: FileText },
    }), [t]);

    const friendlyNames = React.useMemo(() => ({
        'hume.apikey': t('labels.hume_api_key'),
        'hume.secret': t('labels.hume_secret'),
        'hume.configId': t('labels.hume_config_id'),
        'interview.max_duration': t('labels.interview_max_duration'),
        'prompt.system_template': t('labels.prompt_system_template'),
        'prompt.strategy': t('labels.prompt_strategy'),
        'recruiter_names': t('labels.recruiter_names'),
    }), [t]);

    const supportedLanguages = React.useMemo(() => (
        SUPPORTED_LANGUAGE_CODES.map((code) => ({
            code,
            label: t(`languages.${code}`),
        }))
    ), [t]);

    const getLabel = React.useCallback((key: string) => {
        if (key.includes('hume.voice.')) {
            const lang = key.split('.').pop()?.toUpperCase() || '';
            return t('labels.voice_lang', { lang });
        }
        if (key.includes('interview.complement.')) {
            const lang = key.split('.').pop()?.toUpperCase() || '';
            return t('labels.complement_lang', { lang });
        }

        if (friendlyNames[key]) return friendlyNames[key];

        const parts = key.split('.');
        const cleanKey = parts.length > 1 ? parts.slice(1).join(' ') : parts[0];
        return cleanKey
            .split(/[._]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }, [friendlyNames, t]);

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
            const group = item.key.split('.')[0];
            const groupKey = groupConfig[group] ? group : 'other';
            if (groupKey === 'other') return;

            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(item);
    });

    return groups;
    }, [settings, groupConfig]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsService.getAll();
        if (response && response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
                toast.error(t('errors.load_failed'));
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
    }, [t]);

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
            toast.success(t('success.updated'));
    } catch (error) {
      console.error('Error updating setting:', error);
            toast.error(t('errors.update_failed'));
    } finally {
      setSavingKey(null);
    }
  };

  const handleSaveVoice = async () => {
    if (!newVoice.name || !newVoice.id) {
        toast.error(t('errors.voice_required'));
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
            toast.success(t('success.voice_updated'));
        } else {
            // Find language label for description
            const langLabel = supportedLanguages.find(l => l.code === newVoice.name)?.label || newVoice.name;

            const payload = {
                key: formattedKey,
                value: newVoice.id,
                description: newVoice.description || t('descriptions.hume_voice_for', { lang: langLabel })
            };

            const response = await settingsService.create(payload);
            
            if (response && response.data) {
                setSettings(prev => [...prev, response.data]);
                toast.success(t('success.voice_added'));
            }
        }

        setIsVoiceModalOpen(false);
        setNewVoice({ name: 'en', id: '', description: '' });
    } catch (error) {
        console.error('Error saving voice:', error);
        toast.error(t('errors.voice_save_failed'));
    } finally {
        setIsCreatingVoice(false);
    }
  };

  const handleSaveInterviewComplement = async () => {
      if (!newInterviewComplement.value) {
          toast.error(t('errors.complement_required'));
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
              toast.success(t('success.complement_updated'));
          } else {
              const langLabel = supportedLanguages.find(l => l.code === newInterviewComplement.lang)?.label || newInterviewComplement.lang;
              const payload = {
                  key: formattedKey,
                  value: newInterviewComplement.value,
                  description: t('descriptions.complement_for', { lang: langLabel })
              };

              const response = await settingsService.create(payload);
              
              if (response && response.data) {
                  setSettings(prev => [...prev, response.data]);
                  toast.success(t('success.complement_added'));
              }
          }

          setIsInterviewModalOpen(false);
          setNewInterviewComplement({ lang: 'en', value: '' });
      } catch (error) {
          console.error('Error saving interview complement:', error);
          toast.error(t('errors.complement_save_failed'));
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
                          {t('units.seconds')}
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
                    {t('title')}
        </h1>
                <p className="text-gray-500 mt-1">{t('subtitle')}</p>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedSettings).map(([groupKey, items]) => {
                    const config = groupConfig[groupKey] || { label: t('groups.other'), icon: SettingsIcon };
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
                        {t('actions.add_voice')}
                    </button>
                )}
                {groupKey === 'interview' && (
                    <button 
                        onClick={() => setIsInterviewModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#0D7BFF] bg-[#0D7BFF]/10 rounded-lg hover:bg-[#0D7BFF]/20 transition-colors"
                    >
                        <Plus size={16} />
                        {t('actions.add_complement')}
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
                         <span className="text-xs text-gray-400 italic">{t('notes.hume_contact')}</span>
                    </div>
                )}
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        title={t('modal.voice_title')}
        description={t('modal.voice_description')}
        footer={
            <div className="flex justify-end gap-3 w-full">
                <button
                    onClick={() => setIsVoiceModalOpen(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {t('actions.cancel')}
                </button>
                <button
                    onClick={handleSaveVoice}
                    disabled={isCreatingVoice || !newVoice.name || !newVoice.id}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0D7BFF] rounded-lg hover:bg-[#0056b3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isCreatingVoice && <Loader2 className="animate-spin" size={16} />}
                    {settings.some(s => s.key === `hume.voice.${newVoice.name}`) ? t('actions.update') : t('actions.add')}
                </button>
            </div>
        }
      >
        <div className="space-y-4 py-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('modal.voice_language')}
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
                    {supportedLanguages.map((lang) => {
                         const exists = settings.some(s => s.key === `hume.voice.${lang.code}`);
                         return (
                            <option key={lang.code} value={lang.code}>
                                {lang.label} {exists ? t('modal.voice_configured') : ''}
                            </option>
                        );
                    })}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                    {t('modal.voice_key')} <span className="font-mono text-gray-700">hume.voice.{newVoice.name}</span>
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('modal.voice_id')}
                </label>
                <input
                    type="text"
                    value={newVoice.id}
                    onChange={(e) => setNewVoice(prev => ({ ...prev, id: e.target.value }))}
                    placeholder={t('modal.voice_id_placeholder')}
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D7BFF]/20 focus:border-[#0D7BFF] outline-none font-mono"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('modal.voice_description_label')}
                </label>
                <input
                    type="text"
                    value={newVoice.description}
                    onChange={(e) => setNewVoice(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t('modal.voice_description_placeholder')}
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D7BFF]/20 focus:border-[#0D7BFF] outline-none"
                />
            </div>
        </div>
      </Modal>

      <Modal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        title={t('modal.interview_title')}
        description={t('modal.interview_description')}
        footer={
            <div className="flex justify-end gap-3 w-full">
                <button
                    onClick={() => setIsInterviewModalOpen(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {t('actions.cancel')}
                </button>
                <button
                    onClick={handleSaveInterviewComplement}
                    disabled={isCreatingInterview || !newInterviewComplement.value}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0D7BFF] rounded-lg hover:bg-[#0056b3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isCreatingInterview && <Loader2 className="animate-spin" size={16} />}
                    {t('actions.save')}
                </button>
            </div>
        }
      >
        <div className="space-y-4 py-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('modal.interview_language')}
                </label>
                <select
                    value={newInterviewComplement.lang}
                    onChange={(e) => setNewInterviewComplement(prev => ({ ...prev, lang: e.target.value }))}
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D7BFF]/20 focus:border-[#0D7BFF] outline-none bg-white"
                >
                    {supportedLanguages.map((lang) => {
                         const exists = settings.some(s => s.key === `interview.complement.${lang.code}`);
                         return (
                            <option key={lang.code} value={lang.code}>
                                {lang.label} {exists ? t('modal.interview_exists') : ''}
                            </option>
                        );
                    })}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                    {t('modal.interview_key')} <span className="font-mono text-gray-700">interview.complement.{newInterviewComplement.lang}</span>
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('modal.interview_instructions')}
                </label>
                <textarea
                    value={newInterviewComplement.value}
                    onChange={(e) => setNewInterviewComplement(prev => ({ ...prev, value: e.target.value }))}
                    placeholder={t('modal.interview_placeholder')}
                    rows={6}
                    className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D7BFF]/20 focus:border-[#0D7BFF] outline-none font-mono resize-y"
                />
            </div>
        </div>
      </Modal>
    </div>
  );
}
