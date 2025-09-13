/**
 * Interview Service Manager - Centralized service coordination
 * Manages DSA generation, feedback, and code execution services
 * Replaces emergent AI dependencies with Groq-based solutions
 */

import { EnhancedGroqDSAService, DSAProblem } from './enhancedGroqDSAService';
import { OptimizedFeedbackService } from './optimizedFeedbackService';
import EnhancedJudge0Service from './enhancedJudge0Service';
import GroqAIService from './groqAIService';

export interface InterviewServiceConfig {
  useEnhancedDSA: boolean;
  useFastFeedback: boolean;
  enableCodeExecution: boolean;
  companyName: string;
  experienceLevel: 'entry' | 'mid' | 'senior';
}

export class InterviewServiceManager {
  private static instance: InterviewServiceManager;
  private dsaService: EnhancedGroqDSAService;
  private feedbackService: OptimizedFeedbackService;
  private codeExecutionService: EnhancedJudge0Service;
  private groqService: GroqAIService;

  private constructor() {
    this.dsaService = EnhancedGroqDSAService.getInstance();
    this.feedbackService = OptimizedFeedbackService.getInstance();
    this.codeExecutionService = EnhancedJudge0Service.getInstance();
    this.groqService = GroqAIService.getInstance();
    
    console.log('🎯 Interview Service Manager initialized');
  }

  public static getInstance(): InterviewServiceManager {
    if (!InterviewServiceManager.instance) {
      InterviewServiceManager.instance = new InterviewServiceManager();
    }
    return InterviewServiceManager.instance;
  }

  /**
   * Generate comprehensive DSA problems with enhanced test cases
   */
  public async generateDSAProblems(
    companyName: string,
    count: number = 5,
    experienceLevel: 'entry' | 'mid' | 'senior' = 'mid',
    focusAreas: string[] = []
  ): Promise<DSAProblem[]> {
    try {
      console.log(`🚀 Generating ${count} DSA problems for ${companyName}...`);
      
      let problems: DSAProblem[];
      
      if (focusAreas.length > 0) {
        problems = await this.dsaService.generateEnhancedDSAProblems(companyName, count, focusAreas);
      } else {
        problems = await this.dsaService.generateCompanySpecificDSAProblems(companyName, count, experienceLevel);
      }
      
      // Validate that all problems have test cases
      const validatedProblems = problems.map((problem, index) => {
        if (!problem.testCases || problem.testCases.length === 0) {
          console.warn(`Problem ${index} missing test cases, adding fallbacks`);
          problem.testCases = this.generateFallbackTestCases(problem);
        }
        return problem;
      });
      
      console.log(`✅ Generated ${validatedProblems.length} DSA problems successfully`);
      return validatedProblems;
      
    } catch (error) {
      console.error('❌ Error generating DSA problems:', error);
      return this.generateFallbackDSAProblems(companyName, count);
    }
  }

  /**
   * Execute code with enhanced error handling
   */
  public async executeCode(
    code: string,
    language: string,
    testCases: any[]
  ): Promise<any> {
    try {
      console.log(`🧪 Executing ${language} code with ${testCases.length} test cases...`);
      
      // Ensure test cases are properly formatted
      const formattedTestCases = testCases.map((tc, index) => ({
        id: tc.id || `test-${index + 1}`,
        input: tc.input || `input_${index + 1}`,
        expectedOutput: tc.expectedOutput || `output_${index + 1}`,
        hidden: tc.hidden || false
      }));
      
      const result = await this.codeExecutionService.executeCodeWithFallback(
        code,
        language,
        formattedTestCases
      );
      
      console.log(`✅ Code execution completed: ${result.totalPassed}/${result.totalTests} passed`);
      return result;
      
    } catch (error) {
      console.error('❌ Code execution error:', error);
      throw error;
    }
  }

  /**
   * Generate fast feedback for interview performance
   */
  public async generateFastFeedback(
    questions: any[],
    answers: string[],
    companyName: string,
    jobTitle: string
  ): Promise<any> {
    try {
      console.log(`⚡ Generating fast feedback for ${companyName} interview...`);
      
      const analysis = await this.feedbackService.generateFastOverallAnalysis(
        questions,
        answers,
        companyName,
        jobTitle
      );
      
      console.log(`✅ Fast feedback generated in ${analysis.metadata?.processingTime || 'unknown'}ms`);
      return analysis;
      
    } catch (error) {
      console.error('❌ Fast feedback generation error:', error);
      return this.feedbackService.calculatePerformanceMetrics(questions, answers, 0);
    }
  }

  /**
   * Generate interview questions using Groq
   */
  public async generateInterviewQuestions(params: {
    jobTitle: string;
    companyName: string;
    skills: string[];
    interviewType: 'technical' | 'behavioral' | 'mixed' | 'aptitude' | 'dsa';
    experienceLevel: 'entry' | 'mid' | 'senior';
    numberOfQuestions: number;
  }): Promise<any[]> {
    try {
      console.log(`🎯 Generating ${params.numberOfQuestions} ${params.interviewType} questions...`);
      
      if (params.interviewType === 'dsa') {
        // Use enhanced DSA service for DSA questions
        const dsaProblems = await this.generateDSAProblems(
          params.companyName,
          params.numberOfQuestions,
          params.experienceLevel
        );
        
        // Convert DSA problems to question format
        return dsaProblems.map((problem, index) => ({
          id: problem.id,
          question: `Solve this DSA problem: ${problem.title}\n\n${problem.description}`,
          expectedAnswer: `A working solution with proper time and space complexity analysis`,
          category: 'dsa',
          difficulty: problem.difficulty,
          points: this.getDSAPoints(problem.difficulty),
          timeLimit: 45,
          evaluationCriteria: ['Correctness', 'Efficiency', 'Code Quality', 'Edge Cases'],
          tags: [params.companyName, 'dsa', ...problem.topics],
          dsaProblem: problem, // Include full DSA problem data
          provider: 'enhanced-dsa-service'
        }));
      } else if (params.interviewType === 'mixed') {
        // Generate mixed questions including DSA
        const regularQuestions = await this.groqService.generateInterviewQuestions({
          ...params,
          interviewType: 'technical',
          numberOfQuestions: Math.floor(params.numberOfQuestions * 0.6) // 60% technical/behavioral
        });
        
        const dsaProblems = await this.generateDSAProblems(
          params.companyName,
          Math.ceil(params.numberOfQuestions * 0.4), // 40% DSA
          params.experienceLevel
        );
        
        const dsaQuestions = dsaProblems.map((problem) => ({
          id: problem.id,
          question: `Solve this DSA problem: ${problem.title}\n\n${problem.description}`,
          expectedAnswer: `A working solution with proper analysis`,
          category: 'dsa',
          difficulty: problem.difficulty,
          points: this.getDSAPoints(problem.difficulty),
          timeLimit: 45,
          evaluationCriteria: ['Correctness', 'Efficiency', 'Code Quality'],
          tags: [params.companyName, 'dsa', ...problem.topics],
          dsaProblem: problem,
          provider: 'enhanced-dsa-service'
        }));
        
        return [...regularQuestions, ...dsaQuestions];
      } else {
        // Use regular Groq service for other question types
        return await this.groqService.generateInterviewQuestions(params);
      }
      
    } catch (error) {
      console.error('❌ Question generation error:', error);
      return this.generateFallbackQuestions(params);
    }
  }

  /**
   * Health check for all services
   */
  public async healthCheck(): Promise<{
    dsaService: boolean;
    feedbackService: boolean;
    codeExecutionService: boolean;
    groqService: boolean;
    overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  }> {
    try {
      const [dsa, feedback, execution, groq] = await Promise.all([
        this.dsaService.healthCheck(),
        this.feedbackService.healthCheck(),
        this.codeExecutionService.healthCheck(),
        this.groqService.healthCheck()
      ]);
      
      const healthyServices = [
        dsa.groqAvailable,
        feedback.groqAvailable,
        execution.judge0Available,
        groq.groqAvailable
      ].filter(Boolean).length;
      
      let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
      if (healthyServices === 4) overallStatus = 'healthy';
      else if (healthyServices >= 2) overallStatus = 'degraded';
      else overallStatus = 'unhealthy';
      
      return {
        dsaService: dsa.groqAvailable,
        feedbackService: feedback.groqAvailable,
        codeExecutionService: execution.judge0Available,
        groqService: groq.groqAvailable,
        overallStatus
      };
    } catch (error) {
      console.error('❌ Health check error:', error);
      return {
        dsaService: false,
        feedbackService: false,
        codeExecutionService: false,
        groqService: false,
        overallStatus: 'unhealthy'
      };
    }
  }

  // Helper methods
  private generateFallbackTestCases(problem: DSAProblem): any[] {
    return [
      {
        id: 'fallback-1',
        input: problem.examples[0]?.input || 'nums = [2,7,11,15], target = 9',
        expectedOutput: problem.examples[0]?.output || '[0,1]',
        hidden: false
      },
      {
        id: 'fallback-2',
        input: 'nums = [3,2,4], target = 6',
        expectedOutput: '[1,2]',
        hidden: false
      },
      {
        id: 'fallback-3',
        input: 'nums = [3,3], target = 6',
        expectedOutput: '[0,1]',
        hidden: true
      }
    ];
  }

  private generateFallbackDSAProblems(companyName: string, count: number): DSAProblem[] {
    const fallbackProblems: DSAProblem[] = [];
    
    for (let i = 0; i < count; i++) {
      fallbackProblems.push({
        id: `fallback-${companyName.toLowerCase()}-${i}`,
        title: `${companyName} Array Challenge ${i + 1}`,
        difficulty: 'medium' as const,
        description: `Solve this array-based problem commonly asked at ${companyName} interviews.`,
        examples: [
          {
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0,1]',
            explanation: 'The sum of 2 and 7 is 9, so return indices [0,1]'
          }
        ],
        testCases: this.generateFallbackTestCases({
          examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' }]
        } as DSAProblem),
        constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'],
        topics: ['Array', 'Hash Table'],
        hints: ['Consider using a hash map', 'Look for target - current number'],
        companies: [companyName],
        metadata: {
          generatedAt: new Date(),
          company: companyName,
          uniqueId: `fallback-${Date.now()}-${i}`,
          version: 1
        }
      });
    }
    
    return fallbackProblems;
  }

  private getDSAPoints(difficulty: string): number {
    switch (difficulty) {
      case 'easy': return 15;
      case 'medium': return 25;
      case 'hard': return 40;
      default: return 20;
    }
  }

  private generateFallbackQuestions(params: any): any[] {
    return [
      {
        id: 'fallback-1',
        question: `Tell me about your experience with ${params.skills[0] || 'software development'} at ${params.companyName}.`,
        expectedAnswer: 'A comprehensive answer covering technical expertise and practical experience.',
        category: params.interviewType,
        difficulty: 'medium',
        points: 15,
        timeLimit: 5,
        evaluationCriteria: ['Technical Knowledge', 'Communication', 'Experience'],
        tags: [params.companyName, params.jobTitle],
        provider: 'fallback'
      }
    ];
  }
}

export const interviewServiceManager = InterviewServiceManager.getInstance();
export default InterviewServiceManager;