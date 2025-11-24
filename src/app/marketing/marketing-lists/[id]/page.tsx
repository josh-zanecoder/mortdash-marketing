"use client";
import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useMarketingListStore } from '@/store/marketingListStore';
import { Users, Mail, Phone, Building2, User, ChevronLeft, ArrowLeft } from 'lucide-react';

function MarketingListRecipientsPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const listId = params.id as string;
  const token = searchParams.get('token');
  const { lists, recipients, recipientsLoading, fetchRecipients, fetchLists } = useMarketingListStore();
  const [activeTab, setActiveTab] = useState<'prospects' | 'clients' | 'personalContacts'>('prospects');

  const currentList = lists.find(list => String(list.id) === String(listId));
  
  // Get audience type name and map to tab
  const audienceTypeName = currentList?.audienceType?.name || currentList?.audience_type?.name || currentList?.audienceTypeName || currentList?.audience_type_name || '';
  const normalizedAudienceType = audienceTypeName.toLowerCase().trim();
  
  // Map audience type to recipient tab
  const getRecipientTabFromAudienceType = (audienceType: string): 'prospects' | 'clients' | 'personalContacts' | null => {
    const normalized = audienceType.toLowerCase().trim();
    if (normalized === 'prospect') return 'prospects';
    if (normalized === 'client') return 'clients';
    if (normalized === 'personal contact' || normalized === 'personalcontact') return 'personalContacts';
    return null;
  };
  
  const defaultTab = getRecipientTabFromAudienceType(normalizedAudienceType) || 'prospects';
  
  // Set active tab based on audience type when list is loaded
  useEffect(() => {
    if (currentList && normalizedAudienceType) {
      const tab = getRecipientTabFromAudienceType(normalizedAudienceType);
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, [currentList, normalizedAudienceType]);

  useEffect(() => {
    if (token && listId) {
      fetchRecipients(token, listId);
      if (lists.length === 0) {
        fetchLists(token);
      }
    }
  }, [token, listId, fetchRecipients, fetchLists, lists.length]);

  if (recipientsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[#ff6600]/30 border-t-[#ff6600] rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate total recipients based on audience type
  const getTotalRecipients = () => {
    if (!normalizedAudienceType) return 0;
    if (normalizedAudienceType === 'prospect') return recipients?.prospects?.length || 0;
    if (normalizedAudienceType === 'client') return recipients?.clients?.length || 0;
    if (normalizedAudienceType === 'personal contact' || normalizedAudienceType === 'personalcontact') {
      return recipients?.personalContacts?.length || 0;
    }
    return 0;
  };
  
  const totalRecipients = getTotalRecipients();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="cursor-pointer inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Lists
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                {currentList?.listName || currentList?.list_name || 'Marketing List'} Recipients
              </h1>
              <p className="text-slate-600 mt-1">
                View all recipients in this marketing list
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">Total Recipients</div>
              <div className="text-2xl font-bold text-[#ff6600]">{totalRecipients.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Tabs - Only show tab for the list's audience type */}
        {normalizedAudienceType && (
          <div className="mb-6 border-b border-slate-200">
            <nav className="flex gap-6">
              {normalizedAudienceType === 'prospect' && (
                <button
                  onClick={() => setActiveTab('prospects')}
                  className={`cursor-pointer pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'prospects'
                      ? 'border-[#ff6600] text-[#ff6600]'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Prospects ({recipients?.prospects?.length || 0})
                </button>
              )}
              {normalizedAudienceType === 'client' && (
                <button
                  onClick={() => setActiveTab('clients')}
                  className={`cursor-pointer pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'clients'
                      ? 'border-[#ff6600] text-[#ff6600]'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Clients ({recipients?.clients?.length || 0})
                </button>
              )}
              {(normalizedAudienceType === 'personal contact' || normalizedAudienceType === 'personalcontact') && (
                <button
                  onClick={() => setActiveTab('personalContacts')}
                  className={`cursor-pointer pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'personalContacts'
                      ? 'border-[#ff6600] text-[#ff6600]'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Personal Contacts ({recipients?.personalContacts?.length || 0})
                </button>
              )}
            </nav>
          </div>
        )}

        {/* Recipients Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">
              {normalizedAudienceType === 'prospect' && 'Prospects'}
              {normalizedAudienceType === 'client' && 'Clients'}
              {(normalizedAudienceType === 'personal contact' || normalizedAudienceType === 'personalcontact') && 'Personal Contacts'}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {normalizedAudienceType === 'prospect' && 'View all prospect recipients and their members'}
              {normalizedAudienceType === 'client' && 'View all client recipients and their members'}
              {(normalizedAudienceType === 'personal contact' || normalizedAudienceType === 'personalcontact') && 'View all personal contact recipients'}
            </p>
          </div>

          <div className="p-6">
            {!recipients ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-slate-700 text-lg mb-2 font-medium">No recipients found</div>
                <div className="text-slate-500 text-sm">This marketing list has no recipients</div>
              </div>
            ) : normalizedAudienceType === 'prospect' && (!recipients.prospects || recipients.prospects.length === 0) ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-slate-700 text-lg mb-2 font-medium">No prospects found</div>
                <div className="text-slate-500 text-sm">This marketing list has no prospect recipients</div>
              </div>
            ) : normalizedAudienceType === 'client' && (!recipients.clients || recipients.clients.length === 0) ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-slate-700 text-lg mb-2 font-medium">No clients found</div>
                <div className="text-slate-500 text-sm">This marketing list has no client recipients</div>
              </div>
            ) : (normalizedAudienceType === 'personal contact' || normalizedAudienceType === 'personalcontact') && (!recipients.personalContacts || recipients.personalContacts.length === 0) ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-slate-700 text-lg mb-2 font-medium">No personal contacts found</div>
                <div className="text-slate-500 text-sm">This marketing list has no personal contact recipients</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {(normalizedAudienceType === 'prospect' || normalizedAudienceType === 'client') ? (
                        <>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Company</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Contact Info</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Location</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Members</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                        </>
                      ) : (
                        <>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Phone</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Company</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Title</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {normalizedAudienceType === 'prospect' && recipients.prospects?.map((prospect) => {
                      const memberCount = prospect.prospectMembers?.filter(pm => !pm.deletedAt).length || 0;
                      const allMembers = prospect.prospectMembers?.filter(pm => !pm.deletedAt && pm.externalMember) || [];
                      
                      return (
                        <tr key={prospect.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="text-sm font-medium text-slate-900">
                              {prospect.company || prospect.companyName || 'N/A'}
                            </div>
                            {prospect.nmls && (
                              <div className="text-xs text-slate-500 mt-1">NMLS: {prospect.nmls}</div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {prospect.email && (
                              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                                <Mail className="w-4 h-4" />
                                {prospect.email}
                              </div>
                            )}
                            {prospect.phone && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Phone className="w-4 h-4" />
                                {prospect.phone}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-600">
                            {[prospect.city, prospect.state, prospect.zip].filter(Boolean).join(', ') || 'N/A'}
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-slate-900 font-medium">{memberCount} {memberCount === 1 ? 'member' : 'members'}</div>
                            {allMembers.length > 0 && (
                              <div className="mt-1 space-y-1">
                                {allMembers.slice(0, 3).map((pm) => (
                                  <div key={pm.id} className="text-xs text-slate-600">
                                    {pm.externalMember?.firstName} {pm.externalMember?.lastName}
                                    {pm.externalMember?.email && ` (${pm.externalMember.email})`}
                                  </div>
                                ))}
                                {allMembers.length > 3 && (
                                  <div className="text-xs text-slate-500">+{allMembers.length - 3} more</div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {prospect.status && (
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                prospect.status.toLowerCase() === 'hot'
                                  ? 'bg-red-100 text-red-700'
                                  : prospect.status.toLowerCase() === 'warm'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {prospect.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {normalizedAudienceType === 'client' && recipients.clients?.map((client) => {
                      const memberCount = client.clientMembers?.filter(cm => !cm.deletedAt).length || 0;
                      const allMembers = client.clientMembers?.filter(cm => !cm.deletedAt && cm.externalMember) || [];
                      
                      return (
                        <tr key={client.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="text-sm font-medium text-slate-900">
                              {client.company || client.companyName || 'N/A'}
                            </div>
                            {client.nmls && (
                              <div className="text-xs text-slate-500 mt-1">NMLS: {client.nmls}</div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {client.email && (
                              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                                <Mail className="w-4 h-4" />
                                {client.email}
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Phone className="w-4 h-4" />
                                {client.phone}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-600">
                            {[client.city, client.state, client.zip].filter(Boolean).join(', ') || 'N/A'}
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-slate-900 font-medium">{memberCount} {memberCount === 1 ? 'member' : 'members'}</div>
                            {allMembers.length > 0 && (
                              <div className="mt-1 space-y-1">
                                {allMembers.slice(0, 3).map((cm) => (
                                  <div key={cm.id} className="text-xs text-slate-600">
                                    {cm.externalMember?.firstName} {cm.externalMember?.lastName}
                                    {cm.externalMember?.email && ` (${cm.externalMember.email})`}
                                  </div>
                                ))}
                                {allMembers.length > 3 && (
                                  <div className="text-xs text-slate-500">+{allMembers.length - 3} more</div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {client.status && (
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                client.status.toLowerCase() === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {client.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {(normalizedAudienceType === 'personal contact' || normalizedAudienceType === 'personalcontact') && recipients.personalContacts?.map((contact) => (
                      <tr key={contact.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 text-sm font-medium text-slate-900">
                          {contact.firstName || ''} {contact.lastName || ''}
                        </td>
                        <td className="py-4 px-4">
                          {contact.emailAddress && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="w-4 h-4" />
                              {contact.emailAddress}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone className="w-4 h-4" />
                              {contact.phone}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600">{contact.company || 'N/A'}</td>
                        <td className="py-4 px-4 text-sm text-slate-600">{contact.title || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function MarketingListRecipientsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <MarketingListRecipientsPageContent />
    </Suspense>
  );
}

