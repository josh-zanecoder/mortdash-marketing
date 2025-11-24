'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Send, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCampaignStore } from '@/store/campaignStore';

interface CampaignActionsModalProps {
  open: boolean;
  onClose: () => void;
  campaignId: string | number | null;
  token: string | null;
  onSuccess?: () => void;
}

export default function CampaignActionsModal({
  open,
  onClose,
  campaignId,
  token,
  onSuccess
}: CampaignActionsModalProps) {
  const [loading, setLoading] = useState<{
    prepare: boolean;
    rePrepare: boolean;
    start: boolean;
    cancel: boolean;
  }>({
    prepare: false,
    rePrepare: false,
    start: false,
    cancel: false,
  });

  const { prepareCampaign, rePrepareCampaign, startCampaign, cancelCampaign, campaigns } = useCampaignStore();
  const campaign = campaigns.find((item) => String(item.id) === String(campaignId));
  const normalizedStatus = (campaign?.campaignStatus || campaign?.campaign_status || campaign?.status || '').toLowerCase();
  const isDraft = normalizedStatus === 'draft';
  const isSending = normalizedStatus === 'sending';

  const handleAction = async (action: 'prepare' | 're-prepare' | 'start' | 'cancel') => {
    if (!campaignId || !token) {
      toast.error('Missing campaign ID or token');
      return;
    }

    const loadingKey = action === 're-prepare' ? 'rePrepare' : action;
    setLoading((prev) => ({ ...prev, [loadingKey]: true }));

    try {
      let result;
      switch (action) {
        case 'prepare':
          result = await prepareCampaign(token, campaignId);
          break;
        case 're-prepare':
          result = await rePrepareCampaign(token, campaignId);
          break;
        case 'start':
          result = await startCampaign(token, campaignId);
          break;
        case 'cancel':
          result = await cancelCampaign(token, campaignId);
          break;
      }

      const actionNames: Record<string, string> = {
        prepare: 'Prepared',
        're-prepare': 'Re-prepared',
        start: 'Started',
        cancel: 'Canceled',
      };
      toast.success(`Campaign ${actionNames[action]} successfully!`);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      const errorMessage = error.message || `Failed to ${action} campaign`;
      toast.error(errorMessage);
      console.error(`Failed to ${action} campaign:`, error);
    } finally {
      setLoading((prev) => ({ ...prev, [loadingKey]: false }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      if (!v) {
        onClose();
      }
    }} modal={true}>
      <DialogContent 
        className="max-w-md w-[95vw] p-0 rounded-2xl mx-auto"
        onInteractOutside={(e) => {
          // Allow closing on outside click
        }}
      >
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold">Campaign Actions</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6 space-y-4">
          {!isDraft && !isSending && (
            <>
              {/* Prepare Action */}
              <Button
                onClick={() => handleAction('prepare')}
                disabled={loading.prepare || loading.rePrepare || loading.start || loading.cancel}
                className="w-full justify-start gap-3 h-12 text-left bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
              >
                {loading.prepare ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                <div className="flex-1">
                  <div className="font-semibold">Prepare Campaign</div>
                  <div className="text-xs text-blue-600">Initialize the campaign for sending</div>
                </div>
              </Button>

            </>
          )}

          {/* Re-prepare Action (Draft only) */}
          {isDraft && (
            <Button
              onClick={() => handleAction('re-prepare')}
              disabled={loading.prepare || loading.rePrepare || loading.start || loading.cancel}
              className="w-full justify-start gap-3 h-12 text-left bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
            >
              {loading.rePrepare ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RotateCcw className="w-5 h-5" />
              )}
              <div className="flex-1">
                <div className="font-semibold">Re-prepare Campaign</div>
                <div className="text-xs text-purple-600">Refresh campaign preparation</div>
              </div>
            </Button>
          )}

          {/* Start Action */}
          {isDraft && (
            <Button
              onClick={() => handleAction('start')}
              disabled={loading.prepare || loading.rePrepare || loading.start || loading.cancel}
              className="w-full justify-start gap-3 h-12 text-left bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
            >
              {loading.start ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <div className="flex-1">
                <div className="font-semibold">Start Campaign</div>
                <div className="text-xs text-green-600">Begin sending emails to recipients</div>
              </div>
            </Button>
          )}

          {/* Cancel Action */}
          {isSending && (
            <Button
              onClick={() => handleAction('cancel')}
              disabled={loading.prepare || loading.rePrepare || loading.start || loading.cancel}
              className="w-full justify-start gap-3 h-12 text-left bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
            >
              {loading.cancel ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <X className="w-5 h-5" />
              )}
              <div className="flex-1">
                <div className="font-semibold">Cancel Campaign</div>
                <div className="text-xs text-red-600">Stop and cancel the campaign</div>
              </div>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

