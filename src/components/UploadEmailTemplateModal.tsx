'use client';

import { useState, useEffect, useMemo } from 'react';
import { useEmailTemplateStore } from '@/store/useEmailTemplateStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FileText, XCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
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
  parameter: string;
  type: string;
  db_name: string;
  is_required: boolean;
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

interface UploadEmailTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UploadEmailTemplateModal({ open, onClose, onSuccess }: UploadEmailTemplateModalProps) {
  const router = useRouter();
  const { 
    templateName, 
    setTemplateName,
    subject, 
    setSubject,
    selectedTemplateTypes,
    setSelectedTemplateTypes,
    selectedCategoryId,
    setSelectedCategoryId,
    uploadTemplate,
    isUploading,
    resetForm
  } = useEmailTemplateStore();

  const [file, setFile] = useState<File | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [fields, setFields] = useState<EmailTemplateField[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const [audienceTypes, setAudienceTypes] = useState<AudienceType[]>([]);
  const [audienceTypesLoading, setAudienceTypesLoading] = useState(false);
  const [categories, setCategories] = useState<EmailCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const displayedFieldTypes = useMemo(() => {
    const hasClientOrProspect = selectedTemplateTypes.includes('client') || selectedTemplateTypes.includes('prospect');
    return hasClientOrProspect
      ? [...BASE_FIELD_TYPES, { value: 'related', label: 'Member' }]
      : BASE_FIELD_TYPES;
  }, [selectedTemplateTypes]);

  const createValueFromName = (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, '_');
  };

  useEffect(() => {
    if (open) {
      fetchAudienceTypes();
      fetchCategories();
    } else {
      // Reset form when modal closes
      resetForm();
      setFile(null);
      setHtmlContent('');
      setFields([]);
    }
  }, [open, resetForm]);

  const fetchAudienceTypes = async () => {
    setAudienceTypesLoading(true);
    try {
      const response = await fetch('/api/audience_types');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch audience types: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        const audienceTypesWithValues = data.data.map((at: AudienceType) => ({
          ...at,
          value: createValueFromName(at.name)
        }));
        setAudienceTypes(audienceTypesWithValues);
        if (audienceTypesWithValues.length > 0) {
          setSelectedTemplateTypes([audienceTypesWithValues[0].value || '']);
        }
      } else if (Array.isArray(data)) {
        const audienceTypesWithValues = data.map((at: AudienceType) => ({
          ...at,
          value: createValueFromName(at.name)
        }));
        setAudienceTypes(audienceTypesWithValues);
        if (audienceTypesWithValues.length > 0) {
          setSelectedTemplateTypes([audienceTypesWithValues[0].value || '']);
        }
      } else if (data.data && Array.isArray(data.data)) {
        const audienceTypesWithValues = data.data.map((at: AudienceType) => ({
          ...at,
          value: createValueFromName(at.name)
        }));
        setAudienceTypes(audienceTypesWithValues);
        if (audienceTypesWithValues.length > 0) {
          setSelectedTemplateTypes([audienceTypesWithValues[0].value || '']);
        }
      } else {
        setAudienceTypes([]);
        setSelectedTemplateTypes([]);
      }
    } catch (error) {
      console.error('Error fetching audience types:', error);
      toast.error('Failed to load audience types');
      setAudienceTypes([]);
      setSelectedTemplateTypes([]);
    } finally {
      setAudienceTypesLoading(false);
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
        const defaultCategoryId = data.data[0]?.id ?? null;
        setSelectedCategoryId(defaultCategoryId);
      } else {
        setCategories([]);
        setSelectedCategoryId(null);
      }
    } catch (e) {
      console.error('Error fetching categories:', e);
      setCategories([]);
      setSelectedCategoryId(null);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/html' || selectedFile.name.endsWith('.html')) {
        setFile(selectedFile);
        
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            if (content) {
              setHtmlContent(content);
            }
          } catch (error) {
            console.error('Error reading file:', error);
            toast.error('Error reading HTML file', {
              icon: <XCircle className="text-red-600" />,
            });
          }
        };
        
        reader.onerror = () => {
          console.error('FileReader error');
          toast.error('Error reading HTML file', {
            icon: <XCircle className="text-red-600" />,
          });
        };
        
        reader.readAsText(selectedFile);
      } else {
        toast.error('Please select an HTML file', {
          icon: <XCircle className="text-red-600" />,
        });
      }
    }
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (selectedTemplateTypes.length === 0) {
      toast.error('Please select at least one template type');
      return;
    }
    if (!selectedCategoryId) {
      toast.error('Please select a category');
      return;
    }
    if (!htmlContent) {
      toast.error('Please upload an HTML file');
      return;
    }

    try {
      const validFields = fields.filter(field => 
        field.parameter.trim() && field.type.trim() && field.db_name.trim()
      );

      await uploadTemplate({
        name: templateName.trim(),
        file: htmlContent,
        templateTypes: selectedTemplateTypes,
        subject: subject.trim(),
        html: htmlContent,
        email_template_category_id: selectedCategoryId,
        fields: validFields,
      });
      
      toast.success('Email template uploaded successfully!', {
        icon: <FileText className="text-green-600" />,
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      
      if (error instanceof Error && error.message.includes('thumbnail')) {
        toast.error('Template uploaded but thumbnail generation failed. The template was saved successfully.');
      } else {
        toast.error('Failed to upload email template');
      }
    }
  };

  const addField = () => {
    setFields([...fields, { parameter: '', type: 'audience', db_name: '', is_required: false }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, field: Partial<EmailTemplateField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...field };
    setFields(newFields);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !isUploading && onClose()}>
      <DialogContent className="!max-w-[98vw] !w-[98vw] !sm:max-w-[98vw] max-h-[95vh] h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Email Template</DialogTitle>
          <DialogDescription>
            Upload an HTML file to create a new email template. Fill in all required fields and preview your template.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Left side - Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Template Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
                disabled={isUploading}
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
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">
                HTML Template File <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file"
                  type="file"
                  accept=".html,text/html"
                  onChange={handleFileChange}
                  className="cursor-pointer file:cursor-pointer"
                  disabled={isUploading}
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
              <Label>
                Template Types <span className="text-red-500">*</span> <span className="text-sm text-gray-500">(Select multiple)</span>
              </Label>
              <div className="flex flex-col gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {audienceTypes.map((audienceType) => {
                  const isSelected = selectedTemplateTypes.includes(audienceType.value || '');
                  return (
                    <label key={audienceType.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={audienceType.value}
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTemplateTypes([...selectedTemplateTypes, audienceType.value || '']);
                          } else {
                            setSelectedTemplateTypes(selectedTemplateTypes.filter(type => type !== audienceType.value));
                          }
                        }}
                        disabled={isUploading || audienceTypesLoading}
                        className="accent-[#ff6600]"
                      />
                      <span className="text-sm">{audienceType.name}</span>
                    </label>
                  );
                })}
              </div>
              {audienceTypesLoading && <div className="text-sm text-gray-500">Loading template types...</div>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <select
                id="category"
                value={selectedCategoryId ?? ''}
                onChange={e => setSelectedCategoryId(Number(e.target.value))}
                disabled={categoriesLoading || isUploading}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                required
              >
                {categoriesLoading && <option value="">Loading...</option>}
                {!categoriesLoading && categories.length === 0 && <option value="">No categories</option>}
                {!categoriesLoading && categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Fields section */}
            <div className="space-y-2">
              <Label>Fields (Optional)</Label>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Parameter"
                      value={field.parameter}
                      onChange={(e) => updateField(index, { parameter: e.target.value })}
                      disabled={isUploading}
                      className="flex-1"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateField(index, { type: e.target.value })}
                      disabled={isUploading}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6600] text-sm"
                    >
                      {displayedFieldTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    <Input
                      placeholder="DB Name"
                      value={field.db_name}
                      onChange={(e) => updateField(index, { db_name: e.target.value })}
                      disabled={isUploading}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeField(index)}
                      disabled={isUploading}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addField}
                  disabled={isUploading}
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
                disabled={isUploading}
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
                <p className="text-sm">Upload an HTML file to see preview</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUploading || !templateName.trim() || !subject.trim() || selectedTemplateTypes.length === 0 || audienceTypesLoading || !selectedCategoryId || !htmlContent}
            className="bg-[#ff6600] hover:bg-[#ff7a2f] text-white"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Template'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

