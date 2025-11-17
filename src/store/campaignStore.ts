import { create } from 'zustand';
import {
  MarketingCampaign,
  PaginationMeta,
  EmailTemplate,
  CampaignRecipient,
} from '@/types/campaignType';

export type { CampaignRecipient };

interface CampaignStore {
  campaigns: MarketingCampaign[];
  loading: boolean;
  pagination: PaginationMeta | null;
  emailTemplates: EmailTemplate[];
  emailTemplatesLoading: boolean;
  recipientCounts: Record<string, number>;
  setCampaigns: (campaigns: MarketingCampaign[]) => void;
  setLoading: (loading: boolean) => void;
  setPagination: (pagination: PaginationMeta | null) => void;
  addCampaign: (campaign: MarketingCampaign) => void;
  updateCampaign: (id: string | number, campaign: Partial<MarketingCampaign>) => void;
  removeCampaign: (id: string | number) => void;
  fetchCampaigns: (token: string, page?: number, limit?: number) => Promise<void>;
  fetchEmailTemplates: (token: string) => Promise<void>;
  fetchPreview: (token: string, campaignId: string | number, recipientId?: string | number) => Promise<any>;
  fetchRecipients: (token: string, campaignId: string | number) => Promise<any[]>;
  fetchRecipientCount: (token: string, campaignId: string | number) => Promise<number>;
  prepareCampaign: (token: string, campaignId: string | number) => Promise<any>;
  rePrepareCampaign: (token: string, campaignId: string | number) => Promise<any>;
  startCampaign: (token: string, campaignId: string | number) => Promise<any>;
  cancelCampaign: (token: string, campaignId: string | number) => Promise<any>;
  fetchCampaignProgress: (token: string, campaignId: string | number) => Promise<any>;
  cancelCampaignRecipient: (token: string, recipientId: string | number) => Promise<any>;
  retryCampaignRecipient: (token: string, recipientId: string | number) => Promise<any>;
  pauseCampaignQueue: (token: string) => Promise<any>;
  resumeCampaignQueue: (token: string) => Promise<any>;
  fetchQueueStats: (token: string) => Promise<any>;
  setEmailTemplates: (templates: EmailTemplate[]) => void;
  setEmailTemplatesLoading: (loading: boolean) => void;
  setRecipientCount: (campaignId: string | number, count: number) => void;
}

export const useCampaignStore = create<CampaignStore>((set, get) => ({
  campaigns: [],
  loading: false,
  pagination: null,
  emailTemplates: [],
  emailTemplatesLoading: false,
  recipientCounts: {},
  setCampaigns: (campaigns) => set({ campaigns }),
  setLoading: (loading) => set({ loading }),
  setPagination: (pagination) => set({ pagination }),
  setEmailTemplates: (templates) => set({ emailTemplates: templates }),
  setEmailTemplatesLoading: (loading) => set({ emailTemplatesLoading: loading }),
  setRecipientCount: (campaignId, count) =>
    set((state) => ({
      recipientCounts: {
        ...state.recipientCounts,
        [String(campaignId)]: count,
      },
    })),
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
      const res = await axios.get(`/api/campaigns?page=${page}&limit=${limit}`, {
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
  fetchPreview: async (token: string, campaignId: string | number, recipientId?: string | number) => {
    try {
      const axios = (await import('axios')).default;
      const url = `/api/campaign-sending/${campaignId}/preview${recipientId ? `?recipientId=${recipientId}` : ''}`;
      
      const res = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
      });

      // Handle various response formats
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      } else if (res.data?.data) {
        return res.data.data;
      } else if (res.data) {
        return res.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Failed to fetch campaign preview:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch campaign preview';
      throw new Error(errorMessage);
    }
  },
  fetchRecipients: async (token: string, campaignId: string | number) => {
    try {
      const axios = (await import('axios')).default;
      const url = `/api/campaign-sending/${campaignId}/recipients`;
      
      const res = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
      });

      // Handle various response formats
      if (res.data?.success && res.data?.data && Array.isArray(res.data.data)) {
        return res.data.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        return res.data.data;
      } else if (Array.isArray(res.data)) {
        return res.data;
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('Failed to fetch campaign recipients:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch campaign recipients';
      throw new Error(errorMessage);
    }
  },
  fetchRecipientCount: async (token: string, campaignId: string | number) => {
    const key = String(campaignId);
    const existing = get().recipientCounts[key];
    if (typeof existing === 'number') {
      return existing;
    }

    try {
      const axios = (await import('axios')).default;
      const url = `/api/campaign-sending/${campaignId}/recipients`;

      const res = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
      });

      let recipients: any[] = [];
      if (res.data?.success && Array.isArray(res.data.data)) {
        recipients = res.data.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        recipients = res.data.data;
      } else if (Array.isArray(res.data)) {
        recipients = res.data;
      }

      const count = recipients.length;
      get().setRecipientCount(campaignId, count);
      return count;
    } catch (error: any) {
      console.error('Failed to fetch campaign recipient count:', error);
      get().setRecipientCount(campaignId, 0);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch campaign recipients';
      throw new Error(errorMessage);
    }
  },
  prepareCampaign: async (token: string, campaignId: string | number) => {
    try {
      const axios = (await import('axios')).default;
      const url = `/api/campaign-sending/${campaignId}/prepare`;
      
      const res = await axios.post(url, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
        validateStatus: () => true,
      });

      if (res.data?.success || res.status === 200 || res.status === 201) {
        return res.data;
      } else {
        throw new Error(res.data?.message || 'Failed to prepare campaign');
      }
    } catch (error: any) {
      console.error('Failed to prepare campaign:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to prepare campaign';
      throw new Error(errorMessage);
    }
  },
  rePrepareCampaign: async (token: string, campaignId: string | number) => {
    try {
      const axios = (await import('axios')).default;
      const url = `/api/campaign-sending/${campaignId}/re-prepare`;
      
      const res = await axios.post(url, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
        validateStatus: () => true,
      });

      if (res.data?.success || res.status === 200 || res.status === 201) {
        return res.data;
      } else {
        throw new Error(res.data?.message || 'Failed to re-prepare campaign');
      }
    } catch (error: any) {
      console.error('Failed to re-prepare campaign:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to re-prepare campaign';
      throw new Error(errorMessage);
    }
  },
  startCampaign: async (token: string, campaignId: string | number) => {
    try {
      const axios = (await import('axios')).default;
      const url = `/api/campaign-sending/${campaignId}/start`;
      
      const res = await axios.post(url, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
        validateStatus: () => true,
      });

      if (res.data?.success || res.status === 200 || res.status === 201) {
        return res.data;
      } else {
        throw new Error(res.data?.message || 'Failed to start campaign');
      }
    } catch (error: any) {
      console.error('Failed to start campaign:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to start campaign';
      throw new Error(errorMessage);
    }
  },
  cancelCampaign: async (token: string, campaignId: string | number) => {
    try {
      const axios = (await import('axios')).default;
      const url = `/api/campaign-sending/${campaignId}/cancel`;
      
      const res = await axios.post(url, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
        validateStatus: () => true,
      });

      if (res.data?.success || res.status === 200 || res.status === 201) {
        return res.data;
      } else {
        throw new Error(res.data?.message || 'Failed to cancel campaign');
      }
    } catch (error: any) {
      console.error('Failed to cancel campaign:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel campaign';
      throw new Error(errorMessage);
    }
  },
  fetchCampaignProgress: async (token: string, campaignId: string | number) => {
    try {
      const axios = (await import('axios')).default;
      const url = `/api/campaign-sending/${campaignId}/progress`;
      
      const res = await axios.get(url, {
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
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Failed to fetch campaign progress:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch campaign progress';
      throw new Error(errorMessage);
    }
  },
  cancelCampaignRecipient: async (token: string, recipientId: string | number) => {
    try {
      const axios = (await import('axios')).default;
      const url = `/api/campaign-recipients/${recipientId}/cancel`;
      
      const res = await axios.post(url, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
        validateStatus: () => true,
      });

      if (res.data?.success || res.status === 200 || res.status === 201) {
        return res.data;
      } else {
        throw new Error(res.data?.message || 'Failed to cancel recipient');
      }
    } catch (error: any) {
      console.error('Failed to cancel campaign recipient:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel recipient';
      throw new Error(errorMessage);
    }
  },
  retryCampaignRecipient: async (token: string, recipientId: string | number) => {
    try {
      const axios = (await import('axios')).default;
      const url = `/api/campaign-recipients/${recipientId}/retry`;
      
      const res = await axios.post(url, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
        validateStatus: () => true,
      });

      if (res.data?.success || res.status === 200 || res.status === 201) {
        return res.data;
      } else {
        throw new Error(res.data?.message || 'Failed to retry recipient');
      }
    } catch (error: any) {
      console.error('Failed to retry campaign recipient:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to retry recipient';
      throw new Error(errorMessage);
    }
  },
  pauseCampaignQueue: async (token: string) => {
    try {
      const axios = (await import('axios')).default;
      const url = `/api/campaigns/queue/pause`;
      
      const res = await axios.post(url, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
        validateStatus: () => true,
      });

      if (res.data?.success || res.status === 200 || res.status === 201) {
        return res.data;
      } else {
        throw new Error(res.data?.message || 'Failed to pause queue');
      }
    } catch (error: any) {
      console.error('Failed to pause campaign queue:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to pause queue';
      throw new Error(errorMessage);
    }
  },
  resumeCampaignQueue: async (token: string) => {
    try {
      const axios = (await import('axios')).default;
      const url = `/api/campaigns/queue/resume`;
      
      const res = await axios.post(url, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
        validateStatus: () => true,
      });

      if (res.data?.success || res.status === 200 || res.status === 201) {
        return res.data;
      } else {
        throw new Error(res.data?.message || 'Failed to resume queue');
      }
    } catch (error: any) {
      console.error('Failed to resume campaign queue:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to resume queue';
      throw new Error(errorMessage);
    }
  },
  fetchQueueStats: async (token: string) => {
    try {
      const axios = (await import('axios')).default;
      const url = `/api/campaigns/queue/stats`;
      
      const res = await axios.get(url, {
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
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Failed to fetch queue stats:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch queue stats';
      throw new Error(errorMessage);
    }
  },
}));

