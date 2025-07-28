'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import axios from "axios"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"

export default function MembersPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tokenParam = searchParams.get('token')
  const [list, setList] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchList = async () => {
      if (!tokenParam || !params.id) return
      try {
        const res = await axios.get(`/api/marketing/lists/${tokenParam}`)
        const foundList = res.data.data.find((l: any) => l.id === Number(params.id))
        setList(foundList)
      } catch (error) {
        console.error('Error fetching list:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchList()
  }, [tokenParam, params.id])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!list) {
    return <div className="flex items-center justify-center min-h-screen">List not found</div>
  }

  const groupMembersByParent = (members: any[]) => {
    if (!members.length) return [];
    
    const grouped = members.reduce((acc: any, member: any) => {
      const parentId = member.prospect_id || member.client_id;
      const parentName = member.prospect_name || member.client_name;
      const parentType = member.prospect_id ? 'prospect' : 'client';
      
      if (!acc[parentId]) {
        acc[parentId] = {
          id: parentId,
          name: parentName,
          type: parentType,
          members: []
        };
      }
      acc[parentId].members.push(member);
      return acc;
    }, {});

    return Object.values(grouped);
  };

  const members = list.member_details?.members || [];
  const isProspectOrClient = list.member_details?.type === 'prospect' || list.member_details?.type === 'client';
  
  // Paginate the members first
  const totalMembers = members.length;
  const totalPages = Math.ceil(totalMembers / itemsPerPage);
  const paginatedMembers = members.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Then group the paginated members
  const groupedMembers = isProspectOrClient ? groupMembersByParent(paginatedMembers) : [{ members: paginatedMembers }];

  return (
    <main className="min-h-screen bg-[#fdf6f1] flex flex-col items-center pt-16 px-4">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl p-12 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              className="cursor-pointer mb-4"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lists
            </Button>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#232323] mb-1">
              {list.list_name}
            </h1>
            <p className="text-lg text-[#6d6d6d]">
              {list.member_details?.type.charAt(0).toUpperCase() + list.member_details?.type.slice(1)} • 
              {totalMembers} {totalMembers === 1 ? 'Member' : 'Members'} • 
              Page {currentPage} of {totalPages}
            </p>
          </div>
        </div>

        {/* Groups of Tables */}
        <div className="space-y-8">
          {groupedMembers.map((group: any, groupIndex: number) => (
            <div key={group.id || groupIndex} className="rounded-md border">
              {/* Parent Header for Prospect/Client */}
              {isProspectOrClient && group.id && (
                <div className="px-6 py-4 bg-orange-50 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-orange-700">
                        {group.type === 'prospect' ? 'Prospect' : 'Client'}: {group.name || `#${group.id}`}
                      </h3>
                      <p className="text-sm text-orange-600">
                        {group.members.length} {group.members.length === 1 ? 'Member' : 'Members'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Members Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Address</TableHead>
                    {list.member_details?.type === 'marketing_contact' && (
                      <>
                        <TableHead>Channel</TableHead>
                        <TableHead>Status</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.members.map((member: any, index: number) => {
                    const ext = member.external_member || member;
                    const actualIndex = index + 1;

                    return (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{actualIndex}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{ext.full_name || 'No name'}</div>
                            <div className="text-sm text-gray-500">{ext.title || 'No title'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{ext.email || 'N/A'}</div>
                            <div className="text-gray-500">{ext.phone || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {ext.address ? (
                            <div className="text-sm">
                              {ext.address.street && <div>{ext.address.street}</div>}
                              <div>
                                {[ext.address.city, ext.address.state, ext.address.zip]
                                  .filter(Boolean)
                                  .join(', ')}
                              </div>
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col items-center gap-2">
            <p className="text-sm text-gray-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalMembers)} of {totalMembers} members
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => {
                  // Show first page, last page, current page, and pages around current page
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                  ) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    pageNum === currentPage - 3 ||
                    pageNum === currentPage + 3
                  ) {
                    return (
                                        <PaginationItem key={pageNum}>
                    <PaginationLink className="cursor-pointer">...</PaginationLink>
                  </PaginationItem>
                    );
                  }
                  return null;
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={`cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </main>
  );
}
