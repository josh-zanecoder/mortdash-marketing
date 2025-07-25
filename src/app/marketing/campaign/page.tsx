'use client'
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Archive, Eye, X } from 'lucide-react';
import { useListsStore } from '@/store/listsStore';
import { useCampaignStore } from '@/store/useCampaignStore';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import { Suspense } from "react";

const templateFilters = [
  { label: 'All Templates', value: 'all' },
  { label: 'Holidays', value: 'holidays' },
  { label: 'DSCR', value: 'dscr' },
  { label: 'Others', value: 'others' },
];

function CampaignPageContent() {
  const [selectedList, setSelectedList] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const lists = useListsStore((state) => state.lists);
  const setLists = useListsStore((state) => state.setLists);
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token');
  const [previewData, setPreviewData] = useState<{
    id?: number;
    to?: string;
    from?: string;
    subject?: string;
    html?: string;
    template?: number;  // Add template to the interface
  } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const router = useRouter();
  // Campaign templates store
  const { templates, loading: templatesLoading, fetchTemplates, clearTemplates } = useCampaignStore();

  // Clear templates when component unmounts or when selectedList changes to empty
  useEffect(() => {
    if (!selectedList) {
      clearTemplates();
    }
    return () => {
      clearTemplates(); // Clear templates on unmount
    };
  }, [selectedList, clearTemplates]);

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
    const list = lists.find(l => String(l.id) === String(selectedList));
    const audience_type_id = list?.audience_type_id || null;
    fetchTemplates(audience_type_id, false);
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
      console.log('Preview template data:', data);
      setPreviewData({
        ...data,
        template: tpl.id // Store the template ID from tpl
      });
    } catch (err) {
      console.error('Preview error:', err);
      setPreviewData({ html: '<div>Error loading preview</div>' });
    } finally {
      setPreviewLoading(false);
    }
  };

  // Send handler for preview modal
  const handleSend = async () => {
    if (!previewData || !selectedList) return;
    
    // Get the selected list details
    const list = lists.find(l => String(l.id) === String(selectedList));
    if (!list) return;

    // Ensure we have required data
    if (!previewData.template) {
      toast.error('Template ID is missing');
      return;
    }

    const payload = {
      template: previewData.template,
      marketing_list_id: selectedList,
      recipient_type: 'list',
      status: 'pending',
      is_schedule: false,
      scheduled_at: null,
      subject: previewData.subject || 'Marketing Campaign',
      individual_audience: [],
      preview_parameters: {
        sender_id: null,
      }
    };

    // Show loading toast
    const loadingToast = toast.loading('Sending campaign...');

    try {
      const response = await fetch('/api/campaign/send-marketing-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send campaign');
      }

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Campaign sent successfully!', {
        description: 'Your email campaign is now being processed.',
        duration: 5000,
      });

      // Close modal
      setPreviewOpen(false);
    } catch (err) {
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      toast.error('Failed to send campaign', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        duration: 5000,
      });
      console.error('Failed to send campaign:', err);
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
    <>
      <Toaster richColors position="top-right" />
      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setPreviewOpen(false)} />
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header Row */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 md:px-8 py-4 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
              <div className="text-lg sm:text-xl font-semibold text-gray-900">Template Preview</div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleSend}
                  className="bg-[#ff6600] hover:bg-[#ff7a2f] text-white px-3 sm:px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all text-sm sm:text-base font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Send
                </button>
                <button 
                  onClick={() => setPreviewOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close preview"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* To/From/Subject Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6 md:p-8 bg-gray-50 border-b">
              <div className="space-y-1.5">
                <span className="text-xs uppercase tracking-wider font-bold text-gray-500">To:</span>
                <span className="block text-sm font-medium text-gray-900 truncate hover:text-clip">{previewData?.to || '-'}</span>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs uppercase tracking-wider font-bold text-gray-500">From:</span>
                <span className="block text-sm font-medium text-gray-900 truncate hover:text-clip">{previewData?.from || '-'}</span>
              </div>
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <span className="text-xs uppercase tracking-wider font-bold text-gray-500">Subject:</span>
                <span className="block text-sm font-medium text-gray-900 truncate hover:text-clip">{previewData?.subject || '-'}</span>
              </div>
            </div>

            {/* HTML Preview */}
            <div className="relative overflow-auto bg-[#fcf7f2]" style={{ height: 'calc(100vh - 16rem)' }}>
              {previewLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-[#ff6600]/30 border-t-[#ff6600] rounded-full animate-spin" />
                    <span className="text-sm text-gray-500 font-medium">Loading preview...</span>
                  </div>
                </div>
              ) : (
                <div
                  className="p-4 sm:p-6 md:p-8"
                  style={{ fontFamily: 'Montserrat, Arial, sans-serif' }}
                  dangerouslySetInnerHTML={{ __html: previewData?.html || '' }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="min-h-screen bg-gradient-to-b from-[#fdf6f1] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Page Header */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Email Templates</h1>
            <p className="mt-2 text-gray-600">Create and manage your email marketing templates</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            {/* Marketing List Selector */}
            <div className="p-6 sm:p-8 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="flex-1 max-w-md">
                  <label className="block font-medium text-sm text-gray-700 mb-2">Marketing List</label>
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
                  className="cursor-pointer shrink-0 px-4 py-2.5 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff7a2f] shadow-sm hover:shadow transition-all flex items-center gap-2 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Template
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="p-6 sm:p-8 bg-gray-50 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
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
                <div className="flex flex-wrap gap-2">
                  {templateFilters.map(f => (
                    <button
                      key={f.value}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {templatesLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[4/3] bg-gray-200 rounded-xl" />
                      <div className="mt-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : filteredTemplates.length === 0 ? (
                  <div className="col-span-full py-12 text-center">
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
                            className="bg-white text-gray-900 px-6 py-2.5 rounded-lg font-medium transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2"
                          >
                            <Eye className="w-5 h-5" />
                            Preview
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-2 truncate">{tpl.name}</h3>
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
          </div>
        </div>
      </main>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CampaignPageContent />
    </Suspense>
  );
} 