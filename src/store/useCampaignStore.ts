import { create } from 'zustand';

interface CampaignTemplate {
  id: number;
  path: string;
  name: string;
  audience_type_id: number | null;
  thumbnail: string;
  category: string | null;
  email_template_category_id: number | null;
  date_created: string;
  date_updated: string;
  is_archived: number;
  is_archived_by_user: boolean;
  html: string;
}

interface CampaignStore {
  templates: CampaignTemplate[];
  loading: boolean;
  error: string | null;
  fetchTemplates: (audience_type_id: number | null, is_archived?: boolean) => Promise<void>;
  clearTemplates: () => void;
}

export const useCampaignStore = create<CampaignStore>((set) => ({
  templates: [],
  loading: false,
  error: null,
  fetchTemplates: async (audience_type_id, is_archived = false) => {
    // If no audience_type_id, clear templates and return
    if (!audience_type_id) {
      set({ templates: [], loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      params.set('audience_type_id', String(audience_type_id));
      
      // Use different endpoint for archived templates
      const endpoint = is_archived ? '/api/campaign/get-archived-templates' : '/api/campaign';
      
      if (is_archived) {
        params.set('is_archived', '1');
      } else {
        params.set('is_archived', '0');
      }
      
      const res = await fetch(`${endpoint}?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch templates');
      const data = await res.json();
      set({ templates: Array.isArray(data.data) ? data.data : [], loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  clearTemplates: () => {
    set({ templates: [], loading: false, error: null });
  },
}));
