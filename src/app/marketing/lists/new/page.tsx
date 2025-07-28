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
      <div className="relative z-50 w-full max-w-2xl bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl p-8 md:p-12">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Add Marketing List</h1>
              <p className="text-slate-600 text-sm mt-1">Create a new marketing list to target your audience effectively.</p>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="cursor-pointer w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl flex items-center justify-center transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* List Name Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              List Name
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                required
                placeholder="Enter a descriptive name for your list"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <div className="w-2 h-2 bg-orange-500 rounded-full opacity-60"></div>
              </div>
            </div>
          </div>

          {/* Audience Type Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Audience Type
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={audienceTypeId || ''}
                onChange={(e) => handleAudienceTypeChange(Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md appearance-none cursor-pointer"
              >
                <option value="">Select an audience type</option>
                {audienceTypes.map((at) => (
                  <option key={`audience-type-${at.value}-${at.name}`} value={at.value}>
                    {at.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="space-y-4 border-t border-slate-200/60 pt-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                List Filters
              </label>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                {filters.length} active
              </span>
            </div>
            
            {/* Filters Container */}
            <div className="space-y-4">
              {filters.map((f, idx) => (
                <div key={idx} className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60">
                  <div className="flex items-center gap-3 mb-3">
                    <button 
                      type="button" 
                      onClick={() => removeFilter(idx)} 
                      className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <span className="text-sm font-medium text-slate-600">Filter {idx + 1}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 items-center">
                    {/* Filter Type Dropdown */}
                    <div className="relative">
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
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm appearance-none cursor-pointer"
                      >
                        <option value="">Select filter</option>
                        {audienceTypeFilters
                          .filter(ft => ft.audience_type_id === audienceTypeId && ft.type === 'all')
                          .filter(ft => {
                            // Don't show filter types that are already selected in other filters
                            const existingFilterTypes = filters
                              .map((filter, filterIdx) => filterIdx !== idx ? filter.filter_type_name : null)
                              .filter(Boolean);
                            return !existingFilterTypes.includes(ft.name);
                          })
                          .map(ft => (
                            <option key={`filter-type-${ft.value}-${ft.name}`} value={ft.value}>
                              {ft.name}
                            </option>
                          ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <span className="text-slate-400 font-medium">=</span>
                    </div>

                    {/* Filter Value Dropdown */}
                    <div className="relative">
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
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm appearance-none cursor-pointer"
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
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm appearance-none cursor-pointer"
                        >
                          <option value="">Select state</option>
                          {Object.entries(State).map(([abbr, name]) => (
                            <option key={`state-${abbr}`} value={abbr}>
                              {name} ({abbr})
                            </option>
                          ))}
                        </select>
                      )}

                      {f.filter_type_name && (
                        <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Filter Button */}
            {audienceTypeId ? (
              (() => {
                const existingFilterTypes = filters.map(f => f.filter_type_name).filter(Boolean);
                const hasChannel = existingFilterTypes.includes('Channel');
                const hasState = existingFilterTypes.includes('State');
                const canAddMore = !hasChannel || !hasState;
                
                return canAddMore ? (
                  <button 
                    type="button" 
                    onClick={addFilter} 
                    className="w-full py-3 px-4 border-2 border-dashed border-orange-300 rounded-xl text-orange-600 hover:text-orange-700 hover:border-orange-400 hover:bg-orange-50/50 transition-all duration-200 font-medium flex items-center justify-center gap-2 group"
                  >
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors duration-200">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    Add New Filter
                  </button>
                ) : (
                  <div className="w-full py-3 px-4 border-2 border-dashed border-green-300 rounded-xl text-green-600 bg-green-50/50 flex items-center justify-center gap-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">All filter types added (Channel and State)</span>
                  </div>
                );
              })()
            ) : (
              <div className="w-full py-3 px-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 bg-slate-50/50 flex items-center justify-center gap-2">
                <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm">Please select an audience type to add filters</span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200/60">
            <Button 
              type="button" 
              onClick={() => router.back()} 
              className="cursor-pointer px-6 py-2.5 bg-slate-800 text-white hover:bg-slate-700 rounded-xl transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="cursor-pointer px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                'Create List'
              )}
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