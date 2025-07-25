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
      
      // For Prospect lists, use actual filters if selected, otherwise send a minimal valid filter
      const filtersToSend = audienceTypeId === 1 ? 
        (validFilters.length > 0 ? validFilters : [{
          filter_type_id: 1,
          filter_type_name: 'Channel',
          filter_value: '1',
          filter_value_id: '1',
          filter_value_name: 'Wholesale'
        }]) : 
        (validFilters.length > 0 ? validFilters : [{
          filter_type_id: null,
          filter_type_name: 'Channel',
          filter_value: '',
          filter_value_id: '',
          filter_value_name: 'All'
        }]);
      
      // For Prospect lists with State filter, try to avoid the backend issue by using a different approach
      if (audienceTypeId === 1 && validFilters.some(f => f.filter_type_name === 'State')) {
        setToast({
          isOpen: true,
          title: 'Warning',
          message: 'Prospect lists with State filters may have limited functionality due to backend limitations. Try using Channel filters instead.',
          type: 'warning'
        });
      }
      
      const body = {
        name: listName,
        audience_type: String(audienceTypeId),
        filters: filtersToSend.map(({ filter_type_id, filter_type_name, filter_value, filter_value_id, filter_value_name }) => {
          const baseFilter = {
            filter_type_id: filter_type_id ? String(filter_type_id) : '',
            filter_type_name: filter_type_name || '',
            filter_value_id: filter_value_id || filter_value || '',
            value_name: filter_value_name || filter_type_name || 'All',
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
              value_name: filter_value_name || filter_value || filter_value_id || 'All'
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
    newFilters[idx] = { ...newFilters[idx], [key]: value };
  
    // Reset value if filter type changes
    if (key === 'filter_type_id') {
      const selected = audienceTypeFilters.find(ft => ft.value === value);
      newFilters[idx].filter_type_name = selected?.name || '';
      newFilters[idx].filter_value = ''; // reset selected value
      newFilters[idx].filter_value_id = '';
      newFilters[idx].filter_value_name = '';
    }
  
    setFilters(newFilters);
  };
  const removeFilter = (idx: number) => setFilters(filters.filter((_, i) => i !== idx));

  return (
    <main className="min-h-screen bg-[#fdf6f1] flex flex-col items-center pt-16 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-10">
        <h1 className="text-3xl font-extrabold text-[#232323] mb-6">Add Marketing List</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">List Name</label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Audience Type</label>
            <select
              value={audienceTypeId || ''}
              onChange={(e) => handleAudienceTypeChange(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600]"
            >
              <option value="" disabled>Select Audience Type</option>
              {audienceTypes.map((at) => (
                <option key={at.value} value={at.value}>{at.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xl font-semibold text-gray-800 mb-3">Filters</label>
            {filters.map((f, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-3">
                <button type="button" onClick={() => removeFilter(idx)} className="text-red-500">➖</button>

                {/* Filter Type Dropdown */}
                <select
                  value={f.filter_type_id ?? ''}
                  onChange={(e) => {
                    updateFilter(idx, 'filter_type_id', Number(e.target.value));
                  }}
                  className="px-3 py-2 border rounded-lg flex-1"
                >
                  <option value="" disabled>Select filter</option>
                  {audienceTypeFilters
                    .filter(ft => ft.audience_type_id === audienceTypeId && ft.type === 'all')
                    .map(ft => {
                      return (
                        <option key={ft.value} value={ft.value}>{ft.name}</option>
                      );
                    })}
                </select>

                <span>=</span>

                {/* Filter Value Dropdown */}
                {f.filter_type_name === 'Channel' && (
                  <select
                    value={f.filter_value || ''}
                    onChange={(e) => {
                      const selectedChannel = bankChannels.find(channel => String(channel.value) === e.target.value);
                      
                      // Update all filter fields at once
                      const newFilters = [...filters];
                      newFilters[idx] = {
                        ...newFilters[idx],
                        filter_value: e.target.value,
                        filter_value_id: e.target.value,
                        filter_value_name: selectedChannel?.name || ''
                      };
                      setFilters(newFilters);
                    }}
                    className="px-3 py-2 border rounded-lg flex-1"
                  >
                    <option value="" disabled>Select channel</option>
                    {bankChannels.map((channel) => {
                      return (
                        <option key={channel.value} value={String(channel.value)}>
                          {channel.name}
                        </option>
                      );
                    })}
                  </select>
                )}

                {f.filter_type_name === 'State' && (
                  <select
                    value={f.filter_value || ''}
                    onChange={(e) => {
                      const stateName = Object.entries(State).find(([name, abbr]) => abbr === e.target.value)?.[0];
                      
                      // Update all filter fields at once
                      const newFilters = [...filters];
                      newFilters[idx] = {
                        ...newFilters[idx],
                        filter_value: e.target.value,
                        filter_value_id: e.target.value,
                        filter_value_name: stateName || ''
                      };
                      setFilters(newFilters);
                    }}
                    className="px-3 py-2 border rounded-lg flex-1"
                  >
                    <option value="" disabled>Select state</option>
                    {Object.entries(State).map(([name, abbr]) => (
                      <option key={abbr} value={abbr}>
                        {name.replace(/([A-Z])/g, ' $1').trim()}
                      </option>
                    ))}
                  </select>
                )}

                {/* Show placeholder when no filter type is selected */}
                {!f.filter_type_name && f.filter_type_id && (
                  <div className="px-3 py-2 border rounded-lg flex-1 text-gray-400 bg-gray-50">
                    Select filter type first
                  </div>
                )}
              </div>
            ))}
            <button type="button" onClick={addFilter} className="text-[#ff6600] font-semibold">➕ Add Filter</button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-4">
            <Button type="button" onClick={() => router.back()} className="bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-[#ff6600] hover:bg-[#ff7a2f] text-white">
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