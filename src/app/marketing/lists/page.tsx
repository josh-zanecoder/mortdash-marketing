'use client'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const columns = ["Status", "List name", "Audience", "Count", "Actions"];
const rows = [
  ["New", "Newsletter", "All Users", "1200"],
  ["New", "VIP Clients", "Premium", "50"],
];

export default function ListsPage() {
  return (
    <main className="min-h-screen bg-[#fdf6f1] flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-12 flex flex-col items-center">
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
        {/* Search Bar */}
        <div className="mb-6 flex items-center w-full max-w-md bg-white border border-[#ffe3d1] rounded-lg shadow-sm px-4 py-2">
          <Search className="text-[#ff6600] mr-2" size={20} />
          <input
            type="text"
            placeholder="Search lists..."
            className="flex-1 bg-transparent outline-none text-base text-[#232323] placeholder-[#bdbdbd]"
          />
        </div>
        {/* Table */}
        <Card className="shadow-none border-none rounded-2xl bg-white p-0 w-full">
          <CardContent className="flex flex-col flex-1 min-h-0 px-0 pb-0 w-full">
            <div className="flex-1 min-h-0 flex flex-col w-full overflow-x-auto">
              <Table className="w-full border-0 rounded-2xl overflow-hidden">
                <TableHeader>
                  <TableRow className="bg-[#fff7f0] border-b border-[#ffe3d1]">
                    {columns.map((col: string) => (
                      <TableHead key={col} className="text-base font-bold text-[#232323] py-4 px-4 uppercase tracking-wide">{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row: string[], i: number) => (
                    <TableRow key={i} className="border-b border-[#f3ede7] last:border-0 hover:bg-[#fff3e6]/60 transition">
                      <TableCell className="py-4 px-4">
                        <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-[#fff3e6] text-[#ff6600] border border-[#ff6600]">{row[0]}</span>
                      </TableCell>
                      <TableCell className="py-4 px-4 text-base font-semibold text-[#232323]">{row[1]}</TableCell>
                      <TableCell className="py-4 px-4 text-base text-[#232323]">{row[2]}</TableCell>
                      <TableCell className="py-4 px-4 text-base text-[#232323]">{row[3]}</TableCell>
                      <TableCell className="py-4 px-4">
                        <button aria-label="Delete list" className="text-[#ff6600] hover:bg-[#fff0e6] p-2 rounded-full transition-all">
                          <Trash2 size={20} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
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