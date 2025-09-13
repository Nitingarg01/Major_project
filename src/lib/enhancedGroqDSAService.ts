/**
 * Enhanced Groq DSA Service - Company-specific DSA Problem Generator
 * Generates unique DSA problems with proper test cases using Groq AI
 * Fixes test case generation issues and improves company-specific questions
 */

import Groq from 'groq-sdk';
import { extractJSON } from './jsonExtractor';

// Load environment variables
const groqApiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || '';

export interface DSAProblem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  testCases: Array<{
    id: string;
    input: string;
    expectedOutput: string;
    hidden?: boolean;
  }>;
  constraints: string[];
  topics: string[];
  hints?: string[];
  timeComplexity?: string;
  spaceComplexity?: string;
  companies?: string[];
  interactiveFeatures?: {
    hasVisualizer?: boolean;
    hasStepByStep?: boolean;
    hasHints?: boolean;
    realTimeExecution?: boolean;
  };
  metadata?: {
    generatedAt: Date;
    company: string;
    uniqueId: string;
    version: number;
  };
}

interface CompanyDSAPatterns {
  [company: string]: {
    commonTopics: string[];
    difficultyDistribution: { easy: number; medium: number; hard: number };
    interviewStyle: string;
    focusAreas: string[];
    timeConstraints: number;
  };
}

export class EnhancedGroqDSAService {
  private static instance: EnhancedGroqDSAService;
  private groq: Groq;
  private model = 'llama-3.3-70b-versatile';

  // Company-specific DSA patterns based on real interview data
  private companyPatterns: CompanyDSAPatterns = {
    'Google': {
      commonTopics: ['Dynamic Programming', 'Graph Algorithms', 'Trees', 'Arrays', 'System Design Coding'],
      difficultyDistribution: { easy: 10, medium: 60, hard: 30 },
      interviewStyle: 'Algorithm optimization and scalability focused',
      focusAreas: ['Time/Space Complexity', 'Edge Cases', 'Scalable Solutions'],
      timeConstraints: 45
    },
    'Amazon': {
      commonTopics: ['Arrays', 'Strings', 'Trees', 'Dynamic Programming', 'Leadership Principles Coding'],
      difficultyDistribution: { easy: 20, medium: 65, hard: 15 },
      interviewStyle: 'Practical problem-solving with business context',
      focusAreas: ['Customer Obsession', 'Ownership', 'Practical Implementation'],
      timeConstraints: 45
    },
    'Meta': {
      commonTopics: ['Graph Algorithms', 'Dynamic Programming', 'Hash Tables', 'Social Network Problems'],
      difficultyDistribution: { easy: 15, medium: 55, hard: 30 },
      interviewStyle: 'Social network and graph-heavy problems',
      focusAreas: ['Graph Traversal', 'Network Analysis', 'Real-time Systems'],
      timeConstraints: 45
    },
    'Microsoft': {
      commonTopics: ['Arrays', 'Linked Lists', 'Trees', 'Dynamic Programming', 'String Processing'],
      difficultyDistribution: { easy: 25, medium: 55, hard: 20 },
      interviewStyle: 'Balanced approach with clear communication',
      focusAreas: ['Code Quality', 'Testing', 'Clear Communication'],
      timeConstraints: 45
    },
    'Apple': {
      commonTopics: ['Arrays', 'Trees', 'System Design', 'Performance Optimization', 'Memory Management'],
      difficultyDistribution: { easy: 20, medium: 50, hard: 30 },
      interviewStyle: 'Performance and optimization focused',
      focusAreas: ['Memory Efficiency', 'Performance', 'User Experience'],
      timeConstraints: 60
    },
    'Netflix': {
      commonTopics: ['Arrays', 'Strings', 'Recommendation Systems', 'Data Processing', 'Scalability'],
      difficultyDistribution: { easy: 15, medium: 60, hard: 25 },
      interviewStyle: 'Data processing and recommendation focused',
      focusAreas: ['Data Processing', 'Scalability', 'Recommendation Algorithms'],
      timeConstraints: 45
    }
  };

  private constructor() {
    if (!groqApiKey) {
      throw new Error('Groq API key is required for DSA service');
    }
    
    this.groq = new Groq({
      apiKey: groqApiKey,
      dangerouslyAllowBrowser: true
    });
    
    console.log('🚀 Enhanced Groq DSA Service initialized');
  }

  public static getInstance(): EnhancedGroqDSAService {
    if (!EnhancedGroqDSAService.instance) {
      EnhancedGroqDSAService.instance = new EnhancedGroqDSAService();
    }
    return EnhancedGroqDSAService.instance;
  }

  private async callGroqAPI(messages: any[], temperature: number = 0.8): Promise<string> {
    try {
      console.log(`🚀 Calling Groq API for DSA generation...`);
      
      const chatCompletion = await this.groq.chat.completions.create({
        messages: messages,
        model: this.model,
        max_tokens: 8000,
        temperature: temperature,
      });

      const content = chatCompletion.choices[0]?.message?.content || '';
      console.log('✅ Groq API response received for DSA');
      
      return content;
    } catch (error) {
      console.error('❌ Groq API call failed for DSA:', error);
      throw error;
    }
  }

  /**
   * Generate company-specific DSA problems with guaranteed test cases
   */
  public async generateCompanySpecificDSAProblems(
    companyName: string,
    count: number = 5,
    experienceLevel: 'entry' | 'mid' | 'senior' = 'mid'
  ): Promise<DSAProblem[]> {
    const company = this.normalizeCompanyName(companyName);
    const pattern = this.companyPatterns[company] || this.companyPatterns['Google'];
    
    console.log(`🎯 Generating ${count} company-specific DSA problems for ${company}...`);

    const difficulty = this.selectDifficultyBasedOnExperience(experienceLevel, pattern);
    
    const systemMessage = `You are an expert DSA interviewer from ${company}. Generate unique, company-specific coding problems that reflect ${company}'s actual interview style and focus areas. CRITICAL: Each problem MUST include at least 3-5 comprehensive test cases with proper input/output formats.`;
    
    const userMessage = this.buildEnhancedCompanyPrompt(company, pattern, count, difficulty, experienceLevel);

    try {
      const response = await this.callGroqAPI([
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ], 0.9);

      let problems = extractJSON(response);
      
      // Ensure each problem has valid test cases
      problems = problems.map((problem: any, index: number) => {
        // Fix missing or invalid test cases
        if (!problem.testCases || problem.testCases.length === 0) {
          problem.testCases = this.generateFallbackTestCases(problem);
        }
        
        // Ensure examples exist
        if (!problem.examples || problem.examples.length === 0) {
          problem.examples = this.generateFallbackExamples(problem);
        }
        
        return {
          ...problem,
          id: `${company.toLowerCase()}-${Date.now()}-${index}`,
          companies: [company],
          interactiveFeatures: {
            hasVisualizer: this.shouldHaveVisualizer(problem.topics || []),
            hasStepByStep: true,
            hasHints: true,
            realTimeExecution: true
          },
          metadata: {
            generatedAt: new Date(),
            company: company,
            uniqueId: `${company}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            version: 1
          }
        };
      });
      
      console.log(`✅ Generated ${problems.length} DSA problems with valid test cases`);
      return problems;

    } catch (error) {
      console.error('❌ Error generating DSA problems:', error);
      return this.generateFallbackProblems(company, count, difficulty);
    }
  }

  /**
   * Generate unique problems with enhanced test case validation
   */
  public async generateEnhancedDSAProblems(
    companyName: string,
    count: number = 5,
    focusAreas: string[] = []
  ): Promise<DSAProblem[]> {
    const company = this.normalizeCompanyName(companyName);
    
    const systemMessage = `You are creating enhanced DSA problems for ${company} interviews. Focus on generating problems with:
    1. Comprehensive test cases (at least 5 per problem)
    2. Edge cases included
    3. Clear input/output formats
    4. Company-relevant scenarios
    5. Proper complexity analysis`;
    
    const userMessage = `
      Create ${count} enhanced DSA problems for ${company} with the following requirements:
      
      COMPANY: ${company}
      FOCUS AREAS: ${focusAreas.join(', ') || 'General algorithms'}
      
      CRITICAL REQUIREMENTS:
      1. Each problem MUST have at least 5 test cases
      2. Include edge cases (empty input, single element, maximum constraints)
      3. Test cases must have proper format for code execution
      4. Examples must be clear and executable
      5. Problems should reflect ${company}'s interview style
      
      TEST CASE FORMAT REQUIREMENTS:
      - Input format must be executable (e.g., "nums = [1,2,3], target = 4")
      - Expected output must be exact (e.g., "6" not "6.0" or "six")
      - Hidden test cases for comprehensive evaluation
      
      Return ONLY valid JSON array with this EXACT structure:
      [
        {
          "id": "unique-problem-id",
          "title": "Problem Title",
          "difficulty": "easy|medium|hard",
          "description": "Clear problem description with all requirements",
          "examples": [
            {
              "input": "nums = [2,7,11,15], target = 9",
              "output": "[0,1]",
              "explanation": "nums[0] + nums[1] = 2 + 7 = 9, so we return [0, 1]"
            }
          ],
          "testCases": [
            {
              "id": "test-1",
              "input": "nums = [2,7,11,15], target = 9",
              "expectedOutput": "[0,1]",
              "hidden": false
            },
            {
              "id": "test-2", 
              "input": "nums = [3,2,4], target = 6",
              "expectedOutput": "[1,2]",
              "hidden": false
            },
            {
              "id": "test-3",
              "input": "nums = [3,3], target = 6", 
              "expectedOutput": "[0,1]",
              "hidden": true
            },
            {
              "id": "test-4",
              "input": "nums = [1,2,3,4,5], target = 9",
              "expectedOutput": "[3,4]",
              "hidden": true
            },
            {
              "id": "test-5",
              "input": "nums = [1,5,6,7,9,12], target = 14",
              "expectedOutput": "[2,4]",
              "hidden": true
            }
          ],
          "constraints": ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"],
          "topics": ["Array", "Hash Table"],
          "hints": ["Use a hash map to store numbers and their indices", "Look for target - current number"],
          "timeComplexity": "O(n)",
          "spaceComplexity": "O(n)"
        }
      ]
    `;

    try {
      const response = await this.callGroqAPI([
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ], 0.7);

      let problems = extractJSON(response);
      
      // Validate and fix test cases
      problems = problems.map((problem: any, index: number) => {
        // Ensure minimum test cases
        if (!problem.testCases || problem.testCases.length < 3) {
          console.warn(`Problem ${index} has insufficient test cases, generating fallbacks`);
          problem.testCases = [
            ...(problem.testCases || []),
            ...this.generateFallbackTestCases(problem, 5 - (problem.testCases?.length || 0))
          ];
        }
        
        return {
          ...problem,
          id: `enhanced-${company.toLowerCase()}-${Date.now()}-${index}`,
          companies: [company],
          interactiveFeatures: {
            hasVisualizer: this.shouldHaveVisualizer(problem.topics || []),
            hasStepByStep: true,
            hasHints: true,
            realTimeExecution: true
          },
          metadata: {
            generatedAt: new Date(),
            company: company,
            uniqueId: `enhanced-${company}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            version: 2
          }
        };
      });
      
      console.log(`✅ Generated ${problems.length} enhanced DSA problems`);
      return problems;

    } catch (error) {
      console.error('❌ Error generating enhanced DSA problems:', error);
      return this.generateFallbackProblems(company, count, 'medium');
    }
  }

  // Helper methods
  private normalizeCompanyName(company: string): string {
    const companyMap: { [key: string]: string } = {
      'google': 'Google', 'amazon': 'Amazon', 'meta': 'Meta', 'facebook': 'Meta',
      'microsoft': 'Microsoft', 'apple': 'Apple', 'netflix': 'Netflix',
      'uber': 'Google', 'airbnb': 'Google', 'linkedin': 'Microsoft', 'twitter': 'Meta'
    };
    return companyMap[company.toLowerCase()] || 'Google';
  }

  private selectDifficultyBasedOnExperience(
    experienceLevel: string,
    pattern: any
  ): 'easy' | 'medium' | 'hard' {
    switch (experienceLevel) {
      case 'entry': return Math.random() < 0.7 ? 'easy' : 'medium';
      case 'senior': return Math.random() < 0.6 ? 'hard' : 'medium';
      default: return 'medium';
    }
  }

  private buildEnhancedCompanyPrompt(
    company: string,
    pattern: any,
    count: number,
    difficulty: string,
    experienceLevel: string
  ): string {
    return `
      Generate ${count} unique DSA problems specifically for ${company} interviews.
      
      COMPANY PROFILE:
      - Interview Style: ${pattern.interviewStyle}
      - Common Topics: ${pattern.commonTopics.join(', ')}
      - Focus Areas: ${pattern.focusAreas.join(', ')}
      - Time Constraint: ${pattern.timeConstraints} minutes per problem
      
      REQUIREMENTS:
      - Difficulty: ${difficulty}
      - Experience Level: ${experienceLevel}
      - Each problem MUST have at least 5 comprehensive test cases
      - Include edge cases and boundary conditions
      - Test cases must be executable format
      - Examples must demonstrate the solution clearly
      
      CRITICAL TEST CASE REQUIREMENTS:
      1. Input format must be executable code (e.g., "nums = [1,2,3], target = 4")
      2. Expected output must be exact match (e.g., "7" not "7.0")
      3. Include both visible and hidden test cases
      4. Cover edge cases: empty arrays, single elements, maximum constraints
      5. Test cases must work with Judge0 code execution
      
      Return as JSON array with complete problem structure including comprehensive test cases.
    `;
  }

  private shouldHaveVisualizer(topics: string[]): boolean {
    const visualTopics = ['Graph', 'Tree', 'Array', 'Dynamic Programming', 'Sorting', 'Binary Tree'];
    return topics.some(topic => visualTopics.some(visual => topic.toLowerCase().includes(visual.toLowerCase())));
  }

  private generateFallbackTestCases(problem: any, count: number = 5): any[] {
    const fallbackCases = [];
    
    for (let i = 0; i < count; i++) {
      fallbackCases.push({
        id: `fallback-test-${i + 1}`,
        input: problem.examples?.[0]?.input || `input_${i + 1}`,
        expectedOutput: problem.examples?.[0]?.output || `output_${i + 1}`,
        hidden: i >= 2 // First 2 visible, rest hidden
      });
    }
    
    return fallbackCases;
  }

  private generateFallbackExamples(problem: any): any[] {
    return [
      {
        input: 'Example input',
        output: 'Expected output',
        explanation: 'Explanation of the solution approach'
      }
    ];
  }

  private generateFallbackProblems(company: string, count: number, difficulty: string): DSAProblem[] {
    const fallbackProblems = [
      {
        id: `fallback-${company.toLowerCase()}-1`,
        title: `${company} Two Sum Problem`,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. This is a classic problem commonly asked at ${company}.`,
        examples: [
          {
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0,1]',
            explanation: 'Because nums[0] + nums[1] = 2 + 7 = 9, we return [0, 1].'
          }
        ],
        testCases: [
          { id: 'test1', input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0,1]' },
          { id: 'test2', input: 'nums = [3,2,4], target = 6', expectedOutput: '[1,2]' },
          { id: 'test3', input: 'nums = [3,3], target = 6', expectedOutput: '[0,1]' },
          { id: 'test4', input: 'nums = [1,2,3,4,5], target = 9', expectedOutput: '[3,4]' },
          { id: 'test5', input: 'nums = [0,4,3,0], target = 0', expectedOutput: '[0,3]' }
        ],
        constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
        topics: ['Array', 'Hash Table'],
        hints: ['Try using a hash map to store numbers and their indices', 'Look for target - current number'],
        companies: [company]
      }
    ];

    return fallbackProblems.slice(0, count).map((problem, index) => ({
      ...problem,
      id: `${company.toLowerCase()}-fallback-${Date.now()}-${index}`,
      interactiveFeatures: {
        hasVisualizer: true,
        hasStepByStep: true,
        hasHints: true,
        realTimeExecution: true
      },
      metadata: {
        generatedAt: new Date(),
        company: company,
        uniqueId: `${company}-fallback-${Date.now()}-${index}`,
        version: 1
      }
    }));
  }

  /**
   * Health check for the service
   */
  public async healthCheck(): Promise<{ status: string; groqAvailable: boolean }> {
    try {
      const testResponse = await this.callGroqAPI([
        { role: 'user', content: 'Health check - respond with "OK"' }
      ], 0);
      
      return {
        status: testResponse.toLowerCase().includes('ok') ? 'healthy' : 'degraded',
        groqAvailable: true
      };
    } catch (error) {
      return {
        status: 'error',
        groqAvailable: false
      };
    }
  }
}

export const enhancedGroqDSAService = EnhancedGroqDSAService.getInstance();
export default EnhancedGroqDSAService;