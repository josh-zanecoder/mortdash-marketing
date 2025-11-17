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
}

export default function CampaignRecipientsModal({
  open,
  onClose,
  campaignId,
  token
}: CampaignRecipientsModalProps) {
  const [recipients, setRecipients] = useState<CampaignRecipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const { fetchRecipients, cancelCampaignRecipient, retryCampaignRecipient } = useCampaignStore();

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
      return 'bg-blue-100 text-blue-700';
    } else if (typeLower === 'client') {
      return 'bg-green-100 text-green-700';
    } else if (typeLower === 'personal contact') {
      return 'bg-purple-100 text-purple-700';
    }
    return 'bg-gray-100 text-gray-700';
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="!max-w-[90vw] w-[90vw] !sm:max-w-[90vw] h-[85vh] p-0 rounded-2xl mx-auto flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Campaign Recipients
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
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
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="mb-4 text-sm text-gray-600">
                Total Recipients: <span className="font-semibold text-gray-900">{recipients.length}</span>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recipients.map((recipient) => {
                      const cancelLoading = actionLoading[`cancel-${recipient.id}`];
                      const retryLoading = actionLoading[`retry-${recipient.id}`];
                      
                      return (
                        <tr key={recipient.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              {recipient.firstName} {recipient.lastName}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              {recipient.email}
                            </div>
                          </td>
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

