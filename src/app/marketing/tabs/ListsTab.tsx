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
      <div className="flex justify-end mb-4">
        <Button
          className="px-6 bg-[#ff8a4c] hover:bg-[#ff7a2f] text-white shadow-none border-none"
          style={{ boxShadow: "none" }}
        >
          Add new Marketing List
        </Button>
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col: string) => (
                <TableHead key={col}>{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
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
    </>
  );
}
