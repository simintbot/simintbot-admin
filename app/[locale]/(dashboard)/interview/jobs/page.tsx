"use client";
import React, { useState, useEffect } from 'react';
import { Search, Filter, Loader2, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import jobServices, { JobSheet } from '@/lib/services/job.service';
import toast from 'react-hot-toast';
import { useLocale, useTranslations } from 'next-intl';

export default function JobsPage() {
  const t = useTranslations('Jobs');
  const locale = useLocale();
  const [jobs, setJobs] = useState<JobSheet[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters
  const [sectorFilter, setSectorFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await jobServices.getAll({
        sector: sectorFilter || undefined,
        page: page,
        size: size
      });
      
      const { items, total, pages } = response.data;
      setJobs(items);
      setTotal(total);
      setTotalPages(pages);
      
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error(t('errors.load_failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, size, sectorFilter]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSectorFilter(e.target.value);
    setPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="text-[#0D7BFF]" />
            {t('title')}
          </h1>
          <p className="text-gray-500 mt-1">{t('subtitle')}</p>
        </div>
        
        {/* Bouton Ajouter caché pour le moment */}
        {/* <button className="flex items-center gap-2 bg-[#0D7BFF] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
          <Plus size={20} />
          <span>Créer une fiche</span>
        </button> */}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters Bar */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Search Input Filter - Could be added later if API supports it */}
            {/* 
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher un métier..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0D7BFF] focus:ring-2 focus:ring-[#0D7BFF]/20"
              />
            </div> 
            */}
            
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={18} />
              <input
                type="text"
                placeholder={t('filters.sector')}
                value={sectorFilter}
                onChange={(e) => {
                    setSectorFilter(e.target.value);
                    setPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0D7BFF]"
              />
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            {t('results', { count: total })}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.title')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.sector')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.salary')}</th>
                 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.qualification')}</th>
                 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.language')}</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.created_at')}</th>
                {/* Actions cachées pour le moment */}
                {/* <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Loader2 className="animate-spin mb-2" size={32} />
                      <p>{t('loading')}</p>
                    </div>
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {t('empty')}
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                      {job.is_template && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                          {t('badge.template')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {job.sector}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.salary_min} - {job.salary_max} {job.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.qualifications}
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                        {job.language}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {new Date(job.created_at).toLocaleDateString(locale)}
                    </td>
                    {/* Actions cachées */}
                    {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      ...
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-500">
              {t('pagination.range', {
                start: ((page - 1) * size) + 1,
                end: Math.min(page * size, total),
                total
              })}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`p-2 rounded-lg border ${
                  page === 1 
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                    : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = i + 1;
                  // Simple logic to show pages around current page could be added here
                  // For now showing first 5 or logic can be complex
                  // Let's keep it simple: just show current page number if many pages
                  return null; 
                })}
                  <span className="text-sm font-medium text-gray-700">
                    {t('pagination.page_of', { page, total: totalPages })}
                  </span>
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`p-2 rounded-lg border ${
                  page === totalPages 
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                    : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
