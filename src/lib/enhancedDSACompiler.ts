/**
 * Enhanced DSA Compiler Service
 * Advanced code execution with company-specific problem support
 * Integrates with EnhancedGroqAIService for intelligent problem generation
 */

import EnhancedGroqAIService from './enhancedGroqAIService';

interface CompilerLanguage {
  id: number;
  name: string;
  label: string;
  fileExtension: string;
  template: string;
  compileCommand?: string;
  runCommand: string;
}

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  hidden?: boolean;
}

interface DSAProblem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  testCases: TestCase[];
  constraints: string[];
  topics: string[];
  hints?: string[];
  timeComplexity?: string;
  spaceComplexity?: string;
  companyContext?: string;
  realWorldApplication?: string;
}

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  memory: number;
  testResults?: TestResult[];
}

interface TestResult {
  testCase: TestCase;
  passed: boolean;
  actualOutput: string;
  executionTime: number;
  error?: string;
}

interface CompilerSubmission {
  sourceCode: string;
  language: string;
  problem: DSAProblem;
  companyName: string;
}

export class EnhancedDSACompiler {
  private static instance: EnhancedDSACompiler;
  private aiService: EnhancedGroqAIService;
  private judge0ApiKey: string;
  private judge0Host: string;
  private judge0BaseUrl: string;

  // Enhanced language support with better templates
  private languages: CompilerLanguage[] = [
    {
      id: 71, // Python 3
      name: 'python',
      label: 'Python 3.9',
      fileExtension: '.py',
      template: `# Enhanced Python Template for Company DSA Problems
# Time Complexity: O(?)
# Space Complexity: O(?)

def solution():
    """
    Solve the problem step by step:
    1. Understand the requirements
    2. Design the algorithm
    3. Implement with optimal complexity
    4. Test with examples
    """
    # Your code here
    pass

def main():
    # Read input
    # Call solution
    # Print output
    pass

if __name__ == "__main__":;
    main();
`
    },
    {
      id: 54, // C++17
      name: 'cpp',
      label: 'C++ 17',
      fileExtension: '.cpp',
      template: `// Enhanced C++ Template for Company DSA Problems
// Time Complexity: O(?)
// Space Complexity: O(?)

#include <iostream>
#include <vector>
#include <algorithm>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <stack>
#include <string>
using namespace std;

class Solution {
public:
    // Main solution function
    auto solve() {
        // Your algorithm implementation here
        
        return result;
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    Solution solution;
    // Read input, call solve(), output result
    
    return 0;
}
`
    },
    {
      id: 62, // Java 13
      name: 'java',
      label: 'Java 13',
      fileExtension: '.java',
      template: `// Enhanced Java Template for Company DSA Problems
// Time Complexity: O(?)
// Space Complexity: O(?)

import java.util.*;
import java.io.*;

public class Solution {
    
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        Solution solution = new Solution();
        
        // Read input, call solve method, output result
    }
    
    public Object solve() {
        // Your algorithm implementation here
        
        return result;
    }
}
`
    },
    {
      id: 63, // JavaScript (Node.js)
      name: 'javascript',
      label: 'JavaScript (Node.js)',
      fileExtension: '.js',
      template: `// Enhanced JavaScript Template for Company DSA Problems
// Time Complexity: O(?)
// Space Complexity: O(?)

const readline = require('readline');

class Solution {
    solve() {
        // Your algorithm implementation here
        
        return result;
    }
}

// Input handling
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const solution = new Solution();
// Read input, call solve(), output result
`
    },
    {
      id: 70, // TypeScript
      name: 'typescript', 
      label: 'TypeScript',
      fileExtension: '.ts',
      template: `// Enhanced TypeScript Template for Company DSA Problems
// Time Complexity: O(?)
// Space Complexity: O(?)

class Solution {
    solve(): any {
        // Your algorithm implementation here
        
        return result;
    }
}

// Input handling and execution
const solution = new Solution();
// Read input, call solve(), output result
`
    }
  ];

  private constructor() {
    this.aiService = EnhancedGroqAIService.getInstance();
    this.judge0ApiKey = process.env.JUDGE0_API_KEY || process.env.NEXT_PUBLIC_JUDGE0_API_KEY || '';
    this.judge0Host = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';
    this.judge0BaseUrl = `https://${this.judge0Host}`
    
    if (!this.judge0ApiKey) {
      console.warn('⚠️ Judge0 API key not found - compiler will use mock results');
    }
    
    console.log('🔧 Enhanced DSA Compiler initialized with advanced features');
  }

  public static getInstance(): EnhancedDSACompiler {
    if (!EnhancedDSACompiler.instance) {
      EnhancedDSACompiler.instance = new EnhancedDSACompiler();
    }
    return EnhancedDSACompiler.instance;
  }

  // Generate company-specific DSA problems
  public async generateCompanyProblems(
    companyName: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    count: number = 3,
    jobTitle: string = 'Software Engineer';
  ): Promise<DSAProblem[]> {
    try {
      console.log(`🎯 Generating ${count} ${difficulty} DSA problems for ${companyName}...`);
      
      const problems = await this.aiService.generateCompanySpecificDSAProblems(
        companyName,
        difficulty,
        count,
        jobTitle
      );
      
      console.log(`✅ Generated ${problems.length} company-specific problems`);
      return problems;
    } catch (error) {
      console.error('❌ Error generating company problems:', error);
      return this.generateFallbackProblems(companyName, difficulty, count);
    }
  }

  // Execute code with comprehensive testing
  public async executeCode(submission: CompilerSubmission): Promise<ExecutionResult> {
    if (!this.judge0ApiKey) {
      console.warn('⚠️ Judge0 not available, using mock execution');
      return this.generateMockExecution(submission);
    }

    try {
      const language = this.languages.find(lang => lang.name === submission.language);
      if (!language) {
        throw new Error(`Unsupported language: ${submission.language}`);
      }

      console.log(`🚀 Executing ${language.label} code for ${submission.problem.title}...`);
      
      const testResults: TestResult[] = [];
      let allPassed = true;
      let totalExecutionTime = 0;
      let maxMemory = 0;

      // Run code against all test cases
      for (const testCase of submission.problem.testCases) {
        const result = await this.runSingleTest(
          submission.sourceCode,
          language.id,
          testCase
        );
        
        testResults.push(result);
        if (!result.passed) allPassed = false;
        totalExecutionTime += result.executionTime;
        maxMemory = Math.max(maxMemory, 0); // Judge0 doesn't always provide memory info
      }

      const avgExecutionTime = totalExecutionTime / testResults.length;

      // Provide intelligent feedback based on results
      let feedback = this.generateExecutionFeedback(
        testResults,
        submission.problem,
        submission.companyName
      );

      console.log(`✅ Code execution completed: ${testResults.filter(r => r.passed).length}/${testResults.length} tests passed`);

      return {
        success: allPassed,
        output: feedback,
        executionTime: avgExecutionTime,
        memory: maxMemory,
        testResults: testResults
      };

    } catch (error) {
      console.error('❌ Code execution failed:', error);
      return {
        success: false,
        output: 'Execution failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: 0,
        memory: 0
      };
    }
  }

  // Run code against a single test case  
  private async runSingleTest(
    sourceCode: string,
    languageId: number,
    testCase: TestCase
  ): Promise<TestResult> {
    try {
      // Submit code to Judge0
      const submissionResponse = await fetch(`${this.judge0BaseUrl}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': this.judge0ApiKey,
          'X-RapidAPI-Host': this.judge0Host
        },
        body: JSON.stringify({
          source_code: sourceCode,
          language_id: languageId,
          stdin: testCase.input,
          expected_output: testCase.expectedOutput
        })
      });

      if (!submissionResponse.ok) {
        throw new Error(`Submission failed: ${submissionResponse.statusText}`);
      }

      const submissionData = await submissionResponse.json();
      const token = submissionData.token;

      // Wait for execution to complete
      await this.delay(1000); // Give it time to process

      // Get result
      const resultResponse = await fetch(`${this.judge0BaseUrl}/submissions/${token}`, {
        headers: {
          'X-RapidAPI-Key': this.judge0ApiKey,
          'X-RapidAPI-Host': this.judge0Host
        }
      });

      if (!resultResponse.ok) {
        throw new Error(`Result fetch failed: ${resultResponse.statusText}`);
      }

      const result = await resultResponse.json();
      
      const actualOutput = (result.stdout || '').trim();
      const expectedOutput = testCase.expectedOutput.trim();
      const passed = actualOutput === expectedOutput;
      const executionTime = parseFloat(result.time || '0') * 1000; // Convert to ms

      return {
        testCase: testCase,
        passed: passed,
        actualOutput: actualOutput,
        executionTime: executionTime,
        error: result.stderr || undefined
      };

    } catch (error) {
      return {
        testCase: testCase,
        passed: false,
        actualOutput: '',
        executionTime: 0,
        error: error instanceof Error ? error.message : 'Test execution failed'
      };
    }
  }

  // Generate intelligent feedback based on execution results
  private generateExecutionFeedback(
    testResults: TestResult[],
    problem: DSAProblem,
    companyName: string
  ): string {
    const passedTests = testResults.filter(r => r.passed).length;
    const totalTests = testResults.length;
    const avgTime = testResults.reduce((sum, r) => sum + r.executionTime, 0) / totalTests;

    let feedback = `🔍 EXECUTION RESULTS for ${problem.title}\n`;
    feedback += `📊 Tests Passed: ${passedTests}/${totalTests}\n`;
    feedback += `⏱️ Average Execution Time: ${avgTime.toFixed(2)}ms\n\n`;

    if (passedTests === totalTests) {
      feedback += `🎉 EXCELLENT! All test cases passed!\n`;
      feedback += `💡 Your solution correctly handles ${companyName}'s requirements.\n`;
      
      if (problem.companyContext) {
        feedback += `🏢 Company Relevance: ${problem.companyContext}\n`;
      }
      
      if (problem.realWorldApplication) {
        feedback += `🌍 Real-world Application: ${problem.realWorldApplication}\n`;
      }
      
      feedback += `\n🚀 Next Steps:\n`;
      feedback += `- Consider time/space complexity optimization\n`;
      feedback += `- Think about edge cases in ${companyName}'s environment\n`;
      feedback += `- Review the algorithm for production readiness\n`;
    } else {
      feedback += `❌ Some test cases failed. Let's analyze:\n\n`;
      
      testResults.forEach((result, index) => {
        if (!result.passed) {
          feedback += `Test ${index + 1} FAILED:\n`;
          feedback += `Input: ${result.testCase.input}\n`;
          feedback += `Expected: ${result.testCase.expectedOutput}\n`;
          feedback += `Got: ${result.actualOutput}\n`;
          if (result.error) {
            feedback += `Error: ${result.error}\n`;
          }
          feedback += `\n`;
        }
      });
      
      feedback += `💡 Debugging Tips for ${companyName} problems:\n`;
      feedback += `- Check edge cases and boundary conditions\n`;
      feedback += `- Verify input parsing and output formatting\n`;
      feedback += `- Consider ${companyName}'s specific data patterns\n`;
      
      if (problem.hints) {
        feedback += `\n🔍 Hints:\n`;
        problem.hints.forEach(hint => {
          feedback += `- ${hint}\n`;
        });
      }
    }

    return feedback;
  }

  // Get available programming languages
  public getAvailableLanguages(): CompilerLanguage[] {
    return this.languages;
  }

  // Get template for a specific language
  public getLanguageTemplate(languageName: string): string {
    const language = this.languages.find(lang => lang.name === languageName);
    return language?.template || '// Code template not found'
  }

  // Health check for compiler service
  public async healthCheck(): Promise<{
    judge0Available: boolean;
    languagesSupported: number;
    status: string;
  }> {
    try {
      if (!this.judge0ApiKey) {
        return {
          judge0Available: false,
          languagesSupported: this.languages.length,
          status: 'judge0_not_configured'
        };
      }

      // Test Judge0 connectivity
      const response = await fetch(`${this.judge0BaseUrl}/languages`, {
        headers: {
          'X-RapidAPI-Key': this.judge0ApiKey,
          'X-RapidAPI-Host': this.judge0Host
        }
      });

      return {
        judge0Available: response.ok,
        languagesSupported: this.languages.length,
        status: response.ok ? 'healthy' : 'judge0_unavailable'
      };
    } catch (error) {
      return {
        judge0Available: false,
        languagesSupported: this.languages.length,
        status: 'error'
      };
    }
  }

  // Utility methods
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateMockExecution(submission: CompilerSubmission): ExecutionResult {
    const testResults: TestResult[] = submission.problem.testCases.map((testCase, index) => ({
      testCase: testCase,
      passed: Math.random() > 0.3, // 70% pass rate for demo
      actualOutput: testCase.expectedOutput,
      executionTime: Math.random() * 100 + 50
    }));

    const passedTests = testResults.filter(r => r.passed).length;
    const allPassed = passedTests === testResults.length;

    return {
      success: allPassed,
      output: this.generateExecutionFeedback(testResults, submission.problem, submission.companyName),
      executionTime: testResults.reduce((sum, r) => sum + r.executionTime, 0) / testResults.length,
      memory: Math.random() * 50 + 10,
      testResults: testResults
    };
  }

  private generateFallbackProblems(companyName: string, difficulty: string, count: number): DSAProblem[] {
    const problems: DSAProblem[] = [];
    
    const templates = [
      {
        title: `${companyName} Data Processing Challenge`,
        description: `At ${companyName}, you need to efficiently process large datasets. Design an algorithm that can handle their scale.`,
        topics: ['Array', 'Hash Table']
      },
      {
        title: `${companyName} System Optimization`,
        description: `Help ${companyName} optimize their system performance by solving this algorithmic challenge.`,
        topics: ['Dynamic Programming', 'Optimization']
      }
    ];

    for (let i = 0; i < count; i++) {
      const template = templates[i % templates.length];
      problems.push({
        id: `fallback-${companyName.toLowerCase()}-${i}`,
        title: template.title,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        description: template.description,
        examples: [
          {
            input: 'Sample input',
            output: 'Expected output',
            explanation: `This solution addresses ${companyName}'s specific requirements.`
          }
        ],
        testCases: [
          {
            id: `test-${i}`,
            input: '5\n1 2 3 4 5',
            expectedOutput: '15'
          }
        ],
        constraints: [`Optimized for ${companyName}'s scale`, 'Efficient memory usage'],
        topics: template.topics,
        hints: [`Consider ${companyName}'s specific requirements`, 'Think about edge cases'],
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        companyContext: `Relevant to ${companyName}'s engineering challenges`,
        realWorldApplication: `Used in ${companyName}'s production systems`
      });
    }
    
    return problems;
  }
}

export const enhancedDSACompiler = EnhancedDSACompiler.getInstance();
export default EnhancedDSACompiler;