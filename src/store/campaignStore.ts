import { create } from 'zustand';

export interface MarketingCampaign {
  id: string | number;
  name: string;
  marketingListId?: number;
  marketing_list_id?: number;
  emailTemplateId?: string;
  email_template_id?: string;
  isScheduled?: boolean;
  is_scheduled?: boolean;
  scheduledAt?: string;
  scheduled_at?: string;
  status?: string;
  campaignStatus?: string;
  campaign_status?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  listName?: string;
  list_name?: string;
  recipientCount?: number;
  recipient_count?: number;
  emailSent?: boolean;
  email_sent?: boolean;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface EmailTemplate {
  id: string | number;
  name?: string;
  subject?: string;
  [key: string]: any;
}

interface CampaignStore {
  campaigns: MarketingCampaign[];
  loading: boolean;
  pagination: PaginationMeta | null;
  emailTemplates: EmailTemplate[];
  emailTemplatesLoading: boolean;
  setCampaigns: (campaigns: MarketingCampaign[]) => void;
  setLoading: (loading: boolean) => void;
  setPagination: (pagination: PaginationMeta | null) => void;
  addCampaign: (campaign: MarketingCampaign) => void;
  updateCampaign: (id: string | number, campaign: Partial<MarketingCampaign>) => void;
  removeCampaign: (id: string | number) => void;
  fetchCampaigns: (token: string, page?: number, limit?: number) => Promise<void>;
  fetchEmailTemplates: (token: string) => Promise<void>;
  setEmailTemplates: (templates: EmailTemplate[]) => void;
  setEmailTemplatesLoading: (loading: boolean) => void;
}

export const useCampaignStore = create<CampaignStore>((set, get) => ({
  campaigns: [],
  loading: false,
  pagination: null,
  emailTemplates: [],
  emailTemplatesLoading: false,
  setCampaigns: (campaigns) => set({ campaigns }),
  setLoading: (loading) => set({ loading }),
  setPagination: (pagination) => set({ pagination }),
  setEmailTemplates: (templates) => set({ emailTemplates: templates }),
  setEmailTemplatesLoading: (loading) => set({ emailTemplatesLoading: loading }),
  addCampaign: (campaign) => set((state) => ({ campaigns: [...state.campaigns, campaign] })),
  updateCampaign: (id, updates) =>
    set((state) => ({
      campaigns: state.campaigns.map((campaign) =>
        String(campaign.id) === String(id) ? { ...campaign, ...updates } : campaign
      ),
    })),
  removeCampaign: (id) =>
    set((state) => ({
      campaigns: state.campaigns.filter((campaign) => String(campaign.id) !== String(id)),
    })),
  fetchCampaigns: async (token: string, page: number = 1, limit: number = 10) => {
    set({ loading: true });
    try {
      const axios = (await import('axios')).default;
      const res = await axios.get(`/api/new-campaign?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
      });

      // Handle paginated response
      // Expected format: { success: true, data: { data: [...], pagination: {...} } } 
      // OR: { success: true, data: [...] }
      if (res.data?.success) {
        const responseData = res.data.data;
        
        // Check if data is an object with nested data and pagination
        if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
          // Format: { data: [...], pagination: {...} }
          if (responseData.data && Array.isArray(responseData.data)) {
            const paginationInfo = responseData.pagination || {};
            set({ 
              campaigns: responseData.data,
              pagination: {
                page: paginationInfo.page || page,
                limit: paginationInfo.limit || limit,
                total: paginationInfo.total || 0,
                totalPages: paginationInfo.totalPages || Math.ceil((paginationInfo.total || 0) / (paginationInfo.limit || limit)),
                hasNextPage: paginationInfo.hasNextPage !== undefined ? paginationInfo.hasNextPage : (paginationInfo.page || page) < (paginationInfo.totalPages || Math.ceil((paginationInfo.total || 0) / (paginationInfo.limit || limit))),
                hasPrevPage: paginationInfo.hasPrevPage !== undefined ? paginationInfo.hasPrevPage : (paginationInfo.page || page) > 1,
              }
            });
            return;
          }
          
          // Check for campaigns property
          if (responseData.campaigns && Array.isArray(responseData.campaigns)) {
            const paginationInfo = responseData.pagination || {};
            set({ 
              campaigns: responseData.campaigns,
              pagination: {
                page: paginationInfo.page || page,
                limit: paginationInfo.limit || limit,
                total: paginationInfo.total || 0,
                totalPages: paginationInfo.totalPages || Math.ceil((paginationInfo.total || 0) / (paginationInfo.limit || limit)),
                hasNextPage: paginationInfo.hasNextPage !== undefined ? paginationInfo.hasNextPage : (paginationInfo.page || page) < (paginationInfo.totalPages || Math.ceil((paginationInfo.total || 0) / (paginationInfo.limit || limit))),
                hasPrevPage: paginationInfo.hasPrevPage !== undefined ? paginationInfo.hasPrevPage : (paginationInfo.page || page) > 1,
              }
            });
            return;
          }
        }
        
        // Check if data is directly an array (format: { success: true, data: [...] })
        if (Array.isArray(responseData)) {
          // Check if pagination info is at the root level
          const paginationInfo = res.data.pagination || {};
          set({ 
            campaigns: responseData, 
            pagination: {
              page: paginationInfo.page || res.data.page || page,
              limit: paginationInfo.limit || res.data.limit || limit,
              total: paginationInfo.total || res.data.total || responseData.length,
              totalPages: paginationInfo.totalPages || res.data.totalPages || Math.ceil((paginationInfo.total || res.data.total || responseData.length) / (paginationInfo.limit || res.data.limit || limit)),
              hasNextPage: paginationInfo.hasNextPage !== undefined ? paginationInfo.hasNextPage : res.data.hasNextPage !== undefined ? res.data.hasNextPage : (paginationInfo.page || res.data.page || page) < (paginationInfo.totalPages || res.data.totalPages || Math.ceil((paginationInfo.total || res.data.total || responseData.length) / (paginationInfo.limit || res.data.limit || limit))),
              hasPrevPage: paginationInfo.hasPrevPage !== undefined ? paginationInfo.hasPrevPage : res.data.hasPrevPage !== undefined ? res.data.hasPrevPage : (paginationInfo.page || res.data.page || page) > 1,
            }
          });
          return;
        }
      }
      
      // Fallback: try to find data elsewhere
      if (res.data?.data && Array.isArray(res.data.data)) {
        set({ 
          campaigns: res.data.data,
          pagination: {
            page: page,
            limit: limit,
            total: res.data.data.length,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          }
        });
        return;
      }
      
      // Last fallback: direct array
      if (Array.isArray(res.data)) {
        set({ 
          campaigns: res.data,
          pagination: {
            page: page,
            limit: limit,
            total: res.data.length,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          }
        });
        return;
      }
      
      // If nothing matches, log and set empty
      console.warn('Unexpected response format:', res.data);
      set({ campaigns: [], pagination: null });
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      set({ campaigns: [], pagination: null });
    } finally {
      set({ loading: false });
    }
  },
  fetchEmailTemplates: async (token: string) => {
    set({ emailTemplatesLoading: true });
    try {
      const axios = (await import('axios')).default;
      const res = await axios.get(`/api/email-templates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
      });

      // Handle various response formats
      let templates: EmailTemplate[] = [];
      
      if (res.data?.success && Array.isArray(res.data.data)) {
        templates = res.data.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        templates = res.data.data;
      } else if (Array.isArray(res.data)) {
        templates = res.data;
      } else if (res.data && typeof res.data === 'object') {
        // Try to find templates in nested structure
        templates = res.data.templates || res.data.emailTemplates || [];
      }

      set({ emailTemplates: templates });
    } catch (error) {
      console.error('Failed to fetch email templates:', error);
      set({ emailTemplates: [] });
    } finally {
      set({ emailTemplatesLoading: false });
    }
  },
}));

