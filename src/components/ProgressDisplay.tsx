
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Database, FileText, AlertTriangle, Loader2 } from "lucide-react";

export type IngestionStatus = "idle" | "preparing" | "in_progress" | "completed" | "error";

interface ProgressDisplayProps {
  status: IngestionStatus;
  totalRecords: number;
  processedRecords: number;
  errorMessage?: string;
  direction: "clickhouse-to-file" | "file-to-clickhouse";
  startTime?: Date;
  endTime?: Date;
  sourceInfo?: string;
  targetInfo?: string;
}

const ProgressDisplay = ({ 
  status, 
  totalRecords,
  processedRecords,
  errorMessage,
  direction,
  startTime,
  endTime,
  sourceInfo,
  targetInfo
}: ProgressDisplayProps) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  
  useEffect(() => {
    let intervalId: number | undefined;
    
    if (status === "in_progress" && startTime) {
      intervalId = window.setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [status, startTime]);
  
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} sec`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} sec`;
  };
  
  const calculateEstimatedTime = () => {
    if (processedRecords === 0 || totalRecords === 0) return "Calculating...";
    const recordsPerSecond = processedRecords / elapsedTime;
    const remainingRecords = totalRecords - processedRecords;
    const remainingSeconds = Math.floor(remainingRecords / recordsPerSecond);
    return formatDuration(remainingSeconds);
  };

  const progress = totalRecords > 0 ? (processedRecords / totalRecords) * 100 : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              {direction === "clickhouse-to-file" ? (
                <>
                  <Database className="text-blue-500 mr-2" size={18} />
                  <span className="mr-2">ClickHouse</span>
                  <span className="text-gray-400 mx-2">→</span>
                  <FileText className="text-green-500 mr-2" size={18} />
                  <span>File</span>
                </>
              ) : (
                <>
                  <FileText className="text-green-500 mr-2" size={18} />
                  <span className="mr-2">File</span>
                  <span className="text-gray-400 mx-2">→</span>
                  <Database className="text-blue-500 mr-2" size={18} />
                  <span>ClickHouse</span>
                </>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {sourceInfo && <div>From: {sourceInfo}</div>}
              {targetInfo && <div>To: {targetInfo}</div>}
            </CardDescription>
          </div>
          
          <Badge 
            variant={
              status === "completed" ? "default" : 
              status === "error" ? "destructive" : 
              "outline"
            }
            className="uppercase font-semibold"
          >
            {status === "idle" && "Ready"}
            {status === "preparing" && "Preparing"}
            {status === "in_progress" && "In Progress"}
            {status === "completed" && "Completed"}
            {status === "error" && "Error"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">
                {processedRecords.toLocaleString()} / {totalRecords.toLocaleString()} rows
              </span>
            </div>
            <Progress value={progress} />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <Clock className="text-gray-400 mr-2" size={16} />
              {startTime ? (
                <div>
                  <div className="text-gray-500">Started</div>
                  <div>{startTime.toLocaleTimeString()}</div>
                </div>
              ) : (
                <div className="text-gray-500">Not started</div>
              )}
            </div>
            
            <div className="flex items-center">
              {status === "in_progress" ? (
                <>
                  <Loader2 className="text-blue-500 mr-2 animate-spin" size={16} />
                  <div>
                    <div className="text-gray-500">Elapsed</div>
                    <div>{formatDuration(elapsedTime)}</div>
                  </div>
                </>
              ) : status === "completed" && endTime ? (
                <>
                  <CheckCircle className="text-green-500 mr-2" size={16} />
                  <div>
                    <div className="text-gray-500">Completed</div>
                    <div>{endTime.toLocaleTimeString()}</div>
                  </div>
                </>
              ) : (
                <div className="text-gray-500">-</div>
              )}
            </div>
          </div>
          
          {status === "in_progress" && processedRecords > 0 && (
            <div className="flex items-center bg-blue-50 text-blue-700 p-3 rounded">
              <div>
                <div>Processing rate: <span className="font-medium">{Math.round(processedRecords / Math.max(1, elapsedTime)).toLocaleString()} rows/sec</span></div>
                <div>Estimated remaining time: <span className="font-medium">{calculateEstimatedTime()}</span></div>
              </div>
            </div>
          )}
          
          {status === "completed" && (
            <div className="flex items-center bg-green-50 text-green-700 p-3 rounded">
              <CheckCircle className="mr-2" size={18} />
              <div>
                <div className="font-medium">Data transfer completed successfully</div>
                <div>{processedRecords.toLocaleString()} records processed</div>
              </div>
            </div>
          )}
          
          {status === "error" && (
            <div className="flex items-center bg-red-50 text-red-700 p-3 rounded">
              <AlertTriangle className="mr-2" size={18} />
              <div>
                <div className="font-medium">Error during data transfer</div>
                <div>{errorMessage || "Unknown error occurred"}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressDisplay;
