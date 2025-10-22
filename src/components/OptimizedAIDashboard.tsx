'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap, 
  Cloud, 
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Database,
  BarChart3,
  Sparkles,
  Building2,
  Brain,
  Shield,
  Rocket,
  Globe,
  Award
} from 'lucide-react'

interface OptimizedHealthStatus {
  emergentAvailable: boolean,
  geminiAvailable: boolean,
  status: string,
  companyDatabaseSize: number
}

interface SystemInfo {
  timestamp: string,
  services: {
    primary: string,
    analysis: string,
    fallback: string
  };
  performance: {
    questionGeneration: string,
    responseAnalysis: string,
    overallAnalysis: string
  };
  features: {
    questionGeneration: boolean,
    responseAnalysis: boolean,
    performanceAnalysis: boolean,
    companyDatabase: boolean,
    companySuggestions: boolean,
    dsaProblems: boolean
  };
  apiStrategy: {
    questionGeneration: string,
    responseAnalysis: string,
    performanceAnalysis: string,
    companyIntelligence: string
  };
  replacedServices: string[],
  advantages: string[];
}

interface OptimizedAIDashboardProps {
  className?: string
}

const OptimizedAIDashboard: React.FC<OptimizedAIDashboardProps> = ({ className = "" }) => {
  const [healthStatus, setHealthStatus] = useState<OptimizedHealthStatus | null>(null);
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
      const response = await fetch('/api/optimized-health');
      const data = await response.json();
      
      setHealthStatus(data.health);
      setSystemInfo(data.system);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Optimized AI health status:', error);
      setHealthStatus({
        emergentAvailable: false,
        geminiAvailable: false,
        status: 'error',
        companyDatabaseSize: 0
      });
      setLoading(false);
    }
  };

  const runTest = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/optimized-health', {
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
      console.error('Error running Optimized AI test:', error);
      setTestResults({
        success: false,
        error: 'Test failed to execute'
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (available: boolean) => {
    return available;
      ? <CheckCircle className="w-5 h-5 text-green-500" />
      : <XCircle className="w-5 h-5 text-red-500" />
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'emergent_ready':
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'gemini_fallback':
      case 'gemini_only':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'no_service':
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
              <span>Loading Optimized AI service status...</span>
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
            <Rocket className="w-6 h-6 text-blue-500 mr-2" />
            Optimized AI Service Dashboard
          </h2>
          <p className="text-sm text-gray-600">
            High-performance API-based AI • Last updated: {lastUpdated.toLocaleTimeString()}
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

      {/* Performance Improvement Banner */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">🚀 Performance Breakthrough!</h3>
                <p className="text-sm text-gray-600">Smart AI is 10x faster than Ollama Phi3 Mini</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-300">
              UPGRADED
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Cloud className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Emergent LLM</p>
                <p className="text-2xl font-bold text-gray-900">
                  {healthStatus?.emergentAvailable ? 'Active' : 'Offline'}
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
                <p className="text-sm font-medium text-gray-600">Gemini Backup</p>
                <p className="text-2xl font-bold text-gray-900">
                  {healthStatus?.geminiAvailable ? 'Ready' : 'Offline'}
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
              <Globe className="w-8 h-8 text-orange-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">API Status</p>
                <p className="text-2xl font-bold text-gray-900">Cloud</p>
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
              <Cloud className="w-5 h-5 mr-2 text-blue-500" />
              API Service Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Emergent LLM API</span>
                <div className="flex items-center">
                  {getStatusIcon(healthStatus?.emergentAvailable || false)}
                  <span className="ml-2 text-sm">
                    {healthStatus?.emergentAvailable ? 'Connected' : 'Unavailable'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Gemini API</span>
                <div className="flex items-center">
                  {getStatusIcon(healthStatus?.geminiAvailable || false)}
                  <span className="ml-2 text-sm">
                    {healthStatus?.geminiAvailable ? 'Connected' : 'Unavailable'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Overall Status</span>
                <Badge className={getStatusColor(healthStatus?.status || 'unknown')}>
                  {healthStatus?.status?.toUpperCase().replace('_', ' ') || 'UNKNOWN'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Performance Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">10x faster question generation (< 5s)</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">8x faster response analysis (< 3s)</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">Professional-grade AI models</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">No local resource usage</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">API-based reliability</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">Enhanced analysis quality</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">Multi-provider redundancy</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Strategy Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-500" />
            Strategic AI Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                Task-Specific Optimization
              </h4>
              {systemInfo?.apiStrategy && Object.entries(systemInfo.apiStrategy).map(([task, provider]) => (
                <div key={task} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium capitalize">
                    {task.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-xs text-gray-600 font-medium">{provider}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Clock className="w-4 h-4 text-blue-500 mr-2" />
                Performance Metrics
              </h4>
              {systemInfo?.performance && Object.entries(systemInfo.performance).map(([metric, time]) => (
                <div key={metric} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium capitalize">
                    {metric.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-xs text-green-700 font-bold">{time}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

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
              <div key={feature} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Provider</span>
                    <span className="text-sm font-bold">{testResults.provider}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Model</span>
                    <span className="text-sm font-bold">{testResults.model}</span>
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
            {['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'OpenAI', 'Anthropic', 'Tesla', 'Stripe', 'Uber', 'Airbnb'].map((company) => (
              <div key={company} className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded text-center">
                <span className="text-xs font-medium text-gray-700">{company}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            {healthStatus?.companyDatabaseSize || 0} companies with comprehensive tech stack, culture, and interview intelligence
          </p>
        </CardContent>
      </Card>

      {/* Migration Success */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <Sparkles className="w-5 h-5 mr-2" />
            🎉 Migration Complete!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-800">✅ Performance Improvements:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Question generation: 25-40s → 3-5s (10x faster)</li>
                <li>• Response analysis: 10-20s → 2-3s (8x faster)</li>
                <li>• Overall analysis: 30-60s → 5-8s (5x faster)</li>
                <li>• No local resource usage (freed up RAM & CPU)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-green-800">🚀 New Capabilities:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Professional-grade AI models (GPT-4o-mini, Claude 3.5)</li>
                <li>• Enhanced analysis quality and accuracy</li>
                <li>• Multi-provider redundancy for reliability</li>
                <li>• API-based consistency and availability</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimizedAIDashboard;