import { create } from 'zustand';

interface Contact {
  id: number;
  bankId?: number | null;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber?: string | null;
  registrationType?: string | null;
  title?: string | null;
  company?: string | null;
  branch?: string | null;
  rateSheet?: boolean | null;
  hasAccountExecutive?: boolean | null;
  branchId?: number | null;
  mktgUnsubscribe?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  // Legacy fields for backward compatibility
  first_name?: string;
  last_name?: string;
  email?: string;
  email_address?: string;
  phone_number?: string;
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
  fetchContactById: (id: number, token?: string) => Promise<Contact | null>;
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
      const headers: Record<string, string> = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      if (typeof window !== 'undefined') {
        headers['x-client-origin'] = window.location.origin;
      }
      
      const params = new URLSearchParams();
      if (page) params.set('page', String(page));
      if (limit) params.set('limit', String(limit));
      if (search) params.set('search', search);
      
      const url = `/api/marketing-contact${params.size ? '?' + params.toString() : ''}`;
      const res = await fetch(url, { headers });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to fetch contacts');
      }
      
      const response = await res.json();
      let contacts: Contact[] = [];
      let total = 0;
      
      // Handle the API response structure: { success: true, message: "...", data: [...] }
      if (response.success && Array.isArray(response.data)) {
        contacts = response.data;
        // Check for pagination meta
        if (response.meta && typeof response.meta.total === 'number') {
          total = response.meta.total;
        } else if (typeof response.total === 'number') {
          total = response.total;
        } else {
          total = contacts.length;
        }
      } else if (Array.isArray(response.data)) {
        contacts = response.data;
        total = response.meta?.total || response.total || contacts.length;
      } else if (Array.isArray(response)) {
        contacts = response;
        total = contacts.length;
      }
      
      // Apply frontend search filter if needed (when API doesn't support search)
      const _search = search ?? get().search;
      if (_search && _search.trim() !== '' && contacts.length > 0) {
        const q = _search.trim().toLowerCase();
        contacts = contacts.filter(c => {
          const firstName = c.firstName || c.first_name || '';
          const lastName = c.lastName || c.last_name || '';
          const email = c.emailAddress || c.email_address || c.email || '';
          const title = c.title || '';
          const company = c.company || '';
          
          return firstName.toLowerCase().includes(q) ||
            lastName.toLowerCase().includes(q) ||
            email.toLowerCase().includes(q) ||
            title.toLowerCase().includes(q) ||
            company.toLowerCase().includes(q);
        });
        // If we filtered, update total to match filtered results
        if (contacts.length !== response.data?.length) {
          total = contacts.length;
        }
      }
      
      set({ marketingContacts: contacts, total, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },
  fetchContactById: async (id: number, token?: string) => {
    try {
      const headers: Record<string, string> = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      if (typeof window !== 'undefined') {
        headers['x-client-origin'] = window.location.origin;
      }
      
      const res = await fetch(`/api/marketing-contact/${id}`, { headers });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to fetch contact');
      }
      
      const response = await res.json();
      
      // Handle the API response structure: { success: true, message: "...", data: {...} }
      let contact: Contact | null = null;
      if (response.success && response.data) {
        contact = response.data as Contact;
      } else if (response.data && typeof response.data === 'object') {
        contact = response.data as Contact;
      } else if (typeof response === 'object' && response.id) {
        contact = response as Contact;
      }
      
      return contact;
    } catch (err: any) {
      console.error('Failed to fetch contact:', err);
      return null;
    }
  },
  fetchChannels: async (token?: string) => {
    set({ loading: true, error: null });
    try {
      const headers: Record<string, string> = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      if (typeof window !== 'undefined') {
        headers['x-client-origin'] = window.location.origin;
      }
      
      const res = await fetch('/api/bank-channels', { headers });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to fetch channels');
      }
      const data = await res.json();
     
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
      const headers: Record<string, string> = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      if (typeof window !== 'undefined') {
        headers['x-client-origin'] = window.location.origin;
      }
      
      const res = await fetch('/api/marketing-contact', {
        method: 'POST',
        headers,
        body: JSON.stringify(contact),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to add contact');
      }
      
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
      const headers: Record<string, string> = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      if (typeof window !== 'undefined') {
        headers['x-client-origin'] = window.location.origin;
      }
      
      const res = await fetch(`/api/marketing-contact/${contact.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(contact),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to update contact');
      }
      
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
      const headers: Record<string, string> = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      if (typeof window !== 'undefined') {
        headers['x-client-origin'] = window.location.origin;
      }
      
      const res = await fetch(`/api/marketing-contact/${id}`, {
        method: 'DELETE',
        headers,
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to delete contact');
      }
      
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
