/**
 * Smart AI Service - Emergent + Gemini Integration
 * Replaces Ollama Phi3 Mini with intelligent task routing
 * - Emergent LLM Key for complex tasks (interview questions, analysis)
 * - Gemini for lightweight tasks (resume parsing, search)
 */

import { EmergentLLMService } from './emergentLLMService';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractJSON } from './jsonExtractor';

export interface SmartAIRequest {
  task: 'question_generation' | 'response_analysis' | 'resume_parsing' | 'company_search' | 'performance_analysis';
  context: {
    jobTitle?: string;
    companyName?: string;
    skills?: string[];
    interviewType?: string;
    experienceLevel?: string;
    numberOfQuestions?: number;
    companyIntelligence?: any;
    question?: string;
    userAnswer?: string;
    expectedAnswer?: string;
    resumeText?: string;
  };
  priority?: 'high' | 'medium' | 'low';
}

export interface SmartAIResponse {
  success: boolean;
  data: any;
  provider: 'emergent' | 'gemini';
  model: string;
  processingTime: number;
  taskType: string;
}

export class SmartAIService {
  private static instance: SmartAIService;
  private emergentService: EmergentLLMService;
  private geminiAI: GoogleGenerativeAI | null = null;
  private geminiModel: any = null;

  private constructor() {
    this.emergentService = EmergentLLMService.getInstance();
    
    // Initialize Gemini for lightweight tasks
    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (geminiKey) {
      this.geminiAI = new GoogleGenerativeAI(geminiKey);
      this.geminiModel = this.geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    console.log('🧠 SmartAIService initialized - Task-optimized AI routing');
  }

  public static getInstance(): SmartAIService {
    if (!SmartAIService.instance) {
      SmartAIService.instance = new SmartAIService();
    }
    return SmartAIService.instance;
  }

  public async processRequest(request: SmartAIRequest): Promise<SmartAIResponse> {
    const startTime = Date.now();
    
    try {
      console.log(`🎯 Processing ${request.task} with optimal AI provider...`);
      
      // Route to appropriate AI service based on task complexity
      let result: any;
      let provider: 'emergent' | 'gemini';
      let model: string;

      if (this.shouldUseEmergent(request.task)) {
        result = await this.processWithEmergent(request);
        provider = 'emergent';
        model = 'gpt-4o-mini';
      } else {
        result = await this.processWithGemini(request);
        provider = 'gemini';
        model = 'gemini-1.5-flash';
      }

      const processingTime = Date.now() - startTime;
      console.log(`✅ ${request.task} completed in ${processingTime}ms using ${provider}`);

      return {
        success: true,
        data: result,
        provider,
        model,
        processingTime,
        taskType: request.task
      };
    } catch (error) {
      console.error(`❌ SmartAI processing failed for ${request.task}:`, error);
      
      // Attempt fallback if primary service fails
      try {
        const fallbackResult = await this.processFallback(request);
        const processingTime = Date.now() - startTime;
        
        return {
          success: true,
          data: fallbackResult.data,
          provider: fallbackResult.provider,
          model: fallbackResult.model,
          processingTime,
          taskType: request.task
        };
      } catch (fallbackError) {
        return {
          success: false,
          data: { error: 'All AI services failed', details: error },
          provider: 'none',
          model: 'none',
          processingTime: Date.now() - startTime,
          taskType: request.task
        };
      }
    }
  }

  private shouldUseEmergent(task: string): boolean {
    // Complex tasks that need high-quality AI
    const emergentTasks = [
      'question_generation',
      'response_analysis', 
      'performance_analysis'
    ];
    return emergentTasks.includes(task);
  }

  private async processWithEmergent(request: SmartAIRequest): Promise<any> {
    switch (request.task) {
      case 'question_generation':
        return await this.emergentService.generateInterviewQuestions({
          jobTitle: request.context.jobTitle || '',
          companyName: request.context.companyName || '',
          skills: request.context.skills || [],
          interviewType: request.context.interviewType as any || 'mixed',
          experienceLevel: request.context.experienceLevel as any || 'mid',
          numberOfQuestions: request.context.numberOfQuestions || 10,
          companyIntelligence: request.context.companyIntelligence
        });

      case 'response_analysis':
        return await this.emergentService.analyzeInterviewResponse(
          request.context.question || '',
          request.context.userAnswer || '',
          request.context.expectedAnswer || '',
          request.context.interviewType || 'technical',
          request.context.companyName || ''
        );

      case 'performance_analysis':
        return await this.emergentService.analyzeOverallPerformance(
          [], // questions array
          [], // answers array  
          request.context.jobTitle || '',
          request.context.skills || []
        );

      default:
        throw new Error(`Unsupported Emergent task: ${request.task}`);
    }
  }

  private async processWithGemini(request: SmartAIRequest): Promise<any> {
    if (!this.geminiModel) {
      throw new Error('Gemini not initialized');
    }

    switch (request.task) {
      case 'resume_parsing':
        return await this.parseResumeWithGemini(request.context.resumeText || '');
      
      case 'company_search':
        return await this.searchCompanyWithGemini(request.context.companyName || '');
      
      default:
        throw new Error(`Unsupported Gemini task: ${request.task}`);
    }
  }

  private async parseResumeWithGemini(resumeText: string): Promise<any> {
    const prompt = `
      Parse this resume and extract structured information. Return as JSON:
      
      ${resumeText}
      
      Extract:
      {
        "skills": ["skill1", "skill2", ...],
        "projects": "Brief project descriptions",
        "workex": "Work experience summary",
        "education": "Education details",
        "contact": "Contact information"
      }
    `;

    const result = await this.geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      return extractJSON(text);
    } catch (error) {
      // Fallback parsing
      return {
        skills: this.extractSkillsFromText(resumeText),
        projects: "Unable to parse projects",
        workex: "Unable to parse work experience",
        education: "Unable to parse education",
        contact: "Unable to parse contact"
      };
    }
  }

  private async searchCompanyWithGemini(companyName: string): Promise<any> {
    const prompt = `
      Provide basic information about the company "${companyName}". Return as JSON:
      
      {
        "name": "${companyName}",
        "industry": "Industry type",
        "description": "Brief company description",
        "techStack": ["tech1", "tech2", ...],
        "size": "Company size estimate",
        "founded": "Founded year if known"
      }
    `;

    const result = await this.geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      return extractJSON(text);
    } catch (error) {
      return {
        name: companyName,
        industry: "Technology",
        description: `Information about ${companyName}`,
        techStack: ["JavaScript", "Python", "React"],
        size: "Unknown",
        founded: "Unknown"
      };
    }
  }

  private async processFallback(request: SmartAIRequest): Promise<{ data: any; provider: 'emergent' | 'gemini'; model: string }> {
    // Try the opposite service as fallback
    if (this.shouldUseEmergent(request.task)) {
      // Try Gemini as fallback
      const data = await this.processWithGemini(request);
      return { data, provider: 'gemini', model: 'gemini-1.5-flash' };
    } else {
      // Try Emergent as fallback
      const data = await this.processWithEmergent(request);
      return { data, provider: 'emergent', model: 'gpt-4o-mini' };
    }
  }

  private extractSkillsFromText(text: string): string[] {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'TypeScript',
      'HTML', 'CSS', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'Linux'
    ];
    
    return commonSkills.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
  }

  // Convenience methods for direct task execution
  public async generateQuestions(params: {
    jobTitle: string;
    companyName: string;
    skills: string[];
    interviewType: string;
    experienceLevel: string;
    numberOfQuestions: number;
    companyIntelligence?: any;
  }) {
    return this.processRequest({
      task: 'question_generation',
      context: params,
      priority: 'high'
    });
  }

  public async analyzeResponse(
    question: string,
    userAnswer: string,
    expectedAnswer: string,
    category: string,
    companyContext: string
  ) {
    return this.processRequest({
      task: 'response_analysis',
      context: {
        question,
        userAnswer,
        expectedAnswer,
        interviewType: category,
        companyName: companyContext
      },
      priority: 'high'
    });
  }

  public async parseResume(resumeText: string) {
    return this.processRequest({
      task: 'resume_parsing',
      context: { resumeText },
      priority: 'low'
    });
  }

  public async searchCompany(companyName: string) {
    return this.processRequest({
      task: 'company_search',
      context: { companyName },
      priority: 'low'
    });
  }

  public async getHealthStatus(): Promise<{
    emergentAvailable: boolean;
    geminiAvailable: boolean;
    status: string;
    activeProvider: string;
    fallbackAvailable: boolean;
  }> {
    const emergentHealth = await this.emergentService.healthCheck();
    
    return {
      emergentAvailable: emergentHealth.emergentAvailable,
      geminiAvailable: !!this.geminiModel,
      status: emergentHealth.status,
      activeProvider: emergentHealth.emergentAvailable ? 'emergent' : (this.geminiModel ? 'gemini' : 'none'),
      fallbackAvailable: emergentHealth.emergentAvailable && !!this.geminiModel
    };
  }
}

export default SmartAIService;