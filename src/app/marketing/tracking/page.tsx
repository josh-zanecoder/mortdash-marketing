'use client'

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useTrackingStore } from "@/store/useTrackingStore";
import { Loader2, Calendar, Search, Filter } from "lucide-react";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { getDateRange } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function emailsToArray(emails: any) {
  if (Array.isArray(emails)) return emails;
  if (emails && typeof emails === 'object') return Object.values(emails);
  return [];
}

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Calculate date range based on selection using user's timezone
  const getDateRange = (range: string) => {
    const now = new Date();
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Get current date in user's timezone
    const today = new Date(now.toLocaleString("en-US", { timeZone: userTimezone }));
    const startDate = new Date(now.toLocaleString("en-US", { timeZone: userTimezone }));
    
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
    
    // Convert back to ISO date strings in user's timezone
    const formatDateInTimezone = (date: Date) => {
      return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
        .toISOString()
        .split('T')[0];
    };
    
    return {
      startDate: formatDateInTimezone(startDate),
      endDate: formatDateInTimezone(today)
    };
  };

  // Fetch data when component mounts or when date range changes
  useEffect(() => {
    const { startDate, endDate } = getDateRange(dateRange);
    fetchTrackingData(startDate, endDate, pagination.currentPage);
  }, [dateRange, pagination.currentPage, fetchTrackingData]);

  // Transform the nested data structure into a flat array for display
  const transformData = (data: any) => {
    if (!data) return [];
    
    const flattenedData: any[] = [];
    
    // Process each category (delivered, bounced, etc.)
    Object.entries(data).forEach(([category, categoryData]: [string, any]) => {
      if (categoryData.emails) {
        // Convert emails object to array and add category info
        Object.values(categoryData.emails).forEach((email: any) => {
          flattenedData.push({
            ...email,
            category,
            count: categoryData.count,
            percentage: categoryData.percentage
          });
        });
      }
    });
    
    return flattenedData;
  };

  // Flatten all emails from all event types for the table
  // Also merge in marketingEmails if present (some responses provide a flat list)
  const mergedByMessageId = new Map<string, any>();

  const pushUnique = (arr: any[], eventName: string) => {
    arr.forEach((email: any) => {
      const id = email.messageId || `${email.email}-${email.date}-${eventName}`;
      const normalized = { ...email, event: eventName };
      if (!mergedByMessageId.has(id)) mergedByMessageId.set(id, normalized);
    });
  };

  pushUnique(emailsToArray(data.delivered?.emails), 'delivered');
  pushUnique(emailsToArray(data.clicks?.emails), 'clicked');
  pushUnique(emailsToArray(data.softBounce?.emails), 'soft_bounced');
  pushUnique(emailsToArray(data.hardBounce?.emails), 'hard_bounced');
  pushUnique(emailsToArray(data.blocked?.emails), 'blocked');
  pushUnique(emailsToArray(data.opened?.emails), 'opened');
  pushUnique(emailsToArray(data.requests?.emails), 'sent');

  // marketingEmails can include mixed event types; respect their provided event
  emailsToArray(data.marketingEmails).forEach((email: any) => {
    const id = email.messageId || `${email.email}-${email.date}-${email.event || 'unknown'}`;
    const normalized = { ...email, event: (email.event === 'requests' ? 'sent' : (email.event || 'unknown')) };
    if (!mergedByMessageId.has(id)) mergedByMessageId.set(id, normalized);
  });

  const allEmails = Array.from(mergedByMessageId.values());

  // Transform and filter data
  const filteredData = allEmails.filter(item => {
    if (!item) return false;
    
    const matchesSearch = 
      (item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (item.from?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (item.to?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (item.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (item.event?.toLowerCase().includes(searchTerm.toLowerCase()) || '');
    
    const matchesStatus = selectedStatus === 'all' || item.event === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const ITEMS_PER_PAGE = 10;
  const totalFilteredRecords = filteredData.length;
  const totalFilteredPages = Math.ceil(totalFilteredRecords / ITEMS_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  // Get current page's data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Generate condensed pagination items
  const generatePaginationItems = () => {
    const items = [];
    const totalPages = totalFilteredPages;
    const current = currentPage;
    
    if (totalPages <= 3) {
      // Show all pages if 3 or fewer
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Always show first page
      items.push(1);
      
      if (current <= 3) {
        // Show first 3 pages, then ellipsis, then last page
        for (let i = 2; i <= 3; i++) {
          items.push(i);
        }
        items.push('ellipsis');
        items.push(totalPages);
      } else if (current >= totalPages - 2) {
        // Show first page, ellipsis, then last 3 pages
        items.push('ellipsis');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          items.push(i);
        }
      } else {
        // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
        items.push('ellipsis');
        items.push(current - 1);
        items.push(current);
        items.push(current + 1);
        items.push('ellipsis');
        items.push(totalPages);
      }
    }
    
    return items;
  };

  const currentPageData = getCurrentPageData();

  // Derive card values from the CURRENT FILTERED emails so cards react to filters/search
  const countByEvent = (arr: any[], evt: string) => arr.filter(i => i?.event === evt).length;
  const deliveredCount = countByEvent(filteredData, 'delivered');
  const clicksCount = countByEvent(filteredData, 'clicked');
  const softBounceCount = countByEvent(filteredData, 'soft_bounced');
  const hardBounceCount = countByEvent(filteredData, 'hard_bounced');
  const blockedCount = countByEvent(filteredData, 'blocked');
  const totalCount = filteredData.length;

  // Calculate percentages for stats using derived totals from emails
  const totalBase = totalCount || 1; // Avoid division by zero
  const getPercentage = (value: number) => Math.round((value / totalBase) * 100);

  const statsConfig = [
    { label: "Delivered", value: deliveredCount, color: "bg-green-200", percentage: getPercentage(deliveredCount) },
    { label: "Unique Clickers", value: clicksCount, color: "bg-blue-200", percentage: getPercentage(clicksCount) },
    { label: "Soft Bounces", value: softBounceCount, color: "bg-orange-200", percentage: getPercentage(softBounceCount) },
    { label: "Hard Bounces", value: hardBounceCount, color: "bg-gray-400", percentage: getPercentage(hardBounceCount) },
    { label: "Blocked", value: blockedCount, color: "bg-pink-300", percentage: getPercentage(blockedCount) },
  ];

  // Prepare chart data
  const prepareChartData = (data: any, statusFilter: string = 'all') => {
    if (!data) return null;

    const { startDate, endDate } = getDateRange(dateRange);
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Generate all dates in the range
    const dates = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Initialize counts for each date
    const eventCounts: { [key: string]: { [key: string]: number } } = {};
    dates.forEach(date => {
      eventCounts[date] = {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        soft_bounced: 0,
        hard_bounced: 0,
        blocked: 0
      };
    });

    // Helper to process emails for a given event type
    function processEmails(eventKey: string, emails: any, eventName: string) {
      emailsToArray(emails).forEach((email: any) => {
        const emailDate = email.parse_date || email.date?.split('T')[0] || email.date;
        if (emailDate && eventCounts[emailDate]) {
          eventCounts[emailDate][eventName] = (eventCounts[emailDate][eventName] || 0) + 1;
        }
      });
    }

    processEmails('requests', data.requests?.emails, 'sent');
    processEmails('delivered', data.delivered?.emails, 'delivered');
    processEmails('opened', data.opened?.emails, 'opened');
    processEmails('clicks', data.clicks?.emails, 'clicked');
    processEmails('softBounce', data.softBounce?.emails, 'soft_bounced');
    processEmails('hardBounce', data.hardBounce?.emails, 'hard_bounced');
    processEmails('blocked', data.blocked?.emails, 'blocked');

    // Define all possible datasets
    const allDatasets = [
      {
        label: 'Sent',
        eventType: 'sent',
        data: dates.map(date => eventCounts[date].sent),
        borderColor: '#ff8ba7',
        backgroundColor: '#ff8ba7',
        fill: true,
        tension: 0.4,
        borderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        pointHoverBackgroundColor: '#ff8ba7',
        pointBorderColor: '#ff8ba7',
        pointBorderWidth: 2,
        pointHoverBorderWidth: 2,
        stack: 'stack1'
      },
      {
        label: 'Delivered',
        eventType: 'delivered',
        data: dates.map(date => eventCounts[date].delivered),
        borderColor: '#33a1fd',
        backgroundColor: '#33a1fd',
        fill: true,
        tension: 0.4,
        borderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        pointHoverBackgroundColor: '#33a1fd',
        pointBorderColor: '#33a1fd',
        pointBorderWidth: 2,
        pointHoverBorderWidth: 2,
        stack: 'stack1'
      },
      {
        label: 'Opened',
        eventType: 'opened',
        data: dates.map(date => eventCounts[date].opened),
        borderColor: '#4cc9f0',
        backgroundColor: '#4cc9f0',
        fill: true,
        tension: 0.4,
        borderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        pointHoverBackgroundColor: '#4cc9f0',
        pointBorderColor: '#4cc9f0',
        pointBorderWidth: 2,
        pointHoverBorderWidth: 2,
        stack: 'stack1'
      },
      {
        label: 'Clicks',
        eventType: 'clicked',
        data: dates.map(date => eventCounts[date].clicked),
        borderColor: '#ffd60a',
        backgroundColor: '#ffd60a',
        fill: true,
        tension: 0.4,
        borderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        pointHoverBackgroundColor: '#ffd60a',
        pointBorderColor: '#ffd60a',
        pointBorderWidth: 2,
        pointHoverBorderWidth: 2,
        stack: 'stack1'
      },
      {
        label: 'Soft Bounces',
        eventType: 'soft_bounced',
        data: dates.map(date => eventCounts[date].soft_bounced),
        borderColor: '#fb8500',
        backgroundColor: '#fb8500',
        fill: true,
        tension: 0.4,
        borderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        pointHoverBackgroundColor: '#fb8500',
        pointBorderColor: '#fb8500',
        pointBorderWidth: 2,
        pointHoverBorderWidth: 2,
        stack: 'stack1'
      },
      {
        label: 'Hard Bounces',
        eventType: 'hard_bounced',
        data: dates.map(date => eventCounts[date].hard_bounced),
        borderColor: '#219ebc',
        backgroundColor: '#219ebc',
        fill: true,
        tension: 0.4,
        borderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        pointHoverBackgroundColor: '#219ebc',
        pointBorderColor: '#219ebc',
        pointBorderWidth: 2,
        pointHoverBorderWidth: 2,
        stack: 'stack1'
      },
      {
        label: 'Blocked',
        eventType: 'blocked',
        data: dates.map(date => eventCounts[date].blocked),
        borderColor: '#8338ec',
        backgroundColor: '#8338ec',
        fill: true,
        tension: 0.4,
        borderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        pointHoverBackgroundColor: '#8338ec',
        pointBorderColor: '#8338ec',
        pointBorderWidth: 2,
        pointHoverBorderWidth: 2,
        stack: 'stack1'
      },
    ];

    // Filter datasets based on selected status
    const filteredDatasets = statusFilter === 'all' 
      ? allDatasets 
      : allDatasets.filter(dataset => dataset.eventType === statusFilter);

    return {
      labels: dates,
      datasets: filteredDatasets,
    };
  };

  // Update the chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'start' as const,
        labels: {
          padding: 25,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
          font: {
            size: 12,
            weight: 500,
            family: 'Inter, system-ui, sans-serif',
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#0f172a',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 14,
        boxPadding: 8,
        usePointStyle: true,
        titleFont: {
          size: 14,
          weight: 600,
          family: 'Inter, system-ui, sans-serif',
        },
        bodyFont: {
          size: 13,
          family: 'Inter, system-ui, sans-serif',
        },
        bodySpacing: 8,
        callbacks: {
          title: (context: any) => {
            const date = new Date(context[0].label);
            return date.toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          },
          label: (context: any) => {
            return `  ${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.4)',
          drawBorder: false,
          tickLength: 0,
        },
        stacked: true,
        ticks: {
          padding: 12,
          color: '#64748b',
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif',
          },
          callback: (value: any) => {
            return value.toLocaleString();
          }
        }
      },
      x: {
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
        stacked: true,
        ticks: {
          maxRotation: 0,
          padding: 12,
          color: '#64748b',
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif',
          },
          callback: function(this: any, value: any): string {
            const date = new Date(this.getLabelForValue(value));
            return date.toLocaleDateString('en-US', { 
              month: 'short',
              day: 'numeric'
            });
          }
        }
      },
    },
  };

  // Replace the chart placeholder with actual chart
  const chartData = prepareChartData(data, selectedStatus);

  return (
    <div className="min-h-screen bg-[#fdf6f1]">
      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Tracking</h1>
          <p className="text-gray-500">Track campaign performance and analytics.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-100 shadow-sm px-3 py-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-sm focus:outline-none cursor-pointer min-w-[120px]"
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Month">This Month</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-100 shadow-sm px-3 py-2">
            <Filter className="w-4 h-4 text-purple-500" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-sm focus:outline-none cursor-pointer min-w-[100px]"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="opened">Opened</option>
              <option value="clicked">Clicked</option>
              <option value="soft_bounced">Soft Bounces</option>
              <option value="hard_bounced">Hard Bounces</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        {/* Update the stats cards section */}
        <div className="grid grid-cols-5 gap-3">
          {statsConfig.map((stat) => (
            <div 
              key={stat.label} 
              className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-500">{stat.label}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-semibold">{stat.value}</span>
                  <span className="text-xs text-gray-500">emails</span>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${stat.color}`} 
                      style={{ width: `${stat.percentage}%` }} 
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600">{stat.percentage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base font-medium">Email Campaign Performance</CardTitle>
            <CardDescription className="text-sm text-gray-500">Tracking metrics over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              {chartData ? (
                <Line 
                  options={chartOptions} 
                  data={chartData}
                  className="[canvas-important]:!rounded-lg"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-sm text-gray-500 flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    <span>Loading chart data...</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Campaign Details</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search campaigns..."
                    className="pl-9 pr-4 py-2 text-sm border rounded-lg w-[250px] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Message ID</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2 text-gray-500">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Loading tracking data...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        {searchTerm ? 'No results found' : 'No tracking data available'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentPageData.map((item, index) => (
                      <TableRow key={`${item.messageId}-${index}`}>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.event === 'delivered' ? 'bg-green-50 text-green-700' :
                            item.event === 'clicked' ? 'bg-blue-50 text-blue-700' :
                            item.event === 'opened' ? 'bg-purple-50 text-purple-700' :
                            item.event === 'sent' ? 'bg-gray-50 text-gray-700' :
                            item.event === 'soft_bounced' ? 'bg-orange-50 text-orange-700' :
                            item.event === 'hard_bounced' ? 'bg-red-50 text-red-700' :
                            item.event === 'blocked' ? 'bg-pink-50 text-pink-700' :
                            'bg-gray-50 text-gray-700'
                          }`}>
                            {item.event === 'soft_bounced' ? 'Soft Bounced' :
                             item.event === 'hard_bounced' ? 'Hard Bounced' :
                             item.event ? item.event.charAt(0).toUpperCase() + item.event.slice(1).toLowerCase() : ''}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {item.date_time || new Date(item.date).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm font-medium">{item.subject}</TableCell>
                        <TableCell className="text-sm text-gray-600">{item.from}</TableCell>
                        <TableCell className="text-sm text-gray-600">{item.email}</TableCell>
                        <TableCell className="text-xs text-gray-500 font-mono">{item.messageId}</TableCell>
                        <TableCell className="text-xs text-gray-500">{item.ip}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 py-4">
          <p className="text-sm text-gray-500">
            Showing {filteredData.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, totalFilteredRecords)} of {totalFilteredRecords} entries
          </p>
          <div className="flex justify-center">
            <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      handlePageChange(currentPage - 1);
                    }
                  }}
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {generatePaginationItems().map((item, idx) => (
                <PaginationItem key={idx}>
                  {item === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(item as number);
                      }}
                      isActive={currentPage === item}
                    >
                      {item}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalFilteredPages) {
                      handlePageChange(currentPage + 1);
                    }
                  }}
                  aria-disabled={currentPage === totalFilteredPages}
                  className={currentPage === totalFilteredPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
} 