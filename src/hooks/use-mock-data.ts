
import { useState } from "react";
import { TableInfo } from "@/components/TableList";
import { ColumnInfo } from "@/components/ColumnSelector";
import { FileConfig } from "@/components/FileUploadForm";
import { ClickHouseConnectionConfig } from "@/components/ClickHouseConnectionForm";

// Mock table data
const mockTables: TableInfo[] = [
  { name: "uk_price_paid", rowCount: 26987992, engine: "MergeTree" },
  { name: "ontime", rowCount: 188884765, engine: "MergeTree" },
  { name: "hits", rowCount: 100728694, engine: "MergeTree" },
  { name: "visits", rowCount: 1679791, engine: "MergeTree" },
  { name: "logs", rowCount: 8321309, engine: "MergeTree" },
  { name: "user_actions", rowCount: 42349, engine: "MergeTree" },
  { name: "customer_data", rowCount: 1834522, engine: "MergeTree" },
  { name: "transactions", rowCount: 24592104, engine: "MergeTree" },
  { name: "products", rowCount: 54321, engine: "MergeTree" },
  { name: "events", rowCount: 75319846, engine: "MergeTree" }
];

// Mock column data for tables
const mockTableSchemas: Record<string, ColumnInfo[]> = {
  uk_price_paid: [
    { name: "transaction_id", type: "String" },
    { name: "price", type: "Decimal(10,2)" },
    { name: "date_of_transfer", type: "Date" },
    { name: "postcode", type: "String" },
    { name: "property_type", type: "String" },
    { name: "old_new", type: "String" },
    { name: "duration", type: "String" },
    { name: "town", type: "String" },
    { name: "district", type: "String" },
    { name: "county", type: "String" },
    { name: "country", type: "String" }
  ],
  ontime: [
    { name: "year", type: "UInt16" },
    { name: "quarter", type: "UInt8" },
    { name: "month", type: "UInt8" },
    { name: "day_of_month", type: "UInt8" },
    { name: "day_of_week", type: "UInt8" },
    { name: "flight_date", type: "Date" },
    { name: "carrier", type: "String" },
    { name: "tail_number", type: "String" },
    { name: "flight_number", type: "String" },
    { name: "origin", type: "String" },
    { name: "destination", type: "String" },
    { name: "scheduled_departure", type: "UInt16" },
    { name: "departure_time", type: "UInt16" },
    { name: "departure_delay", type: "Int16" },
    { name: "taxi_out", type: "UInt16" },
    { name: "wheels_off", type: "UInt16" },
    { name: "wheels_on", type: "UInt16" },
    { name: "taxi_in", type: "UInt16" },
    { name: "scheduled_arrival", type: "UInt16" },
    { name: "arrival_time", type: "UInt16" },
    { name: "arrival_delay", type: "Int16" },
    { name: "cancelled", type: "UInt8" },
    { name: "cancellation_code", type: "String" },
    { name: "diverted", type: "UInt8" },
    { name: "air_time", type: "UInt16" },
    { name: "distance", type: "UInt16" }
  ]
};

// Mock sample data for preview
const generateMockPreviewData = (columns: ColumnInfo[], rows: number = 5) => {
  return Array.from({ length: rows }, (_, rowIndex) => {
    const row: Record<string, any> = {};
    columns.forEach(column => {
      switch (column.type) {
        case "String":
          row[column.name] = `Sample-${column.name}-${rowIndex + 1}`;
          break;
        case "UInt8":
        case "UInt16":
          row[column.name] = Math.floor(Math.random() * 100);
          break;
        case "Int16":
          row[column.name] = Math.floor(Math.random() * 200) - 100;
          break;
        case "Date":
          const date = new Date();
          date.setDate(date.getDate() - Math.floor(Math.random() * 365));
          row[column.name] = date.toISOString().split('T')[0];
          break;
        case "Decimal(10,2)":
          row[column.name] = (Math.random() * 1000000).toFixed(2);
          break;
        default:
          row[column.name] = `Value-${rowIndex + 1}`;
      }
    });
    return row;
  });
};

// Mock CSV column detection
const csvHeaderToColumns = (header: string, delimiter: string): ColumnInfo[] => {
  return header.split(delimiter).map(name => ({
    name: name.trim(),
    type: "String" // Default type for CSV columns
  }));
};

export const useClickHouseMock = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const connect = async (config: ClickHouseConnectionConfig) => {
    setIsLoading(true);
    // Simulate a network request
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsConnected(true);
    setIsLoading(false);
    return true;
  };

  const disconnect = () => {
    setIsConnected(false);
  };

  const getTables = async () => {
    setIsLoading(true);
    // Simulate a network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    return [...mockTables];
  };

  const getTableSchema = async (tableName: string) => {
    setIsLoading(true);
    // Simulate a network request
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    return mockTableSchemas[tableName] || [];
  };

  const getPreviewData = async (tableName: string, columns: ColumnInfo[], limit: number = 100) => {
    setIsLoading(true);
    // Simulate a network request
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsLoading(false);
    
    const tableColumns = mockTableSchemas[tableName] || [];
    const filteredColumns = columns.filter(col => 
      tableColumns.some(tableCol => tableCol.name === col.name)
    );
    
    return generateMockPreviewData(filteredColumns, limit);
  };

  return {
    isConnected,
    isLoading,
    connect,
    disconnect,
    getTables,
    getTableSchema,
    getPreviewData
  };
};

export const useFileMock = () => {
  const [isLoading, setIsLoading] = useState(false);

  const processFile = async (fileConfig: FileConfig) => {
    setIsLoading(true);
    
    // Simulate reading CSV file
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let columns: ColumnInfo[] = [];
    
    if (fileConfig.file) {
      // Mock CSV columns based on either file name
      if (fileConfig.file.name.includes("uk_price")) {
        columns = mockTableSchemas.uk_price_paid.map(col => ({ ...col }));
      } else if (fileConfig.file.name.includes("ontime")) {
        columns = mockTableSchemas.ontime.map(col => ({ ...col }));
      } else {
        // Generate random columns
        columns = Array.from({ length: 8 }, (_, i) => ({
          name: `column_${i + 1}`,
          type: i % 3 === 0 ? "String" : i % 3 === 1 ? "Number" : "Date"
        }));
      }
    }
    
    setIsLoading(false);
    return {
      columns,
      rowCount: Math.floor(Math.random() * 100000) + 5000
    };
  };

  const getPreviewData = async (columns: ColumnInfo[], limit: number = 100) => {
    setIsLoading(true);
    // Simulate a network request
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    
    return generateMockPreviewData(columns, limit);
  };

  return {
    isLoading,
    processFile,
    getPreviewData
  };
};

export const useDataIngestion = () => {
  const [status, setStatus] = useState<"idle" | "preparing" | "in_progress" | "completed" | "error">("idle");
  const [processedRecords, setProcessedRecords] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState<Date | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const startIngestion = async (
    totalRows: number, 
    onProgress?: (processed: number) => void,
    simulateError: boolean = false
  ) => {
    setStatus("preparing");
    setProcessedRecords(0);
    setTotalRecords(totalRows);
    setStartTime(new Date());
    setEndTime(undefined);
    setErrorMessage(undefined);
    
    // Simulate some preparation time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setStatus("in_progress");
    
    // Simulate ingestion with progress updates
    return new Promise<boolean>((resolve, reject) => {
      let processed = 0;
      const batchSize = Math.ceil(totalRows / 20); // Process in 20 batches
      const interval = setInterval(() => {
        if (simulateError && processed > totalRows / 2) {
          clearInterval(interval);
          setStatus("error");
          setErrorMessage("Connection lost during data transfer. Please check your network connection and try again.");
          reject(new Error("Simulated error during ingestion"));
          return;
        }
        
        processed += batchSize;
        if (processed >= totalRows) {
          processed = totalRows;
          clearInterval(interval);
          setProcessedRecords(processed);
          onProgress?.(processed);
          
          // Simulate a small delay before completion
          setTimeout(() => {
            setStatus("completed");
            setEndTime(new Date());
            resolve(true);
          }, 500);
        } else {
          setProcessedRecords(processed);
          onProgress?.(processed);
        }
      }, 300);
    });
  };

  const resetIngestion = () => {
    setStatus("idle");
    setProcessedRecords(0);
    setTotalRecords(0);
    setStartTime(undefined);
    setEndTime(undefined);
    setErrorMessage(undefined);
  };

  return {
    status,
    processedRecords,
    totalRecords,
    startTime,
    endTime,
    errorMessage,
    startIngestion,
    resetIngestion
  };
};
