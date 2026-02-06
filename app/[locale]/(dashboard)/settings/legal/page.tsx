"use client";
import React, { useState, useRef, useEffect } from 'react';
import { 
    Save, 
    Loader2, 
    Bold, 
    Italic, 
    Underline, 
    List, 
    ListOrdered, 
    Link, 
    AlignLeft, 
    AlignCenter, 
    AlignRight,
    Globe,
    FileText
} from 'lucide-react';
import { documentService } from '@/lib/services/document.service';
import toast from 'react-hot-toast';
import { useLocale, useTranslations } from 'next-intl';

const SUPPORTED_LANGUAGE_CODES = ['en', 'fr', 'es', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ru'];
const DOC_TYPE_SLUGS = ['about', 'privacy-policy', 'terms-of-use', 'legal-notice'];

// Composant éditeur WYSIWYG
function WysiwygEditor({ 
  content, 
  onChange,
  labels,
}: { 
  content: string; 
  onChange: (content: string) => void;
  labels: {
    bold: string;
    italic: string;
    underline: string;
    bullets: string;
    numbered: string;
    align_left: string;
    align_center: string;
    align_right: string;
    insert_link: string;
    format: string;
    paragraph: string;
    heading1: string;
    heading2: string;
    heading3: string;
    link_prompt: string;
  };
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const istyping = useRef(false);

  useEffect(() => {
    // Only update innerHTML if it doesn't match and we aren't actively typing
    if (editorRef.current && editorRef.current.innerHTML !== content) {
        if (!istyping.current) {
            editorRef.current.innerHTML = content;
        }
    }
  }, [content]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      handleInput();
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      istyping.current = true;
      onChange(editorRef.current.innerHTML);
      // Reset typing flag
      setTimeout(() => istyping.current = false, 100);
    }
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', tooltip: labels.bold },
    { icon: Italic, command: 'italic', tooltip: labels.italic },
    { icon: Underline, command: 'underline', tooltip: labels.underline },
    { type: 'separator' },
    { icon: List, command: 'insertUnorderedList', tooltip: labels.bullets },
    { icon: ListOrdered, command: 'insertOrderedList', tooltip: labels.numbered },
    { type: 'separator' },
    { icon: AlignLeft, command: 'justifyLeft', tooltip: labels.align_left },
    { icon: AlignCenter, command: 'justifyCenter', tooltip: labels.align_center },
    { icon: AlignRight, command: 'justifyRight', tooltip: labels.align_right },
    { type: 'separator' },
    { icon: Link, command: 'createLink', tooltip: labels.insert_link, needsValue: true },
  ];

  const handleLinkClick = () => {
    const url = prompt(labels.link_prompt);
    if (url) {
      execCommand('createLink', url);
    }
  };

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 flex-wrap">
        {toolbarButtons.map((btn, index) => {
          if (btn.type === 'separator') {
            return <div key={index} className="w-px h-6 bg-gray-300 mx-1" />;
          }
          const Icon = btn.icon!;
          return (
            <button
              key={index}
              type="button"
              onClick={() => btn.needsValue ? handleLinkClick() : execCommand(btn.command!)}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title={btn.tooltip}
            >
              <Icon size={16} className="text-gray-600" />
            </button>
          );
        })}

        {/* Sélecteur de titre */}
        <select 
          onChange={(e) => execCommand('formatBlock', e.target.value)}
          className="ml-2 p-1.5 text-sm border border-gray-200 rounded bg-white outline-none focus:border-[#0D7BFF]"
          defaultValue=""
        >
          <option value="" disabled>{labels.format}</option>
          <option value="p">{labels.paragraph}</option>
          <option value="h1">{labels.heading1}</option>
          <option value="h2">{labels.heading2}</option>
          <option value="h3">{labels.heading3}</option>
        </select>
      </div>

      {/* Zone d'édition */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[400px] p-4 outline-none prose prose-sm max-w-none focus:bg-gray-50/20 transition-colors"
        spellCheck={false}
      />
    </div>
  );
}

export default function LegalSettingsPage() {
  const t = useTranslations('LegalSettings');
  const locale = useLocale();
  const [selectedSlug, setSelectedSlug] = useState('about');
  const [selectedLang, setSelectedLang] = useState(locale);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [docExists, setDocExists] = useState(false);

  const docTypeKeyMap: Record<string, string> = {
    'about': 'about',
    'privacy-policy': 'privacy_policy',
    'terms-of-use': 'terms_of_use',
    'legal-notice': 'legal_notice',
  };

  const supportedLanguages = React.useMemo(() => (
    SUPPORTED_LANGUAGE_CODES.map((code) => ({
      code,
      label: t(`languages.${code}`),
    }))
  ), [t]);

  const docTypes = React.useMemo(() => (
    DOC_TYPE_SLUGS.map((slug) => ({
      slug,
      label: t(`doc_types.${docTypeKeyMap[slug]}`),
    }))
  ), [t]);

  const editorLabels = React.useMemo(() => ({
    bold: t('toolbar.bold'),
    italic: t('toolbar.italic'),
    underline: t('toolbar.underline'),
    bullets: t('toolbar.bullets'),
    numbered: t('toolbar.numbered'),
    align_left: t('toolbar.align_left'),
    align_center: t('toolbar.align_center'),
    align_right: t('toolbar.align_right'),
    insert_link: t('toolbar.insert_link'),
    format: t('toolbar.format'),
    paragraph: t('toolbar.paragraph'),
    heading1: t('toolbar.heading1'),
    heading2: t('toolbar.heading2'),
    heading3: t('toolbar.heading3'),
    link_prompt: t('toolbar.link_prompt'),
  }), [t]);

  useEffect(() => {
    const fetchDocument = async () => {
        setLoading(true);
        try {
            const response = await documentService.getBySlug(selectedSlug, selectedLang);
            if (response && response.data) {
                // If API returns a document, checks if the locale matches
                if (response.data.locale === selectedLang) {
                    setTitle(response.data.title || '');
                    setContent(response.data.content || '');
                    setDocExists(true);
                } else {
                    // Fallback logic: API returned default/other locale (e.g. FR when EN asked)
                    // We treat this as "Translation missing" but "Document exists" (conceptually)
                    // However, we clear fields to allow clean entry for new language
                    setTitle('');
                    setContent('');
                    // We set docExists to FALSE so our submit logic tries CREATE first, 
                    // and falls back to UPDATE if slug exists. 
                    // (Or strict TRUE if we trust PUT works on existing slug. 
                    // My previous submit logic handles the fallback, so FALSE is safer for UI feedback)
                    setDocExists(false); 
                }
            } else {
                setTitle('');
                setContent('');
                setDocExists(false);
            }
        } catch (error: any) {
            setTitle('');
            setContent('');
            setDocExists(false);
            if (error?.status !== 404) {
               console.error('Error fetching document', error);
            }
        } finally {
            setLoading(false);
        }
    };
    
    fetchDocument();
  }, [selectedSlug, selectedLang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload = {
        slug: selectedSlug,
        locale: selectedLang,
        title,
        content,
        is_active: true
    };

    try {
        if (docExists) {
            // Document/Translation found, simple update
            await documentService.update(selectedSlug, payload);
            toast.success(t('success.updated'));
        } else {
            // No document/translation found for this locale.
            // Try creation (POST). If defaults to 409/Error (slug exists), fallback to update (PUT)
            try {
                await documentService.create(payload);
                setDocExists(true);
                toast.success(t('success.created'));
            } catch (createError: any) {
                // Assuming 409 or 400 means "Slug already exists", so we add translation via PUT
                // You might want to check createError.status === 409 specifically if your API returns that
                console.warn('Creation failed, trying update (UPSERT) for translation...', createError);
                await documentService.update(selectedSlug, payload);
                setDocExists(true);
                toast.success(t('success.translation_added'));
            }
        }
    } catch (error) {
        console.error('Error saving document', error);
            toast.error(t('errors.save_failed'));
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="text-[#0D7BFF]" />
                {t('title')}
            </h1>
              <p className="text-gray-500 text-sm mt-1">{t('subtitle')}</p>
        </div>
        
        {/* Language Selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
            <Globe size={16} className="text-gray-400" />
            <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="text-sm font-medium bg-transparent border-none outline-none text-gray-700 cursor-pointer"
            >
              {supportedLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
            </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-gray-50/50 border-r border-gray-100 flex-shrink-0">
          <nav className="p-4 space-y-1">
            {docTypes.map((doc) => (
              <button
                key={doc.slug}
                onClick={() => setSelectedSlug(doc.slug)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  selectedSlug === doc.slug
                    ? 'bg-[#0D7BFF]/10 text-[#0D7BFF] shadow-sm ring-1 ring-[#0D7BFF]/20'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {doc.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col">
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin text-[#0D7BFF]" size={40} />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                    <div className="p-6 space-y-6 flex-1">
                        {/* Title Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('labels.title', { lang: selectedLang.toUpperCase() })}
                            </label>
                            <input 
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-[#0D7BFF] focus:ring-2 focus:ring-[#0D7BFF]/20 transition-all font-medium text-lg placeholder:font-normal"
                                placeholder={t('labels.title_placeholder', { title: docTypes.find(d => d.slug === selectedSlug)?.label || '' })}
                                required
                            />
                        </div>

                        {/* Editor */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('labels.content')}
                            </label>
                            <WysiwygEditor 
                                key={`${selectedSlug}-${selectedLang}`}
                                content={content}
                                onChange={setContent}
                                labels={editorLabels}
                            />
                            <p className="text-xs text-gray-400 mt-2 text-right">
                                {t('labels.content_count', { count: content.length })}
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex justify-between items-center mt-auto">
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${docExists ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className="text-xs text-gray-500">
                              {docExists ? t('status.existing') : t('status.draft')}
                            </span>
                        </div>
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className="bg-[#0D7BFF] text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#0a6ae0] transition-colors disabled:opacity-70 shadow-sm shadow-[#0D7BFF]/20"
                        >
                            {isSaving ? (
                                <>
                                <Loader2 size={18} className="animate-spin" />
                              {t('actions.saving')}
                                </>
                            ) : (
                                <>
                                <Save size={18} />
                              {docExists ? t('actions.update') : t('actions.create')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
}
