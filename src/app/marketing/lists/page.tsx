'use client'
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Eye, Edit2 } from "lucide-react";
import { useEffect, useState, Suspense, useMemo, useRef } from "react";
import axios from "axios";
import { useListsStore } from "@/store/listsStore";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ConfirmModal from "@/components/ui/confirm-modal";
import LoadingModal from "@/components/ui/loading-modal";
import Toast from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { MarketingList, AudienceType } from "@/types/listsType";
import { State } from "@/types/listsType";
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

// Helper functions to get values with fallback for both camelCase and snake_case
const getListName = (list: MarketingList | null | undefined): string => {
  return list?.listName || list?.list_name || '';
};

const getAudienceTypeId = (list: MarketingList | null | undefined): number => {
  return list?.audienceTypeId || list?.audience_type_id || 0;
};

const getCreatedAt = (list: MarketingList | null | undefined): string => {
  return list?.createdAt || list?.created_at || '';
};

const getMemberDetails = (list: MarketingList | null | undefined) => {
  return list?.memberDetails || list?.member_details;
};

const getFilters = (list: MarketingList | null | undefined) => {
  return list?.filters || list?.marketing_list_filter || [];
};

function MemberDetailsModal() {
  const { selectedList, setSelectedList, isMemberDetailsOpen, setIsMemberDetailsOpen } = useListsStore();
  const [loading, setLoading] = useState(false);

  // Simulate loading when modal opens
  useEffect(() => {
    if (isMemberDetailsOpen && selectedList) {
      setLoading(true);
      // Simulate API call delay
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isMemberDetailsOpen, selectedList]);

  if (!selectedList) return null;

  const memberDetails = getMemberDetails(selectedList);
  const listType = memberDetails?.type || 'unknown';
  const memberCount = memberDetails?.members?.length || 0;

  // Skeleton loader for member cards
  const MemberSkeleton = () => (
    <div className="p-4 border rounded-lg bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-36 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="w-8 h-6 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="col-span-2 md:col-span-1">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-28 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <div className="col-span-2 md:col-span-1">
          <div className="space-y-3">
            <div>
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-36 h-4 bg-gray-200 rounded animate-pulse mt-1"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isMemberDetailsOpen} onOpenChange={setIsMemberDetailsOpen}>
      <DialogContent 
        className="max-w-3xl max-h-[80vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>{getListName(selectedList)} - Member Details</DialogTitle>
          <DialogDescription>
            View detailed information about list members including their contact information and status.
          </DialogDescription>
          <p className="text-sm text-gray-500 mt-1">
            Type: {listType.charAt(0).toUpperCase() + listType.slice(1)} • 
            Total Members: {memberCount}
          </p>
        </DialogHeader>
        <div className="mt-4">
          <div className="space-y-4">
            {loading || !memberDetails?.members ? (
              // Show skeleton loaders
              Array.from({ length: 5 }).map((_, index) => (
                <MemberSkeleton key={`skeleton-${index}`} />
              ))
            ) : memberDetails.members.length === 0 ? (
              // Show empty state
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg">No members found in this list.</div>
                <div className="text-gray-400 text-sm mt-2">This list appears to be empty.</div>
              </div>
            ) : (
              // Show actual members
              memberDetails.members.map((member: any, index: number) => {
                // For prospects and clients, use member.external_member; for marketing_contact, use member directly
                const ext = member.external_member || member;
                const isProspectOrClient = listType === 'prospect' || listType === 'client';
                
                return (
                  <div key={member.id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        {/* Show Prospect/Client Name if available */}
                        {isProspectOrClient && (member.prospect_id || member.client_id) && (
                          <div className="text-sm font-medium text-orange-600">
                            {listType === 'prospect' ? 'Prospect' : 'Client'}: {member.client_name || member.prospect_name}
                          </div>
                        )}
                        <h3 className="font-semibold text-lg text-gray-900">{ext.full_name || 'No name'}</h3>
                        <p className="text-gray-600">{ext.title || 'No title'}</p>
                      </div>
                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">#{index + 1}</span>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div className="col-span-2 md:col-span-1">
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium text-gray-700">Email:</span>{' '}
                            <span className="text-gray-600">{ext.email || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Phone:</span>{' '}
                            <span className="text-gray-600">{ext.phone || 'N/A'}</span>
                          </div>
                          {ext.company_name && (
                            <div>
                              <span className="font-medium text-gray-700">Company:</span>{' '}
                              <span className="text-gray-600">{ext.company_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-span-2 md:col-span-1">
                        <div className="space-y-2">
                          {(ext.address?.street || ext.address?.city || ext.address?.state || ext.address?.zip) && (
                            <div>
                              <span className="font-medium text-gray-700">Address:</span>
                              <div className="text-gray-600 mt-1">
                                {ext.address.street && <div>{ext.address.street}</div>}
                                <div>
                                  {[ext.address.city, ext.address.state, ext.address.zip]
                                    .filter(Boolean)
                                    .join(', ')}
                                </div>
                              </div>
                            </div>
                          )}
                          {ext.nmls && (
                            <div>
                              <span className="font-medium text-gray-700">NMLS:</span>{' '}
                              <span className="text-gray-600">{ext.nmls}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditListModal({ list, isOpen, onClose, token }: { list: MarketingList | null, isOpen: boolean, onClose: () => void, token: string | null }) {
  const [listName, setListName] = useState(getListName(list));
  const [selectedAudienceType, setSelectedAudienceType] = useState<number>(getAudienceTypeId(list));
  const [loading, setLoading] = useState(false);
  const { lists, setLists } = useListsStore();
  const audienceTypes = useListsStore((state) => state.audienceTypes);
  const audienceTypeFilters = useListsStore((state) => state.audienceTypeFilters);
  const bankChannels = useListsStore((state) => state.bankChannels);
  const companies = useListsStore((state) => state.companies);
  const [filters, setFilters] = useState<any[]>([]);
  const [error, setError] = useState('');

  // Get relevant filters for the selected audience type
  const relevantFilters = useMemo(() => {
    if (!selectedAudienceType) return [];
    
    // Find the audience type name to check if it's marketing contact
    const audienceType = audienceTypes.find(at => at.value === selectedAudienceType);
    const isMarketingContact = audienceType?.name?.toLowerCase().includes('marketing');
    
    const baseFilters = audienceTypeFilters.filter(filter => 
      (filter.name === 'State' || filter.name === 'Channel') && 
      Number(filter.audienceTypeId || filter.audience_type_id) === selectedAudienceType
    );
    
    
    return baseFilters;
  }, [selectedAudienceType, audienceTypeFilters, audienceTypes]);

  useEffect(() => {
    if (list) {
      setListName(getListName(list));
      setSelectedAudienceType(getAudienceTypeId(list));
      // Extract existing filters from the list and convert them to editable format
      const existingFilters = getFilters(list).map(filter => {
        const value = filter.value;
        const filterType = filter.audienceTypeFilter || filter.audience_type_filter;
        
        // For Channel filters, we need to map the value to the channel name
        let filterValue = value;
        let filterValueName = value;
        let filterTypeName = filterType?.name || '';
        
        // Check if this is a Channel filter by looking at the value
        const channel = bankChannels.find(ch => 
          String(ch.value) === value || ch.name === value
        );
        
        if (channel) {
          // This is definitely a Channel filter
          filterTypeName = 'Channel';
          filterValue = channel.name;
          filterValueName = channel.name;
          
          // Find the Channel filter type ID from audienceTypeFilters
          const channelFilterType = audienceTypeFilters.find(ft => 
            ft.name === 'Channel' && (Number(ft.audienceTypeId || ft.audience_type_id) === getAudienceTypeId(list))
          );
          if (channelFilterType) {
            filterTypeName = 'Channel';
            // Update the filter_type_id to the correct Channel filter type ID
            return {
              audience_type_filter_id: channelFilterType.value,
              filter_type_id: channelFilterType.value,
              filter_type_name: 'Channel',
              filter_value: channel.name,
              filter_value_id: value,
              filter_value_name: channel.name
            };
          }
        }
        
        // Check if this is a State filter by looking at the value
        const stateAbbr = Object.keys(State).find(abbr => abbr === value);
        if (stateAbbr) {
          // This is definitely a State filter
          const stateFilterType = audienceTypeFilters.find(ft => 
            ft.name === 'State' && (Number(ft.audienceTypeId || ft.audience_type_id) === getAudienceTypeId(list))
          );
          if (stateFilterType) {
            return {
              audience_type_filter_id: stateFilterType.value,
              filter_type_id: stateFilterType.value,
              filter_type_name: 'State',
              filter_value: value,
              filter_value_id: value,
              filter_value_name: value
            };
          }
        }
        
        // Handle legacy "Company" filter name conversion to "Company Name"
        if (filterTypeName === 'Company') {
          filterTypeName = 'Company Name';
        }

        return {
          audience_type_filter_id: filterType?.value || filter.audienceTypeFilterId || filter.audience_type_filter_id,
          filter_type_id: filterType?.value || filter.audienceTypeFilterId || filter.audience_type_filter_id,
          filter_type_name: filterTypeName,
          filter_value: filterValue,
          filter_value_id: value,
          filter_value_name: filterValueName
        };
      }).filter(Boolean) || [];
      
      setFilters(existingFilters);
    }
    setError('');
  }, [list, bankChannels, audienceTypeFilters]);

  useEffect(() => {
  }, [selectedAudienceType, audienceTypeFilters, relevantFilters, filters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !list) return;

    setLoading(true);
    setError('');

    try {
      // Filter out incomplete filters (those without filter_type_id or value)
      const validFilters = filters.filter(filter => 
        filter.filter_type_id && 
        filter.filter_value && 
        filter.filter_value.trim() !== ''
      );

      const res = await axios.put(`/api/marketing/lists/${token}/${list.id}`, {
        listName: listName,
        audienceTypeId: selectedAudienceType,
        filters: validFilters.map(filter => {
          // For state filters, ensure we're sending the acronym
          if (filter.filter_type_name === 'State') {
            return {
              audienceTypeFilterId: filter.filter_type_id,
              value: filter.filter_value_id // acronym
            };
          }
          // For prospect/client channel, send the channel id
          if ((selectedAudienceType === 1 || selectedAudienceType === 2) && filter.filter_type_name === 'Channel') {
            return {
              audienceTypeFilterId: filter.filter_type_id,
              value: filter.filter_value_id // numeric id
            };
          }
          // For company name filters, use the standard handling
          if (filter.filter_type_name === 'Company Name') {
            return {
              audienceTypeFilterId: filter.filter_type_id,
              value: filter.filter_value
            };
          }
          return {
            audienceTypeFilterId: filter.filter_type_id,
            value: filter.filter_value
          };
        })
      });

      if (res.data.success) {
        // Fetch fresh data after successful edit
        const listRes = await axios.get(`/api/marketing/lists/${token}`);
        setLists(listRes.data.data);
        toast.success('Marketing list updated successfully!', {
          icon: <CheckCircle2 className="text-green-600" />,
        });
        onClose();
      } else {
        setError(res.data.message || 'Failed to update list');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update list');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterId: number, value: string) => {
   
    setFilters(prevFilters => {
      const filterIndex = prevFilters.findIndex(f => f.audience_type_filter_id === filterId);
      if (filterIndex > -1) {
        // Update existing filter
        const updatedFilters = [...prevFilters];
        updatedFilters[filterIndex] = {
          ...updatedFilters[filterIndex],
          value: value
        };
        return updatedFilters;
      } else {
        // Add new filter
        return [...prevFilters, {
          audience_type_filter_id: filterId,
          value: value
        }];
      }
    });
  };

  const removeFilter = (index: number) => {
    setFilters(prevFilters => prevFilters.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl"
      >
        <DialogHeader className="pb-6 border-b border-slate-200/60">
          <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Edit2 size={20} className="text-white" />
            </div>
            Edit Marketing List
          </DialogTitle>
         
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          {/* List Name Section */}
          <div className="space-y-3">
            <label htmlFor="listName" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
         
              List Name
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="listName"
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md"
                placeholder="Enter a descriptive list name"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <div className="w-2 h-2 bg-orange-500 rounded-full opacity-60"></div>
              </div>
            </div>
          </div>

          {/* Audience Type Section */}
          <div className="space-y-3">
            <label htmlFor="audienceType" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            
              Audience Type
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="audienceType"
                value={selectedAudienceType}
                onChange={(e) => setSelectedAudienceType(Number(e.target.value))}
                className="cursor-pointer w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md appearance-none"
                required
              >
                <option value="0">Select an audience type</option>
                {audienceTypes.map((type) => (
                  <option key={`audience-type-${type.value}`} value={type.value}>
                    {type.name}
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
                        value={f.filter_type_id || f.audienceTypeFilterId || f.audience_type_filter_id || ''}
                        onChange={(e) => {
                          const selectedFilter = audienceTypeFilters.find(
                            ft => (ft.id || ft.value) === Number(e.target.value)
                          );
                          if (selectedFilter) {
                            const newFilters = [...filters];
                            newFilters[idx] = {
                              ...newFilters[idx],
                              filter_type_id: selectedFilter.id || selectedFilter.value,
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
                          .filter(ft => Number(ft.audienceTypeId || ft.audience_type_id) === selectedAudienceType && (ft.filterType === 'all' || ft.type === 'all'))
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
                              const allChannelValues = bankChannels.map(channel => channel.name);
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
                            <option key={`filter-type-${ft.id || ft.value}-${ft.name}`} value={ft.id || ft.value}>
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
                            const selectedChannel = bankChannels.find(channel => channel.name === e.target.value);
                            if (selectedChannel) {
                              const newFilters = [...filters];
                              newFilters[idx] = {
                                ...newFilters[idx],
                                filter_value: selectedChannel.name,
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
                              return !existingChannelValues.includes(channel.name);
                            })
                            .map((channel) => (
                              <option key={`channel-${channel.value}-${channel.name}`} value={channel.name}>
                                {channel.name}
                              </option>
                            ))}
                        </select>
                      )}

                      {f.filter_type_name === 'State' && (
                        <select
                          value={f.filter_value || ''}
                          onChange={(e) => {
                            const newFilters = [...filters];
                            newFilters[idx] = {
                              ...newFilters[idx],
                              filter_value: e.target.value,
                              filter_value_id: e.target.value,
                              filter_value_name: e.target.value
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
                              <option 
                                key={`state-${abbr}`} 
                                value={abbr}
                              >
                                {name} ({abbr})
                              </option>
                            ))}
                        </select>
                      )}

                      {f.filter_type_name === 'Company Name' && (
                        <select
                          value={f.filter_value || ''}
                          onChange={(e) => {
                            const newFilters = [...filters];
                            newFilters[idx] = {
                              ...newFilters[idx],
                              filter_value: e.target.value,
                              filter_value_id: e.target.value,
                              filter_value_name: e.target.value
                            };
                            setFilters(newFilters);
                          }}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/90 backdrop-blur-sm text-sm font-medium appearance-none cursor-pointer hover:border-slate-400 transition-all duration-200"
                        >
                          <option value="">Select company</option>
                          {companies
                            .filter(company => {
                              // Don't show companies that are already selected in other Company Name filters
                              const existingCompanyValues = filters
                                .map((filter, filterIdx) => 
                                  filterIdx !== idx && filter.filter_type_name === 'Company Name' ? filter.filter_value : null
                                )
                                .filter(Boolean);
                              return !existingCompanyValues.includes(company.name);
                            })
                            .map((company) => (
                              <option 
                                key={`company-${company.value}`} 
                                value={company.name}
                              >
                                {company.name}
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
            {selectedAudienceType ? (
                                <button 
                    type="button" 
                    onClick={() => {
                      setFilters([...filters, { 
                        filter_type_id: null, 
                        filter_type_name: '', 
                        filter_value: '', 
                        filter_value_id: '', 
                        filter_value_name: '' 
                      }]);
                    }} 
                    className="cursor-pointer w-full py-4 px-6 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:text-blue-700 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 font-medium flex items-center justify-center gap-3 group bg-gradient-to-r from-blue-50/30 to-indigo-50/30"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                      <Plus size={16} className="text-blue-600" />
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
             
            {/* Warning Message */}
            {filters.some(f => f.filter_type_id && !f.filter_value) && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-800">Incomplete Filters</p>
                    <p className="text-sm text-amber-700 mt-1">Some filters are incomplete and will be ignored when saving.</p>
                  </div>
                </div>
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
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/60">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="cursor-pointer px-6 py-2.5 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 rounded-xl transition-all duration-200"
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
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ListsPageContent() {
  const { setLists, setAudienceTypes, setBankChannels, setAudienceTypeFilters, setCompanies, setSelectedList, setIsMemberDetailsOpen } = useListsStore((state) => state);
  const lists = useListsStore((state) => state.lists);
  const audienceTypes = useListsStore((state) => state.audienceTypes);
  const audienceTypeFilters = useListsStore((state) => state.audienceTypeFilters);
  const bankChannels = useListsStore((state) => state.bankChannels);
  const companies = useListsStore((state) => state.companies);

  // Helper function to get audience type name from the store
  const getAudienceTypeName = (list: MarketingList): string => {
    // First try to get it from the list's audienceType object
    if (list.audienceType?.name) {
      return list.audienceType.name;
    }
    // Otherwise, look it up from the audienceTypes array
    const audienceTypeId = getAudienceTypeId(list);
    if (audienceTypeId && audienceTypes.length > 0) {
      const audienceType = audienceTypes.find(at => {
        // Match by value or id, ensuring type comparison
        const atValue = at.value ?? (at as any).id;
        return Number(atValue) === Number(audienceTypeId);
      });
      return audienceType?.name || '—';
    }
    return '—';
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: number | null;
    listName: string;
  }>({ isOpen: false, id: null, listName: '' });
  const [toast, setToast] = useState<{
    isOpen: boolean;
    title: string;
    message?: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ isOpen: false, title: '', type: 'info' });
  const itemsPerPage = 10;
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    list: MarketingList | null;
  }>({ isOpen: false, list: null });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all'); // 'all' or audience type id
  const [sortBy, setSortBy] = useState<'name' | 'count' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const router = useRouter()
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token');
  const successParam = searchParams.get('success');
  const messageParam = searchParams.get('message');
  const isLoadingRef = useRef(false);

  // Skeleton loader component
  const TableSkeleton = () => (
    <div className="w-full">
      <div className="w-full flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden border border-slate-200/60 dark:border-slate-700 md:rounded-2xl shadow-lg bg-white/50 backdrop-blur-sm">
              <table className="min-w-full divide-y divide-slate-200/60 dark:divide-slate-700">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80">
                  <tr>
                    <th className="py-4 px-6 text-sm font-semibold text-left text-slate-700 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-sm font-semibold text-left text-slate-700 uppercase tracking-wider">List Name</th>
                    <th className="px-6 py-4 text-sm font-semibold text-left text-slate-700 uppercase tracking-wider">Audience</th>
                    <th className="px-6 py-4 text-sm font-semibold text-left text-slate-700 uppercase tracking-wider">Count</th>
                    <th className="px-6 py-4 text-sm font-semibold text-left text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white/80 divide-y divide-slate-200/60 dark:divide-slate-700 dark:bg-slate-900">
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors duration-200">
                      <td className="px-6 py-5">
                        <div className="w-6 h-4 bg-slate-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="w-32 h-4 bg-slate-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-6 bg-slate-200 rounded-full animate-pulse"></div>
                            <div className="w-20 h-4 bg-slate-200 rounded animate-pulse"></div>
                          </div>
                          <div className="w-48 h-5 bg-slate-200 rounded animate-pulse"></div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="w-12 h-6 bg-slate-200 rounded-full animate-pulse"></div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse"></div>
                          <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse"></div>
                          <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Handle success parameter from navigation
  useEffect(() => {
    if (successParam === 'true') {
      setToast({
        isOpen: true,
        title: 'Success',
        message: messageParam ? decodeURIComponent(messageParam) : 'Marketing list created successfully!',
        type: 'success'
      });
      // Remove the success and message parameters from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('success');
      newUrl.searchParams.delete('message');
      router.replace(newUrl.pathname + newUrl.search);
    }
  }, [successParam, messageParam, router]);

  useEffect(() => {
    const loadAll = async () => {
      if (!tokenParam || isLoadingRef.current) return;
  
      isLoadingRef.current = true;
      setLoading(true);
      try {
        const authHeaders = {
          headers: {
            'Authorization': `Bearer ${tokenParam}`,
            'Content-Type': 'application/json',
          },
        };
  
        const [listRes, typeRes, bankRes, companiesRes] = await Promise.all([
          axios.get(`/api/marketing/lists/${tokenParam}`),
          axios.get(`/api/marketing/lists/new/audience-types`, authHeaders),
          axios.get(`/api/marketing/lists/new/bank-channels`, authHeaders),
          axios.get(`/api/marketing/lists/new/companies`, authHeaders),
        ]);

        setAudienceTypes(typeRes.data.data);
        setBankChannels(bankRes.data.data);
        setCompanies(companiesRes.data.data);
        
        // Fetch all audience-type-filters for lookup fallback and for use in "add new list" page
        if (typeRes.data.data && Array.isArray(typeRes.data.data)) {
          const filterPromises = typeRes.data.data
            .filter((audienceType: any) => audienceType.value != null || audienceType.id != null)
            .map((audienceType: any) => {
              const audienceTypeId = audienceType.value ?? audienceType.id;
              return axios.get(`/api/marketing/lists/new/audience-types-filter?audienceTypeId=${audienceTypeId}`, authHeaders)
                .then(res => res.data.data || [])
                .catch(() => []);
            });
          
          const filterResults = await Promise.all(filterPromises);
          const allFilters = filterResults.flat();
          setAudienceTypeFilters(allFilters);
        }
        
        // Fetch filters for each list individually and update the lists
        if (listRes.data.data && Array.isArray(listRes.data.data)) {
          const listFilterPromises = listRes.data.data.map((list: MarketingList) => 
            axios.get(`/api/marketing/lists/${tokenParam}/${list.id}`, authHeaders)
              .then(res => ({ listId: list.id, filters: res.data.data?.filters || [] }))
              .catch(() => ({ listId: list.id, filters: [] }))
          );
          
          const listFilterResults = await Promise.all(listFilterPromises);
          
          // Update each list with its filters
          const updatedLists = listRes.data.data.map((list: MarketingList) => {
            const filterResult = listFilterResults.find(result => result.listId === list.id);
            return {
              ...list,
              filters: filterResult?.filters || list.filters || []
            };
          });
          
          setLists(updatedLists);
        } else {
          setLists(listRes.data.data || []);
        }
      } catch (err) {
        setToast({
          isOpen: true,
          title: 'Error',
          message: 'Failed to load marketing lists',
          type: 'error'
        });
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    };
  
    loadAll();
  }, [tokenParam]);

  const handleDeleteClick = (id: number, listName: string) => {
    setConfirmModal({
      isOpen: true,
      id,
      listName
    });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmModal.id || !tokenParam) return;

    setDeleteLoading(true);
    try {
      const res = await axios.delete(`/api/marketing/lists/${tokenParam}/${confirmModal.id}`);
      
      if (res.data.success) {
        // Remove the deleted list from the store
        const updatedLists = lists.filter(list => list.id !== confirmModal.id);
        setLists(updatedLists);
        setToast({
          isOpen: true,
          title: 'Success',
          message: `"${confirmModal.listName}" has been deleted successfully`,
          type: 'success'
        });
      } else {
        setToast({
          isOpen: true,
          title: 'Error',
          message: 'Failed to delete list',
          type: 'error'
        });
      }
    } catch (error: any) {
      setToast({
        isOpen: true,
        title: 'Error',
        message: 'Failed to delete list',
        type: 'error'
      });
    } finally {
      setDeleteLoading(false);
      setConfirmModal({ isOpen: false, id: null, listName: '' });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmModal({ isOpen: false, id: null, listName: '' });
  };

  const handleMemberDetailsClick = (list: MarketingList) => {
    setSelectedList(list);
    setIsMemberDetailsOpen(true);
  };

  const handleEditClick = (list: MarketingList) => {
    setEditModal({ isOpen: true, list });
  };

  const handleEditClose = () => {
    setEditModal({ isOpen: false, list: null });
  };

  // Filter and sort lists
  const filteredAndSortedLists = useMemo(() => {
    let filtered = lists.filter(list => {
      // Search filter
      const audienceTypeName = getAudienceTypeName(list);
      const matchesSearch = getListName(list).toLowerCase().includes(searchTerm.toLowerCase()) ||
                           audienceTypeName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Audience type filter
      const matchesFilter = activeFilter === 'all' || 
                           String(getAudienceTypeId(list)) === String(activeFilter);
      
      return matchesSearch && matchesFilter;
    });

    // Sort lists
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = getListName(a).toLowerCase();
          bValue = getListName(b).toLowerCase();
          break;
        case 'count':
          aValue = a.count || 0;
          bValue = b.count || 0;
          break;
        case 'createdAt':
          aValue = new Date(getCreatedAt(a) || 0).getTime();
          bValue = new Date(getCreatedAt(b) || 0).getTime();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [lists, searchTerm, activeFilter, sortBy, sortOrder, audienceTypes]);

  // Pagination calculations for filtered lists
  const totalPages = Math.ceil(filteredAndSortedLists.length / itemsPerPage) || 1;
  const paginatedLists = filteredAndSortedLists.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter, sortBy, sortOrder]);

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const goPage = (p: number) => setCurrentPage(p);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 flex flex-col items-center pt-16 px-4">
      <Toaster />
      <div
        className="w-full max-w-7xl bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 flex flex-col items-center"
        style={{ minHeight: "700px" }}
      >
        {/* Title, Subtitle, and Actions */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Marketing Lists
            </h1>
            <p className="text-lg text-slate-600 font-medium">Manage and track your marketing lists with precision.</p>
          </div>
          <Button
            onClick={() => {
              const token = tokenParam;
              const url = token ? `/marketing/lists/new?token=${token}` : '/marketing/lists/new';
              router.push(url);
            }}
            className="cursor-pointer flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus size={20} className="stroke-2" /> Add Marketing List
          </Button>
        </div>

        {/* Search and Filter Section */}
        <div className="w-full mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search lists by name or audience type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Audience Type Filters */}
            <div className="flex flex-wrap gap-3">
                          <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveFilter('all');
              }}
              className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeFilter === 'all'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white/80 text-slate-700 hover:bg-white hover:shadow-sm border border-slate-200'
              }`}
            >
              All Lists ({lists.length})
            </button>
              {audienceTypes
                .filter((audienceType) => audienceType.value != null)
                .map((audienceType) => {
                  const audienceTypeValue = audienceType.value;
                  return (
                <button
                      key={audienceTypeValue}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveFilter(String(audienceTypeValue));
                      }}
                      type="button"
                  className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        String(activeFilter) === String(audienceTypeValue)
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-white/80 text-slate-700 hover:bg-white hover:shadow-sm border border-slate-200'
                  }`}
                >
                  {audienceType.name} ({lists.filter(list => {
                        const audienceTypeId = getAudienceTypeId(list);
                        return audienceTypeId === audienceTypeValue;
                  }).length})
                </button>
                  );
                })}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700">Sort by:</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-') as ['name' | 'count' | 'createdAt', 'asc' | 'desc'];
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="cursor-pointer px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="count-desc">Most Members</option>
                <option value="count-asc">Least Members</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div>
              Showing {paginatedLists.length} of {filteredAndSortedLists.length} lists
              {searchTerm && (
                <span className="ml-2">
                  for "<span className="font-medium">{searchTerm}</span>"
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Custom Table Section */}
        {loading ? (
          <TableSkeleton />
        ) : (
          <div className="w-full">
            <div className="w-full flex flex-col">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div className="overflow-hidden border border-slate-200/60 dark:border-slate-700 md:rounded-2xl shadow-lg bg-white/50 backdrop-blur-sm">
                    <table className="min-w-full divide-y divide-slate-200/60 dark:divide-slate-700">
                      <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80">
                        <tr>
                          <th className="py-4 px-6 text-sm font-semibold text-left text-slate-700 uppercase tracking-wider">#</th>
                          <th className="px-6 py-4 text-sm font-semibold text-left text-slate-700 uppercase tracking-wider">List Name</th>
                          <th className="px-6 py-4 text-sm font-semibold text-left text-slate-700 uppercase tracking-wider">Audience</th>
                          <th className="px-6 py-4 text-sm font-semibold text-left text-slate-700 uppercase tracking-wider">Count</th>
                          <th className="px-6 py-4 text-sm font-semibold text-left text-slate-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white/80 divide-y divide-slate-200/60 dark:divide-slate-700 dark:bg-slate-900">
                        {paginatedLists.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center">
                              <div className="text-slate-500 text-lg">No lists found</div>
                              <div className="text-slate-400 text-sm mt-1">
                                Try adjusting your search or filters
                              </div>
                            </td>
                          </tr>
                        ) : (
                          paginatedLists.map((list, idx) => (
                          <tr key={`${list.id}-${idx}-${getListName(list)}-${getCreatedAt(list)}`} className="hover:bg-slate-50/80 transition-colors duration-200">
                            <td className="px-6 py-5 text-sm font-medium text-slate-900">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                            <td className="px-6 py-5">
                              <div className="text-sm font-semibold text-slate-900">{getListName(list)}</div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-200/50">
                                    {getAudienceTypeName(list)}
                                  </span>
                                  {getMemberDetails(list)?.members ? (
                                    <button
                                      onClick={() => {
                                        const token = tokenParam;
                                        const url = token ? `/marketing/lists/${list.id}?token=${token}` : `/marketing/lists/${list.id}`;
                                        router.push(url);
                                      }}
                                      className="cursor-pointer text-orange-600 hover:text-orange-700 font-medium transition-colors text-sm"
                                    >
                                      ({getMemberDetails(list)!.members.length} {getMemberDetails(list)!.members.length === 1 ? 'Member' : 'Members'})
                                    </button>
                                  ) : (
                                    <div className="w-20 h-4 bg-slate-200 rounded animate-pulse"></div>
                                  )}
                                </div>
                                {/* Display Filters */}
                                {(() => {
                                  const filters = getFilters(list);
                                  if (!filters || !Array.isArray(filters) || filters.length === 0) return null;
                                  
                                  return (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {filters.map((filter) => {
                                        // Get filter label from nested object or lookup from audienceTypeFilters
                                        let label = filter.audienceTypeFilter?.name || filter.audience_type_filter?.name || '';
                                        
                                        // If label is missing, try to look it up from audienceTypeFilters using the filter ID
                                        if (!label) {
                                          const filterId = filter.audienceTypeFilterId || filter.audience_type_filter_id;
                                          if (filterId != null) {
                                            const filterType = audienceTypeFilters.find(
                                              ft => {
                                                const ftId = ft.id ?? ft.value;
                                                return ftId != null && Number(ftId) === Number(filterId);
                                              }
                                            );
                                            if (filterType) label = filterType.name;
                                          }
                                        }
                                        
                                      let valueToShow: string = String(filter.value ?? '');
                                        const audienceTypeId = getAudienceTypeId(list);
                                        
                                        // Handle Channel filters for Prospect/Client lists
                                      if ((audienceTypeId === 1 || audienceTypeId === 2) && label === 'Channel') {
                                        const ch = bankChannels.find(ch => String(ch.value) === String(filter.value));
                                        if (ch) valueToShow = ch.name;
                                      }
                                        
                                        // Handle State filters - map abbreviation to full state name
                                        if (label === 'State') {
                                          const stateEntry = Object.entries(State).find(([abbr]) => abbr === filter.value);
                                          if (stateEntry) {
                                            valueToShow = stateEntry[1]; // Full state name
                                          }
                                        }
                                        
                                        // Handle Company Name filters
                                        if (label === 'Company Name' || label === 'Company') {
                                          // Value is already the company name, no mapping needed
                                          valueToShow = filter.value || '';
                                        }
                                        
                                        // Only show if we have both label and value
                                        if (!label || !valueToShow) return null;
                                        
                                      return (
                                        <span
                                            key={filter.id || `${label}-${filter.value}`}
                                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/50 shadow-sm"
                                        >
                                          {label}: {valueToShow}
                                        </span>
                                      );
                                    })}
                                  </div>
                                  );
                                })()}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-slate-100 text-slate-700">
                                {list.count}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => {
                                    const token = tokenParam;
                                    const url = token ? `/marketing/lists/${list.id}?token=${token}` : `/marketing/lists/${list.id}`;
                                    router.push(url);
                                  }}
                                  className="cursor-pointer p-2 text-slate-600 hover:text-orange-600 transition-all duration-200 rounded-lg hover:bg-orange-50 hover:shadow-sm" 
                                  aria-label="View members"
                                >
                                  <Eye size={18} className="stroke-2" />
                                </button>
                                <button 
                                  onClick={() => handleEditClick(list)}
                                  className="cursor-pointer p-2 text-slate-600 hover:text-blue-600 transition-all duration-200 rounded-lg hover:bg-blue-50 hover:shadow-sm" 
                                  aria-label="Edit list"
                                >
                                  <Edit2 size={18} className="stroke-2" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteClick(list.id, getListName(list))}
                                  disabled={deleteLoading}
                                  className="cursor-pointer p-2 text-slate-600 hover:text-red-600 transition-all duration-200 rounded-lg hover:bg-red-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" 
                                  aria-label="Delete list"
                                >
                                  <Trash2 size={18} className="stroke-2" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between mt-8">
              <button 
                onClick={goPrev} 
                disabled={currentPage === 1} 
                className="cursor-pointer flex items-center px-4 py-2.5 text-sm font-medium text-slate-700 capitalize transition-all duration-200 bg-white border border-slate-300 rounded-lg gap-x-2 hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 rtl:-scale-x-100">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
                </svg>
                <span>Previous</span>
              </button>
              <div className="items-center hidden md:flex gap-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => goPage(i + 1)}
                    className={`cursor-pointer px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      currentPage === i + 1 
                        ? 'bg-orange-500 text-white shadow-md' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={goNext} 
                disabled={currentPage === totalPages} 
                className="cursor-pointer flex items-center px-4 py-2.5 text-sm font-medium text-slate-700 capitalize transition-all duration-200 bg-white border border-slate-300 rounded-lg gap-x-2 hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <span>Next</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 rtl:-scale-x-100">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating action button for mobile */}
      <button
        className="cursor-pointer fixed bottom-8 right-8 z-50 sm:hidden bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-xl p-4 flex items-center justify-center transition-all duration-300 transform hover:scale-110"
        aria-label="Add new Marketing List"
      >
        <Plus size={28} className="stroke-2" />
      </button>

      {/* Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Marketing List"
        message={`Are you sure you want to delete "${confirmModal.listName}" marketing list? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />

      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />

      {/* Add MemberDetailsModal */}
      <MemberDetailsModal />

      {/* Add EditModal */}
      <EditListModal
        list={editModal.list}
        isOpen={editModal.isOpen}
        onClose={handleEditClose}
        token={tokenParam}
      />
    </main>
  );
}

export default function ListsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 flex flex-col items-center pt-16 px-4">
        <div className="w-full max-w-7xl bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 flex flex-col items-center" style={{ minHeight: "700px" }}>
          <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-6">
            <div className="space-y-2">
              <div className="w-48 h-8 bg-slate-200 rounded animate-pulse mb-2"></div>
              <div className="w-64 h-5 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="w-40 h-10 bg-slate-200 rounded-xl animate-pulse"></div>
          </div>
          <div className="w-full">
            <div className="w-full flex flex-col">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div className="overflow-hidden border border-slate-200/60 dark:border-slate-700 md:rounded-2xl shadow-lg bg-white/50 backdrop-blur-sm">
                    <table className="min-w-full divide-y divide-slate-200/60 dark:divide-slate-700">
                      <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80">
                        <tr>
                          <th className="py-4 px-6 text-sm font-semibold text-left text-slate-700 uppercase tracking-wider">#</th>
                          <th className="px-6 py-4 text-sm font-semibold text-left text-slate-700 uppercase tracking-wider">List Name</th>
                          <th className="px-6 py-4 text-sm font-semibold text-left text-slate-700 uppercase tracking-wider">Audience</th>
                          <th className="px-6 py-4 text-sm font-semibold text-left text-slate-700 uppercase tracking-wider">Count</th>
                          <th className="px-6 py-4 text-sm font-semibold text-left text-slate-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white/80 divide-y divide-slate-200/60 dark:divide-slate-700 dark:bg-slate-900">
                        {Array.from({ length: 10 }).map((_, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors duration-200">
                            <td className="px-6 py-5">
                              <div className="w-6 h-4 bg-slate-200 rounded animate-pulse"></div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="w-32 h-4 bg-slate-200 rounded animate-pulse"></div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-24 h-6 bg-slate-200 rounded-full animate-pulse"></div>
                                  <div className="w-20 h-4 bg-slate-200 rounded animate-pulse"></div>
                                </div>
                                <div className="w-48 h-5 bg-slate-200 rounded animate-pulse"></div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="w-12 h-6 bg-slate-200 rounded-full animate-pulse"></div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse"></div>
                                <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse"></div>
                                <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse"></div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <ListsPageContent />
    </Suspense>
  );
} 