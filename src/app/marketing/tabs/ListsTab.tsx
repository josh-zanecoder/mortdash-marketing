import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type ListsTabProps = {
  columns: string[];
  rows: string[][];
};

export default function ListsTab({ columns, rows }: ListsTabProps) {
  return (
    <>
      <div className="flex flex-col w-full gap-2 sm:flex-row sm:justify-end sm:items-center mb-4">
        <Button
          className="w-full sm:w-auto px-6 bg-[#ff8a4c] hover:bg-[#ff7a2f] text-white shadow-none border-none"
          style={{ boxShadow: "none" }}
        >
          Add new Marketing List
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col: string) => (
                <TableHead key={col} className="min-w-[100px]">{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row: string[], i: number) => (
              <TableRow key={i}>
                {row.map((cell: string, j: number) => (
                  <TableCell key={j} className="min-w-[100px]">{cell}</TableCell>
                ))}
                <TableCell className="min-w-[100px]">
                  <button aria-label="Delete list" className="text-destructive hover:bg-destructive/10 p-1 rounded">
                    <Trash2 size={18} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
