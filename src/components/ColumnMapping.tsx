
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownUp, MoveRight } from "lucide-react";
import { ColumnInfo } from "./ColumnSelector";

interface MappedColumn {
  source: ColumnInfo;
  target: ColumnInfo | null;
}

interface ColumnMappingProps {
  sourceColumns: ColumnInfo[];
  targetColumns: ColumnInfo[];
  onMappingComplete: (mapping: MappedColumn[]) => void;
  sourceLabel: string;
  targetLabel: string;
}

const ColumnMapping = ({ 
  sourceColumns,
  targetColumns,
  onMappingComplete,
  sourceLabel,
  targetLabel
}: ColumnMappingProps) => {
  const [mapping, setMapping] = useState<MappedColumn[]>([]);
  
  useEffect(() => {
    // Initialize mapping with best-guess matches by name
    const initialMapping: MappedColumn[] = sourceColumns.map(sourceCol => {
      // Try to find a target column with the same name (case insensitive)
      const match = targetColumns.find(
        targetCol => targetCol.name.toLowerCase() === sourceCol.name.toLowerCase()
      );
      
      return {
        source: sourceCol,
        target: match || null
      };
    });
    
    setMapping(initialMapping);
  }, [sourceColumns, targetColumns]);

  const handleTargetChange = (sourceColumnName: string, targetColumnName: string | null) => {
    setMapping(prev => 
      prev.map(item => {
        if (item.source.name === sourceColumnName) {
          return {
            ...item,
            target: targetColumnName 
              ? targetColumns.find(col => col.name === targetColumnName) || null
              : null
          };
        }
        return item;
      })
    );
  };

  const handleContinue = () => {
    onMappingComplete(mapping);
  };

  const mappedCount = mapping.filter(m => m.target !== null).length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ArrowDownUp className="mr-2 text-blue-500" />
          Map Columns
        </CardTitle>
        <CardDescription>
          Match source columns to destination columns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2 font-medium">{sourceLabel} (Source)</TableHead>
                <TableHead className="w-1/2 font-medium">{targetLabel} (Target)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mapping.map(({ source, target }) => (
                <TableRow key={source.name}>
                  <TableCell>
                    <div className="font-medium">{source.name}</div>
                    <div className="text-xs text-gray-500">{source.type}</div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={target?.name || ""}
                      onValueChange={(value) => handleTargetChange(source.name, value || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select matching column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">-- Do not map --</SelectItem>
                        {targetColumns.map(targetCol => (
                          <SelectItem key={targetCol.name} value={targetCol.name}>
                            {targetCol.name} ({targetCol.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          {mappedCount} of {sourceColumns.length} columns mapped
        </div>
        <Button onClick={handleContinue} disabled={mappedCount === 0}>
          Continue <MoveRight size={16} className="ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ColumnMapping;
