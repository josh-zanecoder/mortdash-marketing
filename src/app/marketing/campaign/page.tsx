'use client'
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Archive, Eye, X } from 'lucide-react';
import { useListsStore } from '@/store/listsStore';
import { useCampaignStore } from '@/store/useCampaignStore';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

const templateFilters = [
  { label: 'All Templates', value: 'all' },
  { label: 'Holidays', value: 'holidays' },
  { label: 'DSCR', value: 'dscr' },
  { label: 'Others', value: 'others' },
];

export default function CampaignPage() {
  const [selectedList, setSelectedList] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const lists = useListsStore((state) => state.lists);
  const setLists = useListsStore((state) => state.setLists);
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token');
  const [previewData, setPreviewData] = useState<{ to?: string; from?: string; subject?: string; html?: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const router = useRouter();
  // Campaign templates store
  const { templates, loading: templatesLoading, fetchTemplates } = useCampaignStore();

  useEffect(() => {
    const fetchLists = async () => {
      if (!tokenParam) return;
      setLoading(true);
      try {
        const res = await axios.get(`/api/marketing/lists/${tokenParam}`);
        setLists(res.data.data);
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    fetchLists();
  }, [tokenParam, setLists]);

  // Fetch templates when a list is selected
  useEffect(() => {
    if (!selectedList) return;
    const list = lists.find(l => String(l.id) === String(selectedList));
    if (list && list.audience_type_id) {
      fetchTemplates(list.audience_type_id, false);
    }
  }, [selectedList, lists, fetchTemplates]);

  // Filter templates by search, filter, and is_archived === 0
  const filteredTemplates = templates
    .filter((tpl) => tpl.is_archived === 0)
    .filter((tpl) => {
      const matchesFilter = activeFilter === 'all' || tpl.category === activeFilter;
      const matchesSearch = tpl.name?.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });

  // Helper to fetch and show preview
  const handlePreview = async (tpl: any) => {
    setPreviewLoading(true);
    setPreviewData(null);
    setPreviewOpen(true);
    try {
      const marketing_list_id = selectedList;
      const res = await fetch(
        `/api/campaign/get-email-template-content?id=${tpl.id}&marketing_list_id=${marketing_list_id}`
      );
      const data = await res.json();
      setPreviewData(data);
    } catch (err) {
      setPreviewData({ html: '<div>Error loading preview</div>' });
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (previewOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [previewOpen]);

  return (
    <main className="min-h-screen bg-[#fdf6f1] flex flex-col items-center py-8 px-4">
      {/* Page Header */}
      <div className="w-full max-w-6xl mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Templates</h1>
        <p className="text-gray-600">Create and manage your email marketing templates</p>
      </div>

      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
        {/* Marketing List Selector */}
        <div className="w-full flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div className="flex-1 max-w-md">
            <label className="block font-semibold text-sm text-gray-700 mb-2">Marketing List</label>
            <select
              className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6600]/30 bg-white disabled:bg-gray-50"
              value={selectedList}
              onChange={e => setSelectedList(e.target.value)}
              disabled={loading}
            >
              <option value="">Select a marketing list</option>
              {lists.map(list => (
                <option key={list.id} value={list.id}>{list.list_name}</option>
              ))}
            </select>
          </div>
          <button 
          onClick={() => router.push('/email-builder')}
          className="cursor-pointer px-4 py-2.5 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff7a2f] transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Template
          </button>
        </div>

        {/* Search and Filters */}
        <div className="w-full bg-gray-50 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#ff6600]/30"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex gap-2">
              {templateFilters.map(f => (
                <button
                  key={f.value}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeFilter === f.value
                      ? 'bg-[#ff6600] text-white shadow-sm' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templatesLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-t-xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : filteredTemplates.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No templates found</div>
              <div className="text-gray-500 text-sm">Try adjusting your search or filters</div>
            </div>
          ) : (
            filteredTemplates.map(tpl => (
              <div
                key={tpl.id}
                className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] bg-gray-50">
                  <img 
                    src={tpl.thumbnail} 
                    alt={tpl.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handlePreview(tpl)}
                      className="cursor-pointer bg-white text-gray-900 px-6 py-2.5 rounded-lg font-semibold transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2"
                    >
                      <Eye className="w-5 h-5" />
                      Preview
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 truncate">{tpl.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(tpl.date_created).toLocaleDateString()}
                    </div>
                    <button className="text-[#ff6600] hover:text-[#ff7a2f] p-1 rounded-full hover:bg-[#ff6600]/5 transition-colors">
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-3xl w-full mx-4 overflow-hidden">
            {/* Header Row */}
            <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b bg-white">
              <div className="text-2xl font-bold text-gray-900">Template Preview</div>
              <div className="flex items-center gap-2">
                <button className="bg-[#ff6600] hover:bg-[#ff7a2f] text-white font-semibold px-5 py-2 rounded-lg shadow transition-all text-base flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Send
                </button>
                <button className="bg-black hover:bg-gray-800 text-white font-semibold px-5 py-2 rounded-lg shadow transition-all text-base flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17V13a4 4 0 00-8 0v4M12 19v2m-6-6h12" /></svg>
                  Send for Later
                </button>
                <button
                  className="ml-2 text-gray-400 hover:text-[#ff6600] bg-white rounded-full p-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#ff6600]"
                  onClick={() => setPreviewOpen(false)}
                  aria-label="Close preview"
                >
                  <X size={28} />
                </button>
              </div>
            </div>
            {/* To/From/Subject Row */}
            <div className="flex flex-wrap items-center gap-6 px-8 py-4 bg-gray-50 border-b">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-semibold">To:</span>
                <span className="text-sm text-gray-800">{previewData?.to || '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-semibold">From:</span>
                <span className="text-sm text-gray-800">{previewData?.from || '-'}</span>
              </div>
              <div className="flex flex-col flex-1 min-w-[180px]">
                <span className="text-xs text-gray-500 font-semibold">Subject:</span>
                <span className="text-sm text-gray-800">{previewData?.subject || '-'}</span>
              </div>
            </div>
            {/* HTML Preview */}
            <div className="px-8 py-8 bg-[#fcf7f2] min-h-[400px] max-h-[70vh] overflow-auto">
              {previewLoading ? (
                <div className="text-center py-12 text-lg text-gray-400">Loading preview...</div>
              ) : (
                <div
                  className="w-full"
                  style={{ fontFamily: 'Montserrat, Arial, sans-serif' }}
                  dangerouslySetInnerHTML={{ __html: previewData?.html || '' }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 