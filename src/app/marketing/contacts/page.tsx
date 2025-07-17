'use client'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import clsx from "clsx"; // If you don't have clsx, use template strings or install it

const columns = [
  "First name",
  "Last name",
  "Title",
  "Company",
  "Has Account Executive",
  "Account Executive",
];
const rows = [
  ["John", "Doe", "Manager", "Acme Corp", "Yes", "Alice Smith"],
  ["Jane", "Smith", "Developer", "Beta LLC", "No", "-"],
  ["Sam", "Wilson", "Designer", "Gamma Inc", "Yes", "Bob Lee"],
];

export default function ContactsPage() {
  return (
    <main className="min-h-screen bg-[#fdf6f1] flex flex-col items-center pt-16 px-4">
      <div
        className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-12 flex flex-col items-center"
        style={{ minHeight: "700px" }}
      >
        {/* Header: Title/Subtitle left, Search/Buttons right */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          {/* Left: Title and Subtitle */}
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-extrabold text-[#232323] mb-1 text-left">Contacts</h1>
            <p className="text-lg text-[#6d6d6d] text-left">Manage your contacts and account executives.</p>
          </div>
          {/* Right: Search and Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="mb-2 sm:mb-0">
              <div className="flex items-center w-full max-w-xs bg-white border border-[#ffe3d1] rounded-lg shadow-sm px-4 py-2">
                <Search className="text-[#ff6600] mr-2" size={20} />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  className="flex-1 bg-transparent outline-none text-base text-[#232323] placeholder-[#bdbdbd]"
                />
              </div>
            </div>
            <Button className="px-4 bg-[#ff6600] hover:bg-[#ff7a2f] text-white font-bold rounded-lg shadow transition-all">
              Detach Account Executive
            </Button>
            <Button variant="default" className="px-4 font-bold rounded-lg shadow transition-all">
              Upload Contacts
            </Button>
          </div>
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
                    <td
                      key={j}
                      className={`px-6 py-4 ${columns[j] === "Account Executive" && cell === "-" ? "text-[#bdbdbd] italic" : ""}`}
                    >
                      {cell}
                    </td>
                  ))}
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
    </main>
  );
} 