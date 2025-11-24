'use client';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { XCircle, Users, Mail, User, X, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCampaignStore, type CampaignRecipient } from '@/store/campaignStore';

interface CampaignRecipientsModalProps {
  open: boolean;
  onClose: () => void;
  campaignId: string | number | null;
  token: string | null;
  campaignStatus?: string | null;
}

const campaignStatusBadgeStyles: Record<string, string> = {
  sending: 'bg-orange-50 text-orange-700 border border-orange-100',
  sent: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
};

const getCampaignStatusBadgeClass = (status: string) =>
  campaignStatusBadgeStyles[status.toLowerCase()] || 'bg-slate-100 text-slate-700 border border-slate-200';

export default function CampaignRecipientsModal({
  open,
  onClose,
  campaignId,
  token,
  campaignStatus,
}: CampaignRecipientsModalProps) {
  const [recipients, setRecipients] = useState<CampaignRecipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { fetchRecipients, cancelCampaignRecipient, retryCampaignRecipient } = useCampaignStore();
  const normalizedStatus = (campaignStatus || '').toLowerCase();
  const canManageRecipients = normalizedStatus === 'sending' || normalizedStatus === 'sent';

  useEffect(() => {
    if (open && campaignId && token) {
      loadRecipients();
    } else if (!open) {
      setRecipients([]);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, campaignId, token]);

  const loadRecipients = async () => {
    if (!campaignId || !token) return;

    try {
      setLoading(true);
      setError(null);
      const recipientsData = await fetchRecipients(token, campaignId);
      setRecipients(recipientsData);
      setCurrentPage(1);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch campaign recipients';
      setError(errorMessage);
      console.error('Failed to fetch campaign recipients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRecipient = async (recipientId: string | number) => {
    if (!token) {
      toast.error('Token missing');
      return;
    }

    setActionLoading((prev) => ({ ...prev, [`cancel-${recipientId}`]: true }));
    try {
      await cancelCampaignRecipient(token, recipientId);
      toast.success('Recipient cancelled successfully');
      // Reload recipients
      loadRecipients();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel recipient');
    } finally {
      setActionLoading((prev) => ({ ...prev, [`cancel-${recipientId}`]: false }));
    }
  };

  const handleRetryRecipient = async (recipientId: string | number) => {
    if (!token) {
      toast.error('Token missing');
      return;
    }

    setActionLoading((prev) => ({ ...prev, [`retry-${recipientId}`]: true }));
    try {
      await retryCampaignRecipient(token, recipientId);
      toast.success('Recipient retry initiated successfully');
      // Reload recipients
      loadRecipients();
    } catch (error: any) {
      toast.error(error.message || 'Failed to retry recipient');
    } finally {
      setActionLoading((prev) => ({ ...prev, [`retry-${recipientId}`]: false }));
    }
  };

  const getTypeBadgeColor = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower === 'prospect') {
      return 'bg-blue-50 text-blue-700 border border-blue-100';
    } else if (typeLower === 'client') {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    } else if (typeLower === 'personal contact') {
      return 'bg-purple-50 text-purple-700 border border-purple-100';
    }
    return 'bg-slate-50 text-slate-600 border border-slate-100';
  };

  if (!open) return null;

  const totalPages = Math.max(1, Math.ceil(recipients.length / pageSize));
  const paginatedRecipients = recipients.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="!max-w-[95vw] w-[95vw] !sm:max-w-4xl h-[85vh] p-0 rounded-3xl mx-auto flex flex-col bg-gradient-to-b from-slate-50 to-white">
        <DialogHeader className="flex flex-col gap-3 px-6 pt-6 pb-5 border-b border-gray-200">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-slate-900">
                <Users className="w-6 h-6 text-[#ff6600]" />
                Campaign Recipients
              </DialogTitle>
              <p className="text-sm text-slate-500">Track delivery statuses and manage recipient-level actions.</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 flex-1">
              <div className="w-8 h-8 border-2 border-[#ff6600]/30 border-t-[#ff6600] rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="px-6 py-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-800 font-medium">Error loading campaign recipients</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : recipients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 flex-1">
              <Users className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-lg text-gray-700 font-medium mb-2">No recipients found</p>
              <p className="text-sm text-gray-500">This campaign has no recipients yet.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2 text-sm text-gray-600">
                <div>
                  Total Recipients: <span className="font-semibold text-gray-900">{recipients.length}</span>
                </div>
                {canManageRecipients && (
                  <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Actions enabled
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-inner">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Recipient</th>
                      <th className="text-left py-3 px-4 font-semibold">Email</th>
                      <th className="text-left py-3 px-4 font-semibold">Type</th>
                      {canManageRecipients && (
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {paginatedRecipients.map((recipient) => {
                      const cancelLoading = actionLoading[`cancel-${recipient.id}`];
                      const retryLoading = actionLoading[`retry-${recipient.id}`];
                      
                      return (
                        <tr key={recipient.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-gray-900 font-semibold">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium">
                                {recipient.firstName?.[0]}
                                {recipient.lastName?.[0]}
                              </div>
                              <div>
                                <p>{recipient.firstName} {recipient.lastName}</p>
                                <p className="text-xs text-gray-500">ID: {recipient.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200">
                              <Mail className="w-4 h-4 text-slate-400" />
                              <span className="text-sm">{recipient.email}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                              getTypeBadgeColor(recipient.type)
                            }`}>
                              <User className="w-3 h-3" />
                              {recipient.type}
                            </span>
                          </td>
                          {canManageRecipients && (
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => handleCancelRecipient(recipient.id)}
                                  disabled={cancelLoading || retryLoading}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                >
                                  {cancelLoading ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <X className="w-3 h-3" />
                                  )}
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleRetryRecipient(recipient.id)}
                                  disabled={cancelLoading || retryLoading}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                                >
                                  {retryLoading ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <RotateCcw className="w-3 h-3" />
                                  )}
                                  Retry
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {recipients.length > pageSize && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-t border-gray-100 text-sm">
                    <span className="text-gray-500">
                      Showing {(currentPage - 1) * pageSize + 1}-
                      {Math.min(currentPage * pageSize, recipients.length)} of {recipients.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      >
                        Prev
                      </Button>
                      <span className="text-gray-600 font-medium">
                        Page {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

