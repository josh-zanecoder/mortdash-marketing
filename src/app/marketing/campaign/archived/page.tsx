'use client'
import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Archive, Eye, X, Plus, Search, ChevronDown, ArrowLeft } from 'lucide-react';
import { useListsStore } from '@/store/listsStore';
import { useCampaignStore } from '@/store/useCampaignStore';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import { Suspense } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
};

const pageTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 40
};

interface MarketingListOption {
  id: number | string;
  list_name: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: MarketingListOption[];
  disabled?: boolean;
  placeholder?: string;
}

function SearchableSelect({ 
  value, 
  onChange, 
  options, 
  disabled = false, 
  placeholder = "Search marketing lists..." 
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(option => 
    option.list_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => String(opt.id) === String(value));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`flex items-center justify-between w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-white cursor-pointer ${
          disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-300'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex-1 truncate">
          {selectedOption ? selectedOption.list_name : 'Select a marketing list'}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                className="w-full pl-9 pr-4 py-2 text-[15px] border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6600]/20"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">No results found</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={`px-4 py-2.5 text-[15px] cursor-pointer transition-colors ${
                    String(value) === String(option.id)
                      ? 'bg-[#ff6600]/5 text-[#ff6600]'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  onClick={() => {
                    onChange(String(option.id));
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  {option.list_name}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ArchivedTemplatesPageContent() {
  const [selectedList, setSelectedList] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [archivedTemplates, setArchivedTemplates] = useState<any[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
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
    template?: number;
  } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const router = useRouter();
  const [categories, setCategories] = useState<{ 
    id: number; 
    slug: string; 
    name: string; 
    created_at: string; 
    updated_at: string; 
  }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [archivingTemplate, setArchivingTemplate] = useState<number | null>(null);

  // Fetch lists on mount
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

  // Fetch categories on mount
  useEffect(() => {
    setCategoriesLoading(true);
    fetch('/api/campaign/get-email-categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          setCategories([]);
        }
      })
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  // Fetch archived templates on mount
  useEffect(() => {
    const fetchArchivedTemplates = async () => {
      setTemplatesLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('is_archived', '1');
        
        const url = tokenParam 
          ? `/api/campaign/get-archived-templates?${params.toString()}&token=${tokenParam}`
          : `/api/campaign/get-archived-templates?${params.toString()}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          setArchivedTemplates(data.data || []);
        } else {
          setArchivedTemplates([]);
        }
      } catch (error) {
        console.error('Error fetching archived templates:', error);
        setArchivedTemplates([]);
      } finally {
        setTemplatesLoading(false);
      }
    };

    fetchArchivedTemplates();
  }, [tokenParam]);

  // Filter templates by search and category
  const filteredTemplates = archivedTemplates
    .filter((tpl) => {
      const matchesFilter = activeFilter === 'all' || tpl.email_template_category_id === activeFilter;
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
  
      setPreviewData({
        ...data,
        template: tpl.id
      });
    } catch (err) {
      console.error('Preview error:', err);
      setPreviewData({ html: '<div>Error loading preview</div>' });
    } finally {
      setPreviewLoading(false);
    }
  };

  // Send handler for preview modal
  const handleSend = async (isScheduled = false, scheduledDateTime: string | null = null) => {
    if (!previewData || !selectedList) return;
    
    const list = lists.find(l => String(l.id) === String(selectedList));
    if (!list) return;

    if (!previewData.template) {
      toast.error('Template ID is missing');
      return;
    }

    if (isScheduled && scheduledDateTime) {
      const scheduledDate = new Date(scheduledDateTime);
      const now = new Date();
      if (scheduledDate <= now) {
        toast.error('Scheduled date must be in the future');
        return;
      }
    }

    const payload = {
      template: previewData.template,
      marketing_list_id: selectedList,
      recipient_type: 'marketing_list',
      schedule_at: scheduledDateTime,
      time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      subject: previewData.subject || 'Marketing Campaign',
      individual_audience: [],
      preview_parameters: {
        sender_id: null,
      }
    };

    const loadingToast = toast.loading(isScheduled ? 'Scheduling campaign...' : 'Sending campaign...');

    try {
      const endpoint = isScheduled ? '/api/campaign/send-later-marketing-email' : '/api/campaign/send-marketing-email';
      const url = tokenParam ? `${endpoint}?token=${tokenParam}` : endpoint;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isScheduled ? 'schedule' : 'send'} campaign`);
      }

      toast.dismiss(loadingToast);
      toast.success(isScheduled ? 'Campaign scheduled successfully!' : 'Campaign sent successfully!', {
        description: isScheduled 
          ? 'Your email campaign has been scheduled for later delivery.'
          : 'Your email campaign is now being processed.',
        duration: 5000,
      });

      setPreviewOpen(false);
      setScheduleModalOpen(false);
      setScheduledDate('');
      setScheduledTime('');
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(`Failed to ${isScheduled ? 'schedule' : 'send'} campaign`, {
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        duration: 5000,
      });
      console.error(`Failed to ${isScheduled ? 'schedule' : 'send'} campaign:`, err);
    }
  };

  // Schedule handler
  const handleSchedule = () => {
    setScheduleModalOpen(true);
  };

  // Handle schedule submission
  const handleScheduleSubmit = () => {
    if (!scheduledDate || !scheduledTime) {
      toast.error('Please select both date and time');
      return;
    }

    const scheduledDateTime = `${scheduledDate}T${scheduledTime}`;
    handleSend(true, scheduledDateTime);
  };

  // Archive/Unarchive handler
  const handleArchive = async (templateId: number, isCurrentlyArchived: boolean) => {
    setArchivingTemplate(templateId);
    try {
      const url = tokenParam ? `/api/campaign/archive?token=${tokenParam}` : '/api/campaign/archive';
      const payload = {
        id: templateId,
        archive: Boolean(!isCurrentlyArchived)
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to archive template');
      }

      // Refresh archived templates
      const params = new URLSearchParams();
      params.append('is_archived', '1');
      
      const refreshUrl = tokenParam 
        ? `/api/campaign/get-archived-templates?${params.toString()}&token=${tokenParam}`
        : `/api/campaign/get-archived-templates?${params.toString()}`;
      
      const refreshResponse = await fetch(refreshUrl);
      const refreshData = await refreshResponse.json();
      
      if (refreshData.success) {
        setArchivedTemplates(refreshData.data || []);
      }

      toast.success(
        isCurrentlyArchived 
          ? 'Template unarchived successfully!' 
          : 'Template archived successfully!'
      );
    } catch (error) {
      console.error('Archive error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to archive template'
      );
    } finally {
      setArchivingTemplate(null);
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
                  onClick={() => handleSend(false)}
                  className="cursor-pointer bg-[#ff6600] hover:bg-[#ff7a2f] text-white px-3 sm:px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all text-sm sm:text-base font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                  Send
                </button>
                <button 
                  onClick={handleSchedule}
                  className="cursor-pointer bg-white hover:bg-gray-50 text-[#ff6600] border border-[#ff6600] px-3 sm:px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all text-sm sm:text-base font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Schedule
                </button>
                <button 
                  onClick={() => setPreviewOpen(false)}
                  className="cursor-pointer text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
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

      {/* Schedule Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setScheduleModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
              <div className="text-lg font-semibold text-gray-900">Schedule Campaign</div>
              <button 
                onClick={() => setScheduleModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close schedule modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#ff6600]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-[#ff6600]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Schedule for Later</h3>
                <p className="text-sm text-gray-600">Choose when you want your campaign to be sent</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600]/20 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setScheduleModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleSubmit}
                  className="flex-1 px-4 py-2.5 bg-[#ff6600] hover:bg-[#ff7a2f] text-white rounded-lg font-medium transition-colors"
                >
                  Schedule Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="min-h-screen bg-[#fdf6f1]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <motion.div 
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => {
                  const token = tokenParam;
                  const url = token ? `/marketing/campaign?token=${token}` : '/marketing/campaign';
                  router.push(url);
                }}
                className="flex items-center gap-2 text-[#ff6600] hover:text-[#ff7a2f] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-[15px] font-medium">Back to Campaigns</span>
              </button>
            </div>
            <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-[-0.02em] mb-1">
              Archived Templates
            </h1>
            <p className="text-[15px] text-[#666666]">
              View and manage your archived email templates
            </p>
          </motion.div>

          <motion.div 
            layout
            transition={pageTransition}
            className="relative"
          >
                              <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >

                {/* Archived Templates Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100"
                >
                  {/* Templates Header */}
                  <motion.div 
                    layout="position"
                    className="p-6 border-b border-gray-100"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-[#ff6600]/10 rounded-full flex items-center justify-center">
                        <Archive className="w-4 h-4 text-[#ff6600]" />
                      </div>
                      <h2 className="text-xl font-semibold text-[#1a1a1a]">Archived Templates</h2>
                    </div>
                    <p className="text-[15px] text-[#666666]">View and restore your archived email templates</p>
                  </motion.div>

                  {/* Search and Filters */}
                  <motion.div 
                    layout="position"
                    className="p-6 border-b border-gray-100"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="relative flex-1 max-w-2xl">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search archived templates..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff6600]/20 text-[15px]"
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className={`cursor-pointer px-4 py-2 rounded-lg text-[15px] font-medium transition-colors ${
                            activeFilter === 'all'
                              ? 'bg-[#ff6600] text-white' 
                              : 'bg-gray-50 text-[#666666] hover:bg-gray-100'
                          }`}
                          onClick={() => setActiveFilter('all')}
                        >
                          All Archived
                        </button>
                        {categoriesLoading && (
                          <span className="px-4 py-2 text-[15px] text-gray-400">Loading...</span>
                        )}
                        {!categoriesLoading && categories.map(cat => (
                          <button
                            key={cat.id}
                            className={`cursor-pointer px-4 py-2 rounded-lg text-[15px] font-medium transition-colors ${
                              activeFilter === cat.id
                                ? 'bg-[#ff6600] text-white' 
                                : 'bg-gray-50 text-[#666666] hover:bg-gray-100'
                            }`}
                            onClick={() => setActiveFilter(cat.id)}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Templates Grid */}
                  <motion.div 
                    layout="position"
                    className="p-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {templatesLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="animate-pulse"
                          >
                            <div className="aspect-[4/3] bg-gray-100 rounded-xl" />
                            <div className="mt-4 space-y-2">
                              <div className="h-4 bg-gray-100 rounded w-3/4" />
                              <div className="h-4 bg-gray-100 rounded w-1/2" />
                            </div>
                          </motion.div>
                        ))
                      ) : filteredTemplates.length === 0 ? (
                        <motion.div 
                          initial={fadeIn.initial}
                          animate={fadeIn.animate}
                          className="col-span-full py-12 text-center"
                        >
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Archive className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="text-[#666666] text-lg mb-2">No archived templates found</div>
                          <div className="text-[#999999] text-[15px]">Try adjusting your search or filters</div>
                        </motion.div>
                      ) : (
                        filteredTemplates.map((tpl, index) => (
                          <motion.div
                            key={tpl.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              delay: index * 0.1,
                              duration: 0.3,
                              ease: "easeOut"
                            }}
                            className="group rounded-xl border border-gray-100 overflow-hidden bg-white transition-all duration-300 hover:shadow-lg"
                          >
                            <div className="relative aspect-[4/3] bg-gray-50">
                              <img 
                                src={tpl.thumbnail} 
                                alt={tpl.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                <button
                                  onClick={() => handlePreview(tpl)}
                                  className="cursor-pointer bg-white text-[#1a1a1a] px-6 py-2.5 rounded-lg font-medium transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 hover:bg-gray-50"
                                >
                                  <Eye className="w-5 h-5" />
                                  Preview
                                </button>
                              </div>
                              <div className="absolute top-2 left-2">
                                <div className="bg-[#ff6600] text-white text-xs px-2 py-1 rounded-full font-medium">
                                  Archived
                                </div>
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="font-medium text-[#1a1a1a] mb-2 truncate">{tpl.name}</h3>
                              <div className="flex items-center justify-between">
                                <div className="text-[13px] text-[#666666]">
                                  {new Date(tpl.date_created).toLocaleDateString()}
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleArchive(tpl.id, tpl.is_archived_by_user);
                                  }}
                                  disabled={archivingTemplate === tpl.id}
                                  className="cursor-pointer text-[#ff6600] hover:text-[#ff7a2f] p-1.5 rounded-full hover:bg-[#ff6600]/5 transition-colors"
                                  title="Restore template"
                                >
                                  {archivingTemplate === tpl.id ? (
                                    <div className="w-4 h-4 border-2 border-[#ff6600]/30 border-t-[#ff6600] rounded-full animate-spin" />
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
          </motion.div>
        </div>
      </main>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ArchivedTemplatesPageContent />
    </Suspense>
  );
} 