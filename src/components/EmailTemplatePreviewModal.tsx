'use client';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { XCircle, FileText, Mail, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useEmailTemplateStore } from '@/store/useEmailTemplateStore';

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

interface EmailTemplatePreviewModalProps {
  open: boolean;
  onClose: () => void;
  templateId: string | number | null;
  token: string | null;
}

interface EmailTemplateDetails {
  id: string | number;
  name?: string | null;
  subject?: string | null;
  path?: string | null;
  type?: string | null;
  isVisible?: boolean | null;
  isArchived?: boolean | null;
  audienceTypeId?: string | number | null;
  emailTemplateCategoryId?: string | number | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  fields?: Array<{
    id: string;
    parameter: string;
    type: string;
    isAutomatic: boolean;
    isRequired: boolean;
  }> | null;
}

export default function EmailTemplatePreviewModal({
  open,
  onClose,
  templateId,
  token
}: EmailTemplatePreviewModalProps) {
  const [template, setTemplate] = useState<EmailTemplateDetails | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const { fetchTemplateById } = useEmailTemplateStore();

  useEffect(() => {
    if (open && templateId && token) {
      loadTemplate();
      // Prevent layout shift from scrollbar disappearing
      preventScrollbarShift();
    } else if (!open) {
      setTemplate(null);
      setHtmlContent('');
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
  }, [open, templateId, token]);

  const loadTemplate = async () => {
    if (!templateId || !token) return;

    try {
      setLoading(true);
      setError(null);
      
      // Fetch template details
      const templateData = await fetchTemplateById(token, templateId);
      setTemplate(templateData);

      // Fetch HTML content via proxy endpoint to avoid CORS issues
      if (templateData.path) {
        try {
          const htmlResponse = await fetch(`/api/email-builder/${templateId}/html`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
            },
          });

          if (htmlResponse.ok) {
            const html = await htmlResponse.text();
            setHtmlContent(html);
          } else {
            const errorData = await htmlResponse.json().catch(() => ({ error: 'Failed to fetch HTML content' }));
            throw new Error(errorData.error || `Failed to fetch HTML: ${htmlResponse.statusText}`);
          }
        } catch (htmlError: any) {
          console.error('Failed to fetch HTML content:', htmlError);
          setError(htmlError.message || 'Failed to load template HTML content');
        }
      } else {
        setError('Template path not available');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch email template';
      setError(errorMessage);
      console.error('Failed to fetch email template:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string | null | undefined) => {
    if (!type) return 'N/A';
    if (type === 'ae_use') return 'AE Use';
    if (type === 'bank_use') return 'Bank Use';
    return type;
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent 
        className="!max-w-[95vw] w-[95vw] h-[95vh] !sm:max-w-[95vw] p-0 rounded-2xl mx-auto flex flex-col"
      >
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold">Email Template Preview</DialogTitle>
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
                    <p className="text-sm text-red-800 font-medium">Error loading template preview</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : template ? (
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {/* Left section - Template Info (stacks on top for small screens) */}
              <div className="lg:w-96 lg:border-r border-b lg:border-b-0 border-gray-200 p-6 overflow-y-auto bg-gray-50/50 flex-shrink-0">
                <div className="space-y-6">
                  {/* Template Name */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Template Name
                    </Label>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-base text-gray-900 font-medium">{template.name || 'Unnamed Template'}</p>
                    </div>
                  </div>

                  {/* Email Subject */}
                  {template.subject && (
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Subject
                      </Label>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-base text-gray-900 font-medium">{template.subject}</p>
                      </div>
                    </div>
                  )}

                  {/* Template Type */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2">Template Type</Label>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-900">{getTypeLabel(template.type)}</p>
                    </div>
                  </div>

                  {/* Template Status */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2">Status</Label>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          template.isArchived
                            ? 'bg-gray-100 text-gray-700'
                            : template.isVisible
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {template.isArchived ? 'Archived' : template.isVisible ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  </div>

                  {/* Template Fields */}
                  {template.fields && template.fields.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2">Template Fields</Label>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-2 max-h-48 overflow-y-auto">
                        {template.fields.map((field) => (
                          <div key={field.id} className="text-xs border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">{field.parameter}</span>
                              <span className="text-gray-500 capitalize">({field.type})</span>
                            </div>
                            {field.isRequired && (
                              <span className="text-red-500 text-xs">Required</span>
                            )}
                            {field.isAutomatic && (
                              <span className="text-blue-500 text-xs ml-2">Auto</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Template Info */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2">Template Information</Label>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-2">
                      <div>
                        <span className="text-xs text-gray-500">Template ID</span>
                        <p className="text-sm text-gray-900 font-mono">{template.id}</p>
                      </div>
                      {template.createdAt && (
                        <div>
                          <span className="text-xs text-gray-500">Created</span>
                          <p className="text-sm text-gray-900">
                            {new Date(template.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {template.updatedAt && (
                        <div>
                          <span className="text-xs text-gray-500">Last Updated</span>
                          <p className="text-sm text-gray-900">
                            {new Date(template.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right section - Full-width HTML Preview (takes remaining space) */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                  <Label className="text-xl font-medium">Email Preview</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Hide Preview
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Show Preview
                      </>
                    )}
                  </Button>
                </div>

                {showPreview && htmlContent ? (
                  <div className="flex-1 overflow-hidden bg-white">
                    {/* Use iframe to isolate HTML content and prevent style leakage */}
                    <iframe
                      srcDoc={htmlContent}
                      className="w-full h-full border-0"
                      sandbox="allow-same-origin"
                      title="Email Template Preview"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="border border-gray-200 rounded-lg p-16 text-center text-gray-500">
                      <Eye className="w-16 h-16 mx-auto mb-6 text-gray-400" />
                      <p className="text-xl mb-2">Click "Show Preview" to see the email template</p>
                      <p className="text-base">The preview will show exactly how the email template will look</p>
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

