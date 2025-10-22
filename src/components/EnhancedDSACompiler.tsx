'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { 
  Play, 
  Square, 
  Check, 
  X, 
  Clock, 
  Code, 
  TestTube, 
  Lightbulb, 
  Zap, 
  Brain,
  Target,
  AlertTriangle,
  CheckCircle,
  Save,
  RefreshCw,
  Building,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner';
import FixedJudge0Service from '@/lib/fixedJudge0Service';
import { DSAProblem } from '@/lib/enhancedDSAService';

interface EnhancedDSACompilerProps {
  problem: DSAProblem
  onSubmit: (code: string, results: any, timeSpent: number) => void
  timeLimit?: number // in minutes
  companyName?: string
}

interface CodeExecutionStats {
  totalRuns: number
  successfulRuns: number
  averageExecutionTime: number
  memoryUsage: number
  codeQualityScore: number
}

const EnhancedDSACompiler: React.FC<EnhancedDSACompilerProps> = ({ 
  problem, 
  onSubmit, 
  timeLimit = 45,
  companyName = 'Company';
}) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [codeExecutionStats, setCodeExecutionStats] = useState<CodeExecutionStats>({
    totalRuns: 0,
    successfulRuns: 0,
    averageExecutionTime: 0,
    memoryUsage: 0,
    codeQualityScore: 0
  })
  const [syntaxValid, setSyntaxValid] = useState<boolean | null>(null);
  const [autoSaveCount, setAutoSaveCount] = useState(0);
  const [showVisualizer, setShowVisualizer] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const judge0Service = FixedJudge0Service.getInstance();
  const startTime = useRef<Date>(new Date());

  // Enhanced language templates with company-specific context
  const languageTemplates = {
    python: `def solution(${getPythonParams(problem)}):
    """
    ${problem.title} - ${companyName} Interview Question
    
    ${problem.description.split('.')[0]}.
    
    Time Complexity: O(?)
    Space Complexity: O(?)
    
    Args:
        ${getPythonParams(problem)}: ${getParameterDescription(problem)}
    
    Returns:
        ${getPythonReturnType(problem)}: ${getReturnDescription(problem)}
    """
    # Write your solution here
    # Consider edge cases and optimization for ${companyName} standards
    pass

# Example usage:
# result = solution(${problem.examples[0]?.input || '[1,2,3]'});
# print(result)`,
    
    javascript: `function solution(${getJavaScriptParams(problem)}) {
    /**
     * ${problem.title} - ${companyName} Interview Question
     * 
     * ${problem.description.split('.')[0]}.
     * 
     * Time Complexity: O(?)
     * Space Complexity: O(?)
     * 
     * @param {${getJSParamTypes(problem)}} ${getJavaScriptParams(problem)} - ${getParameterDescription(problem)}
     * @returns {${getJSReturnType(problem)}} ${getReturnDescription(problem)}
     */
    // Write your solution here
    // Consider edge cases and optimization for ${companyName} standards
    
}

// Example usage:
// console.log(solution(${problem.examples[0]?.input || '[1,2,3]'}));`,
    
    java: `import java.util.*;

public class Solution {
    /**
     * ${problem.title} - ${companyName} Interview Question
     * 
     * ${problem.description.split('.')[0]}.
     * 
     * Time Complexity: O(?)
     * Space Complexity: O(?)
     * 
     * @param ${getJavaParams(problem)} ${getParameterDescription(problem)}
     * @return ${getJavaReturnType(problem)} ${getReturnDescription(problem)}
     */
    public static ${getJavaReturnType(problem)} solution(${getJavaParams(problem)}) {
        // Write your solution here
        // Consider edge cases and optimization for ${companyName} standards
        
    }
    
    public static void main(String[] args) {
        // Example usage:
        // System.out.println(solution(${problem.examples[0]?.input || 'new int[]{1,2,3}'}))
    }
}`,
    
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>
#include <unordered_map>
#include <unordered_set>
#include <string>
using namespace std;

/**
 * ${problem.title} - ${companyName} Interview Question
 * 
 * ${problem.description.split('.')[0]}.
 * 
 * Time Complexity: O(?)
 * Space Complexity: O(?)
 * 
 * @param ${getCppParams(problem)} ${getParameterDescription(problem)}
 * @return ${getCppReturnType(problem)} ${getReturnDescription(problem)}
 */
${getCppReturnType(problem)} solution(${getCppParams(problem)}) {
    // Write your solution here
    // Consider edge cases and optimization for ${companyName} standards
    
}

int main() {
    // Example usage:
    // cout << solution(${problem.examples[0]?.input || '{1,2,3}'}) << endl
    return 0;
}`
  }

  useEffect(() => {
    setCode(languageTemplates[language as keyof typeof languageTemplates]);
    setSyntaxValid(null);
  }, [language, problem])

  // Timer countdown with company-specific warnings
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit() // Auto-submit when time is up
          return 0;
        }
        
        // Company-specific time warnings
        if (prev === 300) { // 5 minutes left
          toast.warning(`⏰ 5 minutes remaining! ${companyName} interviews are time-critical.`);
        } else if (prev === 60) { // 1 minute left
          toast.error(`⏰ 1 minute remaining! Time to finalize your solution.`);
        }
        
        return prev - 1;
      })
    }, 1000)

    return () => clearInterval(timer);
  }, [])

  // Auto-save functionality with company branding
  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      if (code.trim() && code !== languageTemplates[language as keyof typeof languageTemplates]) {
        localStorage.setItem(`dsa_code_${companyName}_${problem.id}_${language}`, code);
        setAutoSaveCount(prev => prev + 1);
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(autoSaveTimer);
  }, [code, language, problem.id, companyName])

  // Load saved code on mount
  useEffect(() => {
    const saved = localStorage.getItem(`dsa_code_${companyName}_${problem.id}_${language}`);
    if (saved && saved !== languageTemplates[language as keyof typeof languageTemplates]) {
      setCode(saved);
    }
  }, [language, problem.id, companyName])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  const getTimeColor = () => {
    if (timeLeft <= 300) return 'text-red-600 bg-red-50 border-red-200' // Last 5 minutes
    if (timeLeft <= 600) return 'text-yellow-600 bg-yellow-50 border-yellow-200' // Last 10 minutes
    return 'text-green-600 bg-green-50 border-green-200';
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'hard': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  // Enhanced code execution with Fixed Judge0 service
  const runCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!');
      return
    }

    setIsRunning(true);
    const toastId = toast.loading(`Executing your code for ${companyName} interview...`);

    try {
      // Execute code with test cases using Fixed Judge0 service
      const results = await judge0Service.executeCode(code, language, problem.testCases || []);
      setTestResults(results.results || []);
      
      const passedCount = results.totalPassed || 0;
      const totalCount = results.totalTests || 0;
      
      // Handle compilation errors
      if (!results.success && results.compilationError) {
        toast.dismiss(toastId);
        toast.error('Compilation Error: ' + results.compilationError);
        return
      }

      // Handle runtime errors
      if (!results.success && results.runtimeError) {
        toast.dismiss(toastId);
        toast.error('Runtime Error: ' + results.runtimeError);
        return
      }
      
      // Update execution stats
      const avgTime = results.results.reduce((sum, r) => sum + (parseFloat(r.executionTime || '0') || 0), 0) / results.results.length;
      const avgMemory = results.results.reduce((sum, r) => sum + (r.memory || 0), 0) / results.results.length;
      
      setCodeExecutionStats(prev => ({
        totalRuns: prev.totalRuns + 1,
        successfulRuns: prev.successfulRuns + (passedCount === totalCount ? 1 : 0),
        averageExecutionTime: avgTime,
        memoryUsage: avgMemory,
        codeQualityScore: calculateCodeQuality(code, passedCount, totalCount)
      }))
      
      toast.dismiss(toastId);
      
      if (passedCount === totalCount) {
        toast.success(`🎉 All ${totalCount} test cases passed! Ready for ${companyName} submission.`, {
          description: `Avg execution time: ${avgTime.toFixed(3)}s`
        })
      } else if (passedCount > 0) {
        toast.warning(`⚠️ ${passedCount}/${totalCount} test cases passed`, {
          description: 'Review failed test cases for debugging'
        })
      } else {
        toast.error(`❌ 0/${totalCount} test cases passed`, {
          description: 'Check your logic and try again'
        })
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      console.error('Code execution error:', error);
      
      // Try fallback execution
      try {
        const fallbackResults = await judge0Service.executeCodeFallback(code, language, problem.testCases || []);
        setTestResults(fallbackResults.results || []);
        toast.warning('Using fallback execution (Judge0 temporarily unavailable)');
      } catch (fallbackError) {
        toast.error('Code execution failed: ' + error.message);
        setTestResults([]);
      }
    } finally {
      setIsRunning(false);
    }
  }

  // Calculate code quality score based on various factors
  const calculateCodeQuality = (code: string, passed: number, total: number): number => {
    let score = 0;
    
    // Test coverage (40% weight)
    score += (passed / total) * 40;
    
    // Code length (20% weight) - prefer concise but readable code
    const lines = code.split('\n').filter(line => line.trim()).length;
    const optimalLines = 50 // Assume 50 lines is optimal
    const lengthScore = Math.max(0, 20 - Math.abs(lines - optimalLines) * 0.4);
    score += lengthScore;
    
    // Comments and documentation (20% weight)
    const commentLines = code.split('\n').filter(line =>
      line.trim().startsWith('//') || 
      line.trim().startsWith('#') || 
      line.includes('"""') ||
      line.includes('/*');
    ).length
    score += Math.min(20, commentLines * 4);
    
    // Variable naming (10% weight)
    const hasGoodNaming = /[a-zA-Z][a-zA-Z0-9_]*[a-zA-Z]/.test(code);
    if (hasGoodNaming) score += 10;
    
    // Function structure (10% weight)
    const hasFunctions = /def |function |public |private/.test(code);
    if (hasFunctions) score += 10;
    
    return Math.min(100, score);
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const timeSpent = (timeLimit * 60) - timeLeft;

    try {
      // Final validation and execution
      let finalResults = testResults;
      if (testResults.length === 0) {
        const toastId = toast.loading('Running final tests before submission...');
        const executionResult = await judge0Service.executeCode(code, language, problem.testCases || []);
        finalResults = executionResult.results || []
        toast.dismiss(toastId);
      }

      const submissionData = {
        code,
        language,
        testResults: finalResults,
        timeSpent,
        problem: problem.id,
        company: companyName,
        executionStats: codeExecutionStats,
        complexity: {
          time: extractComplexity(code, 'time'),
          space: extractComplexity(code, 'space')
        },
        codeQuality: calculateCodeQuality(code, finalResults.filter(r => r.passed).length, finalResults.length),
        interactiveFeatures: problem.interactiveFeatures
      }
      
      // Clear auto-saved code
      localStorage.removeItem(`dsa_code_${companyName}_${problem.id}_${language}`);
      
      onSubmit(code, submissionData, timeSpent);
      
      toast.success(`🎯 Solution submitted successfully to ${companyName}!`, {
        description: `Time taken: ${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s`
      })
    } catch (error: any) {
      toast.error('Submission failed: ' + error.message)
    } finally {
      setIsSubmitting(false);
    }
  }

  const extractComplexity = (code: string, type: 'time' | 'space'): string => {
    const pattern = new RegExp(`${type}\\s*complexity[:\\s]*o\\(([^)]+)\\)`, 'i');
    const match = code.match(pattern);
    return match ? `O(${match[1]})` : 'Not specified'
  }

  const showNextHint = () => {
    if (problem.hints && currentHint < problem.hints.length - 1) {
      setCurrentHint(prev => prev + 1);
      toast.info(`💡 Hint ${currentHint + 2} revealed`);
    }
  }

  const getOverallProgress = () => {
    if (testResults.length === 0) return 0;
    return (testResults.filter(r => r.passed).length / testResults.length) * 100;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Enhanced Header with Company Branding */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <div>  
              <h1 className="text-2xl font-bold text-gray-800">{problem.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${getDifficultyColor(problem.difficulty)} border`}>
                  {problem.difficulty.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  <Building className="w-3 h-3 mr-1" />
                  {companyName}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Progress Indicator */}
            {testResults.length > 0 && (
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600">Progress</div>
                <div className="flex items-center gap-2">
                  <Progress value={getOverallProgress()} className="w-16 h-2" />
                  <span className="text-sm text-gray-500">
                    {testResults.filter(r => r.passed).length}/{testResults.length}
                  </span>
                </div>
              </div>
            )}
            
            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${getTimeColor()}`}>
              <Clock className="w-5 h-5" />
              <div className="text-center">
                <div className="font-mono font-bold text-lg">{formatTime(timeLeft)}</div>
                <div className="text-xs opacity-75">remaining</div>
              </div>
            </div>
          </div>
        </div>

        {/* Topics and Auto-save */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex flex-wrap gap-2">
            {problem.topics.map((topic, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                {topic}
              </Badge>
            ))}
          </div>
          
          {autoSaveCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Save className="w-3 h-3" />
              Auto-saved {autoSaveCount} times
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Description */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Problem Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">{problem.description}</p>
              </div>

              {/* Examples */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Examples:
                </h4>
                {problem.examples.map((example, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3 border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Input:</span>
                        <code className="block bg-white p-3 rounded mt-1 font-mono text-sm border">
                          {example.input}
                        </code>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Output:</span>
                        <code className="block bg-white p-3 rounded mt-1 font-mono text-sm border">
                          {example.output}
                        </code>
                      </div>
                    </div>
                    {example.explanation && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className="font-medium text-gray-600">Explanation:</span>
                        <p className="text-sm text-gray-700 mt-1">{example.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Constraints */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Constraints:</h4>
                <ul className="text-sm text-gray-700 space-y-1 bg-gray-50 p-3 rounded">
                  {problem.constraints.map((constraint, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      {constraint}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interactive Hints */}
              {problem.hints && problem.hints.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Hints ({currentHint + 1}/{problem.hints.length})
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHints(!showHints)}
                    >
                      {showHints ? 'Hide' : 'Show'} Hints
                    </Button>
                  </div>
                  {showHints && (
                    <div className="space-y-3">
                      {problem.hints.slice(0, currentHint + 1).map((hint, index) => (
                        <div key={index} className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>💡 Hint {index + 1}:</strong> {hint}
                          </p>
                        </div>
                      ))}
                      {currentHint < problem.hints.length - 1 && (
                        <Button variant="outline" size="sm" onClick={showNextHint}>
                          <Lightbulb className="w-4 h-4 mr-2" />
                          Show Next Hint
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Execution Stats */}
          {codeExecutionStats.totalRuns > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">{codeExecutionStats.totalRuns}</div>
                    <div className="text-blue-700">Total Runs</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600">{codeExecutionStats.successfulRuns}</div>
                    <div className="text-green-700">Successful</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded">
                    <div className="text-2xl font-bold text-purple-600">
                      {codeExecutionStats.averageExecutionTime.toFixed(3)}s
                    </div>
                    <div className="text-purple-700">Avg Time</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded">
                    <div className="text-2xl font-bold text-orange-600">
                      {codeExecutionStats.codeQualityScore.toFixed(0)}%
                    </div>
                    <div className="text-orange-700">Quality Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Enhanced Code Editor */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Code Editor
                  {syntaxValid !== null && (
                    <Badge variant={syntaxValid ? 'default' : 'destructive'} className="ml-2">
                      {syntaxValid ? 'Valid' : 'Syntax Error'}
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="python">Python 3</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Write your ${companyName} interview solution here...`}
                style={{ tabSize: 4 }}
              />
              
              <div className="flex items-center gap-3 mt-4">
                <Button
                  onClick={runCode}
                  disabled={isRunning}
                  className="flex items-center gap-2"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Code
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Submit to {companyName}
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => {
                    setCode(languageTemplates[language as keyof typeof languageTemplates]);
                    setSyntaxValid(null);
                    setTestResults([]);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Test Results */}
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  Test Results
                  <Badge variant={testResults.every(r => r.passed) ? 'default' : 'secondary'} className="ml-2">
                    {testResults.filter(r => r.passed).length}/{testResults.length} Passed
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div key={index} className={`p-4 rounded-lg border-2 ${
                      result.passed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-sm">
                          Test Case {index + 1}
                        </span>
                        <div className="flex items-center gap-3">
                          {result.executionTime && (
                            <span className="text-xs text-gray-500">
                              {result.executionTime}
                            </span>
                          )}
                          {result.memory && (
                            <span className="text-xs text-gray-500">
                              {result.memory} KB
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            {result.passed ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <X className="w-4 h-4 text-red-600" />
                            )}
                            <span className={`text-xs font-medium ${
                              result.passed ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {result.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-gray-600 font-medium">Input:</span>
                          <code className="block bg-white p-2 rounded mt-1 border">
                            {result.input}
                          </code>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium">Expected:</span>
                          <code className="block bg-white p-2 rounded mt-1 border">
                            {result.expected}
                          </code>
                        </div>
                      </div>
                      
                      {!result.passed && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="text-gray-600 font-medium text-xs">Your Output:</span>
                          <code className="block bg-white p-2 rounded mt-1 text-xs text-red-600 border">
                            {result.actual}
                          </code>
                          {result.error && (
                            <div className="mt-2">
                              <span className="text-gray-600 font-medium text-xs">Error:</span>
                              <code className="block bg-red-100 p-2 rounded mt-1 text-xs text-red-700 border border-red-200">
                                {result.error}
                              </code>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper functions for language templates
function getPythonParams(problem: DSAProblem): string {
  if (problem.title.toLowerCase().includes('two sum')) return 'nums, target'
  if (problem.title.toLowerCase().includes('array')) return 'nums'
  if (problem.title.toLowerCase().includes('string')) return 's'
  if (problem.title.toLowerCase().includes('tree')) return 'root'
  if (problem.title.toLowerCase().includes('list')) return 'head'
  return 'nums';
}

function getPythonReturnType(problem: DSAProblem): string {
  const output = problem.examples[0]?.output || '';
  if (output.includes('[')) return 'List'
  if (output.includes('true') || output.includes('false')) return 'bool'
  if (!isNaN(Number(output))) return 'int'
  return 'str';
}

function getJavaScriptParams(problem: DSAProblem): string {
  return getPythonParams(problem);
}

function getJSParamTypes(problem: DSAProblem): string {
  if (problem.title.toLowerCase().includes('array')) return 'number[]'
  if (problem.title.toLowerCase().includes('string')) return 'string'
  return 'any';
}

function getJSReturnType(problem: DSAProblem): string {
  const output = problem.examples[0]?.output || '';
  if (output.includes('[')) return 'number[]'
  if (output.includes('true') || output.includes('false')) return 'boolean'
  if (!isNaN(Number(output))) return 'number'
  return 'string';
}

function getJavaReturnType(problem: DSAProblem): string {
  const output = problem.examples[0]?.output || '';
  if (output.includes('[') || output.includes(',')) return 'int[]'
  if (!isNaN(Number(output))) return 'int'
  if (output.includes('true') || output.includes('false')) return 'boolean'
  return 'String';
}

function getJavaParams(problem: DSAProblem): string {
  if (problem.title.toLowerCase().includes('two sum')) return 'int[] nums, int target'
  if (problem.title.toLowerCase().includes('array')) return 'int[] nums'
  if (problem.title.toLowerCase().includes('string')) return 'String s'
  return 'int[] nums';
}

function getCppReturnType(problem: DSAProblem): string {
  const output = problem.examples[0]?.output || '';
  if (output.includes('[') || output.includes(',')) return 'vector<int>'
  if (!isNaN(Number(output))) return 'int'
  if (output.includes('true') || output.includes('false')) return 'bool'
  return 'string';
}

function getCppParams(problem: DSAProblem): string {
  if (problem.title.toLowerCase().includes('two sum')) return 'vector<int>& nums, int target'
  if (problem.title.toLowerCase().includes('array')) return 'vector<int>& nums'
  if (problem.title.toLowerCase().includes('string')) return 'string s'
  return 'vector<int>& nums';
}

function getParameterDescription(problem: DSAProblem): string {
  if (problem.title.toLowerCase().includes('two sum')) return 'Array of integers and target sum'
  if (problem.title.toLowerCase().includes('array')) return 'Input array of integers'
  if (problem.title.toLowerCase().includes('string')) return 'Input string to process'
  return 'Input parameters as specified in problem';
}

function getReturnDescription(problem: DSAProblem): string {
  if (problem.title.toLowerCase().includes('two sum')) return 'Indices of two numbers that add up to target'
  return 'Result as specified in problem description';
}

export default EnhancedDSACompiler;