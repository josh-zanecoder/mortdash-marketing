'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { X, Calendar, Mail, Users, Clock, CheckCircle, XCircle } from 'lucide-react';

interface MarketingCampaign {
  id: string | number;
  name?: string;
  marketingListId?: number;
  marketing_list_id?: number;
  emailTemplateId?: string;
  email_template_id?: string;
  isScheduled?: boolean;
  is_scheduled?: boolean;
  scheduledAt?: string;
  scheduled_at?: string;
  status?: string;
  campaignStatus?: string;
  campaign_status?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  listName?: string;
  list_name?: string;
  recipientCount?: number;
  recipient_count?: number;
  emailSent?: boolean;
  email_sent?: boolean;
  campaignCode?: string;
  campaign_code?: string;
  sentDate?: string;
  sent_date?: string;
  template?: number;
  marketingList?: {
    id: number;
    listName?: string;
    list_name?: string;
  };
  emailTemplate?: {
    id: number;
    name?: string;
  };
}

interface ViewCampaignModalProps {
  open: boolean;
  onClose: () => void;
  campaignId: string | number | null;
  token: string | null;
}

export default function ViewCampaignModal({
  open,
  onClose,
  campaignId,
  token
}: ViewCampaignModalProps) {
  const [campaign, setCampaign] = useState<MarketingCampaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && campaignId && token) {
      fetchCampaignDetails();
    } else if (!open) {
      // Reset state when modal closes
      setCampaign(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, campaignId, token]);

  const fetchCampaignDetails = async () => {
    if (!campaignId || !token) return;

    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`/api/new-campaign/${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': window.location.origin,
        },
      });

      if (res.data?.success && res.data?.data) {
        setCampaign(res.data.data);
      } else if (res.data?.data) {
        setCampaign(res.data.data);
      } else if (res.data) {
        setCampaign(res.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch campaign details';
      setError(errorMessage);
      console.error('Failed to fetch campaign details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const campaignName = campaign?.name || 'Unnamed Campaign';
  const listName = campaign?.listName || campaign?.list_name || campaign?.marketingList?.listName || campaign?.marketingList?.list_name || 'N/A';
  const status = campaign?.status || campaign?.campaignStatus || campaign?.campaign_status || 'Pending';
  const recipientCount = campaign?.recipientCount || campaign?.recipient_count || 0;
  const createdAt = campaign?.createdAt || campaign?.created_at;
  const updatedAt = campaign?.updatedAt || campaign?.updated_at;
  const isScheduled = campaign?.isScheduled || campaign?.is_scheduled || false;
  const scheduledAt = campaign?.scheduledAt || campaign?.scheduled_at;
  const emailSent = campaign?.emailSent || campaign?.email_sent || false;
  const sentDate = campaign?.sentDate || campaign?.sent_date;
  const campaignCode = campaign?.campaignCode || campaign?.campaign_code;
  const emailTemplateId = campaign?.emailTemplateId || campaign?.email_template_id || campaign?.template;
  const emailTemplateName = campaign?.emailTemplate?.name || emailTemplateId;

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'sent' || statusLower === 'completed') {
      return 'bg-green-100 text-green-700';
    } else if (statusLower === 'scheduled') {
      return 'bg-blue-100 text-blue-700';
    } else if (statusLower === 'cancelled') {
      return 'bg-red-100 text-red-700';
    } else {
      return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl w-[95vw] sm:w-full p-0 rounded-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold">Campaign Details</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#ff6600]/30 border-t-[#ff6600] rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800 font-medium">Error loading campaign details</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          ) : campaign ? (
            <div className="space-y-6">
              {/* Campaign Name and Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaignName}</h3>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(status)}`}>
                    {status}
                  </span>
                  {emailSent && (
                    <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Email Sent
                    </span>
                  )}
                  {campaignCode && (
                    <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                      {campaignCode}
                    </span>
                  )}
                </div>
              </div>

              {/* Campaign Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Marketing List */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-gray-500" />
                    <h4 className="text-sm font-semibold text-gray-700">Marketing List</h4>
                  </div>
                  <p className="text-base text-gray-900">{listName}</p>
                </div>

                {/* Email Template */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <h4 className="text-sm font-semibold text-gray-700">Email Template</h4>
                  </div>
                  <p className="text-base text-gray-900">{emailTemplateName || 'N/A'}</p>
                </div>

                {/* Recipient Count */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-gray-500" />
                    <h4 className="text-sm font-semibold text-gray-700">Recipients</h4>
                  </div>
                  <p className="text-base text-gray-900">{recipientCount.toLocaleString()}</p>
                </div>

                {/* Scheduled Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <h4 className="text-sm font-semibold text-gray-700">Schedule</h4>
                  </div>
                  {isScheduled && scheduledAt ? (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-base">{new Date(scheduledAt).toLocaleString()}</span>
                    </div>
                  ) : (
                    <p className="text-base text-gray-900">Immediate</p>
                  )}
                </div>
              </div>

              {/* Date Information */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Timeline</h4>
                <div className="space-y-3">
                  {createdAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Created At</span>
                      <span className="text-sm text-gray-900 font-medium">
                        {new Date(createdAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {updatedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Updated</span>
                      <span className="text-sm text-gray-900 font-medium">
                        {new Date(updatedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {sentDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sent Date</span>
                      <span className="text-sm text-gray-900 font-medium">
                        {new Date(sentDate).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Campaign ID */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Campaign ID</span>
                  <span className="text-xs text-gray-600 font-mono">{campaign.id}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
