'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X, Plus, Trash2 } from 'lucide-react';
import { useMarketingListStore } from '@/store/marketingListStore';
import type { AudienceTypeFilter } from '@/types/listsType';
import { State } from '@/types/listsType';

interface Filter {
  audienceTypeFilterId: number | string;
  filterValue: string;
}

interface MarketingListModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  token: string | null;
  listId?: number | null;
}

export default function MarketingListModal({
  open,
  onClose,
  onSuccess,
  token,
  listId = null
}: MarketingListModalProps) {
  const isEditMode = !!listId;
  const [listName, setListName] = useState('');
  const [selectedAudienceTypeId, setSelectedAudienceTypeId] = useState<number | string>('');
  const [filters, setFilters] = useState<Filter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use store for data state
  const {
    audienceTypes,
    audienceTypesLoading,
    bankChannels,
    bankChannelsLoading,
    audienceTypeFilters,
    audienceTypeFiltersLoading,
    currentList,
    currentListLoading,
    fetchAudienceTypes,
    fetchBankChannels,
    fetchAudienceTypeFilters,
    clearAudienceTypeFilters,
    fetchList,
    clearCurrentList,
    updateListApi,
  } = useMarketingListStore();

  // Fetch audience types and bank channels when modal opens
  useEffect(() => {
    if (open && token) {
      fetchAudienceTypes(token);
      fetchBankChannels(token);
      
      // If edit mode, fetch the list data
      if (isEditMode && listId) {
        fetchList(token, listId);
      } else {
        clearCurrentList();
      }
    }
  }, [open, token, isEditMode, listId, fetchAudienceTypes, fetchBankChannels, fetchList, clearCurrentList]);

  // Fetch audience type filters when audience type is selected
  useEffect(() => {
    if (selectedAudienceTypeId && token) {
      fetchAudienceTypeFilters(token, Number(selectedAudienceTypeId));
    } else {
      clearAudienceTypeFilters();
      setFilters([]);
    }
  }, [selectedAudienceTypeId, token, fetchAudienceTypeFilters, clearAudienceTypeFilters]);

  // Load existing data when currentList is available (edit mode)
  useEffect(() => {
    if (isEditMode && currentList) {
      const listName = currentList.listName || currentList.list_name || '';
      const audienceTypeId = currentList.audienceTypeId || currentList.audience_type_id || '';
      const existingFilters = currentList.filters || currentList.marketing_list_filter || [];
      
      setListName(listName);
      setSelectedAudienceTypeId(audienceTypeId ? String(audienceTypeId) : '');
      
      // Convert existing filters to form format
      const formFilters = existingFilters.map(filter => ({
        audienceTypeFilterId: filter.audienceTypeFilterId || filter.audience_type_filter_id || '',
        filterValue: filter.value || '',
      }));
      setFilters(formFilters);
    }
  }, [isEditMode, currentList]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setListName('');
      setSelectedAudienceTypeId('');
      setFilters([]);
      setError(null);
      clearAudienceTypeFilters();
      clearCurrentList();
    }
  }, [open, clearAudienceTypeFilters, clearCurrentList]);

  const addFilter = () => {
    if (audienceTypeFilters.length > 0) {
      setFilters([...filters, { audienceTypeFilterId: audienceTypeFilters[0].id, filterValue: '' }]);
    }
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, field: 'audienceTypeFilterId' | 'filterValue', value: string | number) => {
    const updatedFilters = [...filters];
    updatedFilters[index] = {
      ...updatedFilters[index],
      [field]: value,
    };
    setFilters(updatedFilters);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Token missing');
      return;
    }

    // Validation
    if (!listName || !listName.trim()) {
      setError('Please enter a list name');
      return;
    }

    if (!selectedAudienceTypeId) {
      setError('Please select an audience type');
      return;
    }

    // Validate filters
    for (let i = 0; i < filters.length; i++) {
      if (!filters[i].audienceTypeFilterId) {
        setError(`Please select a filter type for filter ${i + 1}`);
        return;
      }
      if (!filters[i].filterValue || !filters[i].filterValue.trim()) {
        setError(`Please enter a filter value for filter ${i + 1}`);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const requestData = {
        listName: listName.trim(),
        audienceTypeId: Number(selectedAudienceTypeId),
        filters: filters.map(filter => ({
          audienceTypeFilterId: Number(filter.audienceTypeFilterId),
          filterValue: filter.filterValue.trim(),
        })),
      };

      if (isEditMode && listId) {
        // Update existing list
        await updateListApi(token, listId, requestData);
        toast.success(`Marketing list "${listName}" updated successfully!`);
      } else {
        // Create new list
        const res = await axios.post(`/api/marketing-lists`, requestData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-client-origin': window.location.origin,
          },
        });

        if (res.data?.success || res.status === 200 || res.status === 201) {
          toast.success(`Marketing list "${listName}" created successfully!`);
        } else {
          throw new Error(res.data?.message || 'Failed to create marketing list');
        }
      }

      // Reset form
      setListName('');
      setSelectedAudienceTypeId('');
      setFilters([]);

      // Close modal and call success callback
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || (isEditMode ? 'Failed to update marketing list' : 'Failed to create marketing list');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full p-0 rounded-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold">
            {isEditMode ? 'Edit Marketing List' : 'Create New Marketing List'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-6 pb-6 pt-4">
          {isEditMode && currentListLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#ff6600]/30 border-t-[#ff6600] rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* List Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  List Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  required
                  placeholder="Enter a name for your marketing list"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                />
              </div>

              {/* Audience Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Audience Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {audienceTypesLoading ? (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <select
                  value={selectedAudienceTypeId}
                  onChange={(e) => setSelectedAudienceTypeId(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">Select an audience type</option>
                  {audienceTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              )}
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          {selectedAudienceTypeId && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Filters (Optional)
                </label>
                {audienceTypeFiltersLoading ? (
                  <div className="text-xs text-gray-500">Loading filters...</div>
                ) : audienceTypeFilters.length > 0 ? (
                  <button
                    type="button"
                    onClick={addFilter}
                    className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Filter
                  </button>
                ) : null}
              </div>

              {audienceTypeFiltersLoading ? (
                <div className="text-center py-4 text-sm text-gray-500">
                  Loading available filters...
                </div>
              ) : audienceTypeFilters.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                  No filters available for this audience type
                </div>
              ) : filters.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                  No filters added. Click "Add Filter" to add one.
                </div>
              ) : (
                <div className="space-y-3">
                  {filters.map((filter, index) => (
                    <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Filter Type
                          </label>
                          <select
                            value={filter.audienceTypeFilterId}
                            onChange={(e) => updateFilter(index, 'audienceTypeFilterId', e.target.value)}
                            required
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          >
                            <option value="">Select filter type</option>
                            {audienceTypeFilters.map((filterType) => (
                              <option key={filterType.id} value={filterType.id}>
                                {filterType.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Filter Value
                          </label>
                          {(() => {
                            const selectedFilterType = audienceTypeFilters.find(f => f.id === Number(filter.audienceTypeFilterId));
                            const isChannelFilter = selectedFilterType?.name === 'Channel' || selectedFilterType?.code === 'channel';
                            const isStateFilter = selectedFilterType?.name === 'State' || selectedFilterType?.code === 'state';
                            
                            if (isChannelFilter) {
                              return (
                                <div className="relative">
                                  {bankChannelsLoading ? (
                                    <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                  ) : (
                                    <select
                                      value={filter.filterValue}
                                      onChange={(e) => updateFilter(index, 'filterValue', e.target.value)}
                                      required
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none cursor-pointer"
                                    >
                                      <option value="">Select a channel</option>
                                      {bankChannels.map((channel) => (
                                        <option key={channel.id} value={channel.id}>
                                          {channel.name}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                              );
                            }

                            if (isStateFilter) {
                              return (
                                <div className="relative">
                                  <select
                                    value={filter.filterValue}
                                    onChange={(e) => updateFilter(index, 'filterValue', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none cursor-pointer"
                                  >
                                    <option value="">Select a state</option>
                                    {Object.entries(State).map(([key, value]) => (
                                      <option key={key} value={key}>
                                        {value}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                              );
                            }
                            
                            return (
                              <input
                                type="text"
                                value={filter.filterValue}
                                onChange={(e) => updateFilter(index, 'filterValue', e.target.value)}
                                required
                                placeholder="Enter filter value"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                              />
                            );
                          })()}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFilter(index)}
                        className="cursor-pointer mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove filter"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer px-6 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-all duration-200 font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || (isEditMode && currentListLoading)}
                  className="cursor-pointer px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    isEditMode ? 'Update List' : 'Create List'
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

