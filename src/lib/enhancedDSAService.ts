/**
 * Enhanced DSA Service - Company-specific and Interactive DSA Problem Generator
 * Generates unique DSA problems for Google, Amazon, Meta, Microsoft, etc.
 * Features: Interactive challenges, real-time compilation, company-specific patterns
 */

import GroqAIService from './groqAIService';
import { extractJSON } from './jsonExtractor';

export interface DSAProblem {
  id: string,
  title: string,
  difficulty: 'easy' | 'medium' | 'hard',
  description: string,
  examples: Array<{
    input: string,
    output: string,
    explanation?: string
  }>;
  testCases: Array<{
    id: string,
    input: string,
    expectedOutput: string,
    hidden?: boolean
  }>;
  constraints: string[],
  topics: string[],
  hints?: string[],
  timeComplexity?: string,
  spaceComplexity?: string,
  companies?: string[],
  interactiveFeatures?: {
    hasVisualizer?: boolean,
    hasStepByStep?: boolean,
    hasHints?: boolean,
    realTimeExecution?: boolean
  };
  metadata?: {
    generatedAt: Date,
    company: string,
    uniqueId: string,
    version: number
  };
}

interface CompanyDSAPatterns {
  [company: string]: {
    commonTopics: string[],
    difficultyDistribution: { easy: number; medium: number; hard: number };
    interviewStyle: string,
    focusAreas: string[],
    timeConstraints: number; // minutes
  };
}

export class EnhancedDSAService {
  private static instance: EnhancedDSAService,
  private emergentIntegration = emergentIntegration;

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
    console.log('🚀 Enhanced DSA Service initialized with company patterns:', Object.keys(this.companyPatterns))
  }

  public static getInstance(): EnhancedDSAService {
    if (!EnhancedDSAService.instance) {
      EnhancedDSAService.instance = new EnhancedDSAService();
    }
    return EnhancedDSAService.instance;
  }

  /**
   * Generate unique company-specific DSA problems
   */
  public async generateCompanySpecificDSAProblems(
    companyName: string,
    count: number = 5,
    experienceLevel: 'entry' | 'mid' | 'senior' = 'mid';
  ): Promise<DSAProblem[]> {
    const company = this.normalizeCompanyName(companyName);
    const pattern = this.companyPatterns[company] || this.companyPatterns['Google'];
    
    console.log(`🎯 Generating ${count} unique DSA problems for ${company}...`);

    const difficulty = this.selectDifficultyBasedOnExperience(experienceLevel, pattern);
    
    const systemMessage = `You are an expert DSA interviewer from ${company}. Generate unique, company-specific coding problems that reflect ${company}'s actual interview style and focus areas.`;
    
    const userMessage = this.buildCompanySpecificPrompt(company, pattern, count, difficulty, experienceLevel);

    try {
      const response = await this.emergentIntegration.makeRequest(;
        [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        'dsa_generation',
        {
          provider: 'openai',
          model: 'gpt-4o-mini',
          temperature: 0.9, // Higher temperature for more creative/unique problems
          max_tokens: 6000
        }
      );

      const problems = extractJSON(response.content);
      
      return problems.map((problem: any, index: number) => ({
        ...problem,
        id: `${company.toLowerCase()}-${Date.now()}-${index}`,
        companies: [company],
        interactiveFeatures: {
          hasVisualizer: this.shouldHaveVisualizer(problem.topics),
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
      }));

    } catch (error) {
      console.error('❌ Error generating company-specific DSA problems:', error);
      return this.generateFallbackProblems(company, count, difficulty);
    }
  }

  /**
   * Generate interactive coding challenges with real-time features
   */
  public async generateInteractiveCodingChallenges(
    companyName: string,
    challengeType: 'algorithm' | 'system_design' | 'optimization' | 'debugging' = 'algorithm',
    count: number = 3;
  ): Promise<DSAProblem[]> {
    const company = this.normalizeCompanyName(companyName);
    
    console.log(`🎮 Generating ${count} interactive coding challenges for ${company}...`);

    const systemMessage = `You are creating interactive coding challenges for ${company} interviews. Focus on problems that benefit from step-by-step visualization and real-time feedback.`;
    
    const userMessage = `;
      Create ${count} interactive ${challengeType} coding challenges for ${company}.
      
      Requirements:
      - Each problem should be suitable for interactive visualization
      - Include step-by-step breakdown opportunities
      - Add multiple test cases with varying complexity
      - Focus on ${company}'s interview style: ${this.companyPatterns[company]?.interviewStyle || 'comprehensive problem-solving'}
      
      For each problem, include:
      1. Clear problem statement with visual examples
      2. Multiple test cases (including edge cases)
      3. Step-by-step solution approach
      4. Interactive elements (what can be visualized)
      5. Real-time execution checkpoints
      
      Return as JSON array with this structure:
      [
        {
          "id": "unique-challenge-id",
          "title": "Challenge Title",
          "difficulty": "easy|medium|hard",
          "description": "Detailed problem description with interactive elements",
          "examples": [
            {
              "input": "sample input",
              "output": "expected output",
              "explanation": "step-by-step explanation",
              "visualSteps": ["step1", "step2", "step3"]
            }
          ],
          "testCases": [
            {
              "id": "test-1",
              "input": "test input",
              "expectedOutput": "expected result",
              "hidden": false,
              "visualizable": true
            }
          ],
          "constraints": ["constraint1", "constraint2"],
          "topics": ["relevant", "topics"],
          "hints": ["progressive hints"],
          "interactiveElements": {
            "visualization": "what can be visualized",
            "stepByStep": true,
            "realTimeValidation": true,
            "progressTracking": true
          },
          "timeComplexity": "O(?)",
          "spaceComplexity": "O(?)"
        }
      ]
    `;

    try {
      const response = await this.emergentIntegration.makeRequest(;
        [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        'interactive_challenges',
        {
          provider: 'openai',
          model: 'gpt-4o-mini',
          temperature: 0.8,
          max_tokens: 8000
        }
      );

      const challenges = extractJSON(response.content);
      
      return challenges.map((challenge: any, index: number) => ({
        ...challenge,
        id: `${company.toLowerCase()}-interactive-${Date.now()}-${index}`,
        companies: [company],
        interactiveFeatures: {
          hasVisualizer: true,
          hasStepByStep: true,
          hasHints: true,
          realTimeExecution: true,
          ...challenge.interactiveElements
        },
        metadata: {
          generatedAt: new Date(),
          company: company,
          uniqueId: `${company}-interactive-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          version: 1,
          challengeType
        }
      }));

    } catch (error) {
      console.error('❌ Error generating interactive challenges:', error);
      return this.generateFallbackInteractiveChallenges(company, count);
    }
  }

  /**
   * Generate completely unique problems every time (no repeats)
   */
  public async generateUniqueProblems(
    companyName: string,
    previousProblemIds: string[] = [],
    count: number = 5,
    experienceLevel: 'entry' | 'mid' | 'senior' = 'mid';
  ): Promise<DSAProblem[]> {
    const company = this.normalizeCompanyName(companyName);
    const uniquenessSeed = Date.now() + Math.random();
    
    console.log(`🔄 Generating ${count} completely unique problems for ${company} (avoiding ${previousProblemIds.length} previous problems)...`);

    const systemMessage = `You are a creative DSA problem generator for ${company}. Create completely NEW and UNIQUE problems that have never been asked before. Be innovative and creative while maintaining ${company}'s interview standards.`;
    
    const userMessage = `;
      Create ${count} COMPLETELY UNIQUE and NOVEL DSA problems for ${company} interviews.
      
      UNIQUENESS REQUIREMENTS:
      - Avoid common LeetCode problems
      - Create original scenarios and contexts
      - Use fresh examples and applications
      - Innovation seed: ${uniquenessSeed}
      
      COMPANY CONTEXT: ${company}
      - Interview Style: ${this.companyPatterns[company]?.interviewStyle || 'comprehensive'}
      - Focus Areas: ${this.companyPatterns[company]?.focusAreas?.join(', ') || 'general algorithms'}
      - Experience Level: ${experienceLevel}
      
      CREATIVITY GUIDELINES:
      - Use real-world scenarios relevant to ${company}'s business
      - Create problems with interesting twists
      - Include multiple valid approaches
      - Add creative constraints that make the problem unique
      
      Previous problem IDs to AVOID duplicating: ${previousProblemIds.join(', ')}
      
      Return JSON array with completely original problems following the standard structure.
    `;

    try {
      const response = await this.emergentIntegration.makeRequest(;
        [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        'unique_dsa_generation',
        {
          provider: 'openai',
          model: 'gpt-4o-mini',
          temperature: 1.0, // Maximum creativity
          max_tokens: 8000
        }
      );

      const problems = extractJSON(response.content);
      
      return problems.map((problem: any, index: number) => ({
        ...problem,
        id: `${company.toLowerCase()}-unique-${uniquenessSeed}-${index}`,
        companies: [company],
        interactiveFeatures: {
          hasVisualizer: this.shouldHaveVisualizer(problem.topics),
          hasStepByStep: true,
          hasHints: true,
          realTimeExecution: true
        },
        metadata: {
          generatedAt: new Date(),
          company: company,
          uniqueId: `${company}-unique-${uniquenessSeed}-${Math.random().toString(36).substr(2, 9)}`,
          version: 1,
          uniquenessSeed
        }
      }));

    } catch (error) {
      console.error('❌ Error generating unique problems:', error);
      return this.generateFallbackProblems(company, count, 'medium');
    }
  }

  // Helper methods
  private normalizeCompanyName(company: string): string {
    const companyMap: { [key: string]: string } = {
      'google': 'Google',
      'amazon': 'Amazon',
      'meta': 'Meta',
      'facebook': 'Meta',
      'microsoft': 'Microsoft',
      'apple': 'Apple',
      'netflix': 'Netflix',
      'uber': 'Google', // Fallback to Google pattern
      'airbnb': 'Google',
      'linkedin': 'Microsoft',
      'twitter': 'Meta'
    };

    return companyMap[company.toLowerCase()] || 'Google';
  }

  private selectDifficultyBasedOnExperience(
    experienceLevel: string,
    pattern: any
  ): 'easy' | 'medium' | 'hard' {
    switch (experienceLevel) {
      case 'entry':
        return Math.random() < 0.7 ? 'easy' : 'medium',
      case 'senior':
        return Math.random() < 0.6 ? 'hard' : 'medium',
      default: // mid
        const rand = Math.random() * 100;
        if (rand < pattern.difficultyDistribution.easy) return 'easy';
        if (rand < pattern.difficultyDistribution.easy + pattern.difficultyDistribution.medium) return 'medium';
        return 'hard';
    }
  }

  private buildCompanySpecificPrompt(
    company: string,
    pattern: any,
    count: number,
    difficulty: string,
    experienceLevel: string
  ): string {
    return `;
      Generate ${count} unique DSA problems specifically tailored for ${company} interviews.
      
      COMPANY PROFILE:
      - Interview Style: ${pattern.interviewStyle}
      - Common Topics: ${pattern.commonTopics.join(', ')}
      - Focus Areas: ${pattern.focusAreas.join(', ')}
      - Time Constraint: ${pattern.timeConstraints} minutes per problem
      
      REQUIREMENTS:
      - Difficulty: ${difficulty}
      - Experience Level: ${experienceLevel}
      - Each problem should reflect ${company}'s actual interview patterns
      - Include realistic business scenarios where applicable
      - Add comprehensive test cases with edge cases
      
      UNIQUENESS: Generate problems that are different from standard LeetCode problems. Use creative scenarios and applications.
      
      Return as JSON array with this EXACT structure:
      [
        {
          "id": "unique-problem-id",
          "title": "Problem Title (${company} Style)",
          "difficulty": "${difficulty}",
          "description": "Detailed problem description with ${company}-specific context",
          "examples": [
            {
              "input": "sample input format",
              "output": "expected output format",
              "explanation": "clear step-by-step explanation"
            }
          ],
          "testCases": [
            {
              "id": "test-1",
              "input": "test input",
              "expectedOutput": "expected result",
              "hidden": false
            }
          ],
          "constraints": ["realistic constraints"],
          "topics": ["relevant algorithm topics"],
          "hints": ["progressive hints for guidance"],
          "timeComplexity": "O(?)",
          "spaceComplexity": "O(?)"
        }
      ]
    `;
  }

  private shouldHaveVisualizer(topics: string[]): boolean {
    const visualTopics = ['Graph', 'Tree', 'Array', 'Dynamic Programming', 'Sorting', 'Binary Tree'];
    return topics.some(topic => visualTopics.some(visual => topic.toLowerCase().includes(visual.toLowerCase())));
  }

  private generateFallbackProblems(company: string, count: number, difficulty: string): DSAProblem[] {
    // Fallback problems when AI generation fails
    const fallbackProblems = [;
      {
        id: `fallback-${company.toLowerCase()}-1`,
        title: `${company} Array Processing Challenge`,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        description: `Given an array of integers, find the maximum sum subarray. This problem is commonly asked at ${company} and tests your understanding of dynamic programming concepts.`,
        examples: [
          {
            input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
            output: '6',
            explanation: 'The subarray [4,-1,2,1] has the largest sum 6.'
          }
        ],
        testCases: [
          { id: 'test1', input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' },
          { id: 'test2', input: 'nums = [1]', expectedOutput: '1' },
          { id: 'test3', input: 'nums = [5,4,-1,7,8]', expectedOutput: '23' }
        ],
        constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
        topics: ['Array', 'Dynamic Programming'],
        hints: ['Think about Kadane\'s algorithm', 'Keep track of the maximum sum ending at each position'],
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

  private generateFallbackInteractiveChallenges(company: string, count: number): DSAProblem[] {
    return this.generateFallbackProblems(company, count, 'medium').map(problem => ({
      ...problem,
      title: `Interactive ${problem.title}`,
      interactiveFeatures: {
        hasVisualizer: true,
        hasStepByStep: true,
        hasHints: true,
        realTimeExecution: true,
        visualization: 'Array traversal and sum calculation',
        stepByStep: true,
        realTimeValidation: true,
        progressTracking: true
      }
    }));
  }

  /**
   * Get company-specific interview insights
   */
  public getCompanyInsights(companyName: string): any {
    const company = this.normalizeCompanyName(companyName);
    return this.companyPatterns[company] || this.companyPatterns['Google'];
  }

  /**
   * Health check for the service
   */
  public async healthCheck(): Promise<{ status: string; emergentAvailable: boolean }> {
    try {
      const health = await this.emergentIntegration.healthCheck();
      return {
        status: health.status,
        emergentAvailable: health.status === 'healthy'
      };
    } catch (error) {
      return {
        status: 'error',
        emergentAvailable: false
      };
    }
  }
}

export const enhancedDSAService = EnhancedDSAService.getInstance();
export default EnhancedDSAService;