
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table as TableIcon, Play, Eye } from "lucide-react";
import { ColumnInfo } from "./ColumnSelector";

interface DataPreviewProps {
  columns: ColumnInfo[];
  data: Record<string, any>[];
  onStartIngestion: () => void;
  isLoading?: boolean;
}

const DataPreview = ({ 
  columns, 
  data, 
  onStartIngestion,
  isLoading = false 
}: DataPreviewProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Eye className="mr-2 text-blue-500" />
          Data Preview
        </CardTitle>
        <CardDescription>
          Preview first {Math.min(data.length, 100)} rows of data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No data to preview
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="rounded border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14 text-center">#</TableHead>
                    {columns.map(column => (
                      <TableHead key={column.name}>
                        {column.name}
                        <div className="text-xs font-normal text-gray-500">{column.type}</div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center text-gray-500">{index + 1}</TableCell>
                      {columns.map(column => (
                        <TableCell key={column.name}>
                          {row[column.name] !== undefined ? String(row[column.name]) : "null"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onStartIngestion}
          className="w-full"
          disabled={isLoading}
        >
          <Play size={18} className="mr-2" />
          {isLoading ? "Processing..." : "Start Data Ingestion"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DataPreview;
