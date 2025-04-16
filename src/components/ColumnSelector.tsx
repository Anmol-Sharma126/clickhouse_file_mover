
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Columns, MoveRight } from "lucide-react";

export interface ColumnInfo {
  name: string;
  type: string;
  sourceName?: string;
}

interface ColumnSelectorProps {
  columns: ColumnInfo[];
  isLoading: boolean;
  onColumnsSelect: (columns: ColumnInfo[]) => void;
  title?: string;
}

const ColumnSelector = ({ 
  columns, 
  isLoading, 
  onColumnsSelect,
  title = "Select Columns" 
}: ColumnSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    // Initially select all columns
    const initialSelection = columns.reduce((acc, column) => {
      acc[column.name] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setSelectedColumns(initialSelection);
  }, [columns]);

  const filteredColumns = columns.filter(column => 
    column.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleColumn = (columnName: string) => {
    setSelectedColumns(prev => ({
      ...prev,
      [columnName]: !prev[columnName]
    }));
  };

  const handleToggleAll = () => {
    const areAllSelected = filteredColumns.every(col => selectedColumns[col.name]);
    
    const newSelectedColumns = { ...selectedColumns };
    filteredColumns.forEach(col => {
      newSelectedColumns[col.name] = !areAllSelected;
    });
    
    setSelectedColumns(newSelectedColumns);
  };

  const handleContinue = () => {
    const selected = columns.filter(col => selectedColumns[col.name]);
    onColumnsSelect(selected);
  };

  const selectedCount = Object.values(selectedColumns).filter(Boolean).length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Columns className="mr-2 text-blue-500" />
          {title}
        </CardTitle>
        <CardDescription>
          Choose which columns to include in the data transfer
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
            <div className="flex justify-between items-center mb-4">
              <div className="relative flex-1 mr-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search columns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="select-all" 
                  checked={filteredColumns.length > 0 && filteredColumns.every(col => selectedColumns[col.name])}
                  onCheckedChange={handleToggleAll}
                />
                <label htmlFor="select-all" className="ml-2 text-sm">
                  Select All
                </label>
              </div>
            </div>
            
            {filteredColumns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No columns found
              </div>
            ) : (
              <ScrollArea className="h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Column Name</TableHead>
                      <TableHead className="w-64">Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredColumns.map((column) => (
                      <TableRow key={column.name}>
                        <TableCell>
                          <Checkbox 
                            id={`col-${column.name}`} 
                            checked={!!selectedColumns[column.name]}
                            onCheckedChange={() => handleToggleColumn(column.name)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <label 
                            htmlFor={`col-${column.name}`}
                            className="cursor-pointer"
                          >
                            {column.name}
                          </label>
                        </TableCell>
                        <TableCell className="text-gray-500">{column.type}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          {selectedCount} of {columns.length} columns selected
        </div>
        <Button onClick={handleContinue} disabled={selectedCount === 0}>
          Continue <MoveRight size={16} className="ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ColumnSelector;
