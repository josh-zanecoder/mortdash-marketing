"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CreateCampaignModal from '@/components/CreateCampaignModal';
import ViewCampaignModal from '@/components/ViewCampaignModal';
import CampaignPreviewModal from '@/components/CampaignPreviewModal';
import CampaignRecipientsModal from '@/components/CampaignRecipientsModal';
import CampaignActionsModal from '@/components/CampaignActionsModal';
import CampaignBuilderModal from '@/components/CampaignBuilderModal';
import { useCampaignStore } from '@/store/campaignStore';
import { Plus, Send, Calendar, Copy, ChevronLeft, ChevronRight, Search, Users, Settings, Pause, Play, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

const statusBadgeStyles: Record<string, string> = {
  sending: 'bg-orange-50 text-orange-700 border border-orange-100',
  scheduled: 'bg-blue-50 text-blue-700 border border-blue-100',
  prepared: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
  draft: 'bg-slate-50 text-slate-700 border border-slate-100',
  completed: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  sent: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  canceled: 'bg-rose-50 text-rose-700 border border-rose-100',
};

const getStatusBadgeClass = (status: string) =>
  statusBadgeStyles[status.toLowerCase()] || 'bg-slate-50 text-slate-700 border border-slate-100';

function CampaignSendingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [marketingLists, setMarketingLists] = useState<any[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [createCampaignModalOpen, setCreateCampaignModalOpen] = useState(false);
  const [viewCampaignModalOpen, setViewCampaignModalOpen] = useState(false);
  const [previewCampaignModalOpen, setPreviewCampaignModalOpen] = useState(false);
  const [recipientsModalOpen, setRecipientsModalOpen] = useState(false);
  const [actionsModalOpen, setActionsModalOpen] = useState(false);
  const [builderModalOpen, setBuilderModalOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | number | null>(null);
  const [previewCampaignId, setPreviewCampaignId] = useState<string | number | null>(null);
  const [recipientsCampaignId, setRecipientsCampaignId] = useState<string | number | null>(null);
  const [recipientsCampaignStatus, setRecipientsCampaignStatus] = useState<string | null>(null);
  const [actionsCampaignId, setActionsCampaignId] = useState<string | number | null>(null);
  const [builderCampaignId, setBuilderCampaignId] = useState<string | number | null>(null);
  const [duplicatingCampaignId, setDuplicatingCampaignId] = useState<string | number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [queueStats, setQueueStats] = useState<any>(null);
  const [queueStatsLoading, setQueueStatsLoading] = useState(false);
  const [queueActionLoading, setQueueActionLoading] = useState(false);
  const [campaignTab, setCampaignTab] = useState<'all' | 'ongoing'>('all');
  const {
    campaigns,
    loading: campaignsLoading,
    pagination,
    fetchCampaigns,
    pauseCampaignQueue,
    resumeCampaignQueue,
    fetchQueueStats,
  } = useCampaignStore();

  // Load marketing lists when component mounts
  useEffect(() => {
    const loadLists = async () => {
      if (!token) {
        setLoadingLists(false);
        return;
      }

      try {
        setLoadingLists(true);
        const { default: axios } = await import('axios');
        const authHeaders = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-client-origin': window.location.origin,
          },
        };

        const listsRes = await axios.get(`/api/marketing-lists`, authHeaders).catch(() => ({ data: { data: [] } }));

        // Handle marketing lists response (camelCase format)
        if (listsRes.data?.success && Array.isArray(listsRes.data.data)) {
          setMarketingLists(listsRes.data.data);
        } else if (listsRes.data?.data && Array.isArray(listsRes.data.data)) {
          setMarketingLists(listsRes.data.data);
        }
      } catch (err: any) {
        console.error('Failed to load lists:', err);
      } finally {
        setLoadingLists(false);
      }
    };

    loadLists();
  }, [token]);

  // Fetch campaigns
  useEffect(() => {
    if (token) {
      fetchCampaigns(token, currentPage, limit);
      loadQueueStats();
    }
  }, [token, fetchCampaigns, currentPage, limit]);

  // Load queue stats
  const loadQueueStats = async () => {
    if (!token) return;
    try {
      setQueueStatsLoading(true);
      const stats = await fetchQueueStats(token);
      setQueueStats(stats);
    } catch (error) {
      console.error('Failed to load queue stats:', error);
    } finally {
      setQueueStatsLoading(false);
    }
  };

  // Handle queue pause/resume
  const handleQueuePause = async () => {
    if (!token) return;
    try {
      setQueueActionLoading(true);
      await pauseCampaignQueue(token);
      toast.success('Campaign queue paused successfully!');
      loadQueueStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to pause queue');
    } finally {
      setQueueActionLoading(false);
    }
  };

  const handleQueueResume = async () => {
    if (!token) return;
    try {
      setQueueActionLoading(true);
      await resumeCampaignQueue(token);
      toast.success('Campaign queue resumed successfully!');
      loadQueueStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to resume queue');
    } finally {
      setQueueActionLoading(false);
    }
  };

  // Handle duplicate campaign
  const handleDuplicateCampaign = async (campaignId: string | number, campaignName: string) => {
    if (!token) {
      toast.error('Token missing');
      return;
    }

    try {
      setDuplicatingCampaignId(campaignId);
      const { default: axios } = await import('axios');

      const res = await axios.post(
        `/api/campaigns/${campaignId}/duplicate`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-client-origin': window.location.origin,
          },
        }
      );

      if (res.data?.success || res.status === 200 || res.status === 201) {
        toast.success(`Campaign "${campaignName}" duplicated successfully!`);
        // Refetch campaigns after successful duplication
        if (token) {
          fetchCampaigns(token, currentPage, limit);
        }
      } else {
        throw new Error(res.data?.message || 'Failed to duplicate campaign');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to duplicate campaign';
      toast.error(errorMessage);
      console.error('Failed to duplicate campaign:', err);
    } finally {
      setDuplicatingCampaignId(null);
    }
  };

  if (loadingLists) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[#ff6600]/30 border-t-[#ff6600] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Create Campaign Modal */}
      <CreateCampaignModal
        open={createCampaignModalOpen}
        onClose={() => setCreateCampaignModalOpen(false)}
        onSuccess={() => {
          // Refetch campaigns after successful creation - go to page 1 to see the new campaign
          setCurrentPage(1);
          if (token) {
            fetchCampaigns(token, 1, limit);
          }
        }}
        token={token}
        marketingLists={marketingLists}
      />

      {/* View Campaign Modal */}
      <ViewCampaignModal
        open={viewCampaignModalOpen}
        onClose={() => {
          setViewCampaignModalOpen(false);
          setSelectedCampaignId(null);
        }}
        campaignId={selectedCampaignId}
        token={token}
      />

      {/* Preview Campaign Modal */}
      <CampaignPreviewModal
        open={previewCampaignModalOpen}
        onClose={() => {
          setPreviewCampaignModalOpen(false);
          setPreviewCampaignId(null);
        }}
        campaignId={previewCampaignId}
        token={token}
      />

      {/* Recipients Modal */}
      <CampaignRecipientsModal
        open={recipientsModalOpen}
        onClose={() => {
          setRecipientsModalOpen(false);
          setRecipientsCampaignId(null);
          setRecipientsCampaignStatus(null);
        }}
        campaignId={recipientsCampaignId}
        token={token}
        campaignStatus={recipientsCampaignStatus}
      />

      {/* Actions Modal */}
      <CampaignActionsModal
        open={actionsModalOpen}
        onClose={() => {
          setActionsModalOpen(false);
          setActionsCampaignId(null);
        }}
        campaignId={actionsCampaignId}
        token={token}
        onSuccess={() => {
          if (token) {
            fetchCampaigns(token, currentPage, limit);
          }
        }}
      />

      {/* Builder Modal */}
      <CampaignBuilderModal
        open={builderModalOpen}
        onClose={() => {
          setBuilderModalOpen(false);
          setBuilderCampaignId(null);
        }}
        campaignId={builderCampaignId}
      />

      {/* Main Content */}
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Marketing Campaigns</h1>
                <p className="text-slate-600 mt-1">Create and manage your email marketing campaigns</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {campaignTab === 'ongoing' && (
                <>
                  {/* Queue Stats */}
                  {queueStats && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-700 font-medium">
                        Queue: {queueStats.pending || 0} pending, {queueStats.processing || 0} processing
                      </span>
                    </div>
                  )}
                  {/* Queue Controls */}
                  <button
                    onClick={handleQueuePause}
                    disabled={queueActionLoading}
                    className="cursor-pointer bg-yellow-500 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-yellow-600 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Pause className="w-4 h-4" />
                    Pause Queue
                  </button>
                  <button
                    onClick={handleQueueResume}
                    disabled={queueActionLoading}
                    className="cursor-pointer bg-green-500 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-green-600 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    Resume Queue
                  </button>
                </>
              )}
            <button
              onClick={() => setCreateCampaignModalOpen(true)}
              className="cursor-pointer bg-[#ff6600] text-white rounded-lg px-5 py-2.5 font-medium hover:bg-[#ff7a2f] transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Campaign
            </button>
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
              <h2 className="text-xl font-semibold text-slate-800">All Campaigns</h2>
              <p className="text-sm text-slate-600 mt-1">View and manage all your marketing campaigns</p>
              </div>
              <div className="flex items-center justify-start md:justify-end gap-2 bg-slate-100 rounded-full p-1 w-max">
                {[
                  { key: 'all', label: 'All Campaigns' },
                  { key: 'ongoing', label: 'Ongoing Campaigns' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setCampaignTab(tab.key as 'all' | 'ongoing')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                      campaignTab === tab.key
                        ? 'bg-white text-[#ff6600] shadow-sm'
                        : 'text-slate-600 hover:text-[#ff6600]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6">
              {campaignsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#ff6600]/30 border-t-[#ff6600] rounded-full animate-spin" />
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-slate-700 text-lg mb-2 font-medium">No campaigns found</div>
                  <div className="text-slate-500 text-sm mb-6">Create your first marketing campaign to get started</div>
                  <button
                    onClick={() => setCreateCampaignModalOpen(true)}
                    className="cursor-pointer bg-[#ff6600] text-white rounded-lg px-5 py-2.5 font-medium hover:bg-[#ff7a2f] transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create Campaign
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
                        <th className="py-3 px-4 font-semibold text-left">Campaign</th>
                        <th className="py-3 px-4 font-semibold text-left">Marketing List</th>
                        <th className="py-3 px-4 font-semibold text-left">Status</th>
                        <th className="py-3 px-4 font-semibold text-left">Recipients</th>
                        <th className="py-3 px-4 font-semibold text-left">Created</th>
                        <th className="py-3 px-4 font-semibold text-left">Schedule</th>
                        <th className="py-3 px-4 font-semibold text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-700">
                      {campaigns
                        .filter((campaign) => {
                          if (campaignTab === 'all') return true;
                          const status = (campaign.campaignStatus || campaign.campaign_status || campaign.status || '').toLowerCase();
                          return status === 'sending';
                        })
                        .map((campaign) => {
                        const campaignName = campaign.name || 'Unnamed Campaign';
                        const marketingListName =
                          campaign.marketingList?.listName ||
                          campaign.listName ||
                          campaign.list_name ||
                          'N/A';
                        const statusValue = campaign.campaignStatus || campaign.campaign_status || campaign.status || 'Pending';
                        const recipientCount =
                          campaign.marketingList?.count ??
                          campaign.recipientCount ??
                          campaign.recipient_count ??
                          null;
                        const createdAt = campaign.createdAt || campaign.created_at;
                        const isScheduled = campaign.isScheduled || campaign.is_scheduled || false;
                        const scheduledAt = campaign.scheduledAt || campaign.scheduled_at;
                          const formattedCreated = createdAt ? new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : null;
                          const formattedScheduled = scheduledAt ? new Date(scheduledAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : null;

                        return (
                          <tr key={campaign.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                            <td className="py-4 px-4 text-slate-900">
                              <button
                                onClick={() => {
                                  setSelectedCampaignId(campaign.id);
                                  setViewCampaignModalOpen(true);
                                }}
                                className="cursor-pointer text-[#ff6600] hover:text-[#ff7a2f] hover:underline font-semibold transition-colors text-left"
                              >
                                {campaignName}
                              </button>
                              <p className="text-xs text-slate-500 mt-1">
                                Campaign #{campaign.id}
                              </p>
                            </td>
                            <td className="py-4 px-4 text-slate-600">
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
                                <Users className="w-3 h-3 text-slate-400" />
                                {marketingListName}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadgeClass(statusValue)}`}>
                                {statusValue}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-slate-600">
                              <button
                                onClick={() => {
                                  setRecipientsCampaignId(campaign.id);
                                  setRecipientsCampaignStatus(statusValue);
                                  setRecipientsModalOpen(true);
                                }}
                                className="cursor-pointer inline-flex items-center gap-2 text-[#ff6600] hover:text-[#ff7a2f] font-medium transition-colors"
                              >
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                                  <Users className="w-3 h-3" />
                                  {typeof recipientCount === 'number'
                                    ? recipientCount.toLocaleString()
                                    : 'N/A'}
                                </span>
                              </button>
                            </td>
                            <td className="py-4 px-4 text-slate-600">
                              {formattedCreated ? (
                                <div>
                                  <p className="font-medium text-slate-800">{formattedCreated}</p>
    
                                </div>
                              ) : (
                                'N/A'
                              )}
                            </td>
                            <td className="py-4 px-4 text-slate-600">
                              {isScheduled && formattedScheduled ? (
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium">
                                  <Calendar className="w-3 h-3" />
                                  {formattedScheduled}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-xs uppercase tracking-wide">Immediate</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  onClick={() => {
                                    setActionsCampaignId(campaign.id);
                                    setActionsModalOpen(true);
                                  }}
                                  className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#cc5200] bg-orange-50 hover:bg-orange-100 rounded-full transition-colors"
                                >
                                  <Settings className="w-4 h-4" />
                                  Actions
                                </button>
                                <button
                                  onClick={() => {
                                    setPreviewCampaignId(campaign.id);
                                    setPreviewCampaignModalOpen(true);
                                  }}
                                  className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-full transition-colors"
                                >
                                  <Search className="w-4 h-4" />
                                  Preview
                                </button>
                                <button
                                  onClick={() => handleDuplicateCampaign(campaign.id, campaignName)}
                                  disabled={duplicatingCampaignId === campaign.id}
                                  className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {duplicatingCampaignId === campaign.id ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                      Duplicating...
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-4 h-4" />
                                      Duplicate
                                    </>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                  <div className="text-sm text-slate-600">
                    Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, pagination.total)} of {pagination.total} campaigns
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={!pagination.hasPrevPage || campaignsLoading}
                      className="cursor-pointer inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            disabled={campaignsLoading}
                            className={`cursor-pointer px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              currentPage === pageNum
                                ? 'bg-[#ff6600] text-white'
                                : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                      disabled={!pagination.hasNextPage || campaignsLoading}
                      className="cursor-pointer inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function CampaignSendingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <CampaignSendingPageContent />
    </Suspense>
  );
}

