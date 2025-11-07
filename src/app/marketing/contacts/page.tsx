'use client'
import { Button } from "@/components/ui/button";
import { Trash2, Plus, MoreVertical, User, Search, Download, Upload, UserCheck, UserX, Building, Users, X, CheckCircle2, FileSpreadsheet } from "lucide-react";
import { useState, useEffect } from "react";
import AddContactModal from '@/components/AddContactModal';
import UploadContactsModal from '@/components/UploadContactsModal';
import { useContactStore } from '@/store/useContactStore';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import EditContactModal from '@/components/EditContactModal';
import DeleteContactDialog from '@/components/DeleteContactDialog';


type ContactType = 'marketing' | 'prospects' | 'clients';

export default function ContactsPage() {
  const [activeTab, setActiveTab] = useState<ContactType>('marketing');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingContact, setEditingContact] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingContact, setDeletingContact] = useState<any | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [branchFilter, setBranchFilter] = useState('');
  const updateContact = useContactStore((s) => s.updateContact);
  const deleteContact = useContactStore((s) => s.deleteContact);

  // Skeleton loader component
  const TableSkeleton = () => (
    <div className="w-full">
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500">Full Name</th>
              <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500">Email</th>
              <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500">Phone</th>
              <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500">Company</th>
              <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500">Branch</th>
              <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: 8 }).map((_, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-4 py-4">
                  <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="px-4 py-4">
                  <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="px-4 py-4">
                  <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="px-4 py-4">
                  <div className="w-36 h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="px-4 py-4">
                  <div className="w-28 h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Skeleton for prospect/client sections
  const CompanySkeleton = () => (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-20 h-5 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
      <div className="border-t border-gray-200 mt-2 pt-2">
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-28 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const { marketingContacts, loading, error, fetchContacts, channels, fetchChannels, page, limit, total, setPage, search, setSearch, prospects, prospectsLoading, prospectsError, fetchProspects, clients, clientsLoading, clientsError, fetchClients } = useContactStore();

  // Filter contacts based on search and branch filter
  const filteredContacts = marketingContacts.filter(contact => {
    const matchesSearch = !search || 
      contact.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      contact.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      (contact.email_address || contact.email)?.toLowerCase().includes(search.toLowerCase()) ||
      contact.company?.toLowerCase().includes(search.toLowerCase());
    
    const matchesBranch = !branchFilter || contact.branch === branchFilter;
    
    return matchesSearch && matchesBranch;
  });

  useEffect(() => {
    fetchContacts({ page, limit, search });
    fetchChannels();
    fetchProspects();
    fetchClients();
  }, [fetchContacts, fetchChannels, fetchProspects, fetchClients, page, limit, search]);

  const pageCount = Math.ceil(total / limit) || 1;

  // Handler to refresh contacts after upload
  const handleUploadSuccess = () => {
    // Reset to page 1 to show newly uploaded contacts
    setPage(1);
    // Fetch fresh data with current search and limit
    fetchContacts({ page: 1, limit, search });
    toast.success('Contacts uploaded successfully!', {
      icon: <CheckCircle2 className="text-green-600" />,
    });
  };

  // Debounced search handler
  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput, setSearch]);

  // Download Excel template
  const downloadTemplate = () => {
    const templateData = [
      ['branch', 'company', 'email_address', 'first_name', 'last_name', 'phone_number', 'title'],
      ['Wholesale', 'Example Company Inc', 'john@example.com', 'John', 'Doe', '(555) 123-4567', 'CEO'],
    ];

    // Convert to CSV format (Excel can open CSV files)
    const csvContent = templateData.map(row => row.join(',')).join('\n');
    
    // Create and download file as CSV (Excel will open it correctly)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'marketing_contacts_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Template downloaded successfully!', {
      icon: <FileSpreadsheet className="text-blue-600" />,
    });
  };

  return (
    <main className="min-h-screen bg-[#fdf6f1] flex flex-col items-center pt-8 sm:pt-16 px-2 sm:px-4">
      <AddContactModal open={showAddModal} onClose={() => {
        setShowAddModal(false);
      }} onSubmit={() => {
        // Refresh contacts after adding
        fetchContacts({ page, limit, search });
        toast.success('Contact added successfully!', {
          icon: <CheckCircle2 className="text-green-600" />,
        });
      }} channels={channels} />
      <EditContactModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingContact(null);
        }}
        onSubmit={async (form) => {
          // Refresh contacts after editing
          fetchContacts({ page, limit, search });
          setShowEditModal(false);
          setEditingContact(null);
        }}
        channels={channels}
        contact={editingContact}
      />
      <DeleteContactDialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingContact(null);
        }}
        onConfirm={async () => {
          if (deletingContact) {
            const success = await deleteContact(deletingContact.id);
            if (success) {
              // Refresh contacts after deleting
              fetchContacts({ page, limit, search });
              toast.success('Contact deleted successfully!', {
                icon: <CheckCircle2 className="text-green-600" />,
              });
            } else {
              toast.error('Failed to delete contact.');
            }
            setShowDeleteDialog(false);
            setDeletingContact(null);
          }
        }}
        contact={deletingContact}
      />
      <UploadContactsModal open={showUploadModal} onClose={() => setShowUploadModal(false)} onSuccess={handleUploadSuccess} />
      <Toaster />
      <div
        className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-12 flex flex-col items-center"
        style={{ minHeight: "700px" }}
      >
        {/* Header: Title/Subtitle */}
        <div className="w-full mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#232323] mb-1 text-left">Contacts</h1>
          <p className="text-base sm:text-lg text-[#6d6d6d] text-left">Manage your contacts and view member information.</p>
        </div>

        {/* Tab Navigation */}
        <div className="w-full mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('marketing')}
              className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'marketing'
                  ? 'bg-white text-[#ff6600] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="hidden sm:inline">Marketing Contacts</span>
              <span className="sm:hidden">Marketing</span> ({total})
            </button>
            <button
              onClick={() => setActiveTab('prospects')}
              className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'prospects'
                  ? 'bg-white text-[#ff6600] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="hidden sm:inline">Prospect Members</span>
              <span className="sm:hidden">Prospects</span> ({prospects ? prospects.filter(p => p.members && p.members.length > 0).length : 0})
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-white text-[#ff6600] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="hidden sm:inline">Client Members</span>
              <span className="sm:hidden">Clients</span> ({clients ? clients.filter(c => c.members && c.members.length > 0).length : 0})
            </button>
          </div>
        </div>

        {/* Marketing Contacts Section */}
        {activeTab === 'marketing' && (
          <div className="w-full">
            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-2 sm:flex-1">
                <div className="flex items-center w-full bg-white border border-[#ffe3d1] rounded-lg shadow-sm px-3 sm:px-4 py-2">
                  <Search className="text-[#ff6600] mr-2" size={18} />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    className="flex-1 bg-transparent outline-none text-sm sm:text-base text-[#232323] placeholder-[#bdbdbd]"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                  />
                </div>
                <select 
                  className="cursor-pointer px-3 sm:px-4 py-2 border border-[#ffe3d1] rounded-lg bg-white text-sm sm:text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent shadow-sm"
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                >
                  <option value="">All Branches</option>
                  {channels.map(channel => (
                    <option key={channel.value} value={channel.label}>{channel.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button className="px-3 sm:px-4 py-2 bg-[#ff6600] hover:bg-[#ff7a2f] text-white text-sm sm:text-base font-bold rounded-lg shadow transition-all cursor-pointer" onClick={() => setShowAddModal(true)}>
                  <span className="hidden sm:inline">Add a New Contact</span>
                  <span className="sm:hidden">Add Contact</span>
                </Button>
                {/*
                <Button variant="default" className="px-3 sm:px-4 py-2 text-sm sm:text-base font-bold rounded-lg shadow transition-all cursor-pointer" onClick={() => setShowUploadModal(true)}>
                  <span className="hidden sm:inline">Upload Contacts</span>
                  <span className="sm:hidden">Upload</span>
                </Button>
                <Button variant="outline" className="px-3 sm:px-4 py-2 text-sm sm:text-base font-bold rounded-lg shadow transition-all cursor-pointer border-[#ff6600] text-[#ff6600] hover:bg-[#ff6600] hover:text-white" onClick={downloadTemplate}>
                  <FileSpreadsheet className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Template</span>
                  <span className="sm:hidden">Template</span>
                </Button>
                */}
              </div>
            </div>

            {/* Loading/Error States */}
            {loading && <TableSkeleton />}
            {error && <div className="py-8 text-center text-lg text-red-600">{error}</div>}

            {/* Marketing Contacts Table */}
            {!loading && !error && (
              <>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-3.5 text-xs sm:text-sm font-normal text-left text-gray-500 dark:text-gray-400">Full Name</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3.5 text-xs sm:text-sm font-normal text-left text-gray-500 dark:text-gray-400">Email</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3.5 text-xs sm:text-sm font-normal text-left text-gray-500 dark:text-gray-400">Phone</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3.5 text-xs sm:text-sm font-normal text-left text-gray-500 dark:text-gray-400">Company</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3.5 text-xs sm:text-sm font-normal text-left text-gray-500 dark:text-gray-400">Branch</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3.5 text-xs sm:text-sm font-normal text-left text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
                      {filteredContacts.map((contact) => (
                        <tr key={contact.id}>
                          <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-800 dark:text-white font-medium">
                            {contact.first_name} {contact.last_name}
                          </td>
                          <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-300">{contact.email_address || contact.email}</td>
                          <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-300">{contact.phone_number || 'N/A'}</td>
                          <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-300">{contact.company}</td>
                          <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-300">{contact.branch || 'N/A'}</td>
                          <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm flex flex-col sm:flex-row gap-1 sm:gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="cursor-pointer text-blue-600 border-blue-200 hover:bg-blue-50 text-xs sm:text-sm"
                              onClick={() => {
                                setEditingContact(contact);
                                setShowEditModal(true);
                              }}
                            >
                              <span className="sr-only">Update</span>
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
                              </svg>
                              <span className="hidden sm:inline">Update</span>
                              <span className="sm:hidden">Edit</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 cursor-pointer text-xs sm:text-sm"
                              onClick={() => {
                                setDeletingContact(contact);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <span className="sr-only">Delete</span>
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              <span className="hidden sm:inline">Delete</span>
                              <span className="sm:hidden">Del</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination Controls */}
                <div className="flex justify-center mt-4 sm:mt-6">
                  <Pagination>
                    <PaginationContent className="flex flex-wrap justify-center gap-1 sm:gap-2">
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={e => {
                            e.preventDefault();
                            if (page > 1) setPage(page - 1);
                          }}
                          aria-disabled={page === 1}
                          className="cursor-pointer text-xs sm:text-sm"
                        />
                      </PaginationItem>
                      {[...Array(pageCount)].map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            isActive={page === i + 1}
                            onClick={e => {
                              e.preventDefault();
                              setPage(i + 1);
                            }}
                            className="cursor-pointer text-xs sm:text-sm"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={e => {
                            e.preventDefault();
                            if (page < pageCount) setPage(page + 1);
                          }}
                          aria-disabled={page === pageCount}
                          className="cursor-pointer text-xs sm:text-sm"
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            )}
          </div>
        )}

        {/* Prospect Members Section */}
        {activeTab === 'prospects' && (
          <div className="w-full">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <h3 className="text-base sm:text-lg font-semibold text-blue-900">Prospect Members</h3>
              </div>
              <p className="text-sm sm:text-base text-blue-700 mb-3 sm:mb-4">Read-only view of prospect member data from external API.</p>
              {prospectsLoading ? (
                <div className="text-sm sm:text-base text-blue-700">Loading prospects...</div>
              ) : prospectsError ? (
                <div className="text-sm sm:text-base text-red-600">{prospectsError}</div>
              ) : prospects ? (
                <div className="text-xl sm:text-2xl font-bold text-blue-900">
                  {prospects.filter(p => p.members && p.members.length > 0).length} Prospects
                </div>
              ) : null}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Prospects & Members</h4>
              <div className="space-y-4 sm:space-y-6">
                              {prospectsLoading ? (
                <div className="space-y-4 sm:space-y-6">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <CompanySkeleton key={idx} />
                  ))}
                </div>
              ) : prospectsError ? (
                <div className="text-sm sm:text-base text-red-600">{prospectsError}</div>
              ) : prospects && prospects.length > 0 ? (
                prospects.filter(p => p.members && p.members.length > 0).map((prospect, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <Building className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                      <span className="font-medium text-gray-900 text-base sm:text-lg">{prospect.company || 'Unknown Company'}</span>
                      <span className="ml-2 text-xs text-blue-700 bg-blue-100 rounded-full px-2 py-0.5">{prospect.members.length} members</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm border-t border-gray-200 mt-2">
                        <thead>
                          <tr>
                            <th className="py-1 px-1 sm:px-2 text-left font-semibold text-gray-600">First Name</th>
                            <th className="py-1 px-1 sm:px-2 text-left font-semibold text-gray-600">Last Name</th>
                            <th className="py-1 px-1 sm:px-2 text-left font-semibold text-gray-600">Email</th>
                            <th className="py-1 px-1 sm:px-2 text-left font-semibold text-gray-600">Phone</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prospect.members.map((member, mIdx) => (
                            <tr key={mIdx}>
                              <td className="py-1 px-1 sm:px-2">{member.first_name}</td>
                              <td className="py-1 px-1 sm:px-2">{member.last_name}</td>
                              <td className="py-1 px-1 sm:px-2">{member.email}</td>
                              <td className="py-1 px-1 sm:px-2">{member.phone}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm sm:text-base text-gray-500">No companies found.</div>
              )}
              </div>
            </div>
          </div>
        )}

        {/* Client Members Section */}
        {activeTab === 'clients' && (
          <div className="w-full">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                <h3 className="text-base sm:text-lg font-semibold text-green-900">Client Members</h3>
              </div>
              <p className="text-sm sm:text-base text-green-700 mb-3 sm:mb-4">Read-only view of client member data from external API.</p>
              {clientsLoading ? (
                <div className="text-sm sm:text-base text-green-700">Loading clients...</div>
              ) : clientsError ? (
                <div className="text-sm sm:text-base text-red-600">{clientsError}</div>
              ) : clients ? (
                <div className="text-xl sm:text-2xl font-bold text-green-900">{clients.filter(c => c.members && c.members.length > 0).length} Companies</div>
              ) : null}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Companies & Members</h4>
              <div className="space-y-4 sm:space-y-6">
                {clientsLoading ? (
                  <div className="space-y-4 sm:space-y-6">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <CompanySkeleton key={idx} />
                    ))}
                  </div>
                ) : clientsError ? (
                  <div className="text-sm sm:text-base text-red-600">{clientsError}</div>
                ) : clients && clients.length > 0 ? (
                  clients.filter(c => c.members && c.members.length > 0).map((client, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <Building className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                        <span className="font-medium text-gray-900 text-base sm:text-lg">{client.company || 'Unknown Company'}</span>
                        <span className="ml-2 text-xs text-green-700 bg-green-100 rounded-full px-2 py-0.5">{client.members.length} members</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm border-t border-gray-200 mt-2">
                          <thead>
                            <tr>
                              <th className="py-1 px-1 sm:px-2 text-left font-semibold text-gray-600">First Name</th>
                              <th className="py-1 px-1 sm:px-2 text-left font-semibold text-gray-600">Last Name</th>
                              <th className="py-1 px-1 sm:px-2 text-left font-semibold text-gray-600">Email</th>
                              <th className="py-1 px-1 sm:px-2 text-left font-semibold text-gray-600">Phone</th>
                            </tr>
                          </thead>
                          <tbody>
                            {client.members.map((member, mIdx) => (
                              <tr key={mIdx}>
                                <td className="py-1 px-1 sm:px-2">{member.first_name}</td>
                                <td className="py-1 px-1 sm:px-2">{member.last_name}</td>
                                <td className="py-1 px-1 sm:px-2">{member.email}</td>
                                <td className="py-1 px-1 sm:px-2">{member.phone}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm sm:text-base text-gray-500">No companies found.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}