'use client'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

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
    <main className="min-h-screen bg-[#fdf6f1] flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-12 flex flex-col items-center">
        {/* Title, Subtitle, and Actions */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#232323] mb-1 text-left">Contacts</h1>
            <p className="text-lg text-[#6d6d6d] text-left">Manage your contacts and account executives.</p>
          </div>
          <div className="flex gap-2">
            <Button className="px-4 bg-[#ff6600] hover:bg-[#ff7a2f] text-white font-bold rounded-lg shadow transition-all">
              Detach Account Executive
            </Button>
            <Button variant="default" className="px-4 font-bold rounded-lg shadow transition-all">
              Upload Contacts
            </Button>
          </div>
        </div>
        {/* Search Bar */}
        <div className="mb-6 flex items-center w-full max-w-md bg-white border border-[#ffe3d1] rounded-lg shadow-sm px-4 py-2">
          <Search className="text-[#ff6600] mr-2" size={20} />
          <input
            type="text"
            placeholder="Search contacts..."
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
                      {row.map((cell: string, j: number) => {
                        // If this is the "Account Executive" column (last column)
                        if (j === 5 && cell !== "-") {
                          return (
                            <TableCell key={j} className="py-4 px-4"><Badge>{cell}</Badge></TableCell>
                          );
                        }
                        // If no account executive, just show "-"
                        if (j === 5 && cell === "-") {
                          return <TableCell key={j} className="py-4 px-4">-</TableCell>;
                        }
                        // All other cells
                        return <TableCell key={j} className="py-4 px-4 text-base text-[#232323]">{cell}</TableCell>;
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 