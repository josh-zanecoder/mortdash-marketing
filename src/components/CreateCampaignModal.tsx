'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface MarketingList {
  id: number;
  listName?: string;
  list_name?: string;
}

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  token: string | null;
  marketingLists: MarketingList[];
}

export default function CreateCampaignModal({
  open,
  onClose,
  onSuccess,
  token,
  marketingLists
}: CreateCampaignModalProps) {
  const [campaignName, setCampaignName] = useState('');
  const [selectedListId, setSelectedListId] = useState<number | string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | string>('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Temporary: Email template options 1-10 (integers)
  const emailTemplateOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setCampaignName('');
      setSelectedListId('');
      setSelectedTemplateId('');
      setScheduledAt('');
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Token missing');
      return;
    }

    // Validation
    if (!campaignName || !campaignName.trim()) {
      setError('Please enter a campaign name');
      return;
    }

    if (!selectedListId) {
      setError('Please select a marketing list');
      return;
    }

    if (!selectedTemplateId) {
      setError('Please select an email template');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const campaignData = {
        name: campaignName.trim(),
        marketingListId: Number(selectedListId),
        emailTemplateId: String(selectedTemplateId),
        isScheduled: !!scheduledAt,
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt).toISOString() }),
      };

      const res = await axios.post(`/api/new-campaign`, campaignData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': window.location.origin,
        },
      });

      if (res.data?.success || res.status === 200 || res.status === 201) {
        toast.success(
          scheduledAt 
            ? `Campaign "${campaignName}" scheduled successfully!` 
            : `Campaign "${campaignName}" created successfully!`
        );

        // Reset form
        setCampaignName('');
        setSelectedListId('');
        setSelectedTemplateId('');
        setScheduledAt('');

        // Close modal and call success callback
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(res.data?.message || 'Failed to create campaign');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create campaign';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full p-0 rounded-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold">Create New Campaign</DialogTitle>
          <DialogClose asChild>
            <button
              className="cursor-pointer text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </DialogClose>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-6 pb-6 pt-4">
          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Campaign Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              required
              placeholder="Enter a descriptive name for your campaign"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
            />
          </div>

          {/* Marketing List and Email Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Marketing List */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Marketing List <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedListId}
                  onChange={(e) => setSelectedListId(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">Select a marketing list</option>
                  {marketingLists.map((list) => (
                    <option key={`list-${list.id}`} value={list.id}>
                      {list.listName || list.list_name || `List ${list.id}`}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Email Template */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Template <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">Select an email template</option>
                  {emailTemplateOptions.map((templateId) => (
                    <option key={`template-${templateId}`} value={templateId}>
                      {templateId}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Scheduled Date/Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Schedule Campaign (Optional)
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to send immediately. Select a date and time to schedule the campaign.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-6 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-all duration-200 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="cursor-pointer px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {scheduledAt ? 'Scheduling...' : 'Creating...'}
                </div>
              ) : (
                scheduledAt ? 'Schedule Campaign' : 'Create Campaign'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

