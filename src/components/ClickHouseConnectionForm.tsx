
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Database, Lock, Server, User } from "lucide-react";

export interface ClickHouseConnectionConfig {
  host: string;
  port: string;
  database: string;
  username: string;
  token: string;
}

interface ClickHouseConnectionFormProps {
  onConnect: (config: ClickHouseConnectionConfig) => void;
  isLoading?: boolean;
}

const ClickHouseConnectionForm = ({ 
  onConnect, 
  isLoading = false 
}: ClickHouseConnectionFormProps) => {
  const [config, setConfig] = useState<ClickHouseConnectionConfig>({
    host: "",
    port: "8443",
    database: "",
    username: "",
    token: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect(config);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 text-blue-500" /> 
          ClickHouse Connection
        </CardTitle>
        <CardDescription>
          Enter your ClickHouse connection details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Label htmlFor="host">Host</Label>
              <div className="flex mt-1">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  <Server size={16} />
                </span>
                <Input
                  id="host"
                  name="host"
                  placeholder="your-instance.clickhouse.com"
                  value={config.host}
                  onChange={handleChange}
                  className="rounded-l-none"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                name="port"
                placeholder="8443"
                value={config.port}
                onChange={handleChange}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="database">Database</Label>
            <div className="flex mt-1">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                <Database size={16} />
              </span>
              <Input
                id="database"
                name="database"
                placeholder="default"
                value={config.database}
                onChange={handleChange}
                className="rounded-l-none"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="username">Username</Label>
            <div className="flex mt-1">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                <User size={16} />
              </span>
              <Input
                id="username"
                name="username"
                placeholder="default"
                value={config.username}
                onChange={handleChange}
                className="rounded-l-none"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="token">JWT Token</Label>
            <div className="flex mt-1">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                <Lock size={16} />
              </span>
              <Input
                id="token"
                name="token"
                type="password"
                placeholder="JWT Token for authentication"
                value={config.token}
                onChange={handleChange}
                className="rounded-l-none"
                required
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? "Connecting..." : "Connect to ClickHouse"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClickHouseConnectionForm;
