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
  Globe, 
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Cpu,
  BarChart3
} from 'lucide-react'

interface ProviderStatus {
  name: string,
  status: 'active' | 'limited' | 'error',
  requestsUsed: number,
  requestsLimit: number,
  responseTime: number,
  model: string,
  priority: number
}

interface LLMDashboardProps {
  className?: string
}

const FreeLLMDashboard: React.FC<LLMDashboardProps> = ({ className = "" }) => {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [totalRequests, setTotalRequests] = useState(0);
  const [successRate, setSuccessRate] = useState(100);

  useEffect(() => {
    fetchProviderStatus();
    const interval = setInterval(fetchProviderStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchProviderStatus = async () => {
    try {
      // Mock provider status - in real implementation, this would call your health check API
      const mockProviders: ProviderStatus[] = [
        {
          name: 'Together.ai',
          status: 'active',
          requestsUsed: 25,
          requestsLimit: 60,
          responseTime: 1200,
          model: 'Llama 3.1 8B',
          priority: 1
        },
        {
          name: 'Groq',
          status: 'active', 
          requestsUsed: 8,
          requestsLimit: 30,
          responseTime: 350,
          model: 'Llama 3.1 70B',
          priority: 2
        },
        {
          name: 'Hugging Face',
          status: 'active',
          requestsUsed: 3,
          requestsLimit: 10,
          responseTime: 2800,
          model: 'Mistral 7B',
          priority: 3
        }
      ];

      setProviders(mockProviders);
      setTotalRequests(mockProviders.reduce((sum, p) => sum + p.requestsUsed, 0));
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching provider status:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'limited': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />,
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'limited': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'error': return 'bg-red-100 text-red-800 border-red-300',
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span>Loading LLM provider status...</span>
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
          <h2 className="text-2xl font-bold text-gray-900">Free LLM Dashboard</h2>
          <p className="text-sm text-gray-600">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={fetchProviderStatus} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Cpu className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Providers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {providers.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(providers.reduce((sum, p) => sum + p.responseTime, 0) / providers.length)}ms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider Status Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Provider Status</h3>
        {providers.map((provider, index) => {
          const usagePercentage = getUsagePercentage(provider.requestsUsed, provider.requestsLimit);
          
          return (
            <Card key={index} className="transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getStatusIcon(provider.status)}
                    <h4 className="ml-2 text-lg font-semibold text-gray-900">
                      {provider.name}
                    </h4>
                    <Badge variant="secondary" className="ml-2">
                      Priority {provider.priority}
                    </Badge>
                  </div>
                  <Badge className={getStatusColor(provider.status)}>
                    {provider.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Usage */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Usage</p>
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${getUsageColor(usagePercentage)}`}
                          style={{ width: `${usagePercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {provider.requestsUsed}/{provider.requestsLimit}
                      </span>
                    </div>
                  </div>

                  {/* Response Time */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Response Time</p>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm font-medium">{provider.responseTime}ms</span>
                    </div>
                  </div>

                  {/* Model */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Model</p>
                    <div className="flex items-center">
                      <Cpu className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm font-medium">{provider.model}</span>
                    </div>
                  </div>

                  {/* Health */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Health</p>
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm font-medium">
                        {provider.status === 'active' ? 'Healthy' : 'Issues'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rate Limit Warning */}
                {usagePercentage >= 80 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                      <span className="text-sm text-yellow-700">
                        {usagePercentage >= 95;
                          ? 'Rate limit almost reached - switching to backup provider'
                          : 'Approaching rate limit - prepare for provider switch'
                        }
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
            Free LLM Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">✅ Solved Issues:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• No more rate limiting problems</li>
                <li>• Consistent API responses</li>
                <li>• Multiple provider fallbacks</li>
                <li>• Enhanced company intelligence</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">🚀 New Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time company news integration</li>
                <li>• Better quality interview questions</li>
                <li>• Automatic provider switching</li>
                <li>• Cost-effective solution with multiple providers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FreeLLMDashboard;