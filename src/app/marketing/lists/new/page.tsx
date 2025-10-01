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
            // For Prospect Channel, send the numeric channel id as value_name
            const isChannel = (filter_type_name === 'Channel');
            return {
              ...baseFilter,
              value_name: isChannel ? (filter_value_id || filter_value || '') : (filter_value_name || filter_value || filter_value_id || '')
            };
          } else {
            return baseFilter;
          }
        }),
      };      
      
      // Set loading state only when the actual request is about to be sent
      setLoading(true);
      const res = await axios.post(`/api/marketing/lists/${token}`, body);
      
      // Check if the response indicates success or failure
      if (res.data && res.data.success) {
        const newList = res.data.data;
        
        // Check if list already exists in store to prevent duplicates
        const existingList = lists.find(list => list.id === newList.id);
        if (!existingList) {
          addList(newList);
        }
        
        // Close modal immediately after successful creation
        router.push(`/marketing/lists?token=${token}&success=true&message=${encodeURIComponent(existingList ? 'Marketing list already exists!' : 'Marketing list created successfully!')}`);
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
          <div className="space-y-5 border-t border-slate-200/60 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800">List Filters</h3>
                  <p className="text-xs text-slate-500">Define targeting criteria for your list</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                  {filters.length} active
                </span>
              </div>
            </div>
            
            {/* Filters Container */}
            <div className="space-y-3">
              {filters.map((f, idx) => (
                <div key={idx} className="group relative bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-700">Filter {idx + 1}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeFilter(idx)} 
                      className="cursor-pointer w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Filter Type Dropdown */}
                    <div className="relative col-span-5">
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
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm text-sm font-medium appearance-none cursor-pointer hover:border-slate-400 transition-all duration-200"
                      >
                        <option value="">Select filter</option>
                        {audienceTypeFilters
                          .filter(ft => ft.audience_type_id === audienceTypeId && ft.type === 'all')
                          .filter(ft => {
                            // Always show the current filter's type, even if all values are used
                            if (f.filter_type_name === ft.name) {
                              return true;
                            }
                            
                            // For Channel filters, check if all channel values are already selected
                            if (ft.name === 'Channel') {
                              const selectedChannelValues = filters
                                .filter(filter => filter.filter_type_name === 'Channel')
                                .map(filter => filter.filter_value)
                                .filter(Boolean);
                              const allChannelValues = bankChannels.map(channel => String(channel.value));
                              return selectedChannelValues.length < allChannelValues.length;
                            }
                            
                            // For State filters, check if all state values are already selected
                            if (ft.name === 'State') {
                              const selectedStateValues = filters
                                .filter(filter => filter.filter_type_name === 'State')
                                .map(filter => filter.filter_value)
                                .filter(Boolean);
                              const allStateValues = Object.keys(State);
                              return selectedStateValues.length < allStateValues.length;
                            }
                            
                            return true;
                          })
                          .map(ft => (
                            <option key={`filter-type-${ft.name}`} value={ft.value}>
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

                    <div className="flex items-center justify-center col-span-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">=</span>
                      </div>
                    </div>

                    {/* Filter Value Dropdown */}
                    <div className="relative col-span-5">
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
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/90 backdrop-blur-sm text-sm font-medium appearance-none cursor-pointer hover:border-slate-400 transition-all duration-200"
                        >
                          <option value="">Select channel</option>
                          {bankChannels
                            .filter(channel => {
                              // Don't show channels that are already selected in other Channel filters
                              const existingChannelValues = filters
                                .map((filter, filterIdx) => 
                                  filterIdx !== idx && filter.filter_type_name === 'Channel' ? filter.filter_value : null
                                )
                                .filter(Boolean);
                              return !existingChannelValues.includes(String(channel.value));
                            })
                            .map((channel) => (
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
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/90 backdrop-blur-sm text-sm font-medium appearance-none cursor-pointer hover:border-slate-400 transition-all duration-200"
                        >
                          <option value="">Select state</option>
                          {Object.entries(State)
                            .filter(([abbr, name]) => {
                              // Don't show states that are already selected in other State filters
                              const existingStateValues = filters
                                .map((filter, filterIdx) => 
                                  filterIdx !== idx && filter.filter_type_name === 'State' ? filter.filter_value : null
                                )
                                .filter(Boolean);
                              return !existingStateValues.includes(abbr);
                            })
                            .map(([abbr, name]) => (
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
              <button 
                type="button" 
                onClick={addFilter} 
                className="cursor-pointer w-full py-4 px-6 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:text-blue-700 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 font-medium flex items-center justify-center gap-3 group bg-gradient-to-r from-blue-50/30 to-indigo-50/30"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span>Add New Filter</span>
              </button>
            ) : (
              <div className="w-full py-4 px-6 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 bg-slate-50/50 flex items-center justify-center gap-3">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Please select an audience type to add filters</span>
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