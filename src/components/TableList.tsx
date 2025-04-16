
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, TableProperties } from "lucide-react";

export interface TableInfo {
  name: string;
  rowCount?: number;
  engine?: string;
}

interface TableListProps {
  tables: TableInfo[];
  isLoading: boolean;
  onTableSelect: (tableName: string) => void;
}

const TableList = ({ tables, isLoading, onTableSelect }: TableListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const filteredTables = tables.filter(table => 
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    onTableSelect(tableName);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TableProperties className="mr-2 text-blue-500" />
          Available Tables
        </CardTitle>
        <CardDescription>
          Select a table to view its schema and continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse flex space-x-4">
              <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
              <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
              <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {filteredTables.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tables found
              </div>
            ) : (
              <ScrollArea className="h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Table Name</TableHead>
                      <TableHead className="w-32">Engine</TableHead>
                      <TableHead className="text-right w-32">Rows</TableHead>
                      <TableHead className="text-right w-24"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTables.map((table) => (
                      <TableRow 
                        key={table.name}
                        className={selectedTable === table.name ? "bg-blue-50" : ""}
                      >
                        <TableCell className="font-medium">{table.name}</TableCell>
                        <TableCell>{table.engine || "-"}</TableCell>
                        <TableCell className="text-right">{table.rowCount?.toLocaleString() || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={selectedTable === table.name ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleTableSelect(table.name)}
                          >
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TableList;
