'use client'
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { useListsStore } from "@/store/listsStore";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ConfirmModal from "@/components/ui/confirm-modal";
import LoadingModal from "@/components/ui/loading-modal";
import Toast from "@/components/ui/toast";

function ListsPageContent() {
  const { setLists, setAudienceTypes, setBankChannels, setAudienceTypeFilters } = useListsStore((state) => state);
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

  // Pagination calculations
  const totalPages = Math.ceil(lists.length / itemsPerPage) || 1;
  const paginatedLists = lists.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const goPage = (p: number) => setCurrentPage(p);

  return (
    <main className="min-h-screen bg-[#fdf6f1] flex flex-col items-center pt-16 px-4">
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
                              <div>{(list as any).audience_type?.name || (list as any).audienceType?.name || '—'}</div>
                              {list.added_by && (
                                <div className="mt-2">
                                  <span
                                    className="inline-block px-3 py-1 rounded-md font-bold text-white text-xs"
                                    style={{ background: "#ff9900" }}
                                  >
                                    Account Executive = {list.added_by_name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300">{list.count}</td>
                          <td className="px-4 py-4 text-sm">
                            <button 
                              onClick={() => handleDeleteClick(list.id, list.list_name)}
                              disabled={deleteLoading}
                              className="px-1 py-1 text-[#ff6600] transition-colors duration-200 rounded-lg hover:bg-[#fff0e6] disabled:opacity-50" 
                              aria-label="Delete list"
                            >
                              <Trash2 size={16} />
                            </button>
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