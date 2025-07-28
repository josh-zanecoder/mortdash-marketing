"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useListsStore } from '@/store/listsStore';
import { State } from "@/types/listsType";
import LoadingModal from "@/components/ui/loading-modal";
import Toast from "@/components/ui/toast";

type FilterRow = {
  filter_type_id: number | null;      // e.g. 1 for "Channel"
  filter_type_name: string;           // e.g. "Channel"
  filter_value: string;               // e.g. "1" (channel value) or "CA" (state abbreviation)
  filter_value_id: string;            // e.g. "1" (channel ID)
  filter_value_name: string;          // e.g. "Wholesale" (channel name)
};

function AddMarketingListPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [listName, setListName] = useState('');
  const [audienceTypeId, setAudienceTypeId] = useState<number>();
  const [filters, setFilters] = useState<FilterRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    title: string;
    message?: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ isOpen: false, title: '', type: 'info' });

  const addList = useListsStore(state => state.addList);
  const lists = useListsStore(state => state.lists);
  const audienceTypes = useListsStore(state => state.audienceTypes);
  const audienceTypeFilters = useListsStore(state => state.audienceTypeFilters);
  const bankChannels = useListsStore(state => state.bankChannels);
  const { setAudienceTypes, setAudienceTypeFilters, setBankChannels } = useListsStore(state => state);

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (!token) return;

      try {
        const authHeaders = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        };

        const [typeRes, filterRes, bankRes] = await Promise.all([
          axios.get(`/api/marketing/lists/new/audience-types`, authHeaders),
          axios.get(`/api/marketing/lists/new/audience-types-filter/`, authHeaders),
          axios.get(`/api/marketing/lists/new/bank-channels`, authHeaders),
        ]);

        setAudienceTypes(typeRes.data.data);
        setAudienceTypeFilters(Array.isArray(filterRes.data.data) ? filterRes.data.data : []);
        setBankChannels(bankRes.data.data);
      } catch (err) {
        setToast({
          isOpen: true,
          title: 'Error',
          message: 'Failed to load form data',
          type: 'error'
        });
      }
    };

    loadData();
  }, [token, setAudienceTypes, setAudienceTypeFilters, setBankChannels]);

  const handleAudienceTypeChange = (audienceTypeId: number) => {
    setAudienceTypeId(audienceTypeId);
    // Clear existing filters when audience type changes
    setFilters([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setToast({
        isOpen: true,
        title: 'Error',
        message: 'Token missing',
        type: 'error'
      });
      return;
    }

    // Check if list name is empty or contains only whitespace
    if (!listName || !listName.trim()) {
      setToast({
        isOpen: true,
        title: 'Error',
        message: 'Please enter a valid list name',
        type: 'error'
      });
      return;
    }

    if (!audienceTypeId) {
      setToast({
        isOpen: true,
        title: 'Error',
        message: 'Please select an audience type',
        type: 'error'
      });
      return;
    }

    // Check if any filters have type but no value
    const incompleteFilters = filters.filter(f => 
      f.filter_type_id && f.filter_type_id !== 0 && 
      (!f.filter_value || f.filter_value === '')
    );
    
    if (incompleteFilters.length > 0) {
      setToast({
        isOpen: true,
        title: 'Error',
        message: 'Please complete all filter selections',
        type: 'error'
      });
      return;
    }
    
    setLoading(true);
    try {
      // Filter out empty filters (where filter_type_id is null or empty)
      const validFilters = filters.filter(f => f.filter_type_id !== null && f.filter_type_id !== 0);
      
      // Use only valid filters that the user has actually selected
      const filtersToSend = validFilters.length > 0 ? validFilters : [];
      
      // Filter out any filters that don't have proper values
      const finalFilters = filtersToSend.filter(filter => 
        filter.filter_type_id && 
        filter.filter_value && 
        filter.filter_value.trim() !== '' &&
        filter.filter_value !== 'All'
      );
      

      
      const body = {
        name: listName.trim(),
        audience_type: String(audienceTypeId),
        filters: finalFilters.map(({ filter_type_id, filter_type_name, filter_value, filter_value_id, filter_value_name }) => {
          const baseFilter = {
            filter_type_id: filter_type_id ? String(filter_type_id) : '',
            filter_type_name: filter_type_name || '',
            filter_value_id: filter_value_id || filter_value || '',
            value_name: filter_value_name || filter_value || filter_value_id || '',
          };
          
          // Add audience-specific fields based on backend expectations
          if (audienceTypeId === 3) { // Marketing Contact
            return {
              ...baseFilter,
              filter_value: filter_value_id || filter_value || ''
            };
          } else if (audienceTypeId === 4) { // Rate Sheet
            return {
              ...baseFilter,
              filter_value: filter_value_id || filter_value || ''
            };
          } else if (audienceTypeId === 1) { // Prospect
            return {
              ...baseFilter,
              // For Prospect, ensure we have the value_name that the backend expects
              value_name: filter_value_name || filter_value || filter_value_id || ''
            };
          } else {
            return baseFilter;
          }
        }),
      };      
      const res = await axios.post(`/api/marketing/lists/${token}`, body);
      
      // Check if the response indicates success or failure
      if (res.data && res.data.success) {
        const newList = res.data.data;
        
        // Check if list already exists in store to prevent duplicates
        const existingList = lists.find(list => list.id === newList.id);
        if (!existingList) {
          addList(newList);
        }
        
        setToast({
          isOpen: true,
          title: 'Success',
          message: existingList ? 'Marketing list already exists!' : 'Marketing list created successfully!',
          type: 'success'
        });
        
        setTimeout(() => {
          router.push(`/marketing/lists?token=${token}`);
        }, 1500);
      } else {
        // Handle business logic errors (success: false)
        const errorMessage = res.data?.data || res.data?.message || 'Failed to create list';
        
        // Special handling for Prospect backend issue
        if (audienceTypeId === 1 && errorMessage.includes('prospectMembersCount')) {
          setToast({
            isOpen: true,
            title: 'Backend Limitation',
            message: 'Prospect lists are currently experiencing backend issues. Please try creating a Marketing Contact or Client list instead.',
            type: 'error'
          });
        } else {
          setToast({
            isOpen: true,
            title: 'Error',
            message: errorMessage,
            type: 'error'
          });
        }
      }
    } catch (err: any) {
      // Handle network/HTTP errors
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create list';
      setToast({
        isOpen: true,
        title: 'Error',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const addFilter = () =>
    setFilters([...filters, { filter_type_id: null, filter_type_name: '', filter_value: '', filter_value_id: '', filter_value_name: '' }]);
  
  const updateFilter = (idx: number, key: keyof FilterRow, value: any) => {
    const newFilters = [...filters];
    
    // If updating filter type
    if (key === 'filter_type_id') {
      const selected = audienceTypeFilters.find(ft => ft.value === Number(value));
      if (selected) {
        newFilters[idx] = {
          ...newFilters[idx],
          filter_type_id: Number(value),
          filter_type_name: selected.code || selected.name, // Use code for type identification
          filter_value: '',
          filter_value_id: '',
          filter_value_name: ''
        };
      }
    } else {
      newFilters[idx] = { ...newFilters[idx], [key]: value };
    }

    setFilters(newFilters);
  };
  const removeFilter = (idx: number) => setFilters(filters.filter((_, i) => i !== idx));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 flex flex-col items-center pt-16 px-4">
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"></div>
      
      {/* Modal container */}
      <div className="relative z-50 w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 md:p-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Add Marketing List
          </h1>
          <button
            onClick={() => router.back()}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">List Name</label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              required
              placeholder="Enter a descriptive name for your list"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Audience Type</label>
            <select
              value={audienceTypeId || ''}
              onChange={(e) => handleAudienceTypeChange(Number(e.target.value))}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm cursor-pointer"
            >
              <option value="">Select Audience Type</option>
              {audienceTypes.map((at) => (
                <option key={`audience-type-${at.value}-${at.name}`} value={at.value}>
                  {at.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-lg font-semibold text-slate-800 mb-4">Filters</label>
            {filters.map((f, idx) => (
              <div key={idx} className="flex items-center gap-3 mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <button type="button" onClick={() => removeFilter(idx)} className="cursor-pointer p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200">➖</button>

                {/* Filter Type Dropdown */}
                <select
                  value={f.filter_type_id ?? ''}
                  onChange={(e) => {
                    const selectedFilter = audienceTypeFilters.find(
                      ft => ft.value === Number(e.target.value)
                    );
                    if (selectedFilter) {
                      const newFilters = [...filters];
                      newFilters[idx] = {
                        ...newFilters[idx],
                        filter_type_id: selectedFilter.value,
                        filter_type_name: selectedFilter.name,
                        filter_value: '',
                        filter_value_id: '',
                        filter_value_name: ''
                      };
                      setFilters(newFilters);
                    }
                  }}
                  className="cursor-pointer px-3 py-2 border border-slate-300 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                >
                  <option value="">Select filter</option>
                  {audienceTypeFilters
                    .filter(ft => ft.audience_type_id === audienceTypeId && ft.type === 'all')
                    .map(ft => (
                      <option key={`filter-type-${ft.value}-${ft.name}`} value={ft.value}>
                        {ft.name}
                      </option>
                    ))}
                </select>

                <span className="text-slate-500 font-medium">=</span>

                {/* Filter Value Dropdown */}
                {f.filter_type_name === 'Channel' && (
                  <select
                    value={f.filter_value || ''}
                    onChange={(e) => {
                      const selectedChannel = bankChannels.find(channel => channel.value === Number(e.target.value));
                      if (selectedChannel) {
                        const newFilters = [...filters];
                        newFilters[idx] = {
                          ...newFilters[idx],
                          filter_value: String(selectedChannel.value),
                          filter_value_id: String(selectedChannel.value),
                          filter_value_name: selectedChannel.name
                        };
                        setFilters(newFilters);
                      }
                    }}
                    className="cursor-pointer px-3 py-2 border border-slate-300 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  >
                    <option value="">Select channel</option>
                    {bankChannels.map((channel) => (
                      <option key={`channel-${channel.value}-${channel.name}`} value={channel.value}>
                        {channel.name}
                      </option>
                    ))}
                  </select>
                )}
                {f.filter_type_name === 'State' && (
                  <select
                    value={f.filter_value || ''}
                    onChange={(e) => {
                      const stateValue = e.target.value;
                      const newFilters = [...filters];
                      newFilters[idx] = {
                        ...newFilters[idx],
                        filter_value: stateValue,
                        filter_value_id: stateValue,
                        filter_value_name: stateValue
                      };
                      setFilters(newFilters);
                    }}
                    className="cursor-pointer px-3 py-2 border border-slate-300 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  >
                    <option value="">Select state</option>
                    {Object.entries(State).map(([abbr, name]) => (
                      <option key={`state-${abbr}`} value={abbr}>
                        {name} ({abbr})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
            <button type="button" onClick={addFilter} className="cursor-pointer inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold hover:bg-orange-50 px-3 py-2 rounded-lg transition-all duration-200">
              <span className="text-lg">+</span> Add Filter
            </button>
          </div>
          {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
          <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
            <Button type="button" onClick={() => router.back()} className="cursor-pointer px-6 py-3 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-xl transition-all duration-200">Cancel</Button>
            <Button type="submit" disabled={loading} className="cursor-pointer px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>

      {/* Modals */}
      <LoadingModal
        isOpen={loading}
        title="Creating Marketing List"
        message="Please wait while we create your marketing list..."
      />

      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />
    </main>
  );
}

export default function AddMarketingListPage() {
  return (
    <Suspense fallback={<LoadingModal isOpen={true} title="Loading Form" message="Please wait while we load the form..." />}>
      <AddMarketingListPageContent />
    </Suspense>
  );
} 