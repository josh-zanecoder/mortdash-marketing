import { create } from 'zustand';

interface EmailBuilderState {
  isSaveModalOpen: boolean;
  htmlContent: string | null;
  token: string | null;
  openSaveModal: (html: string, token: string) => void;
  closeSaveModal: () => void;
  saveEmailTemplate: (data: {
    name: string;
    subject: string;
    audienceTypeId: string | number;
    html: string;
    slug?: string;
    isVisible?: boolean;
    thumbnail?: string;
    type?: string;
    emailTemplateCategoryId?: string | number;
    isArchived?: boolean;
    fields?: Array<{
      parameter: string;
      type: string;
      db_name: string;
      is_required: boolean;
    }>;
  }, token: string) => Promise<void>;
}

export const useEmailBuilderStore = create<EmailBuilderState>((set, get) => ({
  isSaveModalOpen: false,
  htmlContent: null,
  token: null,

  openSaveModal: (html: string, token: string) => {
    set({ isSaveModalOpen: true, htmlContent: html, token });
  },

  closeSaveModal: () => {
    set({ isSaveModalOpen: false, htmlContent: null, token: null });
  },

  saveEmailTemplate: async (data, token) => {
    try {
      // Create FormData
      const formData = new FormData();

      // Add required fields
      formData.append('name', data.name);
      formData.append('subject', data.subject);
      formData.append('audienceTypeId', String(data.audienceTypeId));

      // Add optional fields if provided
      if (data.slug) {
        formData.append('slug', data.slug);
      }
      if (data.isVisible !== undefined) {
        formData.append('isVisible', String(data.isVisible));
      }
      if (data.thumbnail) {
        formData.append('thumbnail', data.thumbnail);
      }
      // Send type - default to 'ae_use' if not provided (matches database default)
      const templateType = data.type && (data.type === 'ae_use' || data.type === 'bank_use') 
        ? data.type 
        : 'ae_use';
      formData.append('type', templateType);
      if (data.emailTemplateCategoryId) {
        formData.append('emailTemplateCategoryId', String(data.emailTemplateCategoryId));
      }
      if (data.isArchived !== undefined) {
        formData.append('isArchived', String(data.isArchived));
      }
      if (data.fields && data.fields.length > 0) {
        formData.append('fields', JSON.stringify(data.fields));
      }

      // Create HTML file from content
      const htmlBlob = new Blob([data.html], { type: 'text/html' });
      const htmlFile = new File([htmlBlob], 'template.html', { type: 'text/html' });
      formData.append('file', htmlFile);

      // POST to email-builder endpoint
      const response = await fetch('/api/email-builder', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save email template' }));
        throw new Error(errorData.error || errorData.message || 'Failed to save email template');
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Error saving email template:', error);
      throw error;
    }
  },
}));

