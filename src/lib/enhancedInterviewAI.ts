/**
 * Enhanced Interview AI Service - SMART AI OPTIMIZED VERSION
 * Uses Smart AI service (Emergent + Gemini) replacing Ollama
 */

import SmartAIService from './smartAIService';
import { extractJSON } from './jsonExtractor';

interface CompanyResearchData {
  name: string,
  industry: string,
  size: string,
  techStack: string[],
  interviewProcess: string[],
  difficulty: 'easy' | 'medium' | 'hard',
  focusAreas: string[],
  preparationTips: string[],
  commonQuestions: string[];
}

interface InterviewQuestion {
  id: string,
  question: string,
  expectedAnswer: string,
  category: 'technical' | 'behavioral' | 'dsa' | 'aptitude',
  difficulty: 'easy' | 'medium' | 'hard',
  points: number,
  timeLimit: number,
  evaluationCriteria: string[],
  tags: string[],
  hints: string[],
  companyRelevance: number
}

interface InterviewRoundConfig {
  id: string,
  type: 'technical' | 'behavioral' | 'dsa' | 'aptitude',
  name: string,
  duration: number,
  questionCount: number,
  enabled: boolean,
  order: number
}

export class EnhancedInterviewAI {
  private static instance: EnhancedInterviewAI,
  private smartAIService: SmartAIService,
  private companyCache = new Map<string, CompanyResearchData>();

  private constructor() {
    this.smartAIService = SmartAIService.getInstance();
    console.log('🤖 EnhancedInterviewAI initialized with Smart AI');
  }

  public static getInstance(): EnhancedInterviewAI {
    if (!EnhancedInterviewAI.instance) {
      EnhancedInterviewAI.instance = new EnhancedInterviewAI();
    }
    return EnhancedInterviewAI.instance;
  }

  /**
   * Research company information using Smart AI
   */
  public async researchCompany(companyName: string): Promise<CompanyResearchData> {
    // Check cache first
    const cacheKey = companyName.toLowerCase().trim();
    if (this.companyCache.has(cacheKey)) {
      return this.companyCache.get(cacheKey)!;
    }

    try {
      // Use Smart AI to research company
      const result = await this.smartAIService.searchCompany(companyName);
      
      if (result.success && result.data) {
        const enhancedData: CompanyResearchData = {
          name: result.data.name || companyName,
          industry: result.data.industry || 'Technology',
          size: result.data.size || 'medium',
          techStack: Array.isArray(result.data.techStack) ? result.data.techStack : ['JavaScript', 'React', 'Node.js'],
          interviewProcess: ['Phone Screening', 'Technical Interview', 'System Design', 'Cultural Fit'],
          difficulty: 'medium',
          focusAreas: ['Problem Solving', 'System Design', 'Communication'],
          preparationTips: [
            'Practice coding problems on LeetCode',
            'Review system design fundamentals', 
            'Prepare behavioral questions with STAR method',
            'Research the company and its products'
          ],
          commonQuestions: [
            'Tell me about yourself',
            'Why do you want to work here?',
            'Describe a challenging project you worked on',
            'How do you handle conflicts in a team?'
          ]
        };

        // Cache the result
        this.companyCache.set(cacheKey, enhancedData);
        return enhancedData;
      }

      // Return default company data as fallback
      return this.getFallbackCompanyData(companyName);

    } catch (error) {
      console.error('Error researching company:', error);
      return this.getFallbackCompanyData(companyName);
    }
  }

  private getFallbackCompanyData(companyName: string): CompanyResearchData {
    const fallbackData: CompanyResearchData = {
      name: companyName,
      industry: 'Technology',
      size: 'medium',
      techStack: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
      interviewProcess: ['Phone Screening', 'Technical Interview', 'System Design', 'Final Round'],
      difficulty: 'medium',
      focusAreas: ['Problem Solving', 'Technical Skills', 'Communication', 'Cultural Fit'],
      preparationTips: [
        'Practice coding problems on LeetCode',
        'Review system design fundamentals',
        'Prepare behavioral questions with STAR method',
        'Research the company and its products'
      ],
      commonQuestions: [
        'Tell me about yourself',
        'Why do you want to work here?',
        'Describe a challenging project you worked on',
        'How do you handle conflicts in a team?'
      ]
    };

    this.companyCache.set(companyName.toLowerCase().trim(), fallbackData);
    return fallbackData;
  }

  /**
   * Generate comprehensive interview questions using Smart AI
   */
  public async generateInterviewQuestions(params: {
    companyName: string,
    jobTitle: string,
    skills: string[],
    experienceLevel: 'entry' | 'mid' | 'senior',
    rounds: InterviewRoundConfig[];
  }): Promise<{[roundType: string]: InterviewQuestion[]}> {
    try {
      const totalQuestions = params.rounds.reduce((sum, round) => sum + (round.enabled ? round.questionCount : 0), 0),
      
      // Use Smart AI service for question generation
      const result = await this.smartAIService.generateQuestions({
        jobTitle: params.jobTitle,
        companyName: params.companyName,
        skills: params.skills,
        interviewType: 'mixed', // Generate mixed questions
        experienceLevel: params.experienceLevel,
        numberOfQuestions: totalQuestions
      });

      if (result.success && Array.isArray(result.data)) {
        // Group questions by round type
        const questionsByRound: {[roundType: string]: InterviewQuestion[]} = {};
        let questionIndex = 0;

        for (const round of params.rounds) {
          if (!round.enabled) continue;

          questionsByRound[round.type] = result.data.slice(questionIndex, questionIndex + round.questionCount).map((q: any, i: number) => ({
            id: q.id || `${round.type}-${Date.now()}-${questionIndex + i}`,
            question: q.question || `Sample ${round.type} question`,
            expectedAnswer: q.expectedAnswer || 'Expected answer not provided',
            category: round.type as any,
            difficulty: q.difficulty || this.getDifficultyForLevel(params.experienceLevel),
            points: q.points || 10,
            timeLimit: q.timeLimit || Math.ceil(round.duration / round.questionCount),
            evaluationCriteria: q.evaluationCriteria || ['Accuracy', 'Clarity', 'Completeness'],
            tags: q.tags || [params.jobTitle, params.companyName, round.type],
            hints: q.hints || ['Take your time to think through the problem'],
            companyRelevance: q.companyRelevance || 7
          }));

          questionIndex += round.questionCount;
        }

        return questionsByRound;
      }
      
      return this.generateFallbackQuestionsByRound(params);
    } catch (error) {
      console.error('Error generating interview questions:', error);
      return this.generateFallbackQuestionsByRound(params);
    }
  }

  private getDifficultyForLevel(level: string): 'easy' | 'medium' | 'hard' {
    switch (level) {
      case 'entry': return 'easy',
      case 'senior': return 'hard',
      default: return 'medium';
    }
  }

  private generateFallbackQuestionsByRound(params: any): {[roundType: string]: InterviewQuestion[]} {
    const questionsByRound: {[roundType: string]: InterviewQuestion[]} = {};

    for (const round of params.rounds) {
      if (!round.enabled) continue;

      const questions: InterviewQuestion[] = [],
      
      for (let i = 0; i < round.questionCount; i++) {
        questions.push({
          id: `fallback-${round.type}-${i}`,
          question: `Tell me about your experience with ${params.skills[i % params.skills.length]} in ${round.type} context.`,
          expectedAnswer: `Comprehensive answer covering experience with ${params.skills[i % params.skills.length]}.`,
          category: round.type as any,
          difficulty: this.getDifficultyForLevel(params.experienceLevel),
          points: 10,
          timeLimit: Math.ceil(round.duration / round.questionCount),
          evaluationCriteria: ['Technical accuracy', 'Communication', 'Real-world application'],
          tags: [params.jobTitle, params.companyName, round.type],
          hints: ['Think about specific projects and outcomes'],
          companyRelevance: 6
        });
      }
      
      questionsByRound[round.type] = questions;
    }

    return questionsByRound;
  }
}

export default EnhancedInterviewAI;