'use client'
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export default function TrackingPage() {
  // Placeholder data
  const stats = [
    { label: "Delivered", value: 0, color: "bg-green-200" },
    { label: "Unique Clickers", value: 0, color: "bg-blue-200" },
    { label: "Soft Bounces", value: 0, color: "bg-orange-200" },
    { label: "Hard Bounces", value: 0, color: "bg-gray-400" },
    { label: "Blocked", value: 0, color: "bg-pink-300" },
  ];
  const [date, setDate] = useState("Today");
  const [page, setPage] = useState(1);
  const pageCount = 1; // Static for now
  return (
    <main className="min-h-screen bg-[#fdf6f1] flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-12 flex flex-col items-center" style={{ minHeight: "700px" }}>
        <CardHeader className="w-full items-start">
          <CardTitle className="text-4xl font-extrabold tracking-tight text-left">Tracking</CardTitle>
          <CardDescription className="mt-2 text-lg text-left">Track campaign performance and analytics.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 min-h-0 w-full">
          {/* Main content remains unchanged */}
          <div className="flex flex-col gap-6 flex-1">
            {/* Date Picker */}
            <div className="flex items-center gap-2 mt-2">
              <label className="text-sm font-medium">Date</label>
              <div className="relative">
                <input
                  type="text"
                  value={date}
                  readOnly
                  className="border rounded-md pl-9 pr-3 py-2 text-sm w-32 bg-white cursor-pointer"
                />
                <span className="absolute left-2 top-2.5 text-gray-400">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"/></svg>
                </span>
              </div>
            </div>
            {/* Stats Progress Bars */}
            <div className="flex flex-wrap gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="flex-1 min-w-[120px]">
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>{stat.label}</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full h-2 rounded bg-gray-100 overflow-hidden">
                    <div className={`h-2 rounded ${stat.color}`} style={{ width: `0%` }} />
                  </div>
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
                  <select className="border rounded px-2 py-1 text-xs">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                  <span className="text-xs">entries per page</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">Search:</span>
                  <input className="border rounded px-2 py-1 text-xs bg-gray-50" />
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
                    <tr>
                      <td colSpan={5} className="text-center text-gray-400 p-4">No data available in table</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={e => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }}
                        aria-disabled={page === 1}
                      />
                    </PaginationItem>
                    {[...Array(pageCount)].map((_, idx) => (
                      <PaginationItem key={idx}>
                        <PaginationLink
                          href="#"
                          isActive={page === idx + 1}
                          onClick={e => { e.preventDefault(); setPage(idx + 1); }}
                        >
                          {idx + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={e => { e.preventDefault(); setPage(p => Math.min(pageCount, p + 1)); }}
                        aria-disabled={page === pageCount}
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