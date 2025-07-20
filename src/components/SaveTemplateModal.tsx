'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, FileText, X, Plus, Trash2 } from 'lucide-react';

const templateTypes = {
  client: [
    { name: 'Audience', value: 'audience' },
    { name: 'Account Executive', value: 'account-executive' },
    { name: 'Account Executive Phone', value: 'account-executive-phone' },
    { name: 'Account Executive Avatar', value: 'account-executive-avatar' },
    { name: 'Member', value: 'related' },
    { name: 'Bank', value: 'bank' },
    { name: 'Date', value: 'date' }
  ],
  prospect: [
    { name: 'Audience', value: 'audience' },
    { name: 'Account Executive', value: 'account-executive' },
    { name: 'Account Executive Phone', value: 'account-executive-phone' },
    { name: 'Account Executive Avatar', value: 'account-executive-avatar' },
    { name: 'Member', value: 'related' },
    { name: 'Bank', value: 'bank' },
    { name: 'Date', value: 'date' }
  ],
  marketing_contact: [
    { name: 'Account Executive', value: 'account-executive' },
    { name: 'Account Executive Phone', value: 'account-executive-phone' },
    { name: 'Marketing Contact', value: 'marketing-contact' },
    { name: 'Account Executive Avatar', value: 'account-executive-avatar' },
    { name: 'Bank', value: 'bank' },
    { name: 'Date', value: 'date' }
  ],
  ratesheet: [
    { name: 'Rate Sheet Contact', value: 'rate-sheet-contact' },
  ]
};

interface SaveTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (templateData: {
    name: string;
    file: string;
    templateType: string;
    subject: string;
    html: string;
    json: string;
    ampHtml: string | null;
    version: number;
    language: string | null;
    email_template_id?: number;
    fields?: Array<{ parameter: string; type: string; db_name: string; is_required: boolean }>;
  }) => Promise<void>;
  html: string;
  json: string;
  ampHtml: string | null;
  version: number;
  language: string | null;
  email_template_id?: number;
}

interface AudienceType {
  id: number;
  name: string;
  created_at: string | null;
  updated_at: string | null;
  value?: string; // Optional, will be derived from name
}

interface Field {
  id: string;
  key: string;
  audience: string;
  value: string;
}

export default function SaveTemplateModal({
  open,
  onClose,
  onSave,
  html,
  json,
  ampHtml,
  version,
  language,
  email_template_id
}: SaveTemplateModalProps) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [templateType, setTemplateType] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [audienceTypes, setAudienceTypes] = useState<AudienceType[]>([]);
  const [audienceTypesLoading, setAudienceTypesLoading] = useState(false);
  const [fields, setFields] = useState<Field[]>([]);

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

  // Reset field audiences when template type changes
  useEffect(() => {
    if (templateType && templateTypes[templateType as keyof typeof templateTypes]) {
      setFields(fields =>
        fields.map(field => ({
          ...field,
          audience: (templateTypes[templateType as keyof typeof templateTypes]?.[0]?.value) || ''
        }))
      );
    }
  }, [templateType]);

  const fetchAudienceTypes = async () => {
    setAudienceTypesLoading(true);
    try {
      const response = await fetch('/api/audience_types');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch audience types: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        // Add value field to each audience type based on name
        const audienceTypesWithValues = data.data.map((at: AudienceType) => ({
          ...at,
          value: createValueFromName(at.name)
        }));
        setAudienceTypes(audienceTypesWithValues);
        // Set the first audience type as default
        if (audienceTypesWithValues.length > 0) {
          setTemplateType(audienceTypesWithValues[0].value);
        }
      } else if (Array.isArray(data)) {
        // Add value field to each audience type based on name
        const audienceTypesWithValues = data.map((at: AudienceType) => ({
          ...at,
          value: createValueFromName(at.name)
        }));
        setAudienceTypes(audienceTypesWithValues);
        if (audienceTypesWithValues.length > 0) {
          setTemplateType(audienceTypesWithValues[0].value);
        }
      } else if (data.data && Array.isArray(data.data)) {
        // Add value field to each audience type based on name
        const audienceTypesWithValues = data.data.map((at: AudienceType) => ({
          ...at,
          value: createValueFromName(at.name)
        }));
        setAudienceTypes(audienceTypesWithValues);
        if (audienceTypesWithValues.length > 0) {
          setTemplateType(audienceTypesWithValues[0].value);
        }
      } else {
        setAudienceTypes([]);
        setTemplateType('');
      }
    } catch (error) {
      console.error('Error fetching audience types:', error);
      setAudienceTypes([]);
      setTemplateType('');
    } finally {
      setAudienceTypesLoading(false);
    }
  };

  const addField = () => {
    const newField: Field = {
      id: Date.now().toString(),
      key: '',
      audience: (templateTypes[templateType as keyof typeof templateTypes]?.[0]?.value) || '',
      value: ''
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const updateField = (id: string, field: Partial<Field>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...field } : f));
  };

  const handleSave = async () => {
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

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        file: html,
        templateType,
        subject: subject.trim(),
        html,
        json,
        ampHtml,
        version,
        language,
        email_template_id,
        fields: fields
          .filter(f => f.key.trim() && f.value.trim())
          .map(f => ({
            parameter: f.key,
            type: f.audience,
            db_name: f.value,
            is_required: false
          }))
      });
      onClose();
      // Reset form
      setName('');
      setSubject('');
      setTemplateType('');
      setFields([]);
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
      // Reset form
      setName('');
      setSubject('');
      setTemplateType('');
      setFields([]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[90vw] h-[90vh] max-w-[1200px] max-h-[800px] flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900">Save Email Template</h2>
          <button
            onClick={handleClose}
            disabled={isSaving}
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
                <Label htmlFor="name" className="text-lg font-medium">Template Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  placeholder="Enter template name"
                  disabled={isSaving}
                  className="text-lg h-12"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="subject" className="text-lg font-medium">Subject *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                  disabled={isSaving}
                  className="text-lg h-12"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="templateType" className="text-lg font-medium">Template Type *</Label>
                <select
                  id="templateType"
                  value={templateType}
                  onChange={(e) => {
                    setTemplateType(e.target.value);
                  }}
                  disabled={isSaving || audienceTypesLoading}
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

              {/* Fields Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium">Fields</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addField}
                    disabled={isSaving || audienceTypesLoading}
                    className="h-8 px-3"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    ADD FIELD
                  </Button>
                </div>
                
                {fields.length === 0 ? (
                  <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                    No fields added yet. Click "ADD FIELD" to add custom fields.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fields.map((field) => (
                      <div key={field.id} className="flex gap-3 items-start">
                        <Input
                          placeholder="Key"
                          value={field.key}
                          onChange={(e) => updateField(field.id, { key: e.target.value })}
                          disabled={isSaving}
                          className="flex-1"
                        />
                        <select
                          value={field.audience}
                          onChange={(e) => updateField(field.id, { audience: e.target.value })}
                          disabled={isSaving}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {(templateTypes[templateType as keyof typeof templateTypes] || []).map((aud) => (
                            <option key={aud.value} value={aud.value}>
                              {aud.name}
                            </option>
                          ))}
                        </select>
                        <Input
                          placeholder="Value"
                          value={field.value}
                          onChange={(e) => updateField(field.id, { value: e.target.value })}
                          disabled={isSaving}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeField(field.id)}
                          disabled={isSaving}
                          className="h-10 px-3"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-medium">Template Info</Label>
                <div className="text-sm text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
                  <div>Version: {version}</div>
                  <div>Language: {language || 'en-US'}</div>
                  <div>HTML Size: {(html.length / 1024).toFixed(1)} KB</div>
                  {ampHtml && <div>AMP HTML: Available</div>}
                  <div>Template Type: {audienceTypes.find(at => at.value === templateType)?.name || templateType || 'None'}</div>
                  <div>Fields: {fields.filter(f => f.key.trim() && f.value.trim()).length}</div>
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
                disabled={isSaving}
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
            disabled={isSaving}
            size="lg"
            className="h-12 px-8"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !name.trim() || !subject.trim() || !templateType || audienceTypesLoading}
            className="bg-[#ff6600] hover:bg-[#ff7a2f] text-white h-12 px-8"
            size="lg"
          >
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>
    </div>
  );
} 