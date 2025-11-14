"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CreateCampaignModal from '@/components/CreateCampaignModal';
import ViewCampaignModal from '@/components/ViewCampaignModal';
import { useCampaignStore } from '@/store/campaignStore';
import { Plus, Send, Calendar, Eye, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

function CampaignSendingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [marketingLists, setMarketingLists] = useState<any[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [createCampaignModalOpen, setCreateCampaignModalOpen] = useState(false);
  const [viewCampaignModalOpen, setViewCampaignModalOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | number | null>(null);
  const [duplicatingCampaignId, setDuplicatingCampaignId] = useState<string | number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const { campaigns, loading: campaignsLoading, pagination, fetchCampaigns } = useCampaignStore();

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
    }
  }, [token, fetchCampaigns, currentPage, limit]);

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
        `/api/new-campaign/${campaignId}/duplicate`,
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
            <button
              onClick={() => setCreateCampaignModalOpen(true)}
              className="cursor-pointer bg-[#ff6600] text-white rounded-lg px-5 py-2.5 font-medium hover:bg-[#ff7a2f] transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Campaign
            </button>
          </div>

          {/* Campaigns Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800">All Campaigns</h2>
              <p className="text-sm text-slate-600 mt-1">View and manage all your marketing campaigns</p>
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
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Campaign Name</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Marketing List</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Recipients</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Created At</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Scheduled</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign) => {
                        const campaignName = campaign.name || 'Unnamed Campaign';
                        const listName = campaign.listName || campaign.list_name || 'N/A';
                        const status = campaign.status || campaign.campaignStatus || campaign.campaign_status || 'Pending';
                        const recipientCount = campaign.recipientCount || campaign.recipient_count || 0;
                        const createdAt = campaign.createdAt || campaign.created_at;
                        const isScheduled = campaign.isScheduled || campaign.is_scheduled || false;
                        const scheduledAt = campaign.scheduledAt || campaign.scheduled_at;

                        return (
                          <tr key={campaign.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 text-sm text-slate-900 font-medium">{campaignName}</td>
                            <td className="py-3 px-4 text-sm text-slate-600">{listName}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                status.toLowerCase() === 'sent' || status.toLowerCase() === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : status.toLowerCase() === 'scheduled'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600">{recipientCount}</td>
                            <td className="py-3 px-4 text-sm text-slate-600">
                              {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600">
                              {isScheduled && scheduledAt ? (
                                <span className="inline-flex items-center gap-1 text-blue-600">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(scheduledAt).toLocaleDateString()}
                                </span>
                              ) : (
                                <span className="text-slate-400">Immediate</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedCampaignId(campaign.id);
                                    setViewCampaignModalOpen(true);
                                  }}
                                  className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#ff6600] bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </button>
                                <button
                                  onClick={() => handleDuplicateCampaign(campaign.id, campaignName)}
                                  disabled={duplicatingCampaignId === campaign.id}
                                  className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

