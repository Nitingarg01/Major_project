'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Play, Square, Check, X, Clock, Code, TestTube, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'

interface TestCase {
  id: string
  input: string
  expectedOutput: string
  description?: string
  hidden?: boolean
}

interface DSAProblem {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  examples: Array<{
    input: string
    output: string
    explanation?: string
  }>
  testCases: TestCase[]
  constraints: string[]
  topics: string[]
  hints?: string[]
}

interface DSACompilerProps {
  problem: DSAProblem
  onSubmit: (code: string, results: any) => void
  timeLimit?: number // in minutes
}

const DSACompiler: React.FC<DSACompilerProps> = ({ 
  problem, 
  onSubmit, 
  timeLimit = 45 
}) => {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60)
  const [showHints, setShowHints] = useState(false)
  const [currentHint, setCurrentHint] = useState(0)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Language templates
  const languageTemplates = {
    python: `def solution(${problem?.examples?.[0]?.input?.split(' ').map((_, i) => `param${i + 1}`).join(', ') || 'nums'}):
    # Write your solution here
    pass

# Test your solution
# result = solution(${problem?.examples?.[0]?.input || '[1,2,3]'})
# print(result)`,
    
    javascript: `function solution(${problem?.examples?.[0]?.input?.split(' ').map((_, i) => `param${i + 1}`).join(', ') || 'nums'}) {
    // Write your solution here
    
}

// Test your solution
// console.log(solution(${problem?.examples?.[0]?.input || '[1,2,3]'}));`,
    
    java: `public class Solution {
    public static ${getReturnType(problem)} solution(${getJavaParams(problem)}) {
        // Write your solution here
        
    }
    
    public static void main(String[] args) {
        // Test your solution
        // System.out.println(solution(${problem?.examples?.[0]?.input || 'new int[]{1,2,3}'}));
    }
}`,
    
    cpp: `#include <iostream>
#include <vector>
using namespace std;

${getCppReturnType(problem)} solution(${getCppParams(problem)}) {
    // Write your solution here
    
}

int main() {
    // Test your solution
    // cout << solution(${problem.examples[0]?.input || '{1,2,3}'}) << endl;
    return 0;
}`
  }

  useEffect(() => {
    setCode(languageTemplates[language as keyof typeof languageTemplates])
  }, [language])

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit() // Auto-submit when time is up
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const getTimeColor = () => {
    if (timeLeft <= 300) return 'text-red-600 bg-red-50' // Last 5 minutes
    if (timeLeft <= 600) return 'text-yellow-600 bg-yellow-50' // Last 10 minutes
    return 'text-green-600 bg-green-50'
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const runCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!')
      return
    }

    setIsRunning(true)
    toast.loading('Running your code...')

    try {
      // Mock code execution with test cases
      const results = await mockExecuteCode(code, language, problem.testCases)
      setTestResults(results)
      
      const passedCount = results.filter(r => r.passed).length
      const totalCount = results.length
      
      if (passedCount === totalCount) {
        toast.success(`✅ All ${totalCount} test cases passed!`)
      } else {
        toast.warning(`⚠️ ${passedCount}/${totalCount} test cases passed`)
      }
    } catch (error) {
      toast.error('Error running code: ' + error)
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = () => {
    const finalResults = {
      code,
      language,
      testResults,
      timeSpent: (timeLimit * 60) - timeLeft,
      problem: problem.id
    }
    
    onSubmit(code, finalResults)
  }

  const showNextHint = () => {
    if (problem.hints && currentHint < problem.hints.length - 1) {
      setCurrentHint(prev => prev + 1)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Code className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">{problem.title}</h1>
            <Badge className={getDifficultyColor(problem.difficulty)}>
              {problem.difficulty.toUpperCase()}
            </Badge>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getTimeColor()}`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Topics */}
        <div className="flex flex-wrap gap-2 mb-4">
          {problem.topics.map((topic, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {topic}
            </Badge>
          ))}
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
                <h4 className="font-semibold text-gray-800 mb-2">Examples:</h4>
                {problem.examples.map((example, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg mb-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Input:</span>
                        <code className="block bg-white p-2 rounded mt-1 font-mono text-sm">
                          {example.input}
                        </code>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Output:</span>
                        <code className="block bg-white p-2 rounded mt-1 font-mono text-sm">
                          {example.output}
                        </code>
                      </div>
                    </div>
                    {example.explanation && (
                      <div className="mt-2">
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
                <ul className="text-sm text-gray-700 space-y-1">
                  {problem.constraints.map((constraint, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      {constraint}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hints */}
              {problem.hints && problem.hints.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Hints
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
                    <div className="space-y-2">
                      {problem.hints.slice(0, currentHint + 1).map((hint, index) => (
                        <div key={index} className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Hint {index + 1}:</strong> {hint}
                          </p>
                        </div>
                      ))}
                      {currentHint < problem.hints.length - 1 && (
                        <Button variant="outline" size="sm" onClick={showNextHint}>
                          Show Next Hint
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Code Editor */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Code Editor
                </CardTitle>
                <div className="flex items-center gap-2">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="python">Python</option>
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
                placeholder="Write your code here..."
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
                      <Square className="w-4 h-4" />
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
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit Solution
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      result.passed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          Test Case {index + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          {result.passed ? (
                            <Check className="w-4 h-4 text-green-600" />
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
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-gray-600">Input:</span>
                          <code className="block bg-white p-2 rounded mt-1">
                            {result.input}
                          </code>
                        </div>
                        <div>
                          <span className="text-gray-600">Expected:</span>
                          <code className="block bg-white p-2 rounded mt-1">
                            {result.expected}
                          </code>
                        </div>
                      </div>
                      
                      {!result.passed && (
                        <div className="mt-2">
                          <span className="text-gray-600 text-xs">Your Output:</span>
                          <code className="block bg-white p-2 rounded mt-1 text-xs text-red-600">
                            {result.actual}
                          </code>
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
function getReturnType(problem: DSAProblem): string {
  // Simple heuristic based on problem examples
  const output = problem.examples[0]?.output || ''
  if (output.includes('[') || output.includes(',')) return 'int[]'
  if (!isNaN(Number(output))) return 'int'
  return 'String'
}

function getJavaParams(problem: DSAProblem): string {
  return 'int[] nums' // Simplified
}

function getCppReturnType(problem: DSAProblem): string {
  const output = problem.examples[0]?.output || ''
  if (output.includes('[') || output.includes(',')) return 'vector<int>'
  if (!isNaN(Number(output))) return 'int'
  return 'string'
}

function getCppParams(problem: DSAProblem): string {
  return 'vector<int>& nums' // Simplified
}

// Mock code execution function
async function mockExecuteCode(code: string, language: string, testCases: TestCase[]) {
  // Simulate code execution delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
  
  // Mock results - in real implementation, you'd use a code execution service
  return testCases.map((testCase, index) => {
    const passed = Math.random() > 0.3 // 70% pass rate for demo
    return {
      passed,
      input: testCase.input,
      expected: testCase.expectedOutput,
      actual: passed ? testCase.expectedOutput : 'Wrong output',
      executionTime: Math.random() * 100 + 'ms'
    }
  })
}

export default DSACompiler