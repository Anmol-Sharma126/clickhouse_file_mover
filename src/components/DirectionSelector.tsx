
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Database, FileText } from "lucide-react";

type DirectionOption = "clickhouse-to-file" | "file-to-clickhouse" | null;

interface DirectionSelectorProps {
  onDirectionSelected: (direction: DirectionOption) => void;
}

const DirectionSelector = ({ onDirectionSelected }: DirectionSelectorProps) => {
  const [selectedDirection, setSelectedDirection] = useState<DirectionOption>(null);

  const handleSelect = (direction: DirectionOption) => {
    setSelectedDirection(direction);
    onDirectionSelected(direction);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Bidirectional Data Ingestion Tool</h1>
        <p className="text-gray-500 mt-2">Select the data transfer direction to begin</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          className={`cursor-pointer border-2 transition-all ${selectedDirection === "clickhouse-to-file" ? "border-blue-500 shadow-lg" : "border-transparent hover:border-gray-300"}`}
          onClick={() => handleSelect("clickhouse-to-file")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-blue-600">
              <Database className="mr-2" /> ClickHouse to File
            </CardTitle>
            <CardDescription>Export data from ClickHouse to CSV</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-6">
            <div className="flex justify-center items-center text-blue-500">
              <Database className="h-12 w-12" />
              <ArrowRightLeft className="h-8 w-8 mx-4" />
              <FileText className="h-12 w-12" />
            </div>
          </CardContent>
          <CardFooter className="pt-2 pb-4">
            <Button 
              variant={selectedDirection === "clickhouse-to-file" ? "default" : "outline"} 
              className="w-full"
              onClick={() => handleSelect("clickhouse-to-file")}
            >
              Select
            </Button>
          </CardFooter>
        </Card>

        <Card 
          className={`cursor-pointer border-2 transition-all ${selectedDirection === "file-to-clickhouse" ? "border-blue-500 shadow-lg" : "border-transparent hover:border-gray-300"}`}
          onClick={() => handleSelect("file-to-clickhouse")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-blue-600">
              <FileText className="mr-2" /> File to ClickHouse
            </CardTitle>
            <CardDescription>Import data from CSV to ClickHouse</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-6">
            <div className="flex justify-center items-center text-blue-500">
              <FileText className="h-12 w-12" />
              <ArrowRightLeft className="h-8 w-8 mx-4" />
              <Database className="h-12 w-12" />
            </div>
          </CardContent>
          <CardFooter className="pt-2 pb-4">
            <Button 
              variant={selectedDirection === "file-to-clickhouse" ? "default" : "outline"} 
              className="w-full"
              onClick={() => handleSelect("file-to-clickhouse")}
            >
              Select
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {selectedDirection && (
        <div className="mt-8 text-center">
          <Button 
            size="lg"
            className="px-8"
            onClick={() => onDirectionSelected(selectedDirection)}
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};

export default DirectionSelector;
