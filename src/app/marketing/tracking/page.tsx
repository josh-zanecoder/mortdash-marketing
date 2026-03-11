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

/** Merge two API tracking data objects (for delivered, clicks, etc.) into one */
function mergeTrackingData(acc: any, next: any): any {
  if (!next) return acc;
  if (!acc) return { ...next };
  const merged: any = {};
  const keys = ['delivered', 'clicks', 'softBounces', 'hardBounces', 'blocked', 'opened', 'requests'] as const;
  keys.forEach((k) => {
    merged[k] = { emails: {}, count: 0, percentage: 0 };
    if (acc[k]?.emails && typeof acc[k].emails === 'object') {
      merged[k].emails = { ...acc[k].emails };
    }
    if (k === 'softBounces' && acc.softBounce?.emails && typeof acc.softBounce.emails === 'object') {
      merged[k].emails = { ...merged[k].emails, ...acc.softBounce.emails };
    }
    if (k === 'hardBounces' && acc.hardBounce?.emails && typeof acc.hardBounce.emails === 'object') {
      merged[k].emails = { ...merged[k].emails, ...acc.hardBounce.emails };
    }
    if (next[k]?.emails && typeof next[k].emails === 'object') {
      merged[k].emails = { ...merged[k].emails, ...next[k].emails };
    }
    // Support singular keys from API (softBounce, hardBounce)
    if (k === 'softBounces' && next.softBounce?.emails && typeof next.softBounce.emails === 'object') {
      merged[k].emails = { ...merged[k].emails, ...next.softBounce.emails };
    }
    if (k === 'hardBounces' && next.hardBounce?.emails && typeof next.hardBounce.emails === 'object') {
      merged[k].emails = { ...merged[k].emails, ...next.hardBounce.emails };
    }
  });
  return merged;
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

  const [dateRange, setDateRange] = useState("All Time");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [allPagesData, setAllPagesData] = useState<any>(null);
  const [loadingAllPages, setLoadingAllPages] = useState(false);
  const [selectedCampaignCode, setSelectedCampaignCode] = useState<string>('all');
  const [campaigns, setCampaigns] = useState<
    Array<{ id: number; campaign_code: string; status?: string; template_name?: string }>
  >([]);

  // Calculate date range based on selection
  const getDateRange = (range: string) => {
    const today = new Date();
    const startDate = new Date();

    if (range === "All Time") {
      return {
        startDate: "1970-01-01",
        endDate: today.toISOString().split("T")[0],
      };
    }
    
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

  // Fetch page 1 for chart and stats (store.data)
  useEffect(() => {
    const { startDate, endDate } = getDateRange(dateRange);
    fetchTrackingData(
      startDate,
      endDate,
      1,
      undefined,
      selectedCampaignCode === 'all' ? undefined : selectedCampaignCode
    );
  }, [dateRange, fetchTrackingData, selectedCampaignCode]);

  // Fetch marketing campaigns for the current user (created_by)
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const res = await fetch('/api/marketing/campaigns');
        if (!res.ok) {
          return;
        }
        const json = await res.json();
        const list = (json.data || []) as Array<{
          id: number;
          campaign_code: string;
          status?: string;
          template_name?: string;
        }>;
        setCampaigns(list);
      } catch (e) {
        console.error('Failed to load marketing campaigns', e);
      }
    };

    loadCampaigns();
  }, []);

  // Always fetch all pages for the table so we can paginate and filter correctly (all events + filtered)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoadingAllPages(true);
      setAllPagesData(null);
      const { startDate, endDate } = getDateRange(dateRange);
      let page = 1;
      let merged: any = null;
      try {
        while (true) {
          const params = new URLSearchParams({
            end_date: endDate,
            page: String(page),
            limit: "10",
          });
          if (startDate) {
            params.append('start_date', startDate);
          }
          if (selectedCampaignCode && selectedCampaignCode !== 'all') {
            params.append('campaign_code', selectedCampaignCode);
          }
          const res = await fetch(`/api/tracking/by-range?${params.toString()}`);
          if (!res.ok || cancelled) break;
          const json = await res.json();
          const nextData = json.data || {};
          merged = mergeTrackingData(merged, nextData);
          const totalPages = json.pagination?.total_pages ?? 1;
          if (page >= totalPages) break;
          page += 1;
        }
        if (!cancelled) setAllPagesData(merged);
      } finally {
        if (!cancelled) setLoadingAllPages(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [dateRange, selectedCampaignCode]);

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

  const emailMatchesCampaign = (email: any, campaignCode: string | undefined) => {
    if (!campaignCode || campaignCode === 'all') return true;
    const tag = email?.tag;
    if (!tag) return false;
    if (Array.isArray(tag)) {
      return tag.some((t) => String(t).includes(campaignCode));
    }
    return String(tag).includes(campaignCode);
  };

  // Flatten all emails from all event types for the table (always use merged data when loaded)
  const tableData = allPagesData ?? data;
  const withEvent = (arr: any[], event: string) =>
    (arr || []).map((item: any) => ({ ...item, event: item.event || event }));
  const allEmails = [
    ...withEvent(emailsToArray(tableData?.delivered?.emails), "delivered"),
    ...withEvent(emailsToArray(tableData?.clicks?.emails), "clicks"),
    ...withEvent(emailsToArray(tableData?.softBounces?.emails ?? tableData?.softBounce?.emails), "softBounces"),
    ...withEvent(emailsToArray(tableData?.hardBounces?.emails ?? tableData?.hardBounce?.emails), "hardBounces"),
    ...withEvent(emailsToArray(tableData?.blocked?.emails), "blocked"),
    ...withEvent(emailsToArray(tableData?.opened?.emails), "opened"),
    ...withEvent(emailsToArray(tableData?.requests?.emails), "requests"),
  ];

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
    const matchesCampaignFilter = emailMatchesCampaign(item, selectedCampaignCode);
    
    return matchesSearch && matchesStatus && matchesCampaignFilter;
  });

  // Calculate pagination (always client-side over full filtered list)
  const ITEMS_PER_PAGE = 10;
  const totalFilteredRecords = filteredData.length;
  const totalFilteredPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));

  // Get current page's data (always slice the filtered list)
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const currentPageData = getCurrentPageData();

  // CSV export helpers
  const formatDateForExport = (val: any): string => {
    if (val == null || val === "") return "";
    if (typeof val === "number") {
      return new Date(val * (val < 1e12 ? 1000 : 1))
        .toISOString()
        .slice(0, 16)
        .replace("T", " ");
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day} ${h}:${min}`;
  };

  const exportTableToCsv = () => {
    if (!filteredData.length) return;

    const headers = ["Event", "Date", "Subject", "From", "To", "Message ID", "IP"];

    const escape = (value: any) => {
      const str = value == null ? "" : String(value);
      if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = filteredData.map((item: any) => {
      const event = item.event || "";
      const displayEvent =
        event === "requests"
          ? "Sent"
          : event === "clicks"
          ? "Clicks"
          : event === "softBounces"
          ? "Soft Bounces"
          : event === "hardBounces"
          ? "Hard Bounces"
          : event
          ? event.charAt(0).toUpperCase() +
            event
              .slice(1)
              .replace(/([A-Z])/g, " $1")
              .trim()
          : "";

      const dateStr = formatDateForExport(item.date_time || item.date);
      const dateForExcel = dateStr ? `="${dateStr}"` : "";

      return [
        displayEvent,
        dateForExcel,
        item.subject ?? "",
        item.from ?? "",
        item.email ?? item.to ?? "",
        item.messageId ?? "",
        item.ip ?? "",
      ];
    });

    const csv =
      [headers, ...rows]
        .map((row) => row.map(escape).join(","))
        .join("\n");

    // Prepend BOM so Excel on Windows opens UTF-8 correctly
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `email-tracking-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Calculate percentages for stats
  const total = stats.total || 1; // Avoid division by zero
  const getPercentage = (value: number) => Math.round((value / total) * 100);

  const statsConfig = [
    { label: "Delivered", value: stats.delivered, color: "bg-green-200", percentage: getPercentage(stats.delivered) },
    { label: "Opened", value: stats.opened ?? 0, color: "bg-cyan-200", percentage: getPercentage(stats.opened ?? 0) },
    { label: "Unique Clickers", value: stats.unique_clickers, color: "bg-blue-200", percentage: getPercentage(stats.unique_clickers) },
    { label: "Soft Bounces", value: stats.soft_bounces, color: "bg-orange-200", percentage: getPercentage(stats.soft_bounces) },
    { label: "Hard Bounces", value: stats.hard_bounces, color: "bg-gray-400", percentage: getPercentage(stats.hard_bounces) },
    { label: "Blocked", value: stats.blocked, color: "bg-pink-300", percentage: getPercentage(stats.blocked) },
  ];

  // Prepare chart data
  const prepareChartData = (data: any) => {
    if (!data) return null;

    const { startDate, endDate } = getDateRange(dateRange);
    let dates: string[] = [];

    if (dateRange === "All Time") {
      const collectDates = (emails: any) => {
        emailsToArray(emails).forEach((email: any) => {
          if (!emailMatchesCampaign(email, selectedCampaignCode)) return;
          const d = email.parse_date || email.date?.split("T")[0] || email.date;
          if (d) {
            dates.push(d);
          }
        });
      };

      collectDates(data.requests?.emails);
      collectDates(data.delivered?.emails);
      collectDates(data.opened?.emails);
      collectDates(data.clicks?.emails);
      collectDates(data.softBounces?.emails ?? data.softBounce?.emails);
      collectDates(data.hardBounces?.emails ?? data.hardBounce?.emails);
      collectDates(data.blocked?.emails);

      if (dates.length === 0) {
        return null;
      }

      const uniqueSorted = Array.from(new Set(dates)).sort();
      dates = uniqueSorted;
    } else {
      // Bounded ranges (Today, Last 7 Days, etc.) – generate all dates in the range
      const start = new Date(startDate);
      const end = new Date(endDate);

      const currentDate = new Date(start);
      while (currentDate <= end) {
        dates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Initialize counts for each date
    const eventCounts: { [key: string]: { [key: string]: number } } = {};
    dates.forEach((date) => {
      eventCounts[date] = {
        requests: 0,
        delivered: 0,
        opened: 0,
        clicks: 0,
        softBounces: 0,
        hardBounces: 0,
        blocked: 0,
      };
    });

    // Helper to process emails for a given event type
    function processEmails(eventKey: string, emails: any, eventName: string) {
      emailsToArray(emails).forEach((email: any) => {
        if (!emailMatchesCampaign(email, selectedCampaignCode)) return;
        const emailDate = email.parse_date || email.date?.split("T")[0] || email.date;
        if (emailDate && eventCounts[emailDate]) {
          eventCounts[emailDate][eventName] =
            (eventCounts[emailDate][eventName] || 0) + 1;
        }
      });
    }

    processEmails("requests", data.requests?.emails, "requests");
    processEmails("delivered", data.delivered?.emails, "delivered");
    processEmails("opened", data.opened?.emails, "opened");
    processEmails("clicks", data.clicks?.emails, "clicks");
    processEmails(
      "softBounces",
      data.softBounces?.emails ?? data.softBounce?.emails,
      "softBounces"
    );
    processEmails(
      "hardBounces",
      data.hardBounces?.emails ?? data.hardBounce?.emails,
      "hardBounces"
    );
    processEmails("blocked", data.blocked?.emails, "blocked");

    const datasets: any[] = [];

    const addSeries = (key: string, label: string, color: string) => {
      // Respect the selectedStatus filter: show all series when 'all',
      if (selectedStatus !== "all" && selectedStatus !== key) return;
      datasets.push({
        label,
        data: dates.map((date) => eventCounts[date][key] ?? 0),
        borderColor: color,
        backgroundColor: color,
        fill: true,
        tension: 0.4,
        borderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#fff",
        pointHoverBackgroundColor: color,
        pointBorderColor: color,
        pointBorderWidth: 2,
        pointHoverBorderWidth: 2,
        stack: "stack1",
      });
    };

    addSeries("requests", "Sent", "#ff8ba7");
    addSeries("delivered", "Delivered", "#33a1fd");
    addSeries("opened", "Opened", "#4cc9f0");
    addSeries("clicks", "Clicks", "#ffd60a");
    addSeries("softBounces", "Soft Bounces", "#fb8500");
    addSeries("hardBounces", "Hard Bounces", "#219ebc");
    addSeries("blocked", "Blocked", "#8338ec");

    return {
      labels: dates,
      datasets,
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
  const chartData = prepareChartData(data);

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
              onChange={(e) => {
                setDateRange(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-sm focus:outline-none cursor-pointer min-w-[140px]"
            >
              <option value="All Time">All Time</option>
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
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-sm focus:outline-none cursor-pointer min-w-[100px]"
            >
              <option value="all">All Status</option>
              <option value="requests">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="opened">Opened</option>
              <option value="clicks">Clicks</option>
              <option value="softBounces">Soft Bounces</option>
              <option value="hardBounces">Hard Bounces</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-100 shadow-sm px-3 py-2">
            <Filter className="w-4 h-4 text-emerald-500" />
            <select
              value={selectedCampaignCode}
              onChange={(e) => {
                setSelectedCampaignCode(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-sm focus:outline-none cursor-pointer min-w-0 w-fit max-w-[200px]"
            >
              <option value="all">All Campaigns</option>
              {campaigns
                .filter((c) => c.campaign_code)
                .sort((a, b) => {
                  const nameA = (a.template_name || a.campaign_code).toLowerCase();
                  const nameB = (b.template_name || b.campaign_code).toLowerCase();
                  return nameA.localeCompare(nameB);
                })
                .map((campaign) => {
                  const fullName = campaign.template_name || campaign.campaign_code;
                  const displayName =
                    fullName.length > 32 ? `${fullName.slice(0, 29)}...` : fullName;
                  return (
                    <option
                      key={campaign.id}
                      value={campaign.campaign_code}
                      title={fullName}
                    >
                      {displayName}
                    </option>
                  );
                })}
            </select>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-6 gap-2">
          {statsConfig.map((stat) => (
            <div 
              key={stat.label} 
              className="bg-white rounded-lg border border-gray-100 px-3 py-3 shadow-sm"
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500">{stat.label}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-semibold">{stat.value}</span>
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

        {/* View mode toggle */}
        <div className="flex items-center justify-between mt-4">
          <div className="inline-flex rounded-full bg-white border border-gray-200 p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("chart")}
              className={`px-4 py-1.5 text-xs font-medium rounded-full cursor-pointer ${
                viewMode === "chart"
                  ? "bg-slate-900 text-white shadow"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Graph
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-4 py-1.5 text-xs font-medium rounded-full cursor-pointer ${
                viewMode === "table"
                  ? "bg-slate-900 text-white shadow"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Table
            </button>
          </div>
        </div>

        {viewMode === "chart" && (
          <Card className="bg-white border-0 shadow-sm mt-4">
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
        )}

        {viewMode === "table" && (
        <>
        <Card className="bg-white border-0 shadow-sm overflow-hidden mt-4">
          <CardHeader className="border-b bg-white">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg font-semibold">Campaign Details</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
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
                <button
                  type="button"
                  onClick={exportTableToCsv}
                  className="inline-flex items-center px-3 py-2 text-xs font-medium rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow-sm cursor-pointer"
                >
                  Export CSV
                </button>
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
                  {loading || loadingAllPages ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2 text-gray-500">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{loadingAllPages ? "Loading all events..." : "Loading tracking data..."}</span>
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
                            item.event === 'clicks' ? 'bg-blue-50 text-blue-700' :
                            item.event === 'softBounces' ? 'bg-orange-50 text-orange-700' :
                            item.event === 'hardBounces' ? 'bg-gray-50 text-gray-700' :
                            item.event === 'blocked' ? 'bg-pink-50 text-pink-700' :
                            item.event === 'opened' ? 'bg-cyan-50 text-cyan-700' :
                            item.event === 'requests' ? 'bg-rose-50 text-rose-700' :
                            'bg-gray-50 text-gray-700'
                          }`}>
                            {item.event ? (item.event === 'clicks' ? 'Clicks' : item.event === 'requests' ? 'Sent' : item.event === 'softBounces' ? 'Soft Bounces' : item.event === 'hardBounces' ? 'Hard Bounces' : item.event.charAt(0).toUpperCase() + item.event.slice(1).replace(/([A-Z])/g, ' $1').trim()) : ''}
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

        <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500 shrink-0">
            Showing {totalFilteredRecords > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, totalFilteredRecords)} of {totalFilteredRecords} entries
          </p>
          <Pagination>
            <PaginationContent className="flex flex-wrap justify-center gap-1 sm:gap-2">
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
              {(() => {
                // Windowed pagination: show first, last, current ± 2, and ellipsis for gaps
                const delta = 2;
                const pages: (number | 'ellipsis')[] = [];
                let last = 0;
                for (let p = 1; p <= totalFilteredPages; p++) {
                  if (
                    p === 1 ||
                    p === totalFilteredPages ||
                    (p >= currentPage - delta && p <= currentPage + delta)
                  ) {
                    if (p > last + 1) pages.push('ellipsis');
                    pages.push(p);
                    last = p;
                  }
                }
                return pages.map((item, i) =>
                  item === 'ellipsis' ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(item);
                        }}
                        isActive={currentPage === item}
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  )
                );
              })()}
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
        </>
        )}
      </div>
    </div>
  );
} 