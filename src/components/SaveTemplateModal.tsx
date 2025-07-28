'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, FileText, X } from 'lucide-react';

interface SaveTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (templateData: {
    name: string;
    file: string;
    templateTypes: string[];
    subject: string;
    html: string;
    json: string;
    ampHtml: string | null;
    version: number;
    language: string | null;
    email_template_id?: number;
    email_template_category_id?: number;
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

interface EmailCategory {
  id: number;
  slug: string;
  name: string;
  created_at: string;
  updated_at: string;
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
  const [selectedTemplateTypes, setSelectedTemplateTypes] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [audienceTypes, setAudienceTypes] = useState<AudienceType[]>([]);
  const [audienceTypesLoading, setAudienceTypesLoading] = useState(false);
  const [categories, setCategories] = useState<EmailCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Helper function to create a normalized value from name
  const createValueFromName = (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, '_');
  };

  // Fetch audience types when modal opens
  useEffect(() => {
    if (open) {
      fetchAudienceTypes();
      fetchCategories();
      
      // Log detected merge tags when modal opens
      const extractMergeTags = (html: string): string[] => {
        const mergeTagRegex = /\{\{([^}]+)\}\}/g;
        const matches = html.match(mergeTagRegex);
        return matches ? [...new Set(matches)] : []; // Remove duplicates
      };

      const detectedMergeTags = extractMergeTags(html);
      
   
      
      if (detectedMergeTags.length > 0) {
        
        
        // Show what fields will be created
        const fields = detectedMergeTags.map(tag => {
          const dbName = tag.replace(/[{}]/g, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          return {
            parameter: tag,
            type: dbName, // Type matches the db_name for consistency
            db_name: dbName,
            is_required: false
          };
        });
        
      
      } else {
     
      }
    }
  }, [open, html]);

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
        setSelectedCategoryId(data.data[0]?.id ?? null);
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


  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a template name');
      return;
    }
    if (!subject.trim()) {
      alert('Please enter a subject');
      return;
    }
    if (selectedTemplateTypes.length === 0) {
      alert('Please select at least one template type');
      return;
    }
    if (!selectedCategoryId) {
      alert('Please select a category');
      return;
    }
    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        file: html,
        templateTypes: selectedTemplateTypes,
        subject: subject.trim(),
        html,
        json,
        ampHtml,
        version,
        language,
        email_template_id,
        email_template_category_id: selectedCategoryId,
      });
      onClose();
      setName('');
      setSubject('');
      setSelectedTemplateTypes([]);
      setSelectedCategoryId(categories[0]?.id ?? null);
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
      setSelectedTemplateTypes([]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-all duration-300" />
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-[90vw] h-[90vh] max-w-[1200px] max-h-[800px] flex flex-col overflow-hidden border border-gray-100 ring-1 ring-black/10 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Save Email Template</h2>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
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
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  placeholder="Enter template name"
                  disabled={isSaving}
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
                  disabled={isSaving}
                  className="text-lg h-12"
                />
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
                          disabled={isSaving || audienceTypesLoading}
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
                  disabled={categoriesLoading || isSaving}
                  className="w-full text-lg h-12 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                <Label className="text-lg font-medium">Template Info</Label>
                <div className="text-sm text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
                  <div>Version: {version}</div>
                  <div>Language: {language || 'en-US'}</div>
                  <div>HTML Size: {(html.length / 1024).toFixed(1)} KB</div>
                  {ampHtml && <div>AMP HTML: Available</div>}
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
        <div className="flex items-center justify-end gap-4 p-8 border-t border-gray-100 bg-gray-50/80 backdrop-blur-sm">
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
            disabled={isSaving || !name.trim() || !subject.trim() || selectedTemplateTypes.length === 0 || audienceTypesLoading || !selectedCategoryId}
            className="bg-[#ff6600] hover:bg-[#ff7a2f] text-white h-12 px-8 shadow-lg shadow-orange-100/40"
            size="lg"
          >
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>
    </div>
  );
} 