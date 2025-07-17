'use client'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

const columns = ["List name", "Audience", "Count", "Actions"];
const rows = [
  ["Newsletter", "All Users", "1200"],
  ["VIP Clients", "Premium", "50"],
];

export default function ListsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-7xl mx-auto mt-12 mb-12">
          <div
            className="shadow-sm border rounded-xl bg-white p-8 sm:p-14"
            style={{ minHeight: "700px" }}
          >
            <CardHeader>
              <CardTitle className="text-4xl font-extrabold tracking-tight">Lists</CardTitle>
              <CardDescription className="mt-2 text-lg">Create and manage marketing lists.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 min-h-0">
              <div className="flex justify-end mb-4 w-full">
                <Button
                  className="px-6 bg-[#ff8a4c] hover:bg-[#ff7a2f] text-white shadow-none border-none"
                  style={{ boxShadow: "none" }}
                >
                  Add new Marketing List
                </Button>
              </div>
              <div className="flex-1 min-h-0 flex flex-col w-full">
                <Table className="w-full border border-gray-200 rounded-lg">
                  <TableHeader>
                    <TableRow>
                      {columns.map((col: string) => (
                        <TableHead key={col}>{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader><TableBody>
                    {rows.map((row: string[], i: number) => (
                      <TableRow key={i}>
                        {row.map((cell: string, j: number) => (
                          <TableCell key={j}>{cell}</TableCell>
                        ))}
                        <TableCell>
                          <button aria-label="Delete list" className="text-destructive hover:bg-destructive/10 p-1 rounded">
                            <Trash2 size={18} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </div>
        </div>
      </div>
    </div>
  );
} 