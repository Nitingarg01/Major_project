/**
 * Enhanced AI Dashboard Component
 * Shows Groq + Gemini integration status and capabilities
 * Replaced Emergent AI with Enhanced Groq AI Service
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Activity,
  Settings,
  Sparkles,
  Code,
  MessageSquare,
  BarChart3,
  Cpu,
  Database,
  RefreshCw
} from 'lucide-react';

interface AIHealthStatus {
  groqAvailable: boolean;
  geminiAvailable: boolean;
  status: string;
  activeProvider: string;
  fallbackAvailable: boolean;
  features: string[];
  companyProfilesLoaded?: number;
}

interface ServiceMetrics {
  totalRequests: number;
  averageResponseTime: number;
  successRate: number;
  questionsGenerated: number;
  responsesAnalyzed: number;
  dsaProblemsCreated: number;
}

const EnhancedAIDashboard: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<AIHealthStatus>({
    groqAvailable: false,
    geminiAvailable: false,
    status: 'checking',
    activeProvider: 'none',
    fallbackAvailable: false,
    features: []
  });

  const [metrics, setMetrics] = useState<ServiceMetrics>({
    totalRequests: 0,
    averageResponseTime: 0,
    successRate: 0,
    questionsGenerated: 0,
    responsesAnalyzed: 0,
    dsaProblemsCreated: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [testInProgress, setTestInProgress] = useState(false);

  useEffect(() => {
    checkHealthStatus();
    const interval = setInterval(checkHealthStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkHealthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check Enhanced Groq AI health
      const groqResponse = await fetch('/api/groq-health', {
        method: 'GET',
        cache: 'no-store'
      });
      
      if (groqResponse.ok) {
        const groqData = await groqResponse.json();
        setHealthStatus(groqData.health || {
          groqAvailable: false,
          geminiAvailable: false,
          status: 'unknown',
          activeProvider: 'none',
          fallbackAvailable: false,
          features: []
        });
      } else {
        setHealthStatus({
          groqAvailable: false,
          geminiAvailable: false,
          status: 'api_error',
          activeProvider: 'none',
          fallbackAvailable: false,
          features: []
        });
      }

      // Simulate metrics (in real app, these would come from analytics)
      setMetrics({
        totalRequests: Math.floor(Math.random() * 1000) + 500,
        averageResponseTime: Math.floor(Math.random() * 500) + 200,
        successRate: 95 + Math.random() * 4,
        questionsGenerated: Math.floor(Math.random() * 200) + 100,
        responsesAnalyzed: Math.floor(Math.random() * 150) + 75,
        dsaProblemsCreated: Math.floor(Math.random() * 50) + 25
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus({
        groqAvailable: false,
        geminiAvailable: false,
        status: 'error',
        activeProvider: 'none',
        fallbackAvailable: false,
        features: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runServiceTest = async () => {
    setTestInProgress(true);
    
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: 'Software Engineer',
          companyName: 'Google',
          skills: ['JavaScript', 'React'],
          interviewType: 'technical',
          experienceLevel: 'mid',
          numberOfQuestions: 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Service test successful:', data);
        await checkHealthStatus(); // Refresh status
      }
    } catch (error) {
      console.error('Service test failed:', error);
    } finally {
      setTestInProgress(false);
    }
  };

  const getStatusIcon = (isAvailable: boolean) => {
    if (isAvailable) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'groq_ready':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'gemini_only':
      case 'gemini_fallback':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
      case 'unhealthy':
      case 'no_service':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'All systems operational - Groq AI ready';
      case 'groq_ready':
        return 'Enhanced Groq AI active with company intelligence';
      case 'gemini_only':
        return 'Running on Gemini (Limited features)';
      case 'gemini_fallback':
        return 'Groq unavailable - Using Gemini fallback';
      case 'error':
        return 'Service error - Please check configuration';
      case 'no_service':
        return 'No AI services available';
      default:
        return 'Checking service status...';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Brain className="w-8 h-8 text-blue-600" />
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
              animate={healthStatus.groqAvailable ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Enhanced AI Dashboard</h2>
            <p className="text-sm text-gray-600">
              Powered by Groq + Gemini • Enhanced prompt engineering • Company intelligence
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={runServiceTest}
            disabled={testInProgress}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Zap className={`w-4 h-4 ${testInProgress ? 'animate-spin' : ''}`} />
            <span>{testInProgress ? 'Testing...' : 'Test Service'}</span>
          </button>
          
          <button
            onClick={checkHealthStatus}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className={`p-4 rounded-lg border-2 ${getStatusColor(healthStatus.status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5" />
            <span className="font-semibold">System Status</span>
          </div>
          <span className="text-sm font-medium">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
        <p className="mt-2 text-sm">{getStatusMessage(healthStatus.status)}</p>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Enhanced Groq AI Service */}
        <motion.div
          className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800">Enhanced Groq AI</p>
                <p className="text-sm font-medium text-gray-600">llama-3.3-70b-versatile</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(healthStatus.groqAvailable)}
              <span className={`text-sm font-medium ${healthStatus.groqAvailable ? 'text-green-600' : 'text-red-600'}`}>
                {healthStatus.groqAvailable ? 'Active' : 'Offline'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Company Profiles</span>
              <span className="text-sm font-medium text-gray-800">
                {healthStatus.companyProfilesLoaded || 0} loaded
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Questions Generated</span>
              <span className="text-sm font-medium text-gray-800">
                {metrics.questionsGenerated}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">DSA Problems Created</span>
              <span className="text-sm font-medium text-gray-800">
                {metrics.dsaProblemsCreated}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Capabilities:</p>
            <div className="flex flex-wrap gap-1">
              {[
                'Company Intelligence',
                'Advanced Prompts',
                'DSA Generation',
                'Cultural Analysis'
              ].map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Gemini Service */}
        <motion.div
          className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800">Google Gemini</p>
                <p className="text-sm font-medium text-gray-600">gemini-1.5-flash</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(healthStatus.geminiAvailable)}
              <span className={`text-sm font-medium ${healthStatus.geminiAvailable ? 'text-green-600' : 'text-red-600'}`}>
                {healthStatus.geminiAvailable ? 'Active' : 'Offline'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Primary Use</span>
              <span className="text-sm font-medium text-gray-800">Resume Analysis</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="text-sm font-medium text-gray-800">
                {metrics.averageResponseTime}ms avg
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-sm font-medium text-gray-800">
                {metrics.successRate.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Specialized For:</p>
            <div className="flex flex-wrap gap-1">
              {[
                'Resume Parsing',
                'Fast Processing',
                'Cost Effective',
                'Reliable Fallback'
              ].map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Service Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Performance Metrics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.totalRequests}</div>
            <div className="text-sm text-gray-600">Total Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.averageResponseTime}ms</div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{metrics.successRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{metrics.responsesAnalyzed}</div>
            <div className="text-sm text-gray-600">Responses Analyzed</div>
          </div>
        </div>
      </div>

      {/* AI Service Routing */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Intelligent Task Routing
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Code className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Complex Tasks → Enhanced Groq AI</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Interview question generation</li>
                <li>• Response analysis & feedback</li>
                <li>• Company-specific DSA problems</li>
                <li>• Performance evaluation</li>
              </ul>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-800">Lightweight Tasks → Gemini</span>
              </div>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Resume parsing & analysis</li>
                <li>• Company information lookup</li>
                <li>• Quick data extraction</li>
                <li>• Fallback processing</li>
              </ul>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <Cpu className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-800">Smart Routing Benefits</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div>
                <strong>Cost Optimization:</strong> Right AI for each task
              </div>
              <div>
                <strong>Performance:</strong> Optimal response times
              </div>
              <div>
                <strong>Reliability:</strong> Automatic failover
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {healthStatus.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedAIDashboard;