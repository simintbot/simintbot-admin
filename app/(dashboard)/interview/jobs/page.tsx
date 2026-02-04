"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, MoreVertical, Edit, Trash2, Eye, X, ChevronLeft, ChevronRight, Briefcase, Loader2 } from 'lucide-react';
import { jobService, JobSheet, JobSheetFormData, SECTORS, LANGUAGES } from '@/lib/services/job.service';

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingJob, setViewingJob] = useState<JobSheet | null>(null);
  const [editingJob, setEditingJob] = useState<JobSheet | null>(null);
  const [formData, setFormData] = useState<JobSheetFormData>({
    title: '',
    sector: 'Technologie',
    description: '',
    skills_required: [],
    missions: [],
    qualifications: '',
    salary_min: 0,
    salary_max: 0,
    currency: 'EUR',
    language: 'fr',
    is_template: false,
  });
  const [skillInput, setSkillInput] = useState('');
  const [missionInput, setMissionInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Charger les jobs
  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await jobService.getJobs({
        search: searchQuery || undefined,
        sector: sectorFilter !== 'all' ? sectorFilter : undefined,
      });
      setJobs(data);
    } catch (error) {
      console.error('Erreur lors du chargement des fiches métiers:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sectorFilter]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // Ouvrir modal création
  const openCreateModal = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      sector: 'Technologie',
      description: '',
      skills_required: [],
      missions: [],
      qualifications: '',
      salary_min: 0,
      salary_max: 0,
      currency: 'EUR',
      language: 'fr',
      is_template: false,
    });
    setIsModalOpen(true);
  };

  // Ouvrir modal édition
  const openEditModal = (job: JobSheet) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      sector: job.sector,
      description: job.description,
      skills_required: [...job.skills_required],
      missions: [...job.missions],
      qualifications: job.qualifications,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      currency: job.currency,
      language: job.language,
      is_template: job.is_template,
    });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  // Voir détails
  const viewJob = (job: JobSheet) => {
    setViewingJob(job);
    setOpenMenuId(null);
  };

  // Supprimer
  const handleDeleteJob = async (jobId: string) => {
    try {
      await jobService.deleteJob(jobId);
      setJobs(jobs.filter(j => j.id !== jobId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
    setOpenMenuId(null);
  };

  // Ajouter compétence
  const addSkill = () => {
    if (skillInput.trim() && !formData.skills_required.includes(skillInput.trim())) {
      setFormData({ ...formData, skills_required: [...formData.skills_required, skillInput.trim()] });
      setSkillInput('');
    }
  };

  // Supprimer compétence
  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills_required: formData.skills_required.filter(s => s !== skill) });
  };

  // Ajouter mission
  const addMission = () => {
    if (missionInput.trim() && !formData.missions.includes(missionInput.trim())) {
      setFormData({ ...formData, missions: [...formData.missions, missionInput.trim()] });
      setMissionInput('');
    }
  };

  // Supprimer mission
  const removeMission = (mission: string) => {
    setFormData({ ...formData, missions: formData.missions.filter(m => m !== mission) });
  };

  // Soumettre
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingJob) {
        const updated = await jobService.updateJob(editingJob.id, formData);
        setJobs(jobs.map(j => j.id === editingJob.id ? updated : j));
      } else {
        const newJob = await jobService.createJob(formData);
        setJobs([...jobs, newJob]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fiches Métiers</h1>
          <p className="text-gray-500 text-sm mt-1">{jobs.length} fiche(s) métier</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-[#0D7BFF] text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#0a6ae0] transition-colors"
        >
          <Plus size={18} /> Nouvelle fiche métier
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-2.5 gap-2">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher une fiche métier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm flex-1 text-gray-600"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select 
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="bg-gray-50 border-0 rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-[#0D7BFF]"
            >
              <option value="all">Tous les secteurs</option>
              {SECTORS.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#0D7BFF]" />
          </div>
        ) : (
          <>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Titre</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Secteur</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Salaire</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Langue</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Template</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucune fiche métier trouvée
                  </td>
                </tr>
              ) : (
              jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0D7BFF]/10 flex items-center justify-center">
                        <Briefcase size={18} className="text-[#0D7BFF]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{job.title}</p>
                        <p className="text-xs text-gray-500">{job.skills_required.slice(0, 3).join(', ')}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                      {job.sector}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()} {job.currency}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 uppercase">{job.language}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      job.is_template 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {job.is_template ? 'Oui' : 'Non'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === job.id ? null : job.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical size={16} className="text-gray-400" />
                      </button>
                      
                      {openMenuId === job.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                          <button 
                            onClick={() => viewJob(job)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 w-full"
                          >
                            <Eye size={14} /> Voir
                          </button>
                          <button 
                            onClick={() => openEditModal(job)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 w-full"
                          >
                            <Edit size={14} /> Modifier
                          </button>
                          <button 
                            onClick={() => handleDeleteJob(job.id)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                          >
                            <Trash2 size={14} /> Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Affichage de 1 à {jobs.length} sur {jobs.length} résultats
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1.5 bg-[#0D7BFF] text-white rounded-lg text-sm font-medium">1</button>
            <button className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50" disabled>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Modal Visualisation */}
      {viewingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-900">{viewingJob.title}</h2>
              <button 
                onClick={() => setViewingJob(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <span className="px-3 py-1 bg-[#0D7BFF]/10 text-[#0D7BFF] rounded-lg text-sm font-medium">
                  {viewingJob.sector}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{viewingJob.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Compétences requises</h4>
                <div className="flex flex-wrap gap-2">
                  {viewingJob.skills_required.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Missions</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {viewingJob.missions.map((mission, i) => (
                    <li key={i}>{mission}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Qualifications</h4>
                <p className="text-gray-600">{viewingJob.qualifications}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Salaire</p>
                  <p className="font-bold text-gray-900">
                    {viewingJob.salary_min.toLocaleString()} - {viewingJob.salary_max.toLocaleString()} {viewingJob.currency}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Langue</p>
                  <p className="font-bold text-gray-900">
                    {LANGUAGES.find(l => l.code === viewingJob.language)?.name || viewingJob.language}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Création/Édition */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-900">
                {editingJob ? 'Modifier la fiche métier' : 'Nouvelle fiche métier'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input 
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-[#0D7BFF]"
                    placeholder="Ex: Développeur Full Stack"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secteur</label>
                  <select 
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-[#0D7BFF]"
                  >
                    {SECTORS.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-[#0D7BFF] min-h-[100px]"
                  placeholder="Description du poste..."
                  required
                />
              </div>

              {/* Compétences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compétences requises</label>
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 p-3 border border-gray-300 rounded-xl outline-none focus:border-[#0D7BFF]"
                    placeholder="Ajouter une compétence"
                  />
                  <button 
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-[#0D7BFF] text-white rounded-xl hover:bg-[#0a6ae0]"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills_required.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-[#0D7BFF]/10 text-[#0D7BFF] rounded-lg text-sm flex items-center gap-1">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:text-[#0a6ae0]">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Missions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Missions</label>
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text"
                    value={missionInput}
                    onChange={(e) => setMissionInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMission())}
                    className="flex-1 p-3 border border-gray-300 rounded-xl outline-none focus:border-[#0D7BFF]"
                    placeholder="Ajouter une mission"
                  />
                  <button 
                    type="button"
                    onClick={addMission}
                    className="px-4 py-2 bg-[#0D7BFF] text-white rounded-xl hover:bg-[#0a6ae0]"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div className="space-y-1">
                  {formData.missions.map((mission, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <span className="flex-1 text-sm text-gray-700">{mission}</span>
                      <button type="button" onClick={() => removeMission(mission)} className="text-gray-400 hover:text-red-600">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
                <input 
                  type="text"
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-[#0D7BFF]"
                  placeholder="Ex: Bac+5 en informatique"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salaire min</label>
                  <input 
                    type="number"
                    value={formData.salary_min}
                    onChange={(e) => setFormData({ ...formData, salary_min: Number(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-[#0D7BFF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salaire max</label>
                  <input 
                    type="number"
                    value={formData.salary_max}
                    onChange={(e) => setFormData({ ...formData, salary_max: Number(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-[#0D7BFF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                  <select 
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-[#0D7BFF]"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
                  <select 
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-[#0D7BFF]"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={formData.is_template}
                      onChange={(e) => setFormData({ ...formData, is_template: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-[#0D7BFF] focus:ring-[#0D7BFF]"
                    />
                    <span className="text-sm font-medium text-gray-700">Template par défaut</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-[#0D7BFF] rounded-xl hover:bg-[#0a6ae0] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {editingJob ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
