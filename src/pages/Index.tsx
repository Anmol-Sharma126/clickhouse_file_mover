
import { useState } from "react";
import DirectionSelector from "@/components/DirectionSelector";
import ClickHouseConnectionForm, { ClickHouseConnectionConfig } from "@/components/ClickHouseConnectionForm";
import FileUploadForm, { FileConfig } from "@/components/FileUploadForm";
import TableList, { TableInfo } from "@/components/TableList";
import ColumnSelector, { ColumnInfo } from "@/components/ColumnSelector";
import ColumnMapping from "@/components/ColumnMapping";
import DataPreview from "@/components/DataPreview";
import ProgressDisplay from "@/components/ProgressDisplay";
import WorkflowStepper, { Step } from "@/components/WorkflowStepper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useClickHouseMock, useFileMock, useDataIngestion } from "@/hooks/use-mock-data";
import { ArrowLeft, RefreshCw } from "lucide-react";

type Direction = "clickhouse-to-file" | "file-to-clickhouse" | null;

type WorkflowStep = 
  | "select-direction" 
  | "connect-source" 
  | "connect-target" 
  | "select-table" 
  | "select-columns" 
  | "map-columns" 
  | "preview-data" 
  | "ingestion";

const Index = () => {
  // Workflow state
  const [direction, setDirection] = useState<Direction>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("select-direction");
  
  // Data state
  const [clickHouseConfig, setClickHouseConfig] = useState<ClickHouseConnectionConfig | null>(null);
  const [fileConfig, setFileConfig] = useState<FileConfig | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [sourceColumns, setSourceColumns] = useState<ColumnInfo[]>([]);
  const [targetColumns, setTargetColumns] = useState<ColumnInfo[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<ColumnInfo[]>([]);
  const [columnMapping, setColumnMapping] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([]);
  
  // Mocked services
  const clickHouseMock = useClickHouseMock();
  const fileMock = useFileMock();
  const dataIngestion = useDataIngestion();

  // Handle workflow steps
  const handleDirectionSelected = async (selectedDirection: Direction) => {
    setDirection(selectedDirection);
    setCurrentStep("connect-source");
  };

  const handleClickHouseConnect = async (config: ClickHouseConnectionConfig) => {
    const success = await clickHouseMock.connect(config);
    if (success) {
      setClickHouseConfig(config);
      
      if (direction === "clickhouse-to-file") {
        const tablesList = await clickHouseMock.getTables();
        setTables(tablesList);
        setCurrentStep("select-table");
      } else {
        setCurrentStep("connect-target");
      }
    }
  };

  const handleFileUpload = async (config: FileConfig) => {
    setFileConfig(config);
    
    if (direction === "file-to-clickhouse") {
      const fileData = await fileMock.processFile(config);
      setSourceColumns(fileData.columns);
      setCurrentStep("select-columns");
    } else {
      setCurrentStep("map-columns");
    }
  };

  const handleTableSelect = async (tableName: string) => {
    setSelectedTable(tableName);
    const columns = await clickHouseMock.getTableSchema(tableName);
    
    if (direction === "clickhouse-to-file") {
      setSourceColumns(columns);
      setCurrentStep("select-columns");
    } else {
      setTargetColumns(columns);
      setCurrentStep("map-columns");
    }
  };

  const handleColumnsSelect = (columns: ColumnInfo[]) => {
    setSelectedColumns(columns);
    
    if (direction === "clickhouse-to-file") {
      setCurrentStep("connect-target");
    } else {
      loadPreviewData(columns);
    }
  };

  const handleColumnMapping = (mapping: any[]) => {
    setColumnMapping(mapping);
    loadPreviewData(mapping.filter(m => m.target).map(m => m.source));
  };

  const loadPreviewData = async (columns: ColumnInfo[]) => {
    let data: Record<string, any>[] = [];
    
    if (direction === "clickhouse-to-file" && selectedTable) {
      data = await clickHouseMock.getPreviewData(selectedTable, columns, 10);
    } else if (direction === "file-to-clickhouse" && fileConfig) {
      data = await fileMock.getPreviewData(columns, 10);
    }
    
    setPreviewData(data);
    setCurrentStep("preview-data");
  };

  const handleStartIngestion = async () => {
    setCurrentStep("ingestion");
    
    const totalRecords = direction === "clickhouse-to-file" && selectedTable
      ? (tables.find(t => t.name === selectedTable)?.rowCount || 5000)
      : 5000;
    
    try {
      await dataIngestion.startIngestion(totalRecords);
    } catch (error) {
      console.error("Ingestion error:", error);
    }
  };

  const resetWorkflow = () => {
    setDirection(null);
    setCurrentStep("select-direction");
    setClickHouseConfig(null);
    setFileConfig(null);
    setSelectedTable(null);
    setTables([]);
    setSourceColumns([]);
    setTargetColumns([]);
    setSelectedColumns([]);
    setColumnMapping([]);
    setPreviewData([]);
    dataIngestion.resetIngestion();
  };

  // Generate steps for the workflow stepper
  const getWorkflowSteps = (): Step[] => {
    const baseSteps: Step[] = [
      { 
        id: "select-direction", 
        name: "Select Direction",
        status: currentStep === "select-direction" ? "current" : 
               currentStep === "connect-source" || currentStep === "connect-target" || 
               currentStep === "select-table" || currentStep === "select-columns" || 
               currentStep === "map-columns" || currentStep === "preview-data" || 
               currentStep === "ingestion" ? "completed" : "upcoming"
      },
    ];

    if (direction === "clickhouse-to-file") {
      return [
        ...baseSteps,
        { 
          id: "connect-source", 
          name: "Connect ClickHouse", 
          status: currentStep === "connect-source" ? "current" : 
                 currentStep === "select-table" || currentStep === "select-columns" || 
                 currentStep === "connect-target" || currentStep === "preview-data" || 
                 currentStep === "ingestion" ? "completed" : "upcoming"
        },
        { 
          id: "select-table", 
          name: "Select Table", 
          status: currentStep === "select-table" ? "current" : 
                 currentStep === "select-columns" || currentStep === "connect-target" || 
                 currentStep === "preview-data" || currentStep === "ingestion" ? "completed" : "upcoming" 
        },
        { 
          id: "select-columns", 
          name: "Select Columns", 
          status: currentStep === "select-columns" ? "current" : 
                 currentStep === "connect-target" || currentStep === "preview-data" || 
                 currentStep === "ingestion" ? "completed" : "upcoming" 
        },
        { 
          id: "connect-target", 
          name: "Configure File", 
          status: currentStep === "connect-target" ? "current" : 
                 currentStep === "preview-data" || currentStep === "ingestion" ? "completed" : "upcoming" 
        },
        { 
          id: "preview-data", 
          name: "Preview Data", 
          status: currentStep === "preview-data" ? "current" : 
                 currentStep === "ingestion" ? "completed" : "upcoming" 
        },
        { 
          id: "ingestion", 
          name: "Data Ingestion", 
          status: currentStep === "ingestion" ? "current" : "upcoming" 
        }
      ];
    } else if (direction === "file-to-clickhouse") {
      return [
        ...baseSteps,
        { 
          id: "connect-source", 
          name: "Upload File", 
          status: currentStep === "connect-source" ? "current" : 
                 currentStep === "connect-target" || currentStep === "select-columns" || 
                 currentStep === "select-table" || currentStep === "map-columns" || 
                 currentStep === "preview-data" || currentStep === "ingestion" ? "completed" : "upcoming" 
        },
        { 
          id: "select-columns", 
          name: "Select Columns", 
          status: currentStep === "select-columns" ? "current" : 
                 currentStep === "connect-target" || currentStep === "select-table" || 
                 currentStep === "map-columns" || currentStep === "preview-data" || 
                 currentStep === "ingestion" ? "completed" : "upcoming" 
        },
        { 
          id: "connect-target", 
          name: "Connect ClickHouse", 
          status: currentStep === "connect-target" ? "current" : 
                 currentStep === "select-table" || currentStep === "map-columns" || 
                 currentStep === "preview-data" || currentStep === "ingestion" ? "completed" : "upcoming" 
        },
        { 
          id: "select-table", 
          name: "Select Table", 
          status: currentStep === "select-table" ? "current" : 
                 currentStep === "map-columns" || currentStep === "preview-data" || 
                 currentStep === "ingestion" ? "completed" : "upcoming" 
        },
        { 
          id: "map-columns", 
          name: "Map Columns", 
          status: currentStep === "map-columns" ? "current" : 
                 currentStep === "preview-data" || currentStep === "ingestion" ? "completed" : "upcoming" 
        },
        { 
          id: "preview-data", 
          name: "Preview Data", 
          status: currentStep === "preview-data" ? "current" : 
                 currentStep === "ingestion" ? "completed" : "upcoming" 
        },
        { 
          id: "ingestion", 
          name: "Data Ingestion", 
          status: currentStep === "ingestion" ? "current" : "upcoming" 
        }
      ];
    }
    
    return baseSteps;
  };

  const handleStepClick = (stepId: WorkflowStep) => {
    // Only allow navigation to completed steps
    const steps = getWorkflowSteps();
    const targetStep = steps.find(step => step.id === stepId);
    
    if (targetStep && (targetStep.status === "completed" || targetStep.status === "current")) {
      setCurrentStep(stepId as WorkflowStep);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "select-direction":
        return <DirectionSelector onDirectionSelected={handleDirectionSelected} />;
        
      case "connect-source":
        return direction === "clickhouse-to-file" ? (
          <ClickHouseConnectionForm 
            onConnect={handleClickHouseConnect} 
            isLoading={clickHouseMock.isLoading} 
          />
        ) : (
          <FileUploadForm 
            onFileUpload={handleFileUpload} 
            isLoading={fileMock.isLoading} 
          />
        );
        
      case "connect-target":
        return direction === "clickhouse-to-file" ? (
          <FileUploadForm 
            onFileUpload={handleFileUpload} 
            isLoading={fileMock.isLoading} 
          />
        ) : (
          <ClickHouseConnectionForm 
            onConnect={handleClickHouseConnect} 
            isLoading={clickHouseMock.isLoading} 
          />
        );
        
      case "select-table":
        return <TableList 
          tables={tables} 
          isLoading={clickHouseMock.isLoading} 
          onTableSelect={handleTableSelect} 
        />;
        
      case "select-columns":
        return <ColumnSelector 
          columns={sourceColumns} 
          isLoading={false} 
          onColumnsSelect={handleColumnsSelect} 
          title={direction === "clickhouse-to-file" ? "Select ClickHouse Columns" : "Select File Columns"}
        />;
        
      case "map-columns":
        return <ColumnMapping 
          sourceColumns={sourceColumns} 
          targetColumns={targetColumns} 
          onMappingComplete={handleColumnMapping}
          sourceLabel={direction === "clickhouse-to-file" ? "ClickHouse" : "File"}
          targetLabel={direction === "clickhouse-to-file" ? "File" : "ClickHouse"} 
        />;
        
      case "preview-data":
        return <DataPreview 
          columns={selectedColumns}
          data={previewData}
          onStartIngestion={handleStartIngestion}
          isLoading={clickHouseMock.isLoading || fileMock.isLoading}
        />;
        
      case "ingestion":
        return <ProgressDisplay
          status={dataIngestion.status}
          totalRecords={dataIngestion.totalRecords}
          processedRecords={dataIngestion.processedRecords}
          errorMessage={dataIngestion.errorMessage}
          direction={direction as "clickhouse-to-file" | "file-to-clickhouse"}
          startTime={dataIngestion.startTime}
          endTime={dataIngestion.endTime}
          sourceInfo={direction === "clickhouse-to-file" 
            ? selectedTable 
            : fileConfig?.file?.name
          }
          targetInfo={direction === "clickhouse-to-file"
            ? fileConfig?.file?.name
            : selectedTable
          }
        />;
        
      default:
        return <DirectionSelector onDirectionSelected={handleDirectionSelected} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">ClickHouse Data Ingestion Tool</h1>
          
          {currentStep !== "select-direction" && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center"
              onClick={resetWorkflow}
            >
              <RefreshCw size={16} className="mr-1" /> Reset
            </Button>
          )}
        </header>

        {currentStep !== "select-direction" && (
          <Card className="p-4 mb-8">
            <WorkflowStepper 
              steps={getWorkflowSteps()} 
              onStepClick={handleStepClick}
              allowNavigation={true}
            />
          </Card>
        )}

        <div className="mb-6">
          {currentStep !== "select-direction" && (
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 flex items-center"
              onClick={() => {
                switch (currentStep) {
                  case "connect-source":
                    setCurrentStep("select-direction");
                    break;
                  case "select-table":
                    setCurrentStep("connect-source");
                    break;
                  case "select-columns":
                    setCurrentStep(direction === "clickhouse-to-file" ? "select-table" : "connect-source");
                    break;
                  case "connect-target":
                    setCurrentStep(direction === "clickhouse-to-file" ? "select-columns" : "select-columns");
                    break;
                  case "map-columns":
                    setCurrentStep(direction === "clickhouse-to-file" ? "connect-target" : "select-table");
                    break;
                  case "preview-data":
                    setCurrentStep(direction === "clickhouse-to-file" ? "connect-target" : "map-columns");
                    break;
                  case "ingestion":
                    setCurrentStep("preview-data");
                    break;
                }
              }}
            >
              <ArrowLeft size={16} className="mr-1" /> Back
            </Button>
          )}
        </div>

        {renderCurrentStep()}
        
        {dataIngestion.status === "completed" && (
          <div className="mt-6 text-center">
            <Button 
              onClick={resetWorkflow}
              size="lg"
            >
              Start New Data Transfer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
