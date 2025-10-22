'use client'
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Building, 
  Sparkles, 
  Play, 
  RefreshCw, 
  Code, 
  Brain,
  Target,
  TrendingUp,
  Users
} from 'lucide-react'
import { toast } from 'sonner';
import EnhancedDSACompiler from '@/components/EnhancedDSACompiler';
import { DSAProblem } from '@/lib/enhancedDSAService';

const EnhancedDSATestPage = () => {
  const [selectedCompany, setSelectedCompany] = useState('Google');
  const [experienceLevel, setExperienceLevel] = useState<'entry' | 'mid' | 'senior'>('mid');
  const [problemCount, setProblemCount] = useState(1);
  const [generateUnique, setGenerateUnique] = useState(false);
  const [generateInteractive, setGenerateInteractive] = useState(false);
  const [challengeType, setChallengeType] = useState<'algorithm' | 'system_design' | 'optimization' | 'debugging'>('algorithm');
  const [problems, setProblems] = useState<DSAProblem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [companyInsights, setCompanyInsights] = useState<any>(null);
  const [previousProblemIds, setPreviousProblemIds] = useState<string[]>([]);
  const [serviceStatus, setServiceStatus] = useState<any>(null);

  const companies = [
    { name: 'Google', color: 'bg-blue-100 text-blue-800', icon: '🔍' },
    { name: 'Amazon', color: 'bg-orange-100 text-orange-800', icon: '📦' },
    { name: 'Meta', color: 'bg-purple-100 text-purple-800', icon: '👤' },
    { name: 'Microsoft', color: 'bg-green-100 text-green-800', icon: '🪟' },
    { name: 'Apple', color: 'bg-gray-100 text-gray-800', icon: '🍎' },
    { name: 'Netflix', color: 'bg-red-100 text-red-800', icon: '🎬' }
  ]

  // Check service status on mount
  useEffect(() => {
    checkServiceStatus();
  }, [])

  const checkServiceStatus = async () => {
    try {
      const response = await fetch('/api/generate-company-dsa');
      const data = await response.json();
      setServiceStatus(data);
    } catch (error) {
      console.error('Failed to check service status:', error)
    }
  }

  const generateProblems = async () => {
    setLoading(true);
    const toastId = toast.loading(`Generating ${generateInteractive ? 'interactive' : generateUnique ? 'unique' : 'company-specific'} DSA problems for ${selectedCompany}...`);

    try {
      const response = await fetch('/api/generate-company-dsa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: selectedCompany,
          count: problemCount,
          experienceLevel,
          challengeType,
          previousProblemIds,
          generateUnique,
          generateInteractive
        }),
      })

      const data = await response.json();

      if (data.success) {
        setProblems(data.problems);
        setCompanyInsights(data.companyInsights);
        setCurrentProblemIndex(0);
        
        // Add new problem IDs to avoid duplicates in future generations
        setPreviousProblemIds(prev => [...prev, ...data.problems.map((p: DSAProblem) => p.id)]);
        
        toast.dismiss(toastId);
        toast.success(`🎉 Generated ${data.problems.length} ${selectedCompany}-style DSA problems!`, {
          description: `${generateInteractive ? 'Interactive' : generateUnique ? 'Unique' : 'Company-specific'} problems ready for practice`
        })
      } else {
        throw new Error(data.error || 'Failed to generate problems');
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error('Failed to generate problems: ' + error.message);
      console.error('Problem generation error:', error)
    } finally {
      setLoading(false);
    }
  }

  const handleProblemSubmit = (code: string, results: any, timeSpent: number) => {
    console.log('DSA Solution submitted:', { 
      code, 
      results, 
      timeSpent, 
      company: selectedCompany,
      problemId: problems[currentProblemIndex]?.id
    })
    
    toast.success(`🎯 Solution submitted for ${selectedCompany}!`, {
      description: `Time: ${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s | Quality: ${results.codeQuality || 0}%`
    })

    // Move to next problem if available
    if (currentProblemIndex < problems.length - 1) {
      setTimeout(() => {
        setCurrentProblemIndex(prev => prev + 1);
        toast.info('Moving to next problem...');
      }, 2000)
    }
  }

  const currentProblem = problems[currentProblemIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Enhanced DSA Compiler
              </h1>
              <p className="text-gray-600 mt-2">Company-specific • Interactive • Unique Problems</p>
            </div>
          </div>
          
          {/* Service Status */}
          {serviceStatus && (
            <div className="flex items-center justify-center gap-4 mb-6">
              <Badge variant={serviceStatus.emergentAvailable ? 'default' : 'secondary'}>
                {serviceStatus.emergentAvailable ? '🟢 AI Service Online' : '🟡 Fallback Mode'}
              </Badge>
              <Badge variant="outline">
                {serviceStatus.supportedCompanies?.length || 6} Companies Supported
              </Badge>
            </div>
          )}
        </div>

        {/* Configuration Panel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Problem Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Company Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Company
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {companies.map((company) => (
                    <Button
                      key={company.name}
                      variant={selectedCompany === company.name ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCompany(company.name)}
                      className="flex items-center gap-1"
                    >
                      <span>{company.icon}</span>
                      <span className="text-xs">{company.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <div className="space-y-2">
                  {(['entry', 'mid', 'senior'] as const).map((level) => (
                    <Button
                      key={level}
                      variant={experienceLevel === level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setExperienceLevel(level)}
                      className="w-full"
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Problem Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Count
                </label>
                <select
                  value={problemCount}
                  onChange={(e) => setProblemCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num} Problem{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              {/* Generation Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Generation Type
                </label>
                <div className="space-y-2">
                  <Button
                    variant={!generateUnique && !generateInteractive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setGenerateUnique(false);
                      setGenerateInteractive(false);
                    }}
                    className="w-full"
                  >
                    <Building className="w-4 h-4 mr-1" />
                    Company Style
                  </Button>
                  <Button
                    variant={generateUnique ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setGenerateUnique(true);
                      setGenerateInteractive(false);
                    }}
                    className="w-full"
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    Unique
                  </Button>
                  <Button
                    variant={generateInteractive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setGenerateInteractive(true);
                      setGenerateUnique(false);
                    }}
                    className="w-full"
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Interactive
                  </Button>
                </div>
              </div>
            </div>

            {/* Interactive Challenge Type */}
            {generateInteractive && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interactive Challenge Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['algorithm', 'system_design', 'optimization', 'debugging'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={challengeType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChallengeType(type)}
                      className="capitalize"
                    >
                      {type.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Generation Button */}
            <div className="flex items-center gap-4">
              <Button
                onClick={generateProblems}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Generate {selectedCompany} Problems
                  </>
                )}
              </Button>

              {problems.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {problems.length} Problem{problems.length > 1 ? 's' : ''} Generated
                  </Badge>
                  {problems.length > 1 && (
                    <span className="text-sm text-gray-600">
                      Problem {currentProblemIndex + 1} of {problems.length}
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Company Insights */}
        {companyInsights && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {selectedCompany} Interview Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Interview Style</h4>
                  <p className="text-sm text-gray-600">{companyInsights.interviewStyle}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Common Topics</h4>
                  <div className="flex flex-wrap gap-1">
                    {companyInsights.commonTopics?.map((topic: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Focus Areas</h4>
                  <div className="flex flex-wrap gap-1">
                    {companyInsights.focusAreas?.map((area: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{companyInsights.difficultyDistribution?.easy || 0}%</div>
                    <div className="text-xs text-gray-600">Easy</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{companyInsights.difficultyDistribution?.medium || 0}%</div>
                    <div className="text-xs text-gray-600">Medium</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{companyInsights.difficultyDistribution?.hard || 0}%</div>
                    <div className="text-xs text-gray-600">Hard</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* DSA Compiler */}
        {currentProblem && (
          <div className="mb-8">
            {problems.length > 1 && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Problem {currentProblemIndex + 1}: {currentProblem.title}
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentProblemIndex(Math.max(0, currentProblemIndex - 1))}
                    disabled={currentProblemIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentProblemIndex(Math.min(problems.length - 1, currentProblemIndex + 1))}
                    disabled={currentProblemIndex === problems.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
            
            <EnhancedDSACompiler
              problem={currentProblem}
              onSubmit={handleProblemSubmit}
              timeLimit={companyInsights?.timeConstraints || 45}
              companyName={selectedCompany}
            />
          </div>
        )}

        {/* Instructions */}
        {!currentProblem && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                How to Use Enhanced DSA Compiler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 p-4 rounded-lg mb-3">
                    <Building className="w-8 h-8 text-blue-600 mx-auto" />
                  </div>
                  <h3 className="font-semibold mb-2">1. Choose Company</h3>
                  <p className="text-sm text-gray-600">
                    Select your target company to get problems that match their interview style and focus areas.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 p-4 rounded-lg mb-3">
                    <Users className="w-8 h-8 text-green-600 mx-auto" />
                  </div>
                  <h3 className="font-semibold mb-2">2. Set Experience Level</h3>
                  <p className="text-sm text-gray-600">
                    Choose your experience level to get appropriately challenging problems.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 p-4 rounded-lg mb-3">
                    <Sparkles className="w-8 h-8 text-purple-600 mx-auto" />
                  </div>
                  <h3 className="font-semibold mb-2">3. Generate & Practice</h3>
                  <p className="text-sm text-gray-600">
                    Generate unique problems and practice with real-time code execution and feedback.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default EnhancedDSATestPage;