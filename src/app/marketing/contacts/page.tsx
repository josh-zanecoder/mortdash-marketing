'use client'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <div className="flex-1 flex flex-col">
        <div className="w-full max-w-7xl mx-auto mt-12 mb-12">
          <div
            className="shadow-sm border rounded-xl bg-white p-8 sm:p-14"
            style={{ minHeight: "700px" }}
          >
            <CardHeader>
              <CardTitle className="text-4xl font-extrabold tracking-tight">Contacts</CardTitle>
              <CardDescription className="mt-2 text-lg">Manage your contacts and account executives.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 min-h-0">
              <div className="flex flex-row items-center justify-end gap-2 mb-4 w-full">
                <input
                  type="text"
                  placeholder="Search keyword"
                  className="w-64 rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <Button
                  className="px-4 bg-[#ff8a4c] hover:bg-[#ff7a2f] text-white shadow-none border-none"
                  style={{ boxShadow: "none" }}
                >
                  Detach Account Executive
                </Button>
                <Button variant="default" className="px-4">
                  Upload Contacts
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
                        {row.map((cell: string, j: number) => {
                          // If this is the "Account Executive" column (last column)
                          if (j === 5 && cell !== "-") {
                            return (
                              <TableCell key={j}>
                                <Badge>{cell}</Badge>
                              </TableCell>
                            );
                          }
                          // If no account executive, just show "-"
                          if (j === 5 && cell === "-") {
                            return <TableCell key={j}>-</TableCell>;
                          }
                          // All other cells
                          return <TableCell key={j}>{cell}</TableCell>;
                        })}
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