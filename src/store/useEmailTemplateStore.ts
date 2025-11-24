import { create } from 'zustand';

interface EmailTemplate {
  id: string | number;
  name?: string | null;
  subject?: string | null;
  thumbnail?: string | null;
  path?: string | null;
  type?: string | null;
  isVisible?: boolean | null;
  isArchived?: boolean | null;
  audienceTypeId?: string | number | null;
  emailTemplateCategoryId?: string | number | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  slug?: string | null;
  deletedAt?: string | Date | null;
  fields?: Array<{
    id: string;
    emailTemplateId: string;
    parameter: string;
    type: string;
    isAutomatic: boolean;
    isRequired: boolean;
    createdAt?: string;
    updatedAt?: string;
    dbName?: string;
    dbAlternateName?: string;
  }> | null;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface EmailTemplateState {
  templateName: string;
  setTemplateName: (name: string) => void;
  subject: string;
  setSubject: (subject: string) => void;
  selectedTemplateTypes: string[];
  setSelectedTemplateTypes: (types: string[]) => void;
  selectedCategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;
  templates: EmailTemplate[];
  templatesLoading: boolean;
  pagination: PaginationMeta | null;
  fetchTemplates: (token: string) => Promise<void>;
  fetchPaginatedTemplates: (token: string, page: number, limit: number) => Promise<void>;
  fetchTemplateById: (token: string, templateId: string | number) => Promise<EmailTemplate>;
  updateTemplate: (token: string, templateId: string | number, templateData: {
    name?: string;
    subject?: string;
    file?: File | null;
    slug?: string;
    isVisible?: boolean;
    thumbnail?: string;
    audienceTypeId?: string | number;
    type?: string;
    emailTemplateCategoryId?: string | number;
    isArchived?: boolean;
    fields?: Array<{
      id?: string;
      parameter: string;
      type: string;
      dbName: string;
      isRequired: boolean;
      isAutomatic?: boolean;
      dbAlternateName?: string;
    }>;
    fieldsToDelete?: string[];
  }) => Promise<void>;
  deleteTemplate: (token: string, templateId: string | number) => Promise<void>;
  saveTemplateHtml: (token: string, templateId: string | number, html: string) => Promise<void>;
  uploadTemplate: (templateData: {
    name: string;
    file: string;
    templateTypes: string[];
    subject: string;
    html: string;
    email_template_category_id?: number;
    fields?: Array<{
      parameter: string;
      type: string;
      db_name: string;
      is_required: boolean;
    }>;
  }) => Promise<void>;
  resetForm: () => void;
}

export const useEmailTemplateStore = create<EmailTemplateState>((set, get) => ({
  templateName: '',
  setTemplateName: (name: string) => set({ templateName: name }),
  
  subject: '',
  setSubject: (subject: string) => set({ subject }),
  
  selectedTemplateTypes: [],
  setSelectedTemplateTypes: (types: string[]) => set({ selectedTemplateTypes: types }),
  
  selectedCategoryId: null,
  setSelectedCategoryId: (id: number | null) => set({ selectedCategoryId: id }),
  
  isUploading: false,
  setIsUploading: (uploading: boolean) => set({ isUploading: uploading }),
  
  templates: [],
  templatesLoading: false,
  pagination: null,
  
  fetchTemplates: async (token: string) => {
    set({ templatesLoading: true });
    try {
      const axios = (await import('axios')).default;
      const res = await axios.get(`/api/email-builder`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
      });

      let templates: EmailTemplate[] = [];
      
      if (res.data?.success && Array.isArray(res.data.data)) {
        templates = res.data.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        templates = res.data.data;
      } else if (Array.isArray(res.data)) {
        templates = res.data;
      } else if (res.data && typeof res.data === 'object') {
        templates = res.data.templates || res.data.emailTemplates || [];
      }

      set({ templates });
    } catch (error) {
      console.error('Failed to fetch email templates:', error);
      set({ templates: [] });
    } finally {
      set({ templatesLoading: false });
    }
  },
  
  fetchPaginatedTemplates: async (token: string, page: number = 1, limit: number = 10) => {
    set({ templatesLoading: true });
    try {
      const axios = (await import('axios')).default;
      const res = await axios.get(`/api/email-templates/paginated`, {
        params: {
          page,
          limit,
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
        validateStatus: () => true,
      });

      let templates: EmailTemplate[] = [];
      let pagination: PaginationMeta | null = null;

      // Handle response format
      if (res.data?.success && res.data?.data) {
        if (Array.isArray(res.data.data.data)) {
          templates = res.data.data.data;
          pagination = res.data.data.pagination;
        } else if (res.data.data && typeof res.data.data === 'object') {
          templates = res.data.data.data || [];
          pagination = res.data.data.pagination || null;
        }
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        templates = res.data.data;
        pagination = res.data.pagination || null;
      } else if (Array.isArray(res.data)) {
        templates = res.data;
      }

      set({ templates, pagination });
    } catch (error) {
      console.error('Failed to fetch paginated email templates:', error);
      set({ templates: [], pagination: null });
    } finally {
      set({ templatesLoading: false });
    }
  },
  
  fetchTemplateById: async (token: string, templateId: string | number) => {
    try {
      const axios = (await import('axios')).default;
      const res = await axios.get(`/api/email-builder/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
        validateStatus: () => true,
      });

      if (res.data?.success && res.data?.data) {
        return res.data.data;
      } else if (res.data?.data) {
        return res.data.data;
      } else if (res.data) {
        return res.data;
      }
      
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('Failed to fetch email template by ID:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch email template');
    }
  },
  
  updateTemplate: async (token: string, templateId: string | number, templateData) => {
    try {
      const formData = new FormData();
      
      // Add form fields if provided
      if (templateData.name !== undefined) formData.append('name', templateData.name);
      if (templateData.subject !== undefined) formData.append('subject', templateData.subject);
      if (templateData.slug !== undefined) formData.append('slug', templateData.slug);
      if (templateData.isVisible !== undefined) formData.append('isVisible', String(templateData.isVisible));
      if (templateData.thumbnail !== undefined) formData.append('thumbnail', templateData.thumbnail);
      if (templateData.audienceTypeId !== undefined) formData.append('audienceTypeId', String(templateData.audienceTypeId));
      if (templateData.type !== undefined) formData.append('type', templateData.type);
      if (templateData.emailTemplateCategoryId !== undefined) formData.append('emailTemplateCategoryId', String(templateData.emailTemplateCategoryId));
      if (templateData.isArchived !== undefined) formData.append('isArchived', String(templateData.isArchived));
      
      // Add file if provided
      if (templateData.file) {
        formData.append('file', templateData.file);
      }
      
      // Add fields as JSON string
      if (templateData.fields && templateData.fields.length > 0) {
        formData.append('fields', JSON.stringify(templateData.fields));
      }
      
      // Add fieldsToDelete as JSON string
      if (templateData.fieldsToDelete && templateData.fieldsToDelete.length > 0) {
        formData.append('fieldsToDelete', JSON.stringify(templateData.fieldsToDelete));
      }
      
      const res = await fetch(`/api/email-builder/${templateId}`, {
        method: 'PUT',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to update template' }));
        throw new Error(errorData.error || errorData.message || 'Failed to update template');
      }

      return await res.json();
    } catch (error: any) {
      console.error('Failed to update email template:', error);
      throw new Error(error.message || 'Failed to update email template');
    }
  },
  
  deleteTemplate: async (token: string, templateId: string | number) => {
    try {
      const res = await fetch(`/api/email-builder/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to delete template' }));
        throw new Error(errorData.error || errorData.message || 'Failed to delete template');
      }

      return await res.json();
    } catch (error: any) {
      console.error('Failed to delete email template:', error);
      throw new Error(error.message || 'Failed to delete email template');
    }
  },
  
  saveTemplateHtml: async (token: string, templateId: string | number, html: string) => {
    try {
      // Replace the HTML template file - only sends the file, preserves all other template fields
      const formData = new FormData();
      
      // Create a file from the HTML content (from email builder)
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const htmlFile = new File([htmlBlob], 'template.html', { type: 'text/html' });
      
      // Append the file - backend will update the path and regenerate thumbnail
      formData.append('file', htmlFile);
      
      // Add flag to request thumbnail regeneration
      formData.append('regenerateThumbnail', 'true');
      
      // Send PUT request to replace the HTML file and regenerate thumbnail
      const response = await fetch(`/api/email-builder/${templateId}`, {
        method: 'PUT',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update template' }));
        throw new Error(errorData.error || errorData.message || 'Failed to replace template file');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Failed to replace template HTML file:', error);
      throw new Error(error.message || 'Failed to replace template HTML file');
    }
  },
  
  uploadTemplate: async (templateData) => {
    set({ isUploading: true });
    
    try {
      // Create an array of promises for each template type
      const savePromises = templateData.templateTypes.map(async (templateType) => {
        // Create FormData for each template type
        const formData = new FormData();
        
        // Add form fields
        formData.append('name', templateData.name);
        formData.append('subject', templateData.subject);
        
        // Get the audience type ID based on the selected template type
        const audienceTypeId = await getAudienceTypeId(templateType);
        formData.append('audience_type_id', audienceTypeId.toString());
        
        formData.append('created_at', new Date().toISOString());
        
        // Add email_template_category_id if provided
        if (templateData.email_template_category_id) {
          formData.append('email_template_category_id', templateData.email_template_category_id.toString());
        }
        
        // Use only manually defined fields
        if (templateData.fields && templateData.fields.length > 0) {
          formData.append('fields', JSON.stringify(templateData.fields));
        }
        
        // Create a file from the HTML content
        const htmlBlob = new Blob([templateData.html], { type: 'text/html' });
        const htmlFile = new File([htmlBlob], 'template.html', { type: 'text/html' });
        formData.append('file', htmlFile);
        
        // Save the template to your database
        const response = await fetch('/api/email-templates', {
          method: 'POST',
          body: formData, // Send as FormData instead of JSON
        });

        if (!response.ok) {
          throw new Error(`Failed to save template for type ${templateType}`);
        }

        return response.json();
      });

      // Wait for all templates to be saved
      await Promise.all(savePromises);
      
    } catch (error) {
      console.error('Error uploading template:', error);
      throw error;
    } finally {
      set({ isUploading: false });
    }
  },
  
  resetForm: () => set({
    templateName: '',
    subject: '',
    selectedTemplateTypes: [],
    selectedCategoryId: null,
    isUploading: false
  })
}));


// Helper function to get audience type ID from template type value
const getAudienceTypeId = async (templateTypeValue: string): Promise<number> => {
  try {
    const response = await fetch('/api/audience_types');
    if (!response.ok) {
      throw new Error('Failed to fetch audience types');
    }
    const data = await response.json();
    
    // Helper function to create normalized value from name (same as SaveTemplateModal)
    const createValueFromName = (name: string): string => {
      return name.toLowerCase().replace(/\s+/g, '_');
    };
    
    if (data.success && Array.isArray(data.data)) {
      // Add value field to each audience type and find the match
      const audienceType = data.data.find((at: any) => {
        const normalizedValue = createValueFromName(at.name);
        return normalizedValue === templateTypeValue;
      });
      
      if (audienceType) {
        return audienceType.id;
      }
    } else if (Array.isArray(data)) {
      // Add value field to each audience type and find the match
      const audienceType = data.find((at: any) => {
        const normalizedValue = createValueFromName(at.name);
        return normalizedValue === templateTypeValue;
      });
      
      if (audienceType) {
        return audienceType.id;
      }
    }
    
    return 1;
  } catch (error) {
    console.error('Error getting audience type ID:', error);
    // Fallback to ID 1 if error
    return 1;
  }
};
