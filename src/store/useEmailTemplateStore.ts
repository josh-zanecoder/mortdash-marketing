import { create } from 'zustand';

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
