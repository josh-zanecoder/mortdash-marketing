import { create } from 'zustand';

interface TrackingData {
  id: string;
  event: string;
  date: string;
  subject: string;
  from: string;
  to: string;
  status?: string;
}

interface TrackingStats {
  delivered: number;
  unique_clickers: number;
  soft_bounces: number;
  hard_bounces: number;
  blocked: number;
  total: number;
}

interface TrackingResponse {
  data: TrackingData[];
  stats: TrackingStats;
  pagination: {
    current_page: number;
    total_pages: number;
    total_records: number;
    per_page: number;
  };
}

interface TrackingStore {
  // State
  data: any;
  stats: TrackingStats;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
  };
  loading: boolean;
  error: string | null;
  selectedRatesheetId: string | null;
  dashboardStats: TrackingStats;
  
  // Actions
  fetchTrackingData: (startDate: string, endDate: string, page?: number, ratesheetId?: string) => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  setSelectedRatesheetId: (ratesheetId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  data: {},
  stats: {
    delivered: 0,
    unique_clickers: 0,
    soft_bounces: 0,
    hard_bounces: 0,
    blocked: 0,
    total: 0
  },
  dashboardStats: {
    delivered: 0,
    unique_clickers: 0,
    soft_bounces: 0,
    hard_bounces: 0,
    blocked: 0,
    total: 0
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0
  },
  loading: false,
  error: null,
  selectedRatesheetId: null
};

export const useTrackingStore = create<TrackingStore>((set, get) => ({
  ...initialState,

  fetchTrackingData: async (startDate: string, endDate: string, page = 1, ratesheetId?: string) => {
    set({ loading: true, error: null });
    
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        page: page.toString(),
        limit: '10'
      });

      // Use ratesheet endpoint if ratesheetId is provided
      const endpoint = ratesheetId 
        ? `/api/tracking/by-range-by-ratesheet?${params.toString()}&ratesheet_id=${ratesheetId}`
        : `/api/tracking/by-range?${params.toString()}`;

      const response = await fetch(endpoint);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tracking data');
      }

      const result = await response.json();
      const trackingData = result.data || {};

      set({
        data: trackingData, 
        stats: {
          delivered: trackingData.delivered?.count || 0,
          unique_clickers: trackingData.clicks?.count || 0,
          soft_bounces: trackingData.softBounce?.count || 0,
          hard_bounces: trackingData.hardBounce?.count || 0,
          blocked: trackingData.blocked?.count || 0,
          total: trackingData.total || 0,
        },
        pagination: {
          currentPage: result.pagination?.current_page || 1,
          totalPages: result.pagination?.total_pages || 1,
          totalRecords: result.pagination?.total_records || 0
        },
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  },

  fetchDashboardStats: async () => {
    try {
      // Get today's date
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const endDate = startDate;

      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        page: '1',
        limit: '1' 
      });

      const response = await fetch(`/api/tracking/by-range?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dashboard stats');
      }

      const result: TrackingResponse = await response.json();
      
      set({
        dashboardStats: result.stats || initialState.stats
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  },

  setSelectedRatesheetId: (ratesheetId: string | null) => set({ selectedRatesheetId: ratesheetId }),

  setLoading: (loading: boolean) => set({ loading }),
  
  setError: (error: string | null) => set({ error }),
  
  reset: () => set(initialState)
}));

function groupEmailsByEvent(data: TrackingData[] | any) {
  console.log('groupEmailsByEvent input:', data);
  if (!Array.isArray(data)) {
    return data || {};
  }
  const grouped: any = {};
  data.forEach(email => {
    const event = email.event || 'unknown';
    if (!grouped[event]) {
      grouped[event] = { emails: {}, count: 0, percentage: 0 };
    }
    grouped[event].emails[email.id] = email;
    grouped[event].count += 1;
  });
  return grouped;
}
