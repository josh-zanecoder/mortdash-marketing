import { create } from 'zustand';

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  title: string;
  company: string;
}

interface Channel {
  value: string;
  label: string;
}

interface ContactStore {
  marketingContacts: Contact[];
  channels: Channel[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  search: string;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  fetchContacts: (opts?: { token?: string; page?: number; limit?: number; search?: string }) => Promise<void>;
  fetchChannels: (token?: string) => Promise<void>;
  addContact: (contact: any, token?: string) => Promise<boolean>;
  updateContact: (contact: any, token?: string) => Promise<boolean>;
  deleteContact: (id: number, token?: string) => Promise<boolean>;
  prospects: { company: string; members: any[] }[] | null;
  prospectsLoading: boolean;
  prospectsError: string | null;
  fetchProspects: () => Promise<void>;
  clients: { company: string; members: any[] }[] | null;
  clientsLoading: boolean;
  clientsError: string | null;
  fetchClients: () => Promise<void>;
}

export const useContactStore = create<ContactStore>((set, get) => ({
  marketingContacts: [],
  channels: [],
  loading: false,
  error: null,
  page: 1,
  limit: 10,
  total: 0,
  search: '',
  setPage: (page) => set({ page }),
  setSearch: (search) => set({ search, page: 1 }),
  fetchContacts: async (opts = {}) => {
    set({ loading: true, error: null });
    try {
      const { token, page, limit, search } = opts;
      const params = new URLSearchParams();
      if (token) params.set('token', token);
      if (page) params.set('page', String(page));
      if (limit) params.set('limit', String(limit));
      if (search) params.set('search', search);
      const url = `/api/contacts${params.size ? '?' + params.toString() : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch contacts');
      const data = await res.json();
      let contacts: Contact[] = [];
      let total = 0;
      if (Array.isArray(data)) {
        contacts = data;
        total = data.length;
      } else if (data && typeof data === 'object') {
        // Prefer data.data or data.results for the array
        if (Array.isArray(data.data)) {
          contacts = data.data;
        } else if (Array.isArray(data.results)) {
          contacts = data.results;
        } else {
          // Try to find the first array property
          const arrProp = Object.values(data).find((v) => Array.isArray(v));
          if (arrProp) contacts = arrProp as Contact[];
        }
        if (typeof data.total === 'number') total = data.total;
        else if (typeof data.count === 'number') total = data.count;
        else total = contacts.length;
      }
      // --- TEMPORARY FRONTEND SEARCH & PAGINATION PATCH ---
      const _page = page ?? 1;
      const _limit = limit ?? 5;
      const _search = search ?? get().search;
      if (contacts.length > 0 && total === contacts.length) {
        let filtered = contacts;
        if (_search && _search.trim() !== '') {
          const q = _search.trim().toLowerCase();
          filtered = contacts.filter(c =>
            c.first_name?.toLowerCase().includes(q) ||
            c.last_name?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.title?.toLowerCase().includes(q) ||
            c.company?.toLowerCase().includes(q)
          );
        }
        total = filtered.length;
        const start = (_page - 1) * _limit;
        const end = start + _limit;
        contacts = filtered.slice(start, end);
      }
      set({ marketingContacts: contacts, total, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  fetchChannels: async (token?: string) => {
    set({ loading: true, error: null });
    try {
      const url = token ? `/api/channels?token=${encodeURIComponent(token)}` : '/api/channels';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch channels');
      const data = await res.json();
      console.log('Fetched channels data:', data);
      let channels: Channel[] = [];
      if (data && Array.isArray(data.data)) {
        channels = data.data.map((c: any) => ({ value: String(c.value), label: c.name }));
      }
      set({ channels, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  addContact: async (contact: any, token?: string) => {
    set({ loading: true, error: null });
    try {
      const url = token ? `/api/contacts?token=${encodeURIComponent(token)}` : '/api/contacts';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      });
      if (!res.ok) throw new Error('Failed to add contact');
      await get().fetchContacts({ token, page: get().page, limit: get().limit });
      set({ loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
      return false;
    }
  },
  updateContact: async (contact: any, token?: string) => {
    set({ loading: true, error: null });
    try {
      const url = token ? `/api/contacts/${contact.id}?token=${encodeURIComponent(token)}` : `/api/contacts/${contact.id}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      });
      if (!res.ok) throw new Error('Failed to update contact');
      await get().fetchContacts({ token, page: get().page, limit: get().limit });
      set({ loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
      return false;
    }
  },
  deleteContact: async (id: number, token?: string) => {
    set({ loading: true, error: null });
    try {
      const url = token ? `/api/contacts/${id}?token=${encodeURIComponent(token)}` : `/api/contacts/${id}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete contact');
      await get().fetchContacts({ token, page: get().page, limit: get().limit });
      set({ loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
      return false;
    }
  },
  prospects: null,
  prospectsLoading: false,
  prospectsError: null,
  fetchProspects: async () => {
    set({ prospectsLoading: true, prospectsError: null });
    try {
      const res = await fetch('/api/contacts/prospects');
      if (!res.ok) throw new Error('Failed to fetch prospects');
      const data = await res.json();
      set({ prospects: Array.isArray(data.data) ? data.data : [], prospectsLoading: false });
    } catch (err: any) {
      set({ prospectsError: err.message || 'Unknown error', prospectsLoading: false });
    }
  },
  clients: null,
  clientsLoading: false,
  clientsError: null,
  fetchClients: async () => {
    set({ clientsLoading: true, clientsError: null });
    try {
      const res = await fetch('/api/contacts/clients');
      if (!res.ok) throw new Error('Failed to fetch clients');
      const data = await res.json();
      set({ clients: Array.isArray(data.data) ? data.data : [], clientsLoading: false });
    } catch (err: any) {
      set({ clientsError: err.message || 'Unknown error', clientsLoading: false });
    }
  },
}));
