'use client'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

const columns = ["Status", "List name", "Audience", "Count", "Actions"];
const rows = [
  ["New", "Newsletter", "All Users", "1200"],
  ["New", "VIP Clients", "Premium", "50"],
];

export default function ListsPage() {
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
          <Button className="flex items-center gap-2 px-6 py-2 bg-[#ff6600] hover:bg-[#ff7a2f] text-white font-bold rounded-lg shadow transition-all text-lg">
            <Plus size={22} /> Add Marketing List
          </Button>
        </div>
        {/* Table */}
        <div className="w-full flex flex-col items-center justify-center overflow-x-auto">
          <table className="min-w-full rounded-xl overflow-hidden shadow border border-[#ffe3d1]">
            <thead>
              <tr className="bg-[#fff3e6]">
                {columns.map((col: string) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-bold text-[#ff6600] uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: string[], i: number) => (
                <tr
                  key={i}
                  className={`transition-colors ${i % 2 === 0 ? "bg-white" : "bg-[#fff8f3]"} hover:bg-[#fff0e6]`}
                >
                  {row.map((cell: string, j: number) => (
                    <td key={j} className="px-6 py-4">
                      {cell}
                    </td>
                  ))}
                  {/* Actions column */}
                  <td className="px-6 py-4">
                    <button aria-label="Delete list" className="text-[#ff6600] hover:bg-[#fff0e6] p-2 rounded-full transition-all">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination at the bottom of the card */}
        <div className="flex justify-end w-full mt-auto pt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
      {/* Floating action button for mobile */}
      <button
        className="fixed bottom-8 right-8 z-50 sm:hidden bg-[#ff6600] hover:bg-[#ff7a2f] text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all"
        aria-label="Add new Marketing List"
      >
        <Plus size={28} />
      </button>
    </main>
  );
} 