/**
 * Enhanced Interview AI Service - OLLAMA OPTIMIZED VERSION
 * Uses Ollama as primary AI service, removed Groq dependencies
 */

import { OllamaService } from './ollamaService';
import { extractJSON } from './jsonExtractor';

interface CompanyResearchData {
  name: string;
  industry: string;
  size: string;
  techStack: string[];
  interviewProcess: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  focusAreas: string[];
  preparationTips: string[];
  commonQuestions: string[];
}

interface InterviewQuestion {
  id: string;
  question: string;
  expectedAnswer: string;
  category: 'technical' | 'behavioral' | 'dsa' | 'aptitude';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit: number;
  evaluationCriteria: string[];
  tags: string[];
  hints: string[];
  companyRelevance: number;
}

interface InterviewRoundConfig {
  id: string;
  type: 'technical' | 'behavioral' | 'dsa' | 'aptitude';
  name: string;
  duration: number;
  questionCount: number;
  enabled: boolean;
  order: number;
}

export class EnhancedInterviewAI {
  private static instance: EnhancedInterviewAI;
  private ollamaService: OllamaService;
  private companyCache = new Map<string, CompanyResearchData>();

  private constructor() {
    this.ollamaService = OllamaService.getInstance();
    console.log('🤖 EnhancedInterviewAI initialized with Ollama');
  }

  public static getInstance(): EnhancedInterviewAI {
    if (!EnhancedInterviewAI.instance) {
      EnhancedInterviewAI.instance = new EnhancedInterviewAI();
    }
    return EnhancedInterviewAI.instance;
  }

  /**
   * Research company information using Ollama AI
   */
  public async researchCompany(companyName: string): Promise<CompanyResearchData> {
    // Check cache first
    const cacheKey = companyName.toLowerCase().trim();
    if (this.companyCache.has(cacheKey)) {
      return this.companyCache.get(cacheKey)!;
    }

    try {
      // Use Ollama to research company
      const health = await this.ollamaService.healthCheck();
      
      if (health.ollamaAvailable && health.modelLoaded) {
        const systemMessage = `You are a company research expert. Analyze the provided company and structure it into interview preparation data.`;
        
        const userMessage = `
          Research ${companyName} and provide structured company information:
          
          Please provide detailed company information in this JSON format:
          {
            "name": "${companyName}",
            "industry": "specific industry sector",
            "size": "startup|small|medium|large|enterprise",
            "techStack": ["technology1", "technology2", "etc"],
            "interviewProcess": ["process step 1", "process step 2"],
            "difficulty": "easy|medium|hard",
            "focusAreas": ["focus area 1", "focus area 2"],
            "preparationTips": ["tip 1", "tip 2", "tip 3"],
            "commonQuestions": ["common question 1", "common question 2"]
          }
          
          Make educated guesses based on:
          - Company name and typical industry patterns
          - Common tech stacks for companies in similar sectors
          - Standard interview processes for tech companies
          
          Ensure all arrays have at least 3-5 relevant items.
        `;

        try {
          const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'llama3.1:8b',
              prompt: `${systemMessage}\n\n${userMessage}`,
              stream: false,
              options: { temperature: 0.7, num_predict: 2000 }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const companyData = extractJSON(data.response);
            
            // Validate and enhance the data
            const enhancedData: CompanyResearchData = {
              name: companyData.name || companyName,
              industry: companyData.industry || 'Technology',
              size: companyData.size || 'medium',
              techStack: Array.isArray(companyData.techStack) ? companyData.techStack : ['JavaScript', 'React', 'Node.js'],
              interviewProcess: Array.isArray(companyData.interviewProcess) ? companyData.interviewProcess : ['Phone Screening', 'Technical Interview', 'System Design', 'Cultural Fit'],
              difficulty: companyData.difficulty || 'medium',
              focusAreas: Array.isArray(companyData.focusAreas) ? companyData.focusAreas : ['Problem Solving', 'System Design', 'Communication'],
              preparationTips: Array.isArray(companyData.preparationTips) ? companyData.preparationTips : ['Practice coding problems', 'Understand system design basics', 'Research company values'],
              commonQuestions: Array.isArray(companyData.commonQuestions) ? companyData.commonQuestions : ['Tell me about yourself', 'Why do you want to work here?', 'Describe a challenging project']
            };

            // Cache the result
            this.companyCache.set(cacheKey, enhancedData);
            return enhancedData;
          }
        } catch (error) {
          console.log('Ollama research failed, using fallback');
        }
      }

      // Return default company data as fallback
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

      this.companyCache.set(cacheKey, fallbackData);
      return fallbackData;

    } catch (error) {
      console.error('Error researching company:', error);
      
      // Return default company data as fallback
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

      this.companyCache.set(cacheKey, fallbackData);
      return fallbackData;
    }
  }

  /**
   * Generate comprehensive interview questions using Ollama
   */
  public async generateInterviewQuestions(params: {
    companyName: string;
    jobTitle: string;
    skills: string[];
    experienceLevel: 'entry' | 'mid' | 'senior';
    rounds: InterviewRoundConfig[];
  }): Promise<{[roundType: string]: InterviewQuestion[]}> {
    try {
      // Use Ollama service for question generation
      const questions = await this.ollamaService.generateInterviewQuestions({
        jobTitle: params.jobTitle,
        companyName: params.companyName,
        skills: params.skills,
        interviewType: 'technical', // Default to technical, can be made dynamic
        experienceLevel: params.experienceLevel,
        numberOfQuestions: params.rounds.reduce((sum, round) => sum + (round.enabled ? round.questionCount : 0), 0)
      });

      // Group questions by round type
      const questionsByRound: {[roundType: string]: InterviewQuestion[]} = {};
      let questionIndex = 0;

      for (const round of params.rounds) {
        if (!round.enabled) continue;

        questionsByRound[round.type] = questions.slice(questionIndex, questionIndex + round.questionCount).map((q: any) => ({
          id: q.id || `${round.type}-${Date.now()}-${questionIndex}`,
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
    } catch (error) {
      console.error('Error generating interview questions:', error);
      return this.generateFallbackQuestionsByRound(params);
    }
  }

  private getDifficultyForLevel(level: string): 'easy' | 'medium' | 'hard' {
    switch (level) {
      case 'entry': return 'easy';
      case 'senior': return 'hard';
      default: return 'medium';
    }
  }

  private generateFallbackQuestionsByRound(params: any): {[roundType: string]: InterviewQuestion[]} {
    const questionsByRound: {[roundType: string]: InterviewQuestion[]} = {};

    for (const round of params.rounds) {
      if (!round.enabled) continue;

      const questions: InterviewQuestion[] = [];
      
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