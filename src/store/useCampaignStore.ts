import { create } from 'zustand';

interface CampaignTemplate {
  id: number;
  path: string;
  name: string;
  audience_type_id: number | null;
  thumbnail: string;
  category: string | null;
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
  fetchTemplates: (audience_type_id: number, is_archived?: boolean) => Promise<void>;
}

export const useCampaignStore = create<CampaignStore>((set) => ({
  templates: [],
  loading: false,
  error: null,
  fetchTemplates: async (audience_type_id, is_archived = false) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      params.set('audience_type_id', String(audience_type_id));
      params.set('is_archived', String(is_archived));
      // Optionally add token if needed: params.set('token', token);
      const res = await fetch(`/api/campaign?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch templates');
      const data = await res.json();
      set({ templates: Array.isArray(data.data) ? data.data : [], loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
}));
