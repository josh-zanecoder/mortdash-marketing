'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { XCircle, FileText, Mail, User, Eye, EyeOff, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCampaignStore } from '@/store/campaignStore';
import { toast } from 'sonner';

// Fix for scrollbar causing layout shift when modal opens
const preventScrollbarShift = () => {
  if (typeof window === 'undefined') return;
  
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
};

const restoreScrollbarShift = () => {
  if (typeof window === 'undefined') return;
  document.body.style.paddingRight = '';
};

interface CampaignPreviewModalProps {
  open: boolean;
  onClose: () => void;
  campaignId: string | number | null;
  token: string | null;
}

interface CampaignPreview {
  html: string;
  recipient: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    type: string;
  };
  subject: string;
}

export default function CampaignPreviewModal({
  open,
  onClose,
  campaignId,
  token
}: CampaignPreviewModalProps) {
  const router = useRouter();
  const [preview, setPreview] = useState<CampaignPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [openingBuilder, setOpeningBuilder] = useState(false);
  const { fetchPreview } = useCampaignStore();

  useEffect(() => {
    if (open && campaignId && token) {
      loadPreview();
      // Prevent layout shift from scrollbar disappearing
      preventScrollbarShift();
    } else if (!open) {
      setPreview(null);
      setError(null);
      setShowPreview(true);
      // Restore scrollbar space
      restoreScrollbarShift();
    }
    
    // Cleanup on unmount
    return () => {
      restoreScrollbarShift();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, campaignId, token]);

  const loadPreview = async () => {
    if (!campaignId || !token) return;

    try {
      setLoading(true);
      setError(null);
      const previewData = await fetchPreview(token, campaignId);
      setPreview(previewData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch campaign preview';
      setError(errorMessage);
      console.error('Failed to fetch campaign preview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditInBuilder = async () => {
    if (!campaignId || !token) {
      toast.error('Missing required information');
      return;
    }

    try {
      setOpeningBuilder(true);
      const htmlContent = preview?.html;

      if (!htmlContent) {
        toast.error('No HTML content found for this campaign');
        return;
      }

      const storageKey = `grapesjs-builder-html-${campaignId}-${Date.now()}`;
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(storageKey, htmlContent);
        window.sessionStorage.setItem(`${storageKey}-campaignId`, String(campaignId));
      }

      const params = new URLSearchParams();
      if (token) params.set('token', token);
      params.set('builderId', storageKey);
      params.set('campaignId', String(campaignId));

      // Close the preview modal
      onClose();
      
      // Navigate to builder
      router.push(`/marketing/email-editor?${params.toString()}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to open builder');
    } finally {
      setOpeningBuilder(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent 
        className="!max-w-[95vw] w-[95vw] h-[95vh] !sm:max-w-[95vw] p-0 rounded-2xl mx-auto flex flex-col"
      >
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold">Campaign Preview</DialogTitle>
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
                    <p className="text-sm text-red-800 font-medium">Error loading campaign preview</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : preview ? (
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {/* Left section - Preview Info (stacks on top for small screens) */}
              <div className="lg:w-96 lg:border-r border-b lg:border-b-0 border-gray-200 p-6 overflow-y-auto bg-gray-50/50 flex-shrink-0">
                <div className="space-y-6">
                  {/* Email Subject */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Subject
                    </Label>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-base text-gray-900 font-medium">{preview.subject}</p>
                    </div>
                  </div>

                  {/* Recipient Info */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Preview Recipient
                    </Label>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-2">
                      <div>
                        <span className="text-xs text-gray-500">Name</span>
                        <p className="text-sm text-gray-900 font-medium">
                          {preview.recipient.firstName} {preview.recipient.lastName}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Email</span>
                        <p className="text-sm text-gray-900">{preview.recipient.email}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Type</span>
                        <p className="text-sm text-gray-900 capitalize">{preview.recipient.type}</p>
                      </div>
                    </div>
                  </div>

                  {/* Campaign Info */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2">Campaign Information</Label>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-2">
                      <div>
                        <span className="text-xs text-gray-500">Campaign ID</span>
                        <p className="text-sm text-gray-900 font-mono">{campaignId}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Recipient ID</span>
                        <p className="text-sm text-gray-900 font-mono">{preview.recipient.id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right section - Full-width HTML Preview (takes remaining space) */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                  <Label className="text-xl font-medium">Email Preview</Label>
                  <Button
                    onClick={handleEditInBuilder}
                    disabled={openingBuilder}
                    className="h-10 px-4 bg-[#ff6600] text-white hover:bg-[#ff7a2f] cursor-pointer"
                  >
                    {openingBuilder ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Opening...
                      </>
                    ) : (
                      <>
                        <LayoutTemplate className="w-4 h-4 mr-2" />
                        Edit in Builder
                      </>
                    )}
                  </Button>
                </div>

                {showPreview ? (
                  <div className="flex-1 overflow-hidden bg-white">
                    {/* Use iframe to isolate HTML content and prevent style leakage */}
                    <iframe
                      srcDoc={preview.html}
                      className="w-full h-full border-0"
                      sandbox="allow-same-origin"
                      title="Campaign Email Preview"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="border border-gray-200 rounded-lg p-16 text-center text-gray-500">
                      <Eye className="w-16 h-16 mx-auto mb-6 text-gray-400" />
                      <p className="text-xl mb-2">Click "Show Preview" to see the email preview</p>
                      <p className="text-base">The preview will show exactly how the campaign email will look</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

