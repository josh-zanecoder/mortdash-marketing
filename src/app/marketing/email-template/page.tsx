'use client';

import { useState, useEffect } from 'react';
import { useEmailTemplateStore } from '@/store/useEmailTemplateStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { Upload, FileText, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AudienceType {
  id: number;
  name: string;
  created_at: string | null;
  updated_at: string | null;
  value?: string; // Optional, will be derived from name
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

const FIELD_TYPES = [
  { value: 'audience', label: 'Audience' },
  { value: 'account_executive', label: 'Account Executive' },
  { value: 'member', label: 'Member' },
  { value: 'bank', label: 'Bank' },
  { value: 'date', label: 'Date' }
];

export default function EmailTemplatePage() {
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

  // Helper function to create a normalized value from name
  const createValueFromName = (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, '_');
  };

  // Fetch audience types and categories when component mounts
  useEffect(() => {
    fetchAudienceTypes();
    fetchCategories();
  }, []);


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
          setSelectedTemplateTypes([audienceTypesWithValues[0].value || '']);
        }
      } else if (Array.isArray(data)) {
        // Add value field to each audience type based on name
        const audienceTypesWithValues = data.map((at: AudienceType) => ({
          ...at,
          value: createValueFromName(at.name)
        }));
        setAudienceTypes(audienceTypesWithValues);
        if (audienceTypesWithValues.length > 0) {
          setSelectedTemplateTypes([audienceTypesWithValues[0].value || '']);
        }
      } else if (data.data && Array.isArray(data.data)) {
        // Add value field to each audience type based on name
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
        // Set file first
        setFile(selectedFile);
        
        // Read file content asynchronously
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
      toast.error('Please enter a template name', {
        icon: <XCircle className="text-red-600" />,
      });
      return;
    }
    if (!subject.trim()) {
      toast.error('Please enter a subject', {
        icon: <XCircle className="text-red-600" />,
      });
      return;
    }
    if (selectedTemplateTypes.length === 0) {
      toast.error('Please select at least one template type', {
        icon: <XCircle className="text-red-600" />,
      });
      return;
    }
    if (!selectedCategoryId) {
      toast.error('Please select a category', {
        icon: <XCircle className="text-red-600" />,
      });
      return;
    }
    if (!htmlContent) {
      toast.error('Please upload an HTML file', {
        icon: <XCircle className="text-red-600" />,
      });
      return;
    }

    try {
      // Filter out empty fields
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
        icon: <CheckCircle2 className="text-green-600" />,
      });
      
      resetForm();
      setFile(null);
      setHtmlContent('');
      router.push('/marketing/campaign');
    } catch (error) {
      console.error('Upload error:', error);
      
      // Check if it's a thumbnail generation error
      if (error instanceof Error && error.message.includes('thumbnail')) {
        toast.error('Template uploaded but thumbnail generation failed. The template was saved successfully.', {
          icon: <XCircle className="text-yellow-600" />,
        });
      } else {
        toast.error('Failed to upload email template', {
          icon: <XCircle className="text-red-600" />,
        });
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

  const handleClose = () => {
    if (!isUploading) {
      resetForm();
      setFile(null);
      setHtmlContent('');
    }
  };

  return (
    <main className="min-h-screen bg-[#fdf6f1] flex flex-col items-center justify-center py-12 px-4">
      <Toaster />
      <div key="email-template-upload" className="relative bg-white rounded-3xl shadow-2xl w-[90vw] h-[90vh] max-w-[1200px] max-h-[800px] flex flex-col overflow-hidden border border-gray-100 ring-1 ring-black/10">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Upload Email Template</h1>
          
        </div>
        
        {/* Content */}
        <div className="flex flex-1 overflow-hidden bg-white/80 backdrop-blur-sm">
          {/* Left side - Form */}
          <div className="flex-1 p-10 overflow-y-auto">
            <div className="space-y-10 max-w-2xl">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-lg font-medium">
                  Template Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={templateName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  disabled={isUploading}
                  className="text-lg h-12"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="subject" className="text-lg font-medium">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                  disabled={isUploading}
                  className="text-lg h-12"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="file" className="text-lg font-medium">
                  HTML Template File <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Input
                      id="file"
                      type="file"
                      accept=".html,text/html"
                      onChange={handleFileChange}
                      className="text-lg h-12 cursor-pointer file:cursor-pointer"
                      disabled={isUploading}
                    />
                  </div>
                  {file && (
                    <div className="flex items-center gap-2 text-green-600">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="templateType" className="text-lg font-medium">
                  Template Types <span className="text-red-500">*</span> <span className="text-sm text-gray-500">(Select multiple)</span>
                </Label>
                <div className="flex flex-col gap-2">
                  {audienceTypes.map((audienceType) => {
                    const isSelected = selectedTemplateTypes.includes(audienceType.value || '');
                    return (
                      <label key={audienceType.id} className="flex items-center gap-3 cursor-pointer select-none">
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
                          className="accent-[#ff6600] w-5 h-5 rounded focus:ring-[#ff6600]"
                        />
                        <span className="text-base font-medium text-gray-800">{audienceType.name}</span>
                      </label>
                    );
                  })}
                </div>
                {audienceTypesLoading && <div className="text-sm text-gray-500">Loading template types...</div>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="category" className="text-lg font-medium">
                  Category <span className="text-red-500">*</span>
                </Label>
                <select
                  id="category"
                  value={selectedCategoryId ?? ''}
                  onChange={e => setSelectedCategoryId(Number(e.target.value))}
                  disabled={categoriesLoading || isUploading}
                  className="w-full text-lg h-12 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  required
                >
                  {categoriesLoading && <option value="">Loading...</option>}
                  {!categoriesLoading && categories.length === 0 && <option value="">No categories</option>}
                  {!categoriesLoading && categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-medium">Fields</Label>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Input
                        placeholder="Key"
                        value={field.parameter}
                        onChange={(e) => updateField(index, { parameter: e.target.value })}
                        disabled={isUploading}
                        className="flex-1"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateField(index, { type: e.target.value })}
                        disabled={isUploading}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {FIELD_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                      <Input
                        placeholder="Value"
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
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        REMOVE
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
                    ADD FIELD
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-medium">Template Info</Label>
                <div className="text-sm text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
                  <div>HTML Size: {htmlContent ? (htmlContent.length / 1024).toFixed(1) + ' KB' : 'No file uploaded'}</div>
                  <div>Template Types: {selectedTemplateTypes.map(type => 
                    audienceTypes.find(at => at.value === type)?.name
                  ).join(', ') || 'None'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Preview */}
          <div className="flex-1 border-l border-gray-100 p-10 overflow-y-auto bg-white/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <Label className="text-2xl font-medium">Email Preview</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                disabled={isUploading}
                className="h-10 px-4"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>

            {showPreview && htmlContent ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div className="text-base font-medium text-gray-700">Email Template Preview</div>
                  </div>
                </div>
                <div className="p-4 max-h-[600px] overflow-hidden bg-white">
                  <iframe
                    srcDoc={htmlContent}
                    className="w-full h-[500px] border-0"
                    sandbox="allow-same-origin"
                    title="Email Template Preview"
                  />
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-16 text-center text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-6 text-gray-400" />
                <p className="text-xl mb-2">Upload an HTML file to see preview</p>
                <p className="text-base">The preview will show exactly how your email will look</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-8 border-t border-gray-100 bg-gray-50/80 backdrop-blur-sm">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
            size="lg"
            className="h-12 px-8"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUploading || !templateName.trim() || !subject.trim() || selectedTemplateTypes.length === 0 || audienceTypesLoading || !selectedCategoryId || !htmlContent}
            className="bg-[#ff6600] hover:bg-[#ff7a2f] text-white h-12 px-8 shadow-lg shadow-orange-100/40"
            size="lg"
          >
            {isUploading ? 'Uploading...' : 'Upload Template'}
          </Button>
        </div>
      </div>
    </main>
  );
}
