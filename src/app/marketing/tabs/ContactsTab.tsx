import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type ContactsTabProps = {
  columns: string[];
  rows: string[][];
};

export default function ContactsTab({ columns, rows }: ContactsTabProps) {
  return (
    <>
      <div className="flex flex-col w-full gap-2 sm:flex-row sm:justify-end sm:items-center sm:gap-2 flex-wrap mb-4">
        <input
          type="text"
          placeholder="Search keyword"
          className="w-full sm:w-64 rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <Button
          className="w-full sm:w-auto px-4 bg-[#ff8a4c] hover:bg-[#ff7a2f] text-white shadow-none border-none"
          style={{ boxShadow: "none" }}
        >
          Detach Account Executive
        </Button>
        <Button variant="default" className="w-full sm:w-auto px-4">
          Upload Contacts
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
