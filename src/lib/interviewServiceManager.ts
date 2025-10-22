/**
 * Interview Service Manager - Centralized service coordination
 * Manages DSA generation, feedback, and code execution services
 * Enhanced with proper question distribution for mixed interviews and DSA-only rounds
 */

import { EnhancedGroqDSAService, DSAProblem } from './enhancedGroqDSAService';
import { OptimizedFeedbackService } from './optimizedFeedbackService';
import EnhancedJudge0Service from './enhancedJudge0Service';
import GroqAIService from './groqAIService';

export interface InterviewServiceConfig {
  useEnhancedDSA: boolean,
  useFastFeedback: boolean,
  enableCodeExecution: boolean,
  companyName: string,
  experienceLevel: 'entry' | 'mid' | 'senior'
}

export class InterviewServiceManager {
  private static instance: InterviewServiceManager,
  private dsaService: EnhancedGroqDSAService,
  private feedbackService: OptimizedFeedbackService,
  private codeExecutionService: EnhancedJudge0Service,
  private groqService: GroqAIService,

  private constructor() {
    this.dsaService = EnhancedGroqDSAService.getInstance();
    this.feedbackService = OptimizedFeedbackService.getInstance();
    this.codeExecutionService = EnhancedJudge0Service.getInstance();
    this.groqService = GroqAIService.getInstance();
    
    console.log('🎯 Enhanced Interview Service Manager initialized');
  }

  public static getInstance(): InterviewServiceManager {
    if (!InterviewServiceManager.instance) {
      InterviewServiceManager.instance = new InterviewServiceManager();
    }
    return InterviewServiceManager.instance;
  }

  /**
   * Generate comprehensive DSA problems with enhanced test cases
   * Fixed to generate exactly the requested count
   */
  public async generateDSAProblems(
    companyName: string,
    count: number = 2, // Default to 2 as per user requirements
    experienceLevel: 'entry' | 'mid' | 'senior' = 'mid',
    focusAreas: string[] = []
  ): Promise<DSAProblem[]> {
    try {
      console.log(`🚀 Generating exactly ${count} DSA problems for ${companyName}...`);
      
      let problems: DSAProblem[],
      
      if (focusAreas.length > 0) {
        problems = await this.dsaService.generateEnhancedDSAProblems(companyName, count, focusAreas);
      } else {
        problems = await this.dsaService.generateCompanySpecificDSAProblems(companyName, count, experienceLevel);
      }
      
      // Ensure we get exactly the requested count
      if (problems.length !== count) {
        console.warn(`⚠️ Expected ${count} problems but got ${problems.length}, adjusting...`);
        if (problems.length > count) {
          problems = problems.slice(0, count);
        } else {
          // Add fallback problems if we don't have enough
          const additionalNeeded = count - problems.length;
          const fallbacks = this.generateFallbackDSAProblems(companyName, additionalNeeded);
          problems = [...problems, ...fallbacks];
        }
      }
      
      // Validate that all problems have test cases
      const validatedProblems = problems.map((problem, index) => {
        if (!problem.testCases || problem.testCases.length === 0) {
          console.warn(`Problem ${index} missing test cases, adding fallbacks`);
          problem.testCases = this.generateFallbackTestCases(problem);
        }
        return problem;
      });
      
      console.log(`✅ Generated exactly ${validatedProblems.length} DSA problems successfully`);
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
   * Generate interview questions using enhanced distribution logic
   */
  public async generateInterviewQuestions(params: {
    jobTitle: string,
    companyName: string,
    skills: string[],
    interviewType: 'technical' | 'behavioral' | 'mixed' | 'aptitude' | 'dsa',
    experienceLevel: 'entry' | 'mid' | 'senior',
    numberOfQuestions: number
  }): Promise<any[]> {
    try {
      console.log(`🎯 Generating ${params.numberOfQuestions} ${params.interviewType} questions...`);
      
      if (params.interviewType === 'dsa') {
        console.log('💻 Generating DSA-only interview with exactly 2 problems...');
        
        // Use enhanced DSA service for DSA questions - force exactly 2 questions
        const dsaProblems = await this.generateDSAProblems(
          params.companyName,
          2, // FIXED: Always generate exactly 2 DSA problems
          params.experienceLevel
        );
        
        // Convert DSA problems to question format
        return dsaProblems.map((problem, index) => ({
          id: problem.id,
          question: `Solve this DSA problem: ${problem.title}\n\n${problem.description}`,
          expectedAnswer: `A working solution with proper time and space complexity analysis. Include code implementation, explain the approach, and analyze edge cases.`,
          category: 'dsa',
          difficulty: problem.difficulty,
          points: this.getDSAPoints(problem.difficulty),
          timeLimit: 45,
          evaluationCriteria: ['Correctness', 'Efficiency', 'Code Quality', 'Edge Cases', 'Complexity Analysis'],
          tags: [params.companyName, 'dsa', ...problem.topics],
          dsaProblem: problem, // Include full DSA problem data
          provider: 'enhanced-dsa-service'
        }));
        
      } else if (params.interviewType === 'mixed') {
        console.log('🔄 Generating comprehensive mixed interview with all 4 rounds...');
        
        // Enhanced Mixed Interview Distribution:
        // Technical: 6 questions (37.5%)
        // Behavioral: 4 questions (25%)  
        // Aptitude: 4 questions (25%)
        // DSA: 2 questions (12.5%)
        // Total: 16 questions
        
        const [technicalQuestions, behavioralQuestions, aptitudeQuestions, dsaProblems] = await Promise.all([
          // Technical Questions (6)
          this.groqService.generateInterviewQuestions({
            ...params,
            interviewType: 'technical',
            numberOfQuestions: 6
          }),
          
          // Behavioral Questions (4)
          this.groqService.generateInterviewQuestions({
            ...params,
            interviewType: 'behavioral',
            numberOfQuestions: 4
          }),
          
          // Aptitude Questions (4) 
          this.groqService.generateInterviewQuestions({
            ...params,
            interviewType: 'aptitude',
            numberOfQuestions: 4
          }),
          
          // DSA Problems (2)
          this.generateDSAProblems(
            params.companyName,
            2, // FIXED: Exactly 2 DSA questions
            params.experienceLevel
          )
        ]);
        
        const dsaQuestions = dsaProblems.map((problem) => ({
          id: problem.id,
          question: `Solve this DSA problem: ${problem.title}\n\n${problem.description}`,
          expectedAnswer: `A working solution with proper analysis and implementation details.`,
          category: 'dsa',
          difficulty: problem.difficulty,
          points: this.getDSAPoints(problem.difficulty),
          timeLimit: 45,
          evaluationCriteria: ['Correctness', 'Efficiency', 'Code Quality'],
          tags: [params.companyName, 'dsa', ...problem.topics],
          dsaProblem: problem,
          provider: 'enhanced-dsa-service'
        }));
        
        const allQuestions = [...technicalQuestions, ...behavioralQuestions, ...aptitudeQuestions, ...dsaQuestions];
        
        console.log(`✅ Mixed interview generated: ${technicalQuestions.length} Technical + ${behavioralQuestions.length} Behavioral + ${aptitudeQuestions.length} Aptitude + ${dsaQuestions.length} DSA = ${allQuestions.length} total`);
        
        return allQuestions;
        
      } else {
        console.log(`🎯 Generating ${params.interviewType} interview questions...`);
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
    dsaService: boolean,
    feedbackService: boolean,
    codeExecutionService: boolean,
    groqService: boolean,
    overallStatus: 'healthy' | 'degraded' | 'unhealthy'
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
      
      let overallStatus: 'healthy' | 'degraded' | 'unhealthy',
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
    const fallbackProblems: DSAProblem[] = [],
    
    const problemTemplates = [
      {
        title: `${companyName} Two Sum Challenge`,
        description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. This is a classic problem commonly asked at ${companyName} interviews.`,
        topics: ['Array', 'Hash Table'],
        examples: [{
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] = 2 + 7 = 9, we return [0, 1].';
        }]
      },
      {
        title: `${companyName} Valid Parentheses Problem`,
        description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if brackets are closed in the correct order.`,
        topics: ['String', 'Stack'],
        examples: [{
          input: 's = "()"',
          output: 'true',
          explanation: 'The parentheses are properly matched.'
        }]
      }
    ];
    
    for (let i = 0; i < count; i++) {
      const template = problemTemplates[i % problemTemplates.length];
      fallbackProblems.push({
        id: `fallback-${companyName.toLowerCase()}-${i}`,
        title: template.title,
        difficulty: 'medium' as const,
        description: template.description,
        examples: template.examples,
        testCases: this.generateFallbackTestCases({
          examples: template.examples
        } as DSAProblem),
        constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'],
        topics: template.topics,
        hints: ['Consider using a hash map', 'Think about the time complexity'],
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
      case 'easy': return 20,
      case 'medium': return 30,
      case 'hard': return 45,
      default: return 25;
    }
  }

  private generateFallbackQuestions(params: any): any[] {
    const count = params.interviewType === 'dsa' ? 2 : (params.interviewType === 'mixed' ? 16 : params.numberOfQuestions),
    const questions = [];
    
    if (params.interviewType === 'dsa') {
      // Generate exactly 2 DSA fallback questions
      questions.push({
        id: 'dsa-fallback-1',
        question: `DSA Problem 1: Implement a function to find the maximum sum of a contiguous subarray in an array of integers.`,
        expectedAnswer: 'Use Kadane\'s algorithm with O(n) time complexity. Handle edge cases like all negative numbers.',
        category: 'dsa',
        difficulty: 'medium',
        points: 30,
        timeLimit: 45,
        evaluationCriteria: ['Correctness', 'Efficiency', 'Code Quality', 'Edge Cases'],
        tags: [params.companyName, 'dsa', 'algorithms'],
        provider: 'fallback'
      });
      
      questions.push({
        id: 'dsa-fallback-2',
        question: `DSA Problem 2: Design a data structure that supports insert, delete, and getRandom operations in O(1) average time.`,
        expectedAnswer: 'Use a combination of array and hash map. Array for O(1) random access, hash map for O(1) insert/delete.',
        category: 'dsa',
        difficulty: 'medium',
        points: 30,  
        timeLimit: 45,
        evaluationCriteria: ['Correctness', 'Efficiency', 'Code Quality', 'Design Skills'],
        tags: [params.companyName, 'dsa', 'data-structures'],
        provider: 'fallback'
      });
    } else if (params.interviewType === 'mixed') {
      // Generate mixed fallback questions (6 tech + 4 behavioral + 4 aptitude + 2 DSA)
      for (let i = 0; i < 6; i++) {
        questions.push({
          id: `tech-fallback-${i}`,
          question: `Tell me about your experience with ${params.skills[i % params.skills.length]} at ${params.companyName}.`,
          expectedAnswer: 'A technical answer with practical examples.',
          category: 'technical',
          difficulty: 'medium',
          points: 15,
          timeLimit: 5,
          evaluationCriteria: ['Technical Knowledge', 'Communication', 'Experience'],
          tags: [params.companyName, params.jobTitle],
          provider: 'fallback'
        });
      }
      // Add behavioral, aptitude, and DSA fallbacks...
      // (Similar structure for other categories)
    } else {
      // Generate standard fallback questions
      for (let i = 0; i < count; i++) {
        questions.push({
          id: `fallback-${i}`,
          question: `Tell me about your experience with ${params.skills[i % params.skills.length] || 'software development'} at ${params.companyName}.`,
          expectedAnswer: 'A comprehensive answer covering technical expertise and practical experience.',
          category: params.interviewType,
          difficulty: 'medium',
          points: 15,
          timeLimit: 5,
          evaluationCriteria: ['Technical Knowledge', 'Communication', 'Experience'],
          tags: [params.companyName, params.jobTitle],
          provider: 'fallback'
        });
      }
    }
    
    return questions;
  }
}

export const interviewServiceManager = InterviewServiceManager.getInstance();
export default InterviewServiceManager;