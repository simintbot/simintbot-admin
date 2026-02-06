"use client";
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Loader2, 
  Settings as SettingsIcon,
} from 'lucide-react';
import { settingsService, SettingItem } from '@/lib/services/settings.service';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

// Helper to group settings nicely
const KNOWN_GROUPS = ['hume', 'interview', 'prompt', 'report'];


export default function GeneralSettingsPage() {
  const t = useTranslations('GeneralSettings');
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const friendlyNames = React.useMemo(() => ({
    'platform.address': t('labels.platform_address'),
    'platform.contact_email': t('labels.platform_contact_email'),
    'platform.support_phone': t('labels.platform_support_phone'),
    'platform.social_links': t('labels.platform_social_links'),
    'site.name': t('labels.site_name'),
    'site.description': t('labels.site_description'),
  }), [t]);

  const getLabel = React.useCallback((key: string) => {
    if (friendlyNames[key]) return friendlyNames[key];
    const parts = key.split('.');
    const cleanKey = parts.length > 1 ? parts.slice(1).join(' ') : parts[0];
    return cleanKey
      .split(/[._]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, [friendlyNames]);

  // Filter for "Other" settings
  const generalSettings = React.useMemo(() => {
    return settings.filter(item => {
        const group = item.key.split('.')[0];
        // If it starts with one of the known groups, ignore it. 
        // Otherwise, it belongs to "General/Other"
        return !KNOWN_GROUPS.includes(group);
    }).sort((a, b) => a.key.localeCompare(b.key));
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
        toast.error(t('errors.load_failed'));
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [t]);

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

  // Helper component to render proper input based on content
  const renderInput = (item: SettingItem) => {
    const isLongText = item.value.length > 60 || item.value.includes('\n');
    const isJson = item.value.trim().startsWith('[') || item.value.trim().startsWith('{');
    const isNumber = !isNaN(Number(item.value)) && !item.value.includes(',');
    const isDuration = item.key.endsWith('_duration');

    const handleChange = (newValue: string) => {
        if(newValue !== item.value) {
            handleUpdate(item.key, newValue);
        }
    }

    // Editable Text Area for larger content or specific keys
    if (isLongText || isJson) {
         return (
             <div className="relative group w-full">
                <textarea
                    defaultValue={item.value}
                    onBlur={(e) => handleChange(e.target.value)}
                    disabled={savingKey === item.key}
                    className={`w-full min-h-[100px] p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D7BFF]/20 focus:border-[#0D7BFF] outline-none font-mono resize-y ${savingKey === item.key ? 'bg-gray-50 text-gray-500' : ''}`}
                    rows={4}
                />
                 {savingKey === item.key && (
                    <div className="absolute top-2 right-2 text-[#0D7BFF] bg-white rounded-full p-1 shadow-sm border border-gray-100">
                        <Loader2 className="animate-spin" size={16} />
                    </div>
                 )}
             </div>
         )
    }

    // Duration Input
    if (isDuration) {
        return (
            <div className="relative w-full">
                <input
                    type="number"
                    defaultValue={item.value}
                    onBlur={(e) => handleChange(e.target.value)}
                    disabled={savingKey === item.key}
                    className={`w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D7BFF]/20 focus:border-[#0D7BFF] outline-none pr-12 ${savingKey === item.key ? 'bg-gray-50 text-gray-500' : ''}`}
                />
                <div className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 text-xs font-medium pointer-events-none">
                  {t('units.seconds')}
                </div>
                 {savingKey === item.key && (
                    <div className="absolute top-1/2 -translate-y-1/2 right-8 text-[#0D7BFF] bg-white rounded-full p-0.5">
                        <Loader2 className="animate-spin" size={14} />
                    </div>
                 )}
            </div>
        );
    }

    // Simple Input for short values
    return (
        <div className="relative w-full">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm text-[#0D7BFF]">
                        <SettingsIcon size={20} />
                    </div>
                    <h2 className="font-semibold text-gray-800 text-lg">{t('group_title')}</h2>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {generalSettings.length > 0 ? (
                    generalSettings.map((item) => (
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
                            {item.description || t('table.no_description')}
                            </p>
                        </div>
                        
                        <div className="md:w-2/3">
                            {renderInput(item)}
                        </div>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-500 italic">
                        {t('empty')}
                    </div>
                )}
              </div>
            </div>
      </div>
    </div>
  );
}

