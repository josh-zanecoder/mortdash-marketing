'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEmailTemplateStore } from '@/store/useEmailTemplateStore';
import UploadEmailTemplateModal from '@/components/UploadEmailTemplateModal';
import EditEmailTemplateModal from '@/components/EditEmailTemplateModal';
import DeleteEmailTemplateDialog from '@/components/DeleteEmailTemplateDialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, FileText, Trash2, Search, Loader2, ChevronLeft, ChevronRight, Pencil, LayoutTemplate } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';

interface EmailTemplate {
  id: string | number;
  name?: string | null;
  subject?: string | null;
  thumbnail?: string | null;
  path?: string | null;
  type?: string | null;
  isVisible?: boolean | null;
  isArchived?: boolean | null;
  audienceTypeId?: string | number | null;
  emailTemplateCategoryId?: string | number | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

function EmailTemplatePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const { templates, templatesLoading, pagination, fetchPaginatedTemplates, deleteTemplate } = useEmailTemplateStore();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTemplateId, setEditTemplateId] = useState<string | number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | number | null>(null);
  const [deletingTemplateName, setDeletingTemplateName] = useState<string>('');
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    if (token) {
      fetchPaginatedTemplates(token, currentPage, limit);
    }
  }, [token, currentPage, limit, fetchPaginatedTemplates]);

  // Filter templates client-side if search query is provided
  const filteredTemplates = templates.filter((template) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      template.name?.toLowerCase().includes(query) ||
      template.subject?.toLowerCase().includes(query) ||
      template.type?.toLowerCase().includes(query)
    );
  });

  // If search query is provided, show filtered results; otherwise show paginated results
  const displayTemplates = searchQuery.trim() ? filteredTemplates : templates;

  const handleUploadSuccess = () => {
    if (token) {
      fetchPaginatedTemplates(token, currentPage, limit);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditTemplateId(template.id);
    setEditModalOpen(true);
  };

  const handleEditInBuilder = async (template: EmailTemplate) => {
    if (!token || !template.id || !template.path) {
      toast.error('Missing required information to open builder');
      return;
    }

    try {
      // Fetch HTML content from template (with cache-busting to ensure fresh content)
      const htmlResponse = await fetch(`/api/email-builder/${template.id}/html?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-client-origin': typeof window !== 'undefined' ? window.location.origin : '',
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store', // Don't cache the request
      });

      if (!htmlResponse.ok) {
        throw new Error('Failed to fetch template HTML');
      }

      const htmlContent = await htmlResponse.text();

      // Store HTML in sessionStorage
      const storageKey = `grapesjs-builder-html-${template.id}-${Date.now()}`;
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(storageKey, htmlContent);
      }

      // Navigate to builder with HTML and template ID
      const params = new URLSearchParams();
      if (token) params.set('token', token);
      params.set('builderId', storageKey);
      params.set('templateId', String(template.id));
      
      router.push(`/marketing/email-builder?${params.toString()}`);
    } catch (error: any) {
      console.error('Failed to open builder:', error);
      toast.error(error.message || 'Failed to open template in builder');
    }
  };

  const handleDeleteClick = (template: EmailTemplate) => {
    setDeletingTemplateId(template.id);
    setDeletingTemplateName(template.name || 'Unnamed Template');
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!token || !deletingTemplateId) {
      toast.error('Missing required information');
      return;
    }

    try {
      setDeleting(true);
      await deleteTemplate(token, deletingTemplateId);
      toast.success('Email template deleted successfully!');
      setDeleteDialogOpen(false);
      setDeletingTemplateId(null);
      setDeletingTemplateName('');
      
      // Refresh templates list
      if (token) {
        fetchPaginatedTemplates(token, currentPage, limit);
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete email template');
    } finally {
      setDeleting(false);
    }
  };

  const getTypeLabel = (type: string | null | undefined) => {
    if (!type) return 'N/A';
    if (type === 'ae_use') return 'AE Use';
    if (type === 'bank_use') return 'Bank Use';
    return type;
  };

  return (
    <main className="min-h-screen bg-[#fdf6f1]">
      <Toaster />
      
      {/* Header */}
      <div className="bg-[#fdf6f1]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
              <p className="text-gray-600 mt-1">Manage your email templates</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push(`/marketing/email-builder${token ? `?token=${token}` : ''}`)}
                variant="outline"
                size="lg"
                className="border-gray-300 hover:bg-gray-50"
              >
                <LayoutTemplate className="w-5 h-5 mr-2" />
                Builder
              </Button>
              <Button
                onClick={() => setUploadModalOpen(true)}
                className="bg-[#ff6600] hover:bg-[#ff7a2f] text-white"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Upload Template
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search templates by name, subject, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent"
            />
          </div>
        </div>

        {/* Templates Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {templatesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#ff6600]" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No templates found' : 'No templates yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Get started by uploading your first email template'}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setUploadModalOpen(true)}
                  className="bg-[#ff6600] hover:bg-[#ff7a2f] text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Upload Template
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayTemplates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {template.thumbnail ? (
                            <img
                              src={template.thumbnail}
                              alt={template.name || 'Template'}
                              className="w-10 h-10 rounded object-cover mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center mr-3">
                              <FileText className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {template.name || 'Unnamed Template'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {template.subject || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {getTypeLabel(template.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            template.isArchived
                              ? 'bg-gray-100 text-gray-700'
                              : template.isVisible
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {template.isArchived ? 'Archived' : template.isVisible ? 'Visible' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {template.createdAt
                          ? new Date(template.createdAt).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(template)}
                            className="h-8"
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          {template.path && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditInBuilder(template)}
                              className="h-8"
                            >
                              <LayoutTemplate className="w-4 h-4 mr-1" />
                              Edit Template
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(template)}
                            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {!searchQuery.trim() && pagination && pagination.totalPages > 1 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{((currentPage - 1) * limit) + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * limit, pagination.total)}</span> of <span className="font-semibold text-gray-900">{pagination.total}</span> template{pagination.total !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={!pagination.hasPrevPage || templatesLoading}
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={templatesLoading}
                        className={`cursor-pointer min-w-[2.5rem] px-3 py-2 text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          currentPage === pageNum
                            ? 'bg-[#ff6600] text-white shadow-sm'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
                  disabled={!pagination.hasNextPage || templatesLoading}
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results count for search */}
        {searchQuery.trim() && !templatesLoading && filteredTemplates.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Found {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadEmailTemplateModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Edit Modal */}
      <EditEmailTemplateModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditTemplateId(null);
        }}
        onSuccess={() => {
          if (token) {
            fetchPaginatedTemplates(token, currentPage, limit);
          }
        }}
        templateId={editTemplateId}
        token={token}
      />

      {/* Delete Dialog */}
      <DeleteEmailTemplateDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingTemplateId(null);
          setDeletingTemplateName('');
        }}
        onConfirm={handleDeleteConfirm}
        templateName={deletingTemplateName}
      />
    </main>
  );
}

export default function EmailTemplatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fdf6f1] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff6600]" />
      </div>
    }>
      <EmailTemplatePageContent />
    </Suspense>
  );
}
