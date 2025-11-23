"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CreateCampaignModal from '@/components/CreateCampaignModal';
import EditCampaignModal from '@/components/EditCampaignModal';
import ViewCampaignModal from '@/components/ViewCampaignModal';
import CampaignPreviewModal from '@/components/CampaignPreviewModal';
import CampaignRecipientsModal from '@/components/CampaignRecipientsModal';
import CampaignActionsModal from '@/components/CampaignActionsModal';
import CampaignBuilderModal from '@/components/CampaignBuilderModal';
import DeleteCampaignDialog from '@/components/DeleteCampaignDialog';
import { useCampaignStore } from '@/store/campaignStore';
import { Plus, Send, Calendar, Copy, ChevronLeft, ChevronRight, Search, Users, Settings, Pause, Play, BarChart3, Edit2, Trash2, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const statusBadgeStyles: Record<string, string> = {
  sending: 'bg-orange-100 text-orange-700 border border-orange-200',
  scheduled: 'bg-blue-100 text-blue-700 border border-blue-200',
  prepared: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  draft: 'bg-slate-100 text-slate-700 border border-slate-200',
  completed: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  sent: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  canceled: 'bg-rose-100 text-rose-700 border border-rose-200',
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
  const [editCampaignModalOpen, setEditCampaignModalOpen] = useState(false);
  const [viewCampaignModalOpen, setViewCampaignModalOpen] = useState(false);
  const [previewCampaignModalOpen, setPreviewCampaignModalOpen] = useState(false);
  const [recipientsModalOpen, setRecipientsModalOpen] = useState(false);
  const [actionsModalOpen, setActionsModalOpen] = useState(false);
  const [builderModalOpen, setBuilderModalOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | number | null>(null);
  const [editCampaignId, setEditCampaignId] = useState<string | number | null>(null);
  const [previewCampaignId, setPreviewCampaignId] = useState<string | number | null>(null);
  const [recipientsCampaignId, setRecipientsCampaignId] = useState<string | number | null>(null);
  const [recipientsCampaignStatus, setRecipientsCampaignStatus] = useState<string | null>(null);
  const [actionsCampaignId, setActionsCampaignId] = useState<string | number | null>(null);
  const [builderCampaignId, setBuilderCampaignId] = useState<string | number | null>(null);
  const [duplicatingCampaignId, setDuplicatingCampaignId] = useState<string | number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCampaignId, setDeleteCampaignId] = useState<string | number | null>(null);
  const [deleteCampaignName, setDeleteCampaignName] = useState<string>('');
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | number | null>(null);
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
    deleteCampaign,
    removeCampaign,
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

  // Handle delete campaign
  const handleDeleteCampaign = (campaignId: string | number, campaignName: string) => {
    setDeleteCampaignId(campaignId);
    setDeleteCampaignName(campaignName);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCampaign = async () => {
    if (!deleteCampaignId || !token) {
      toast.error('Missing campaign ID or token');
      return;
    }

    try {
      setDeletingCampaignId(deleteCampaignId);
      await deleteCampaign(token, deleteCampaignId);
      removeCampaign(deleteCampaignId);
      toast.success(`Campaign "${deleteCampaignName}" deleted successfully!`);
      setDeleteDialogOpen(false);
      setDeleteCampaignId(null);
      setDeleteCampaignName('');
      // Refetch campaigns after successful deletion
      if (token) {
        fetchCampaigns(token, currentPage, limit);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete campaign';
      toast.error(errorMessage);
      console.error('Failed to delete campaign:', error);
    } finally {
      setDeletingCampaignId(null);
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

      {/* Edit Campaign Modal */}
      <EditCampaignModal
        open={editCampaignModalOpen}
        onClose={() => {
          setEditCampaignModalOpen(false);
          setEditCampaignId(null);
        }}
        onSuccess={() => {
          // Refetch campaigns after successful update
          if (token) {
            fetchCampaigns(token, currentPage, limit);
          }
        }}
        token={token}
        campaignId={editCampaignId}
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

      {/* Delete Campaign Dialog */}
      <DeleteCampaignDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteCampaignId(null);
          setDeleteCampaignName('');
        }}
        onConfirm={confirmDeleteCampaign}
        campaignName={deleteCampaignName}
      />

      {/* Main Content */}
      <main className="min-h-screen bg-[#fdf6f1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Page Header */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Campaigns</h1>
                <p className="text-slate-500 text-base">Create, manage, and track your email marketing campaigns</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {campaignTab === 'ongoing' && (
                  <>
                    {/* Queue Stats */}
                    {queueStats && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm">
                        <BarChart3 className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm text-indigo-900 font-medium">
                          {queueStats.pending || 0} pending • {queueStats.processing || 0} processing
                        </span>
                      </div>
                    )}
                    {/* Queue Controls */}
                    <button
                      onClick={handleQueuePause}
                      disabled={queueActionLoading}
                      className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-4 py-2.5 font-semibold text-sm shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Pause className="w-4 h-4" />
                      Pause
                    </button>
                    <button
                      onClick={handleQueueResume}
                      disabled={queueActionLoading}
                      className="cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-4 py-2.5 font-semibold text-sm shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-4 h-4" />
                      Resume
                    </button>
                  </>
                )}
                <button
                  onClick={() => setCreateCampaignModalOpen(true)}
                  className="cursor-pointer bg-[#ff6600] hover:bg-[#e55a00] text-white rounded-xl px-6 py-3 font-semibold text-sm shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Campaign
                </button>
              </div>
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Campaigns</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {campaigns.length} {campaigns.length === 1 ? 'campaign' : 'campaigns'} total
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-max">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'ongoing', label: 'Ongoing' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setCampaignTab(tab.key as 'all' | 'ongoing')}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                        campaignTab === tab.key
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-8">
              {campaignsLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-3 border-slate-200 border-t-[#ff6600] rounded-full animate-spin" />
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Send className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No campaigns yet</h3>
                  <p className="text-slate-500 mb-8 max-w-md mx-auto">Create your first marketing campaign to start engaging with your audience</p>
                  <button
                    onClick={() => setCreateCampaignModalOpen(true)}
                    className="cursor-pointer bg-[#ff6600] hover:bg-[#e55a00] text-white rounded-xl px-6 py-3 font-semibold text-sm shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Campaign
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-8 px-8">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <th className="py-4 px-4 text-left">Campaign</th>
                        <th className="py-4 px-4 text-left">List</th>
                        <th className="py-4 px-4 text-left">Status</th>
                        <th className="py-4 px-4 text-left">Recipients</th>
                        <th className="py-4 px-4 text-left">Created</th>
                        <th className="py-4 px-4 text-left">Schedule</th>
                        <th className="py-4 px-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
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
                          <tr key={campaign.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="py-5 px-4">
                              <button
                                onClick={() => {
                                  setSelectedCampaignId(campaign.id);
                                  setViewCampaignModalOpen(true);
                                }}
                                className="cursor-pointer text-slate-900 hover:text-[#ff6600] font-semibold text-sm transition-colors text-left group-hover:text-[#ff6600]"
                              >
                                {campaignName}
                              </button>
                              <p className="text-xs text-slate-400 mt-1">
                                #{campaign.id}
                              </p>
                            </td>
                            <td className="py-5 px-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-700">
                                <Users className="w-3.5 h-3.5 text-slate-500" />
                                {marketingListName}
                              </span>
                            </td>
                            <td className="py-5 px-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold capitalize ${getStatusBadgeClass(statusValue)}`}>
                                {statusValue}
                              </span>
                            </td>
                            <td className="py-5 px-4">
                              <button
                                onClick={() => {
                                  setRecipientsCampaignId(campaign.id);
                                  setRecipientsCampaignStatus(statusValue);
                                  setRecipientsModalOpen(true);
                                }}
                                className="cursor-pointer inline-flex items-center gap-1.5 text-slate-700 hover:text-[#ff6600] font-medium text-sm transition-colors"
                              >
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold">
                                  {typeof recipientCount === 'number'
                                    ? recipientCount.toLocaleString()
                                    : 'N/A'}
                                </span>
                              </button>
                            </td>
                            <td className="py-5 px-4 text-sm text-slate-600">
                              {formattedCreated ? (
                                <span className="font-medium">{formattedCreated}</span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="py-5 px-4">
                              {isScheduled && formattedScheduled ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {formattedScheduled}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-xs font-medium">Immediate</span>
                              )}
                            </td>
                            <td className="py-5 px-4">
                              <div className="flex items-center gap-1.5">
                                {/* Edit Button */}
                                <button
                                  onClick={() => {
                                    setEditCampaignId(campaign.id);
                                    setEditCampaignModalOpen(true);
                                  }}
                                  className="cursor-pointer inline-flex items-center justify-center w-8 h-8 text-[#ff6600] hover:bg-orange-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                {/* Preview Button */}
                                <button
                                  onClick={() => {
                                    setPreviewCampaignId(campaign.id);
                                    setPreviewCampaignModalOpen(true);
                                  }}
                                  className="cursor-pointer inline-flex items-center justify-center w-8 h-8 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="Preview"
                                >
                                  <Search className="w-4 h-4" />
                                </button>
                                {/* More Actions Dropdown */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      className="cursor-pointer inline-flex items-center justify-center w-8 h-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                      title="More"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    {/* Actions - Status Actions */}
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setActionsCampaignId(campaign.id);
                                        setActionsModalOpen(true);
                                      }}
                                      className="cursor-pointer flex items-center gap-2"
                                    >
                                      <Settings className="w-4 h-4" />
                                      <span>Campaign Actions</span>
                                    </DropdownMenuItem>
                                    {/* Duplicate */}
                                    <DropdownMenuItem
                                      onClick={() => handleDuplicateCampaign(campaign.id, campaignName)}
                                      disabled={duplicatingCampaignId === campaign.id}
                                      className="cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {duplicatingCampaignId === campaign.id ? (
                                        <>
                                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                          <span>Duplicating...</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-4 h-4" />
                                          <span>Duplicate</span>
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    {/* Separator before destructive action */}
                                    <DropdownMenuSeparator />
                                    {/* Delete - Destructive Action */}
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteCampaign(campaign.id, campaignName)}
                                      disabled={deletingCampaignId === campaign.id}
                                      className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {deletingCampaignId === campaign.id ? (
                                        <>
                                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                          <span>Deleting...</span>
                                        </>
                                      ) : (
                                        <>
                                          <Trash2 className="w-4 h-4" />
                                          <span>Delete</span>
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
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
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-slate-600">
                      Showing <span className="font-semibold text-slate-900">{((currentPage - 1) * limit) + 1}</span> to <span className="font-semibold text-slate-900">{Math.min(currentPage * limit, pagination.total)}</span> of <span className="font-semibold text-slate-900">{pagination.total}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={!pagination.hasPrevPage || campaignsLoading}
                        className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                              className={`cursor-pointer min-w-[2.5rem] px-3 py-2 text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                currentPage === pageNum
                                  ? 'bg-[#ff6600] text-white shadow-sm'
                                  : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400'
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
                        className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
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

