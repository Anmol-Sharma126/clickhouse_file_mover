
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload } from "lucide-react";

export interface FileConfig {
  file: File | null;
  delimiter: string;
}

interface FileUploadFormProps {
  onFileUpload: (config: FileConfig) => void;
  isLoading?: boolean;
}

const FileUploadForm = ({ onFileUpload, isLoading = false }: FileUploadFormProps) => {
  const [fileConfig, setFileConfig] = useState<FileConfig>({
    file: null,
    delimiter: ","
  });
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileConfig(prev => ({ ...prev, file }));
      setFileName(file.name);
    }
  };

  const handleDelimiterChange = (value: string) => {
    setFileConfig(prev => ({ ...prev, delimiter: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileConfig.file) {
      onFileUpload(fileConfig);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 text-blue-500" /> 
          File Upload
        </CardTitle>
        <CardDescription>
          Upload a CSV or other delimited flat file
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file-upload">CSV File</Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {fileName ? (
                    <>
                      <FileText className="w-12 h-12 mb-2 text-blue-500" />
                      <p className="text-sm text-gray-700 font-medium">{fileName}</p>
                      <p className="text-xs text-gray-500 mt-1">Click to change file</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 mb-2 text-gray-400" />
                      <p className="mb-1 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">CSV, TSV or other flat files</p>
                    </>
                  )}
                </div>
                <input 
                  id="file-upload" 
                  type="file" 
                  accept=".csv,.tsv,.txt" 
                  className="hidden" 
                  onChange={handleFileChange} 
                  required
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delimiter">Delimiter</Label>
            <Select value={fileConfig.delimiter} onValueChange={handleDelimiterChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select delimiter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=",">Comma (,)</SelectItem>
                <SelectItem value="\t">Tab (\t)</SelectItem>
                <SelectItem value=";">Semicolon (;)</SelectItem>
                <SelectItem value="|">Pipe (|)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          onClick={handleSubmit} 
          className="w-full" 
          disabled={!fileConfig.file || isLoading}
        >
          {isLoading ? "Processing..." : "Upload and Process File"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FileUploadForm;
