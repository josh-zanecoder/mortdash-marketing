import { create } from 'zustand';
import type {
  MarketingList,
  AudienceType,
  AudienceTypeFilter,
  BankChannel,
  MarketingListFilter,
  MarketingListRecipients,
} from '@/types/listsType';

interface MarketingListStore {
  lists: MarketingList[];
  loading: boolean;
  setLists: (lists: MarketingList[]) => void;
  setLoading: (loading: boolean) => void;
  addList: (list: MarketingList) => void;
  updateList: (id: number, list: Partial<MarketingList>) => void;
  removeList: (id: number) => void;
  fetchLists: (token: string) => Promise<void>;
  createList: (token: string, listData: { listName: string; audienceTypeId: number; filters: Array<{ audienceTypeFilterId: number; filterValue: string }> }) => Promise<void>;
  audienceTypes: AudienceType[];
  audienceTypesLoading: boolean;
  fetchAudienceTypes: (token: string) => Promise<void>;
  bankChannels: BankChannel[];
  bankChannelsLoading: boolean;
  fetchBankChannels: (token: string) => Promise<void>;
  audienceTypeFilters: AudienceTypeFilter[];
  audienceTypeFiltersLoading: boolean;
  fetchAudienceTypeFilters: (token: string, audienceTypeId: number) => Promise<void>;
  clearAudienceTypeFilters: () => void;
  recipients: MarketingListRecipients | null;
  recipientsLoading: boolean;
  fetchRecipients: (token: string, listId: string | number) => Promise<void>;
  clearRecipients: () => void;
  currentList: MarketingList | null;
  currentListLoading: boolean;
  fetchList: (token: string, listId: string | number) => Promise<void>;
  clearCurrentList: () => void;
  updateListApi: (token: string, listId: string | number, listData: { listName: string; audienceTypeId: number; filters: Array<{ audienceTypeFilterId: number; filterValue: string }> }) => Promise<void>;
  deleteList: (token: string, listId: string | number) => Promise<void>;
}

export const useMarketingListStore = create<MarketingListStore>((set, get) => ({
  lists: [],
  loading: false,
  setLists: (lists) => set({ lists }),
  setLoading: (loading) => set({ loading }),
  addList: (list) => set((state) => ({ lists: [...state.lists, list] })),
  updateList: (id, updates) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === id ? { ...list, ...updates } : list
      ),
    })),
  removeList: (id) =>
    set((state) => ({
      lists: state.lists.filter((list) => list.id !== id),
    })),
  audienceTypes: [],
  audienceTypesLoading: false,
  bankChannels: [],
  bankChannelsLoading: false,
  audienceTypeFilters: [],
  audienceTypeFiltersLoading: false,
  recipients: null,
  recipientsLoading: false,
  fetchLists: async (token: string) => {
    set({ loading: true });
    try {
      const axios = (await import('axios')).default;
      const res = await axios.get('/api/marketing-lists', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
      });

      if (res.data?.success) {
        const data = res.data.data;
        if (Array.isArray(data)) {
          set({ lists: data });
        } else if (data?.data && Array.isArray(data.data)) {
          set({ lists: data.data });
        }
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        set({ lists: res.data.data });
      } else if (Array.isArray(res.data)) {
        set({ lists: res.data });
      } else {
        console.warn('Unexpected response format:', res.data);
        set({ lists: [] });
      }
    } catch (error) {
      console.error('Failed to fetch marketing lists:', error);
      set({ lists: [] });
    } finally {
      set({ loading: false });
    }
  },
  createList: async (token: string, listData: { listName: string; audienceTypeId: number; filters: Array<{ audienceTypeFilterId: number; filterValue: string }> }) => {
    set({ loading: true });
    try {
      const axios = (await import('axios')).default;
      const res = await axios.post('/api/marketing-lists', listData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
      });

      if (res.data?.success || res.status === 200 || res.status === 201) {
        const get = useMarketingListStore.getState();
        await get.fetchLists(token);
      } else {
        throw new Error(res.data?.message || 'Failed to create marketing list');
      }
    } catch (error) {
      console.error('Failed to create marketing list:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  fetchAudienceTypes: async (token: string) => {
    set({ audienceTypesLoading: true });
    try {
      const axios = (await import('axios')).default;
      const res = await axios.get('/api/audience-types', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
      });

      let audienceTypes: AudienceType[] = [];
      
      if (res.data?.success && Array.isArray(res.data.data)) {
        audienceTypes = res.data.data;
      } else if (Array.isArray(res.data)) {
        audienceTypes = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        audienceTypes = res.data.data;
      }

      audienceTypes = audienceTypes.map(type => ({
        ...type,
        id: type.id ?? type.value ?? 0,
      }));

      set({ audienceTypes, audienceTypesLoading: false });
    } catch (error) {
      console.error('Failed to fetch audience types:', error);
      set({ audienceTypes: [], audienceTypesLoading: false });
    }
  },
  fetchBankChannels: async (token: string) => {
    set({ bankChannelsLoading: true });
    try {
      const axios = (await import('axios')).default;
      const res = await axios.get('/api/bank-channels', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
      });

      let bankChannels: BankChannel[] = [];
      
      if (res.data?.success && Array.isArray(res.data.data)) {
        bankChannels = res.data.data;
      } else if (Array.isArray(res.data)) {
        bankChannels = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        bankChannels = res.data.data;
      }

      bankChannels = bankChannels.map(channel => ({
        ...channel,
        id: channel.id ?? channel.value?.toString() ?? '',
      }));

      set({ bankChannels, bankChannelsLoading: false });
    } catch (error) {
      console.error('Failed to fetch bank channels:', error);
      set({ bankChannels: [], bankChannelsLoading: false });
    }
  },
  fetchAudienceTypeFilters: async (token: string, audienceTypeId: number) => {
    set({ audienceTypeFiltersLoading: true });
    try {
      const axios = (await import('axios')).default;
      const res = await axios.get(`/api/audience-type-filters?audienceTypeId=${audienceTypeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
      });

      let filters: AudienceTypeFilter[] = [];
      
      if (res.data?.success && Array.isArray(res.data.data)) {
        filters = res.data.data;
      } else if (Array.isArray(res.data)) {
        filters = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        filters = res.data.data;
      }

      set({ audienceTypeFilters: filters, audienceTypeFiltersLoading: false });
    } catch (error) {
      console.error('Failed to fetch audience type filters:', error);
      set({ audienceTypeFilters: [], audienceTypeFiltersLoading: false });
    }
  },
  clearAudienceTypeFilters: () => {
    set({ audienceTypeFilters: [] });
  },
  fetchRecipients: async (token: string, listId: string | number) => {
    set({ recipientsLoading: true });
    try {
      const axios = (await import('axios')).default;
      const res = await axios.get(`/api/marketing-lists/${listId}/recipients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
      });

      let recipients: MarketingListRecipients = {
        prospects: [],
        clients: [],
        personalContacts: [],
      };

      if (res.data?.success && res.data?.data) {
        recipients = {
          prospects: res.data.data.prospects || [],
          clients: res.data.data.clients || [],
          personalContacts: res.data.data.personalContacts || [],
        };
      } else if (res.data?.prospects || res.data?.clients || res.data?.personalContacts) {
        recipients = {
          prospects: res.data.prospects || [],
          clients: res.data.clients || [],
          personalContacts: res.data.personalContacts || [],
        };
      }

      set({ recipients, recipientsLoading: false });
    } catch (error) {
      console.error('Failed to fetch recipients:', error);
      set({ recipients: null, recipientsLoading: false });
    }
  },
  clearRecipients: () => {
    set({ recipients: null });
  },
  currentList: null,
  currentListLoading: false,
  fetchList: async (token: string, listId: string | number) => {
    set({ currentListLoading: true });
    try {
      const axios = (await import('axios')).default;
      const res = await axios.get(`/api/marketing-lists/${listId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
      });

      let list: MarketingList | null = null;

      if (res.data?.success && res.data?.data) {
        list = res.data.data;
      } else if (res.data?.id) {
        list = res.data;
      } else if (res.data?.data?.id) {
        list = res.data.data;
      }

      set({ currentList: list, currentListLoading: false });
    } catch (error) {
      console.error('Failed to fetch marketing list:', error);
      set({ currentList: null, currentListLoading: false });
    }
  },
  clearCurrentList: () => {
    set({ currentList: null });
  },
  updateListApi: async (token: string, listId: string | number, listData: { listName: string; audienceTypeId: number; filters: Array<{ audienceTypeFilterId: number; filterValue: string }> }) => {
    set({ loading: true });
    try {
      const axios = (await import('axios')).default;
      const res = await axios.put(`/api/marketing-lists/${listId}`, listData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
      });

      if (res.data?.success || res.status === 200 || res.status === 201) {
        const get = useMarketingListStore.getState();
        await get.fetchLists(token);
      } else {
        throw new Error(res.data?.message || 'Failed to update marketing list');
      }
    } catch (error) {
      console.error('Failed to update marketing list:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  deleteList: async (token: string, listId: string | number) => {
    set({ loading: true });
    try {
      const axios = (await import('axios')).default;
      const res = await axios.delete(`/api/marketing-lists/${listId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
        },
      });

      if (res.data?.success || res.status === 200 || res.status === 204) {
        const get = useMarketingListStore.getState();
        await get.fetchLists(token);
      } else {
        throw new Error(res.data?.message || 'Failed to delete marketing list');
      }
    } catch (error) {
      console.error('Failed to delete marketing list:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

