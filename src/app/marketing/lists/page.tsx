'use client'
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Eye, Edit2 } from "lucide-react";
import { useEffect, useState, Suspense, useMemo } from "react";
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

function MemberDetailsModal() {
  const { selectedList, setSelectedList, isMemberDetailsOpen, setIsMemberDetailsOpen } = useListsStore();

  if (!selectedList) return null;

  const listType = selectedList.member_details?.type || 'unknown';
  const memberCount = selectedList.member_details?.members?.length || 0;

  return (
    <Dialog open={isMemberDetailsOpen} onOpenChange={setIsMemberDetailsOpen}>
      <DialogContent 
        className="max-w-3xl max-h-[80vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>{selectedList.list_name} - Member Details</DialogTitle>
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
            {selectedList.member_details?.members.map((member: any, index: number) => {
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
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditListModal({ list, isOpen, onClose, token }: { list: MarketingList | null, isOpen: boolean, onClose: () => void, token: string | null }) {
  const [listName, setListName] = useState(list?.list_name || '');
  const [selectedAudienceType, setSelectedAudienceType] = useState<number>(list?.audience_type_id || 0);
  const [loading, setLoading] = useState(false);
  const { lists, setLists } = useListsStore();
  const audienceTypes = useListsStore((state) => state.audienceTypes);
  const audienceTypeFilters = useListsStore((state) => state.audienceTypeFilters);
  const bankChannels = useListsStore((state) => state.bankChannels);
  const [filters, setFilters] = useState<any[]>([]);
  const [error, setError] = useState('');

  // Get relevant filters for the selected audience type
  const relevantFilters = useMemo(() => {
    if (!selectedAudienceType) return [];
    return audienceTypeFilters.filter(filter => 
      (filter.name === 'State' || filter.name === 'Channel') && 
      Number(filter.audience_type_id) === selectedAudienceType
    );
  }, [selectedAudienceType, audienceTypeFilters]);

  useEffect(() => {
    if (list) {
      setListName(list.list_name);
      setSelectedAudienceType(list.audience_type_id);
      // Extract existing filters from the list and convert them to editable format
      const existingFilters = list.marketing_list_filter?.map(filter => {
        const value = filter.value;
        const filterType = filter.audience_type_filter;
        
        return {
          audience_type_filter_id: filterType?.value || filter.audience_type_filter_id,
          filter_type_id: filterType?.value || filter.audience_type_filter_id,
          filter_type_name: filterType?.name || '',
          filter_value: value,
          filter_value_id: value,
          filter_value_name: value
        };
      }).filter(Boolean) || [];
      
      setFilters(existingFilters);
    }
    setError('');
  }, [list]);

  useEffect(() => {
  }, [selectedAudienceType, audienceTypeFilters, relevantFilters, filters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !list) return;

    setLoading(true);
    setError('');

    try {
      const res = await axios.put(`/api/marketing/lists/${token}/${list.id}`, {
        list_name: listName,
        audience_type_id: selectedAudienceType,
        filters: filters.map(filter => {
          // For state filters, ensure we're sending the acronym
          if (filter.filter_type_name === 'State') {
            return {
              audience_type_filter_id: filter.filter_type_id,
              value: filter.filter_value_id // Use the acronym directly from filter_value_id
            };
          }
          return {
            audience_type_filter_id: filter.filter_type_id,
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
    console.log('Changing filter:', { filterId, value });
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
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle>Edit Marketing List</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="listName" className="text-sm font-medium text-gray-700">
              List Name
            </label>
            <input
              id="listName"
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent"
              placeholder="Enter list name"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="audienceType" className="text-sm font-medium text-gray-700">
              Audience Type
            </label>
            <select
              id="audienceType"
              value={selectedAudienceType}
              onChange={(e) => setSelectedAudienceType(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent"
              required
            >
              <option value="0">Select Audience Type</option>
              {audienceTypes.map((type) => (
                <option key={`audience-type-${type.value}`} value={type.value}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filters Section */}
          <div className="space-y-4 border-t pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">List Filters</h3>
            
            {/* Edit filters */}
            {filters.map((f, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-3">
                <button type="button" onClick={() => removeFilter(idx)} className="text-red-500">➖</button>

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
                  className="px-3 py-2 border rounded-lg flex-1"
                >
                  <option value="">Select filter</option>
                  {audienceTypeFilters
                    .filter(ft => ft.audience_type_id === selectedAudienceType && ft.type === 'all')
                    .map(ft => (
                      <option key={`filter-type-${ft.value}-${ft.name}`} value={ft.value}>
                        {ft.name}
                      </option>
                    ))}
                </select>

                <span className="text-gray-500">=</span>

                {/* Filter Value Dropdown */}
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
                    className="px-3 py-2 border rounded-lg flex-1"
                  >
                    <option value="">Select channel</option>
                    {bankChannels.map((channel) => (
                      <option key={`channel-${channel.value}-${channel.name}`} value={channel.name}>
                        {channel.name}
                      </option>
                    ))}
                  </select>
                )}

                {f.filter_type_name === 'State' && (
                  <div className="relative flex-1">
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
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select state</option>
                      {Object.entries(State).map(([abbr, name]) => (
                        <option 
                          key={`state-${abbr}`} 
                          value={abbr}
                        >
                          {name} ({abbr})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ))}
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
              className="inline-flex items-center gap-2 text-[#ff6600] hover:text-[#ff7a2f] font-semibold"
            >
              <span>+</span> Add Filter
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#ff6600] hover:bg-[#ff7a2f] text-white"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ListsPageContent() {
  const { setLists, setAudienceTypes, setBankChannels, setAudienceTypeFilters, setSelectedList, setIsMemberDetailsOpen } = useListsStore((state) => state);
  const lists = useListsStore((state) => state.lists);
  const audienceTypes = useListsStore((state) => state.audienceTypes);
  const audienceTypeFilters = useListsStore((state) => state.audienceTypeFilters);
  const bankChannels = useListsStore((state) => state.bankChannels);
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

  const router = useRouter()
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token');

  useEffect(() => {
    const loadAll = async () => {
      if (!tokenParam) return;
  
      setLoading(true);
      try {
        const authHeaders = {
          headers: {
            'Authorization': `Bearer ${tokenParam}`,
            'Content-Type': 'application/json',
          },
        };
  
        const [listRes, typeRes, filterRes, bankRes] = await Promise.all([
          axios.get(`/api/marketing/lists/${tokenParam}`),
          axios.get(`/api/marketing/lists/new/audience-types`, authHeaders),
          axios.get(`/api/marketing/lists/new/audience-types-filter/`, authHeaders),
          axios.get(`/api/marketing/lists/new/bank-channels`, authHeaders),
        ]);
  
        setLists(listRes.data.data);
        setAudienceTypes(typeRes.data.data);
        setAudienceTypeFilters(Array.isArray(filterRes.data.data) ? filterRes.data.data : []);
        setBankChannels(bankRes.data.data);
      } catch (err) {
        setToast({
          isOpen: true,
          title: 'Error',
          message: 'Failed to load marketing lists',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
  
    loadAll();
  }, [tokenParam, setLists, setAudienceTypes, setAudienceTypeFilters, setBankChannels]);

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

  // Pagination calculations
  const totalPages = Math.ceil(lists.length / itemsPerPage) || 1;
  const paginatedLists = lists.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const goPage = (p: number) => setCurrentPage(p);

  return (
    <main className="min-h-screen bg-[#fdf6f1] flex flex-col items-center pt-16 px-4">
      <Toaster />
      <div
        className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-12 flex flex-col items-center"
        style={{ minHeight: "700px" }}
      >
        {/* Title, Subtitle, and Actions */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#232323] mb-1 text-left">Marketing Lists</h1>
            <p className="text-lg text-[#6d6d6d] text-left">Manage and track your marketing lists.</p>
          </div>
          <Button
            onClick={() => {
              const token = tokenParam;
              const url = token ? `/marketing/lists/new?token=${token}` : '/marketing/lists/new';
              router.push(url);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#ff6600] hover:bg-[#ff7a2f] text-white font-bold rounded-lg shadow transition-all"
          >
            <Plus size={22} /> Add Marketing List
          </Button>
        </div>

        {/* Custom Table Section */}
        <div className="w-full">
          <div className="w-full flex flex-col mt-6">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="py-3.5 px-4 text-sm font-normal text-left text-gray-500 dark:text-gray-400">#</th>
                        <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">List Name</th>
                        <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">Audience</th>
                        <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">Count</th>
                        <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
                      {paginatedLists.map((list, idx) => (
                        <tr key={`${list.id}-${idx}-${list.list_name}-${list.created_at}`}>
                          <td className="px-4 py-4 text-sm text-gray-800 dark:text-white">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                          <td className="px-4 py-4 text-sm text-gray-800 dark:text-white">{list.list_name}</td>
                          <td className="px-4 py-4 text-sm text-gray-800 dark:text-white">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {(list as MarketingList).audience_type?.name || (list as MarketingList).audienceType?.name || '—'}
                                </span>
                                {list.member_details?.members && (
                                  <button
                                    onClick={() => {
                                      const token = tokenParam;
                                      const url = token ? `/marketing/lists/${list.id}?token=${token}` : `/marketing/lists/${list.id}`;
                                      router.push(url);
                                    }}
                                    className="text-[#ff6600] hover:text-[#ff7a2f] font-medium cursor-pointer transition-colors"
                                  >
                                    ({list.member_details.members.length} {list.member_details.members.length === 1 ? 'Member' : 'Members'})
                                  </button>
                                )}
                              </div>
                              {/* Display Filters */}
                              {list.marketing_list_filter && list.marketing_list_filter.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {list.marketing_list_filter.map((filter) => (
                                    <span
                                      key={filter.id}
                                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                                    >
                                      {filter.audience_type_filter?.name}: {filter.value}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {list.added_by && (
                                <div className="mt-2">
                                  <span
                                    className="inline-flex items-center px-3 py-1.5 rounded-md text-white text-sm font-medium bg-[#ff9900] whitespace-nowrap"
                                  >
                                    Account Executive = {list.added_by_name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300">{list.count}</td>
                          <td className="px-4 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  const token = tokenParam;
                                  const url = token ? `/marketing/lists/${list.id}?token=${token}` : `/marketing/lists/${list.id}`;
                                  router.push(url);
                                }}
                                className="p-1 text-[#ff6600] transition-colors duration-200 rounded-lg hover:bg-[#fff0e6]" 
                                aria-label="View members"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                onClick={() => handleEditClick(list)}
                                className="p-1 text-[#ff6600] transition-colors duration-200 rounded-lg hover:bg-[#fff0e6]" 
                                aria-label="Edit list"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteClick(list.id, list.list_name)}
                                disabled={deleteLoading}
                                className="p-1 text-[#ff6600] transition-colors duration-200 rounded-lg hover:bg-[#fff0e6] disabled:opacity-50" 
                                aria-label="Delete list"
                              >
                                <Trash2 size={16} />
                              </button>
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
          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <button onClick={goPrev} disabled={currentPage === 1} className="flex items-center px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-gray-100 disabled:opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 rtl:-scale-x-100">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
              </svg>
              <span>previous</span>
            </button>
            <div className="items-center hidden md:flex gap-x-3">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => goPage(i + 1)}
                  className={`px-2 py-1 text-sm rounded-md ${currentPage === i + 1 ? 'text-blue-500 bg-blue-100/60 dark:bg-gray-800' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button onClick={goNext} disabled={currentPage === totalPages} className="flex items-center px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-gray-100 disabled:opacity-50">
              <span>Next</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 rtl:-scale-x-100">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Floating action button for mobile */}
      <button
        className="fixed bottom-8 right-8 z-50 sm:hidden bg-[#ff6600] hover:bg-[#ff7a2f] text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all"
        aria-label="Add new Marketing List"
      >
        <Plus size={28} />
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

      <LoadingModal
        isOpen={loading}
        title="Loading Marketing Lists"
        message="Please wait while we load your marketing lists..."
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
    <Suspense fallback={<LoadingModal isOpen={true} title="Loading Marketing Lists" message="Please wait while we load your marketing lists..." />}>
      <ListsPageContent />
    </Suspense>
  );
} 