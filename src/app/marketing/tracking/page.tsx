'use client'
import { useState, useEffect } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useTrackingStore } from "@/store/useTrackingStore";
import { Loader2 } from "lucide-react";

export default function TrackingPage() {
  const { 
    data, 
    stats, 
    pagination, 
    loading, 
    error, 
    fetchTrackingData
  } = useTrackingStore();

  const [dateRange, setDateRange] = useState("Today");
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Calculate date range based on selection
  const getDateRange = (range: string) => {
    const today = new Date();
    const startDate = new Date();
    
    switch (range) {
      case "Today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "Yesterday":
        startDate.setDate(today.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "Last 7 Days":
        startDate.setDate(today.getDate() - 7);
        break;
      case "Last 30 Days":
        startDate.setDate(today.getDate() - 30);
        break;
      case "This Month":
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  };

  // Fetch data when component mounts or when date range changes
  useEffect(() => {
    const { startDate, endDate } = getDateRange(dateRange);
    fetchTrackingData(startDate, endDate, pagination.currentPage, perPage);
  }, [dateRange, pagination.currentPage, perPage, fetchTrackingData]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const { startDate, endDate } = getDateRange(dateRange);
    fetchTrackingData(startDate, endDate, newPage, perPage);
  };

  // Handle per page change
  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    const { startDate, endDate } = getDateRange(dateRange);
    fetchTrackingData(startDate, endDate, 1, newPerPage); // Reset to page 1
  };

  // Filter data based on search term and status
  const filteredData = data.filter(item => {
    const matchesSearch = item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.event.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || item.event === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate percentages for stats
  const total = stats.total || 1; // Avoid division by zero
  const getPercentage = (value: number) => Math.round((value / total) * 100);

  const statsConfig = [
    { label: "Delivered", value: stats.delivered, color: "bg-green-200", percentage: getPercentage(stats.delivered) },
    { label: "Unique Clickers", value: stats.unique_clickers, color: "bg-blue-200", percentage: getPercentage(stats.unique_clickers) },
    { label: "Soft Bounces", value: stats.soft_bounces, color: "bg-orange-200", percentage: getPercentage(stats.soft_bounces) },
    { label: "Hard Bounces", value: stats.hard_bounces, color: "bg-gray-400", percentage: getPercentage(stats.hard_bounces) },
    { label: "Blocked", value: stats.blocked, color: "bg-pink-300", percentage: getPercentage(stats.blocked) },
  ];

  return (
    <main className="min-h-screen bg-[#fdf6f1] flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-12 flex flex-col items-center" style={{ minHeight: "700px" }}>
        <CardHeader className="w-full items-start">
          <CardTitle className="text-4xl font-extrabold tracking-tight text-left">Tracking</CardTitle>
          <CardDescription className="mt-2 text-lg text-left">Track campaign performance and analytics.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 min-h-0 w-full">
          <div className="flex flex-col gap-6 flex-1">
            {/* Filters */}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="relative">
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="border rounded-md pl-9 pr-3 py-2 text-sm w-32 bg-white cursor-pointer"
                  >
                    <option value="Today">Today</option>
                    <option value="Yesterday">Yesterday</option>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="This Month">This Month</option>
                  </select>
                  <span className="absolute left-2 top-2.5 text-gray-400">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"/></svg>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Select Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm w-48 bg-white cursor-pointer"
                >
                  <option value="all">✓ All</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="opened">Opened</option>
                  <option value="clicked">Unique Clickers</option>
                  <option value="soft_bounced">Soft Bounces</option>
                  <option value="hard_bounced">Hard Bounces</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Stats Progress Bars */}
            <div className="flex flex-wrap gap-6">
              {statsConfig.map((stat) => (
                <div key={stat.label} className="flex-1 min-w-[120px]">
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>{stat.label}</span>
                    <span>{stat.percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded bg-gray-100 overflow-hidden">
                    <div 
                      className={`h-2 rounded ${stat.color}`} 
                      style={{ width: `${stat.percentage}%` }} 
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{stat.value} emails</div>
                </div>
              ))}
            </div>

            {/* Chart Placeholder */}
            <div className="border rounded-xl bg-white h-64 flex flex-col items-center justify-center">
              <div className="flex gap-4 mb-2">
                <span className="flex items-center gap-1 text-xs"><span className="inline-block w-4 h-2 rounded bg-green-200" />Delivered</span>
                <span className="flex items-center gap-1 text-xs"><span className="inline-block w-4 h-2 rounded bg-blue-200" />Clicks</span>
                <span className="flex items-center gap-1 text-xs"><span className="inline-block w-4 h-2 rounded bg-orange-200" />Soft Bounces</span>
                <span className="flex items-center gap-1 text-xs"><span className="inline-block w-4 h-2 rounded bg-gray-400" />Hard Bounces</span>
                <span className="flex items-center gap-1 text-xs"><span className="inline-block w-4 h-2 rounded bg-pink-300" />Blocked</span>
              </div>
              <div className="text-gray-400 text-sm">[Chart Placeholder]</div>
            </div>

            {/* Table and Controls */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <select 
                    className="border rounded px-2 py-1 text-xs"
                    value={perPage}
                    onChange={(e) => handlePerPageChange(Number(e.target.value))}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-xs">entries per page</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">Search:</span>
                  <input 
                    className="border rounded px-2 py-1 text-xs bg-gray-50" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search emails..."
                  />
                </div>
              </div>

              <div className="overflow-x-auto border rounded-xl bg-white">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 font-semibold text-left">Event</th>
                      <th className="p-2 font-semibold text-left">Date</th>
                      <th className="p-2 font-semibold text-left">Subject</th>
                      <th className="p-2 font-semibold text-left">From</th>
                      <th className="p-2 font-semibold text-left">To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Loading tracking data...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-gray-400 p-4">
                          {searchTerm ? 'No results found' : 'No tracking data available'}
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.event === 'delivered' ? 'bg-green-100 text-green-800' :
                              item.event === 'clicked' ? 'bg-blue-100 text-blue-800' :
                              item.event === 'bounced' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.event}
                            </span>
                          </td>
                          <td className="p-2">{new Date(item.date).toLocaleDateString()}</td>
                          <td className="p-2 font-medium">{item.subject}</td>
                          <td className="p-2">{item.from}</td>
                          <td className="p-2">{item.to}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-xs text-gray-500">
                  Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to {Math.min(pagination.currentPage * pagination.perPage, pagination.totalRecords)} of {pagination.totalRecords} entries
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={e => { e.preventDefault(); handlePageChange(pagination.currentPage - 1); }}
                        aria-disabled={pagination.currentPage === 1}
                      />
                    </PaginationItem>
                    {[...Array(pagination.totalPages)].map((_, idx) => (
                      <PaginationItem key={idx}>
                        <PaginationLink
                          href="#"
                          isActive={pagination.currentPage === idx + 1}
                          onClick={e => { e.preventDefault(); handlePageChange(idx + 1); }}
                        >
                          {idx + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={e => { e.preventDefault(); handlePageChange(pagination.currentPage + 1); }}
                        aria-disabled={pagination.currentPage === pagination.totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </main>
  );
} 