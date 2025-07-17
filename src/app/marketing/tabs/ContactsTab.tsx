import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type ContactsTabProps = {
  columns: string[];
  rows: string[][];
};

export default function ContactsTab({ columns, rows }: ContactsTabProps) {
  return (
    <>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
