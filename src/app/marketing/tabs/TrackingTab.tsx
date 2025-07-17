import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

type TrackingTabProps = {
  columns: string[];
  rows: string[][];
};

export default function TrackingTab({ columns, rows }: TrackingTabProps) {
  return (
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
  );
}
