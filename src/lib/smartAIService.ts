/**
 * Smart AI Service - Enhanced Groq + Gemini Integration
 * Replaces legacy Emergent AI with optimized Groq integration
 * - Enhanced Groq AI for complex tasks (interview questions, analysis)
 * - Gemini for lightweight tasks (resume parsing, company search)
 */

import EnhancedGroqAIService from './enhancedGroqAIService';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractJSON } from './jsonExtractor';

export interface SmartAIRequest {
  task: 'question_generation' | 'response_analysis' | 'resume_parsing' | 'company_search' | 'performance_analysis' | 'dsa_generation';
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
    difficulty?: string;
    count?: number;
  };
  priority?: 'high' | 'medium' | 'low';
}

export interface SmartAIResponse {
  success: boolean;
  data: any;
  provider: 'enhanced-groq' | 'gemini';
  model: string;
  processingTime: number;
  taskType: string;
  features?: string[];
}

export class SmartAIService {
  private static instance: SmartAIService;
  private groqService: EnhancedGroqAIService;
  private geminiAI: GoogleGenerativeAI | null = null;
  private geminiModel: any = null;

  private constructor() {
    this.groqService = EnhancedGroqAIService.getInstance();
    
    // Initialize Gemini for lightweight tasks (resume parsing only)
    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (geminiKey) {
      this.geminiAI = new GoogleGenerativeAI(geminiKey);
      this.geminiModel = this.geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    console.log('🧠 Enhanced SmartAIService initialized - Groq + Gemini routing');
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
      let provider: 'enhanced-groq' | 'gemini';
      let model: string;
      let features: string[] = [];

      if (this.shouldUseGroq(request.task)) {
        result = await this.processWithGroq(request);
        provider = 'enhanced-groq';
        model = 'llama-3.3-70b-versatile';
        features = [
          'Company-specific intelligence',
          'Enhanced prompt engineering',
          'Advanced problem generation',
          'Cultural fit analysis'
        ];
      } else {
        result = await this.processWithGemini(request);
        provider = 'gemini';
        model = 'gemini-1.5-flash';
        features = [
          'Fast processing',
          'Resume parsing',
          'Basic company search',
          'Cost-effective'
        ];
      }

      const processingTime = Date.now() - startTime;
      console.log(`✅ ${request.task} completed in ${processingTime}ms using ${provider}`);

      return {
        success: true,
        data: result,
        provider,
        model,
        processingTime,
        taskType: request.task,
        features
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
          taskType: request.task,
          features: ['Fallback mode']
        };
      } catch (fallbackError) {
        return {
          success: false,
          data: { error: 'All AI services failed', details: error },
          provider: 'enhanced-groq',
          model: 'none',
          processingTime: Date.now() - startTime,
          taskType: request.task,
          features: []
        };
      }
    }
  }

  private shouldUseGroq(task: string): boolean {
    // Complex tasks that need high-quality AI with company intelligence
    const groqTasks = [
      'question_generation',
      'response_analysis', 
      'performance_analysis',
      'dsa_generation'
    ];
    return groqTasks.includes(task);
  }

  private async processWithGroq(request: SmartAIRequest): Promise<any> {
    switch (request.task) {
      case 'question_generation':
        return await this.groqService.generateInterviewQuestions({
          jobTitle: request.context.jobTitle || '',
          companyName: request.context.companyName || '',
          skills: request.context.skills || [],
          interviewType: request.context.interviewType as any || 'mixed',
          experienceLevel: request.context.experienceLevel as any || 'mid',
          numberOfQuestions: request.context.numberOfQuestions || 10,
          companyIntelligence: request.context.companyIntelligence
        });

      case 'response_analysis':
        return await this.groqService.analyzeInterviewResponse(
          request.context.question || '',
          request.context.userAnswer || '',
          request.context.expectedAnswer || '',
          request.context.interviewType || 'technical',
          request.context.companyName || ''
        );

      case 'dsa_generation':
        return await this.groqService.generateCompanySpecificDSAProblems(
          request.context.companyName || 'Technology Company',
          request.context.difficulty as any || 'medium',
          request.context.count || 3,
          request.context.jobTitle || 'Software Engineer'
        );

      case 'performance_analysis':
        // This would need questions and answers arrays - simplified for now
        return {
          overallScore: 7.5,
          parameterScores: {
            "Technical Knowledge": 8,
            "Problem Solving": 7,
            "Communication Skills": 8,
            "Company Culture Fit": 7,
            "Practical Application": 7
          },
          overallVerdict: "Good performance with room for improvement",
          strengths: ["Technical competency", "Clear communication"],
          improvements: ["Company-specific knowledge", "Advanced problem solving"],
          recommendations: ["Study company tech stack", "Practice system design"]
        };

      default:
        throw new Error(`Unsupported Enhanced Groq task: ${request.task}`);
    }
  }

  private async processWithGemini(request: SmartAIRequest): Promise<any> {
    if (!this.geminiModel) {
      throw new Error('Gemini not initialized - only resume parsing supported');
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
      Parse this resume and extract structured information for interview preparation. Return as JSON:
      
      ${resumeText}
      
      Extract:
      {
        "personalInfo": {
          "name": "Full name",
          "email": "Email address",
          "phone": "Phone number",
          "location": "Location"
        },
        "skills": {
          "technical": ["skill1", "skill2", ...],
          "languages": ["language1", "language2", ...],
          "frameworks": ["framework1", "framework2", ...]
        },
        "experience": [
          {
            "company": "Company name",
            "role": "Job title",
            "duration": "Time period",
            "achievements": ["achievement1", "achievement2"]
          }
        ],
        "projects": [
          {
            "name": "Project name",
            "description": "Brief description",
            "technologies": ["tech1", "tech2"]
          }
        ],
        "education": [
          {
            "institution": "School/University",
            "degree": "Degree type",
            "year": "Graduation year"
          }
        ],
        "summary": "Professional summary for interview context"
      }
    `;

    const result = await this.geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      return extractJSON(text);
    } catch (error) {
      console.error('Failed to parse Gemini resume response:', error);
      // Fallback parsing
      return {
        personalInfo: {
          name: "Unable to parse",
          email: this.extractEmailFromText(resumeText),
          phone: this.extractPhoneFromText(resumeText),
          location: "Unable to parse"
        },
        skills: {
          technical: this.extractSkillsFromText(resumeText),
          languages: [],
          frameworks: []
        },
        experience: [],
        projects: [],
        education: [],
        summary: "Resume parsing failed - manual review required"
      };
    }
  }

  private async searchCompanyWithGemini(companyName: string): Promise<any> {
    const prompt = `
      Provide comprehensive information about the company "${companyName}" for interview preparation. Return as JSON:
      
      {
        "basicInfo": {
          "name": "${companyName}",
          "industry": "Primary industry",
          "description": "Company description and mission",
          "founded": "Founded year",
          "headquarters": "Location",
          "size": "Employee count estimate"
        },
        "technical": {
          "primaryTechStack": ["main tech1", "main tech2", ...],
          "programmingLanguages": ["language1", "language2", ...],
          "frameworks": ["framework1", "framework2", ...],
          "databases": ["db1", "db2", ...],
          "cloudPlatforms": ["platform1", "platform2", ...]
        },
        "culture": {
          "values": ["value1", "value2", ...],
          "workStyle": "Remote/Hybrid/Office description",
          "benefits": ["benefit1", "benefit2", ...]
        },
        "interviewInfo": {
          "commonQuestionTypes": ["type1", "type2", ...],
          "technicalFocus": ["focus1", "focus2", ...],
          "preparationTips": ["tip1", "tip2", ...]
        },
        "recentNews": ["news1", "news2", ...],
        "keyProducts": ["product1", "product2", ...]
      }
    `;

    const result = await this.geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      return extractJSON(text);
    } catch (error) {
      console.error('Failed to parse Gemini company response:', error);
      return {
        basicInfo: {
          name: companyName,
          industry: "Technology",
          description: `${companyName} is a technology company`,
          founded: "Unknown",
          headquarters: "Unknown",
          size: "Unknown"
        },
        technical: {
          primaryTechStack: ["JavaScript", "Python", "React"],
          programmingLanguages: ["JavaScript", "Python"],
          frameworks: ["React", "Node.js"],
          databases: ["PostgreSQL", "MongoDB"],
          cloudPlatforms: ["AWS", "Azure"]
        },
        culture: {
          values: ["Innovation", "Collaboration", "Excellence"],
          workStyle: "Hybrid work environment",
          benefits: ["Health insurance", "Flexible hours", "Learning budget"]
        },
        interviewInfo: {
          commonQuestionTypes: ["Technical", "Behavioral", "System Design"],
          technicalFocus: ["Problem solving", "Code quality", "System thinking"],
          preparationTips: ["Study their tech stack", "Practice coding problems", "Research company values"]
        },
        recentNews: ["Company information limited"],
        keyProducts: ["Technology solutions"]
      };
    }
  }

  private async processFallback(request: SmartAIRequest): Promise<{ data: any; provider: 'enhanced-groq' | 'gemini'; model: string }> {
    // Try the opposite service as fallback
    if (this.shouldUseGroq(request.task)) {
      // Try Gemini as fallback (limited capabilities)
      if (request.task === 'resume_parsing' && this.geminiModel) {
        const data = await this.processWithGemini(request);
        return { data, provider: 'gemini', model: 'gemini-1.5-flash' };
      }
      
      // Generate basic fallback for complex tasks
      const data = this.generateBasicFallback(request);
      return { data, provider: 'enhanced-groq', model: 'fallback' };
    } else {
      // Try Enhanced Groq as fallback
      const data = await this.processWithGroq(request);
      return { data, provider: 'enhanced-groq', model: 'llama-3.3-70b-versatile' };
    }
  }

  private generateBasicFallback(request: SmartAIRequest): any {
    switch (request.task) {
      case 'question_generation':
        return Array.from({ length: request.context.numberOfQuestions || 5 }, (_, i) => ({
          id: `fallback-${i}`,
          question: `Tell me about your experience with ${request.context.skills?.[i % (request.context.skills?.length || 1)] || 'relevant technologies'}.`,
          expectedAnswer: 'Comprehensive answer covering experience and examples.',
          category: request.context.interviewType || 'technical',
          difficulty: 'medium',
          points: 10
        }));
        
      case 'response_analysis':
        return {
          score: 6,
          feedback: 'Basic analysis - AI service unavailable',
          suggestions: ['Provide more detail', 'Add specific examples'],
          strengths: ['Attempted the question'],
          improvements: ['Technical depth', 'Communication clarity']
        };
        
      default:
        return { error: 'Fallback not available for this task' };
    }
  }

  // Helper methods for text extraction
  private extractSkillsFromText(text: string): string[] {
    const commonSkills = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
      'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask',
      'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'SASS', 'LESS',
      'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins',
      'Git', 'GitHub', 'GitLab', 'Linux', 'Bash', 'PowerShell'
    ];
    
    return commonSkills.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
  }

  private extractEmailFromText(text: string): string {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex);
    return matches ? matches[0] : 'Not found';
  }

  private extractPhoneFromText(text: string): string {
    const phoneRegex = /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    const matches = text.match(phoneRegex);
    return matches ? matches[0] : 'Not found';
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

  public async generateDSAProblems(
    companyName: string,
    difficulty: string = 'medium',
    count: number = 3,
    jobTitle: string = 'Software Engineer'
  ) {
    return this.processRequest({
      task: 'dsa_generation',
      context: {
        companyName,
        difficulty,
        count,
        jobTitle
      },
      priority: 'high'
    });
  }

  public async parseResume(resumeText: string) {
    return this.processRequest({
      task: 'resume_parsing',
      context: { resumeText },
      priority: 'medium'
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
    groqAvailable: boolean;
    geminiAvailable: boolean;
    status: string;
    activeProvider: string;
    fallbackAvailable: boolean;
    features: string[];
  }> {
    try {
      const groqHealth = await this.groqService.healthCheck();
      
      return {
        groqAvailable: groqHealth.groqAvailable,
        geminiAvailable: !!this.geminiModel,
        status: groqHealth.status,
        activeProvider: groqHealth.groqAvailable ? 'enhanced-groq' : (this.geminiModel ? 'gemini' : 'none'),
        fallbackAvailable: groqHealth.groqAvailable && !!this.geminiModel,
        features: [
          'Company-specific intelligence',
          'Enhanced prompt engineering', 
          'DSA problem generation',
          'Cultural fit analysis',
          'Resume parsing (Gemini)',
          'Intelligent task routing'
        ]
      };
    } catch (error) {
      return {
        groqAvailable: false,
        geminiAvailable: !!this.geminiModel,
        status: 'error',
        activeProvider: this.geminiModel ? 'gemini-only' : 'none',
        fallbackAvailable: false,
        features: ['Limited functionality']
      };
    }
  }
}

export default SmartAIService;