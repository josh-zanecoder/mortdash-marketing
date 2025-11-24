'use client';

import { useState, useEffect, useMemo } from 'react';
import { useEmailTemplateStore } from '@/store/useEmailTemplateStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FileText, XCircle, Eye, EyeOff, Loader2, LayoutTemplate } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AudienceType {
  id: number;
  name: string;
  created_at: string | null;
  updated_at: string | null;
  value?: string;
}

interface EmailCategory {
  id: number;
  slug: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface EmailTemplateField {
  id?: string;
  parameter: string;
  type: string;
  db_name: string;
  is_required: boolean;
  is_automatic?: boolean;
}

const BASE_FIELD_TYPES = [
  { value: 'audience', label: 'Audience' },
  { value: 'account-executive-avatar', label: 'Account Executive Avatar' },
  { value: 'account-executive-phone', label: 'Account Executive Phone' },
  { value: 'account-executive', label: 'Account Executive' },
  { value: 'bank', label: 'Bank' },
  { value: 'date', label: 'Date' },
  { value: 'register-link', label: 'Register Link' },
];

interface EditEmailTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  templateId: string | number | null;
  token: string | null;
}

export default function EditEmailTemplateModal({ open, onClose, onSuccess, templateId, token }: EditEmailTemplateModalProps) {
  const router = useRouter();
  const { updateTemplate, fetchTemplateById } = useEmailTemplateStore();

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [slug, setSlug] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);
  const [isArchived, setIsArchived] = useState(false);
  const [type, setType] = useState<string>('ae_use');
  const [audienceTypeId, setAudienceTypeId] = useState<string | number>('');
  const [emailTemplateCategoryId, setEmailTemplateCategoryId] = useState<string | number | null>(null);
  const [fields, setFields] = useState<EmailTemplateField[]>([]);
  const [fieldsToDelete, setFieldsToDelete] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [audienceTypes, setAudienceTypes] = useState<AudienceType[]>([]);
  const [categories, setCategories] = useState<EmailCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const displayedFieldTypes = useMemo(() => {
    // Determine field types based on audience type - simplified for edit
    return BASE_FIELD_TYPES;
  }, []);

  const createValueFromName = (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, '_');
  };

  useEffect(() => {
    if (open && templateId && token) {
      fetchTemplateData();
      fetchAudienceTypes();
      fetchCategories();
    } else if (!open) {
      // Reset form when modal closes
      resetForm();
    }
  }, [open, templateId, token]);

  const fetchTemplateData = async () => {
    if (!templateId || !token) return;

    try {
      setFetching(true);
      const templateData = await fetchTemplateById(token, templateId);
      
      // Populate form with existing data
      setName(templateData.name || '');
      setSubject(templateData.subject || '');
      setSlug(templateData.slug || '');
      setIsVisible(templateData.isVisible ?? true);
      setIsArchived(templateData.isArchived ?? false);
      setType(templateData.type || 'ae_use');
      setAudienceTypeId(templateData.audienceTypeId || '');
      setEmailTemplateCategoryId(templateData.emailTemplateCategoryId || null);

      // Load existing fields
      if (templateData.fields && Array.isArray(templateData.fields)) {
        setFields(templateData.fields.map((f: any) => ({
          id: f.id,
          parameter: f.parameter || '',
          type: f.type || '',
          db_name: f.dbName || f.db_name || '',
          is_required: f.isRequired ?? f.is_required ?? false,
          is_automatic: f.isAutomatic ?? f.is_automatic ?? false,
        })));
      }

      // Fetch HTML content from template path
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
          }
        } catch (error) {
          console.error('Failed to fetch HTML content:', error);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch template data:', error);
      toast.error(error.message || 'Failed to load template data');
    } finally {
      setFetching(false);
    }
  };

  const fetchAudienceTypes = async () => {
    try {
      const response = await fetch('/api/audience_types');
      if (!response.ok) throw new Error('Failed to fetch audience types');
      
      const data = await response.json();
      const types = data.success ? data.data : (Array.isArray(data) ? data : []);
      setAudienceTypes(types.map((at: AudienceType) => ({
        ...at,
        value: createValueFromName(at.name)
      })));
    } catch (error) {
      console.error('Error fetching audience types:', error);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch('/api/campaign/get-email-categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      }
    } catch (e) {
      console.error('Error fetching categories:', e);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setSubject('');
    setSlug('');
    setFile(null);
    setHtmlContent('');
    setIsVisible(true);
    setIsArchived(false);
    setType('ae_use');
    setAudienceTypeId('');
    setEmailTemplateCategoryId(null);
    setFields([]);
    setFieldsToDelete([]);
    setShowPreview(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/html' || selectedFile.name.endsWith('.html')) {
        setFile(selectedFile);
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) {
            setHtmlContent(content);
          }
        };
        reader.readAsText(selectedFile);
      } else {
        toast.error('Please select an HTML file');
      }
    }
  };

  const handleSave = async () => {
    if (!token || !templateId) {
      toast.error('Missing required information');
      return;
    }

    if (!name.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    try {
      setLoading(true);

      const validFields = fields
        .filter(field => 
          field.parameter.trim() && field.type.trim() && field.db_name.trim()
        )
        .map(field => ({
          id: field.id || undefined,
          parameter: field.parameter.trim(),
          type: field.type.trim(),
          dbName: field.db_name.trim(),
          isRequired: field.is_required || false,
          isAutomatic: field.is_automatic || false,
          dbAlternateName: field.db_name.trim() || undefined,
        }));

      await updateTemplate(token, templateId, {
        name: name.trim(),
        subject: subject.trim(),
        slug: slug.trim() || undefined,
        file: file || undefined,
        isVisible,
        isArchived,
        type,
        audienceTypeId: audienceTypeId || undefined,
        emailTemplateCategoryId: emailTemplateCategoryId || undefined,
        fields: validFields,
        fieldsToDelete: fieldsToDelete.length > 0 ? fieldsToDelete : undefined,
      });
      
      toast.success('Email template updated successfully!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update email template');
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    setFields([...fields, { parameter: '', type: 'audience', db_name: '', is_required: false }]);
  };

  const removeField = (index: number) => {
    const field = fields[index];
    if (field.id) {
      // Mark for deletion
      setFieldsToDelete([...fieldsToDelete, field.id]);
    }
    // Remove from fields array
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, field: Partial<EmailTemplateField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...field };
    setFields(newFields);
  };

  const handleEditInBuilder = async () => {
    if (!token || !templateId) {
      toast.error('Missing required information');
      return;
    }

    if (!htmlContent) {
      toast.error('Template HTML content not available');
      return;
    }

    try {
      // Store HTML in sessionStorage
      const storageKey = `grapesjs-builder-html-${templateId}-${Date.now()}`;
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(storageKey, htmlContent);
      }

      // Navigate to builder with HTML
      const params = new URLSearchParams();
      if (token) params.set('token', token);
      params.set('builderId', storageKey);
      
      // Close the modal first
      onClose();
      
      // Navigate to builder
      router.push(`/marketing/email-builder?${params.toString()}`);
    } catch (error: any) {
      console.error('Failed to open builder:', error);
      toast.error(error.message || 'Failed to open template in builder');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !loading && onClose()}>
      <DialogContent className="!max-w-[98vw] !w-[98vw] !sm:max-w-[98vw] max-h-[95vh] h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Email Template</DialogTitle>
          <DialogDescription>
            Update the email template details. Upload a new HTML file to replace the existing one, or leave it unchanged.
          </DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#ff6600]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
            {/* Left side - Form */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Template Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter template name"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="Enter template slug"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">
                  HTML Template File <span className="text-sm text-gray-500">(Optional - leave empty to keep existing)</span>
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="file"
                    type="file"
                    accept=".html,text/html"
                    onChange={handleFileChange}
                    className="cursor-pointer file:cursor-pointer"
                    disabled={loading}
                  />
                  {file && (
                    <div className="flex items-center gap-2 text-green-600">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audienceType">Audience Type</Label>
                <select
                  id="audienceType"
                  value={audienceTypeId}
                  onChange={e => setAudienceTypeId(e.target.value)}
                  disabled={loading}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6600]"
                >
                  <option value="">Select audience type</option>
                  {audienceTypes.map(at => (
                    <option key={at.id} value={at.id}>{at.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={emailTemplateCategoryId ?? ''}
                  onChange={e => setEmailTemplateCategoryId(e.target.value ? Number(e.target.value) : null)}
                  disabled={categoriesLoading || loading}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6600]"
                >
                  <option value="">No category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={type}
                  onChange={e => setType(e.target.value)}
                  disabled={loading}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6600]"
                >
                  <option value="ae_use">AE (Account Executive Use)</option>
                  <option value="bank_use">Bank Use</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={(e) => setIsVisible(e.target.checked)}
                    disabled={loading}
                    className="accent-[#ff6600]"
                  />
                  <span className="text-sm">Visible</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isArchived}
                    onChange={(e) => setIsArchived(e.target.checked)}
                    disabled={loading}
                    className="accent-[#ff6600]"
                  />
                  <span className="text-sm">Archived</span>
                </label>
              </div>

              {/* Fields section */}
              <div className="space-y-2">
                <Label>Fields</Label>
                <div className="space-y-2">
                  {fields.map((field, index) => {
                    const hasId = !!field.id; // Existing field
                    const isAutomatic = field.is_automatic;
                    return (
                      <div key={field.id || `new-${index}`} className="flex items-center gap-2 p-2 border border-gray-200 rounded-md">
                        <Input
                          placeholder="Parameter"
                          value={field.parameter || ''}
                          onChange={(e) => updateField(index, { parameter: e.target.value })}
                          disabled={loading}
                          className="flex-1"
                        />
                        <select
                          value={field.type || ''}
                          onChange={(e) => updateField(index, { type: e.target.value })}
                          disabled={loading}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6600] text-sm"
                        >
                          {displayedFieldTypes.map(ft => (
                            <option key={ft.value} value={ft.value}>{ft.label}</option>
                          ))}
                        </select>
                        <Input
                          placeholder="DB Name"
                          value={field.db_name || ''}
                          onChange={(e) => updateField(index, { db_name: e.target.value })}
                          disabled={loading}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeField(index)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    );
                  })}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addField}
                    disabled={loading}
                    className="w-full"
                  >
                    Add Field
                  </Button>
                </div>
              </div>
            </div>

            {/* Right side - Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Email Preview</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  disabled={loading}
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPreview ? 'Hide' : 'Show'}
                </Button>
              </div>

              {showPreview && htmlContent ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden h-[500px]">
                  <iframe
                    srcDoc={htmlContent}
                    className="w-full h-full border-0"
                    sandbox="allow-same-origin"
                    title="Email Template Preview"
                  />
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500 h-[500px] flex flex-col items-center justify-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm">No preview available</p>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          {htmlContent && (
            <Button
              variant="outline"
              onClick={handleEditInBuilder}
              disabled={loading || fetching}
              className="border-[#ff6600] text-[#ff6600] hover:bg-[#ff6600] hover:text-white"
            >
              <LayoutTemplate className="w-4 h-4 mr-2" />
              Edit Template
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={loading || fetching || !name.trim() || !subject.trim()}
            className="bg-[#ff6600] hover:bg-[#ff7a2f] text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Template'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

