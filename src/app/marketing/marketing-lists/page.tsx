"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMarketingListStore } from '@/store/marketingListStore';
import MarketingListModal from '@/components/CreateMarketingList';
import { Users, Calendar, Mail, Filter, Plus, Eye, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import DeleteMarketingListDialog from '@/components/DeleteMarketingListDialog';

function MarketingListsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { lists, loading, fetchLists, deleteList } = useMarketingListStore();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingListId, setEditingListId] = useState<number | null>(null);
  const [deletingList, setDeletingList] = useState<any | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch marketing lists
  useEffect(() => {
    if (token) {
      fetchLists(token);
    }
  }, [token, fetchLists]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[#ff6600]/30 border-t-[#ff6600] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Create/Edit Marketing List Modal */}
      <MarketingListModal
        open={createModalOpen || editingListId !== null}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingListId(null);
        }}
        onSuccess={() => {
          if (token) {
            fetchLists(token);
          }
          setCreateModalOpen(false);
        setEditingListId(null);
        }}
        token={token}
      listId={editingListId}
      />
    <DeleteMarketingListDialog
      open={showDeleteDialog}
      onClose={() => {
        setShowDeleteDialog(false);
        setDeletingList(null);
      }}
      onConfirm={async () => {
        if (deletingList && token) {
          try {
            await deleteList(token, deletingList.id);
            toast.success('Marketing list deleted successfully!', {
              icon: <CheckCircle2 className="text-green-600" />,
            });
            fetchLists(token);
          } catch (error: any) {
            toast.error('Failed to delete marketing list.');
          }
          setShowDeleteDialog(false);
          setDeletingList(null);
        }
      }}
      list={deletingList}
    />
    <Toaster />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Marketing Lists</h1>
              <p className="text-slate-600 mt-1">View and manage all your marketing lists</p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="cursor-pointer bg-[#ff6600] text-white rounded-lg px-5 py-2.5 font-medium hover:bg-[#ff7a2f] transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create List
            </button>
          </div>

        {/* Marketing Lists Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">All Marketing Lists</h2>
            <p className="text-sm text-slate-600 mt-1">View and manage all your marketing lists</p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-[#ff6600]/30 border-t-[#ff6600] rounded-full animate-spin" />
              </div>
            ) : lists.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-slate-700 text-lg mb-2 font-medium">No marketing lists found</div>
                <div className="text-slate-500 text-sm mb-6">Create your first marketing list to get started</div>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="cursor-pointer bg-[#ff6600] text-white rounded-lg px-5 py-2.5 font-medium hover:bg-[#ff7a2f] transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create List
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">List Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Audience Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Filters</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Recipients</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Count</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email Sent</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Created At</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lists.map((list) => {
                      const listName = list.listName || list.list_name || 'Unnamed List';
                      const audienceTypeName = list.audienceType?.name || list.audience_type?.name || list.audienceTypeName || list.audience_type_name || 'N/A';
                      const recipientCount = list.recipientCount || list.recipient_count || list.count || 0;
                      const count = list.count || 0;
                      const emailSent = list.emailSent || list.email_sent || false;
                      const createdAt = list.createdAt || list.created_at;
                      const filters = list.filters || [];

                      return (
                        <tr key={list.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 text-sm text-slate-900 font-medium">{listName}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{audienceTypeName}</td>
                          <td className="py-3 px-4">
                            {filters.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {filters.map((filter) => {
                                  const filterName = filter.audienceTypeFilter?.name || 'Unknown Filter';
                                  const filterCode = filter.audienceTypeFilter?.code;
                                  const filterValue = filter.value || 'N/A';
                                  const valueType = filter.audienceTypeFilter?.valueType;
                                  
                                  // If valueType is "filter_value_id", the value is an ID and we should only show the filter name
                                  // Otherwise, show both name and value if value is meaningful
                                  const isValueAnId = valueType === 'filter_value_id';
                                  
                                  return (
                                    <span
                                      key={filter.id}
                                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md border border-blue-200"
                                      title={isValueAnId ? `${filterName} (ID: ${filterValue})` : (filterCode ? `${filterName} (${filterCode}): ${filterValue}` : `${filterName}: ${filterValue}`)}
                                    >
                                      <Filter className="w-3 h-3" />
                                      <span className="font-medium">{filterName}</span>
                                      {!isValueAnId && filterValue && filterValue !== 'N/A' && (
                                        <>
                                          <span className="text-blue-600">:</span>
                                          <span>{filterValue}</span>
                                        </>
                                      )}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-sm">No filters</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">{recipientCount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{count.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            {emailSent ? (
                              <span className="inline-flex items-center gap-1 text-green-600">
                                <Mail className="w-4 h-4" />
                                Sent
                              </span>
                            ) : (
                              <span className="text-slate-400">Not Sent</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingListId(list.id)}
                                className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => router.push(`/marketing/marketing-lists/${list.id}?token=${token}`)}
                                className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#ff6600] bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View Recipients
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingList(list);
                                  setShowDeleteDialog(true);
                                }}
                                className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
    </>
  );
}

export default function MarketingListsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <MarketingListsPageContent />
    </Suspense>
  );
}

