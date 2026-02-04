"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Save, Loader2, Bold, Italic, Underline, List, ListOrdered, Link, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

type TabType = 'about' | 'privacy' | 'terms';

// Composant éditeur WYSIWYG simple
function WysiwygEditor({ 
  content, 
  onChange 
}: { 
  content: string; 
  onChange: (content: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', tooltip: 'Gras' },
    { icon: Italic, command: 'italic', tooltip: 'Italique' },
    { icon: Underline, command: 'underline', tooltip: 'Souligné' },
    { type: 'separator' },
    { icon: List, command: 'insertUnorderedList', tooltip: 'Liste à puces' },
    { icon: ListOrdered, command: 'insertOrderedList', tooltip: 'Liste numérotée' },
    { type: 'separator' },
    { icon: AlignLeft, command: 'justifyLeft', tooltip: 'Aligner à gauche' },
    { icon: AlignCenter, command: 'justifyCenter', tooltip: 'Centrer' },
    { icon: AlignRight, command: 'justifyRight', tooltip: 'Aligner à droite' },
    { type: 'separator' },
    { icon: Link, command: 'createLink', tooltip: 'Insérer un lien', needsValue: true },
  ];

  const handleLinkClick = () => {
    const url = prompt('Entrez l\'URL du lien:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden">
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
          className="ml-2 p-1.5 text-sm border border-gray-200 rounded bg-white"
          defaultValue=""
        >
          <option value="" disabled>Format</option>
          <option value="p">Paragraphe</option>
          <option value="h1">Titre 1</option>
          <option value="h2">Titre 2</option>
          <option value="h3">Titre 3</option>
        </select>
      </div>

      {/* Zone d'édition */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[300px] p-4 outline-none prose prose-sm max-w-none"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
}

export default function LegalSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [isLoading, setIsLoading] = useState(false);
  const [contents, setContents] = useState({
    about: `<h2>À propos de SimintBot</h2>
<p>SimintBot est une plateforme innovante de simulation d'entretiens d'embauche utilisant l'intelligence artificielle.</p>
<p>Notre mission est d'aider les candidats à préparer leurs entretiens de manière efficace et réaliste.</p>
<h3>Notre équipe</h3>
<p>Nous sommes une équipe passionnée de développeurs, designers et experts RH.</p>`,
    privacy: `<h2>Politique de Confidentialité</h2>
<p>Dernière mise à jour : Février 2026</p>
<h3>1. Collecte des données</h3>
<p>Nous collectons les informations que vous nous fournissez directement...</p>
<h3>2. Utilisation des données</h3>
<p>Vos données sont utilisées pour améliorer votre expérience...</p>`,
    terms: `<h2>Conditions Générales d'Utilisation</h2>
<p>Dernière mise à jour : Février 2026</p>
<h3>1. Acceptation des conditions</h3>
<p>En utilisant SimintBot, vous acceptez les présentes conditions...</p>
<h3>2. Description du service</h3>
<p>SimintBot propose des simulations d'entretiens d'embauche...</p>`,
  });

  const tabs = [
    { id: 'about' as TabType, label: 'À propos' },
    { id: 'privacy' as TabType, label: 'Politique de confidentialité' },
    { id: 'terms' as TabType, label: 'Conditions générales' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulation sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    // TODO: Afficher toast de succès
  };

  const handleContentChange = (newContent: string) => {
    setContents({ ...contents, [activeTab]: newContent });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Informations Légales</h1>
        <p className="text-gray-500 text-sm mt-1">Modifiez les contenus légaux de la plateforme</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {/* Tabs */}
        <div className="border-b border-gray-100">
          <nav className="flex gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#0D7BFF] text-[#0D7BFF]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <WysiwygEditor 
              content={contents[activeTab]}
              onChange={handleContentChange}
            />
          </div>

          {/* Footer avec bouton */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
            <p className="text-xs text-gray-400">
              Les modifications seront visibles immédiatement sur le site
            </p>
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
