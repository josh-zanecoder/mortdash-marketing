'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useEmailBuilderStore } from '@/store/useEmailBuilder';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AudienceType {
  id: number;
  name: string;
  created_at: string | null;
  updated_at: string | null;
}

interface EmailCategory {
  id: number;
  slug: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export default function SaveEmailTemplateModal() {
  const { isSaveModalOpen, htmlContent, token, closeSaveModal, saveEmailTemplate } = useEmailBuilderStore();
  
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [slug, setSlug] = useState('');
  const [selectedAudienceTypeId, setSelectedAudienceTypeId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);
  const [isArchived, setIsArchived] = useState(false);
  const [type, setType] = useState<string>('ae_use'); // Default to 'ae_use' to match database default
  const [isSaving, setIsSaving] = useState(false);
  
  const [audienceTypes, setAudienceTypes] = useState<AudienceType[]>([]);
  const [audienceTypesLoading, setAudienceTypesLoading] = useState(false);
  const [categories, setCategories] = useState<EmailCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isSaveModalOpen) {
      fetchAudienceTypes();
      fetchCategories();
    } else {
      // Reset form when modal closes
      setName('');
      setSubject('');
      setSlug('');
      setSelectedAudienceTypeId('');
      setSelectedCategoryId('');
      setIsVisible(true);
      setIsArchived(false);
      setType('ae_use'); // Reset to default
    }
  }, [isSaveModalOpen]);

  const fetchAudienceTypes = async () => {
    setAudienceTypesLoading(true);
    try {
      const response = await fetch('/api/audience_types');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch audience types: ${response.status}`);
      }
      
      const data = await response.json();
      
      let audienceTypesList: AudienceType[] = [];
      if (data.success && Array.isArray(data.data)) {
        audienceTypesList = data.data;
      } else if (Array.isArray(data)) {
        audienceTypesList = data;
      } else if (data.data && Array.isArray(data.data)) {
        audienceTypesList = data.data;
      }
      
      setAudienceTypes(audienceTypesList);
      if (audienceTypesList.length > 0) {
        setSelectedAudienceTypeId(String(audienceTypesList[0].id));
      }
    } catch (error) {
      console.error('Error fetching audience types:', error);
      toast.error('Failed to load audience types');
      setAudienceTypes([]);
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
        if (data.data.length > 0) {
          setSelectedCategoryId(String(data.data[0].id));
        }
      } else {
        setCategories([]);
      }
    } catch (e) {
      console.error('Error fetching categories:', e);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Auto-detect merge tags from HTML and create fields
  const extractMergeTags = (html: string): Array<{
    parameter: string;
    type: string;
    db_name: string;
    is_required: boolean;
  }> => {
    const mergeTagRegex = /\{\{([^}]+)\}\}/g;
    const matches = html.match(mergeTagRegex);
    if (!matches) return [];
    
    const uniqueTags = [...new Set(matches)];
    return uniqueTags.map(tag => {
      const dbName = tag.replace(/[{}]/g, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return {
        parameter: tag,
        type: dbName,
        db_name: dbName,
        is_required: false
      };
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (!selectedAudienceTypeId) {
      toast.error('Please select an audience type');
      return;
    }
    if (!htmlContent) {
      toast.error('No HTML content to save');
      return;
    }
    if (!token) {
      toast.error('Authentication token missing');
      return;
    }

    try {
      setIsSaving(true);

      // Extract merge tags and create fields
      const fields = extractMergeTags(htmlContent);

      await saveEmailTemplate({
        name: name.trim(),
        subject: subject.trim(),
        audienceTypeId: selectedAudienceTypeId,
        html: htmlContent,
        slug: slug.trim() || undefined,
        isVisible,
        type: (type && (type === 'ae_use' || type === 'bank_use')) ? type : 'ae_use', // Default to 'ae_use' to match database default
        emailTemplateCategoryId: selectedCategoryId || undefined,
        isArchived,
        fields: fields.length > 0 ? fields : undefined,
      }, token);

      toast.success('Email template saved successfully!');
      closeSaveModal();
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error(error.message || 'Failed to save email template');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isSaveModalOpen} onOpenChange={(open) => !open && closeSaveModal()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Save Email Template</DialogTitle>
          <DialogDescription>
            Enter the details for your email template. The HTML content from the builder will be saved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Template Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter template name"
              required
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject <span className="text-red-500">*</span></Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              required
            />
          </div>

          {/* Audience Type */}
          <div className="space-y-2">
            <Label htmlFor="audienceType">Audience Type <span className="text-red-500">*</span></Label>
            <Select
              value={selectedAudienceTypeId}
              onValueChange={setSelectedAudienceTypeId}
              disabled={audienceTypesLoading}
            >
              <SelectTrigger id="audienceType">
                <SelectValue placeholder={audienceTypesLoading ? "Loading..." : "Select audience type"} />
              </SelectTrigger>
              <SelectContent>
                {audienceTypes.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (Optional)</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Enter template slug"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Template Type</Label>
            <Select
              value={type || 'ae_use'}
              onValueChange={(value) => setType(value || 'ae_use')}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select template type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ae_use">AE (Account Executive Use)</SelectItem>
                <SelectItem value="bank_use">Bank Use</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Select
              value={selectedCategoryId || undefined}
              onValueChange={(value) => setSelectedCategoryId(value || '')}
              disabled={categoriesLoading}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category (optional)"} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Visibility and Archive Toggles */}
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isVisible"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#ff6600] focus:ring-[#ff6600]"
              />
              <Label htmlFor="isVisible" className="cursor-pointer">
                Visible
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isArchived"
                checked={isArchived}
                onChange={(e) => setIsArchived(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#ff6600] focus:ring-[#ff6600]"
              />
              <Label htmlFor="isArchived" className="cursor-pointer">
                Archived
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={closeSaveModal}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !name.trim() || !subject.trim() || !selectedAudienceTypeId}
            className="bg-[#ff6600] hover:bg-[#e55a00] text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Template'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

