'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap, 
  Server, 
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Database,
  BarChart3,
  Sparkles,
  Building2,
  Brain,
  Shield
} from 'lucide-react'

interface OllamaHealthStatus {
  ollamaAvailable: boolean;
  modelLoaded: boolean;
  status: string;
  companyDatabaseSize: number;
}

interface SystemInfo {
  timestamp: string;
  model: string;
  features: {
    questionGeneration: boolean;
    responseAnalysis: boolean;
    performanceAnalysis: boolean;
    companyDatabase: boolean;
    companySuggestions: boolean;
  };
  replacedServices: string[];
  advantages: string[];
}

interface OllamaDashboardProps {
  className?: string;
}

const OllamaDashboard: React.FC<OllamaDashboardProps> = ({ className = "" }) => {
  const [healthStatus, setHealthStatus] = useState<OllamaHealthStatus | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [testResults, setTestResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchHealthStatus();
    const interval = setInterval(fetchHealthStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('/api/ollama-health');
      const data = await response.json();
      
      setHealthStatus(data.health);
      setSystemInfo(data.system);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Ollama health status:', error);
      setHealthStatus({
        ollamaAvailable: false,
        modelLoaded: false,
        status: 'error',
        companyDatabaseSize: 0
      });
      setLoading(false);
    }
  };

  const runTest = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/ollama-health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testQuery: 'Generate a technical question for a Software Engineer at Google'
        })
      });
      
      const data = await response.json();
      setTestResults(data.results);
    } catch (error) {
      console.error('Error running Ollama test:', error);
      setTestResults({
        success: false,
        error: 'Test failed to execute'
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (available: boolean) => {
    return available 
      ? <CheckCircle className="w-5 h-5 text-green-500" />
      : <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'model_not_loaded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'service_unavailable':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span>Loading Ollama service status...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Sparkles className="w-6 h-6 text-blue-500 mr-2" />
            Ollama AI Service Dashboard
          </h2>
          <p className="text-sm text-gray-600">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchHealthStatus} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={runTest} disabled={testing} variant="outline" size="sm">
            {testing ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Test Service
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Server className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Service Status</p>
                <p className="text-2xl font-bold text-gray-900">
                  {healthStatus?.ollamaAvailable ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">AI Model</p>
                <p className="text-2xl font-bold text-gray-900">
                  {healthStatus?.modelLoaded ? 'Loaded' : 'Not Loaded'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Database className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Company Database</p>
                <p className="text-2xl font-bold text-gray-900">
                  {healthStatus?.companyDatabaseSize || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-orange-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Privacy</p>
                <p className="text-2xl font-bold text-gray-900">Offline</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="w-5 h-5 mr-2 text-blue-500" />
              Service Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Ollama Service</span>
                <div className="flex items-center">
                  {getStatusIcon(healthStatus?.ollamaAvailable || false)}
                  <span className="ml-2 text-sm">
                    {healthStatus?.ollamaAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">LLaMA 3.1 Model</span>
                <div className="flex items-center">
                  {getStatusIcon(healthStatus?.modelLoaded || false)}
                  <span className="ml-2 text-sm">
                    {healthStatus?.modelLoaded ? 'Loaded' : 'Not Loaded'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Overall Status</span>
                <Badge className={getStatusColor(healthStatus?.status || 'unknown')}>
                  {healthStatus?.status?.toUpperCase() || 'UNKNOWN'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Migration Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">Removed Groq dependency</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">Removed Emergent LLM dependency</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">Offline AI processing</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">No rate limiting</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">Company-specific questions</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">Enhanced privacy</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
            Available Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemInfo?.features && Object.entries(systemInfo.features).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium capitalize">
                  {feature.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                {getStatusIcon(enabled)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Test Status</span>
                <Badge className={testResults.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {testResults.success ? 'PASSED' : 'FAILED'}
                </Badge>
              </div>
              
              {testResults.success && (
                <>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-2">Sample Generated Question:</p>
                    <p className="text-sm text-blue-700">{testResults.sampleQuestion}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Company Relevance</span>
                    <span className="text-sm font-bold">{testResults.companyRelevance}/10</span>
                  </div>
                </>
              )}
              
              {testResults.error && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700">{testResults.error}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company Database Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-indigo-500" />
            Company Intelligence Database
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Uber', 'Airbnb', 'Tesla', 'Spotify', 'LinkedIn', 'Adobe'].map((company) => (
              <div key={company} className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded text-center">
                <span className="text-xs font-medium text-gray-700">{company}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            {healthStatus?.companyDatabaseSize || 0} companies with tech stack, culture, and interview style data
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OllamaDashboard;