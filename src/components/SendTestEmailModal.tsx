'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, FileText, X } from 'lucide-react';

interface SendTestEmailModalProps {
  open: boolean;
  onClose: () => void;
  html: string;
  subject?: string;
}

interface AudienceType {
  id: number;
  name: string;
  created_at: string | null;
  updated_at: string | null;
  value?: string;
}

export default function SendTestEmailModal({ open, onClose, html, subject: initialSubject }: SendTestEmailModalProps) {
  const [recipient, setRecipient] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState(initialSubject || '');
  const [templateType, setTemplateType] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [sending, setSending] = useState(false);
  const [audienceTypes, setAudienceTypes] = useState<AudienceType[]>([]);
  const [audienceTypesLoading, setAudienceTypesLoading] = useState(false);

  // Helper function to create a normalized value from name
  const createValueFromName = (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, '_');
  };

  // Fetch audience types when modal opens
  useEffect(() => {
    if (open) {
      fetchAudienceTypes();
    }
  }, [open]);

  const fetchAudienceTypes = async () => {
    setAudienceTypesLoading(true);
    try {
      const response = await fetch('/api/audience_types');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        const audienceTypesWithValues = data.data.map((at: AudienceType) => ({
          ...at,
          value: createValueFromName(at.name)
        }));
        setAudienceTypes(audienceTypesWithValues);
        if (audienceTypesWithValues.length > 0) {
          setTemplateType(audienceTypesWithValues[0].value);
        }
      } else if (Array.isArray(data)) {
        const audienceTypesWithValues = data.map((at: AudienceType) => ({
          ...at,
          value: createValueFromName(at.name)
        }));
        setAudienceTypes(audienceTypesWithValues);
        if (audienceTypesWithValues.length > 0) {
          setTemplateType(audienceTypesWithValues[0].value);
        }
      }
    } catch (error) {
      console.error('Error fetching audience types:', error);
    } finally {
      setAudienceTypesLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!recipient.trim()) {
      alert('Please enter a recipient email');
      return;
    }
    if (!name.trim()) {
      alert('Please enter a template name');
      return;
    }
    if (!subject.trim()) {
      alert('Please enter a subject');
      return;
    }
    if (!templateType) {
      alert('Please select a template type');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/campaign/send-test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient,
          name,
          subject,
          template: html, // Send html as template directly
          template_type: templateType // Use snake_case for backend
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send test email');
      }

      toast.success('Test email sent successfully!');
      onClose();
      // Reset form
      setRecipient('');
      setName('');
      setSubject(initialSubject || '');
      setTemplateType('');
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send test email');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      onClose();
      // Reset form
      setRecipient('');
      setName('');
      setSubject(initialSubject || '');
      setTemplateType('');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[90vw] h-[90vh] max-w-[1200px] max-h-[800px] flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900">Send Test Email</h2>
          <button
            onClick={handleClose}
            disabled={sending}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left side - Form */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="space-y-8 max-w-2xl">
              <div className="space-y-3">
                <Label htmlFor="recipient" className="text-lg font-medium">Recipient Email *</Label>
                <Input
                  id="recipient"
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter recipient email"
                  disabled={sending}
                  className="text-lg h-12"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="name" className="text-lg font-medium">Template Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter template name"
                  disabled={sending}
                  className="text-lg h-12"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="subject" className="text-lg font-medium">Subject *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                  disabled={sending}
                  className="text-lg h-12"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="templateType" className="text-lg font-medium">Template Type *</Label>
                <select
                  id="templateType"
                  value={templateType}
                  onChange={(e) => setTemplateType(e.target.value)}
                  disabled={sending || audienceTypesLoading}
                  className="w-full text-lg h-12 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {audienceTypesLoading ? "Loading..." : "Select template type"}
                  </option>
                  {audienceTypes.map((audienceType) => (
                    <option key={audienceType.id} value={audienceType.value}>
                      {audienceType.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-medium">Template Info</Label>
                <div className="text-sm text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
                  <div>HTML Size: {(html.length / 1024).toFixed(1)} KB</div>
                  <div>Template Type: {audienceTypes.find(at => at.value === templateType)?.name || templateType || 'None'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Preview */}
          <div className="flex-1 border-l border-gray-200 p-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <Label className="text-xl font-medium">Email Preview</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                disabled={sending}
                className="h-10 px-4"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>

            {showPreview ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div className="text-base font-medium text-gray-700">Email Template Preview</div>
                  </div>
                </div>
                <div 
                  className="p-8 max-h-[600px] overflow-y-auto bg-white"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-16 text-center text-gray-500">
                <Eye className="w-16 h-16 mx-auto mb-6 text-gray-400" />
                <p className="text-xl mb-2">Click "Show Preview" to see the email template</p>
                <p className="text-base">The preview will show exactly how your email will look</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={sending}
            size="lg"
            className="h-12 px-8"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={sending || !recipient.trim() || !name.trim() || !subject.trim() || !templateType || audienceTypesLoading}
            className="bg-[#ff6600] hover:bg-[#ff7a2f] text-white h-12 px-8"
            size="lg"
          >
            {sending ? 'Sending...' : 'Send Test'}
          </Button>
        </div>
      </div>
    </div>
  );
} 