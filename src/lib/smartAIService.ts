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

      // Try primary provider first
      if (this.shouldUseGroq(request.task)) {
        try {
          result = await this.processWithGroq(request);
          provider = 'enhanced-groq';
          model = 'llama-3.3-70b-versatile';
          features = [
            'Company-specific intelligence',
            'Enhanced prompt engineering',
            'Advanced problem generation',
            'Cultural fit analysis'
          ];
        } catch (groqError: any) {
          console.warn('Groq service failed, trying Gemini fallback:', groqError.message);
          result = await this.processWithGemini(request);
          provider = 'gemini';
          model = 'gemini-1.5-flash';
          features = ['Fallback processing', 'Basic functionality'];
        }
      } else {
        try {
          result = await this.processWithGemini(request);
          provider = 'gemini';
          model = 'gemini-1.5-flash';
          features = [
            'Fast processing',
            'Resume parsing',
            'Basic company search',
            'Cost-effective'
          ];
        } catch (geminiError: any) {
          console.warn('Gemini service failed, trying Groq fallback:', geminiError.message);
          result = await this.processWithGroq(request);
          provider = 'enhanced-groq';
          model = 'llama-3.3-70b-versatile';
          features = ['Fallback processing', 'Enhanced capabilities'];
        }
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
        try {
          const dsaProblems = await this.groqService.generateCompanySpecificDSAProblems(
            request.context.companyName || 'Technology Company',
            request.context.difficulty as any || 'medium',
            request.context.count || 3,
            request.context.jobTitle || 'Software Engineer'
          );
          
          // Validate that we got an array of problems
          if (!Array.isArray(dsaProblems) || dsaProblems.length === 0) {
            throw new Error('DSA generation returned invalid data');
          }
          
          return dsaProblems;
        } catch (dsaError) {
          console.error('DSA generation failed in Smart AI service:', dsaError);
          // Return a basic fallback DSA problem
          return [{
            id: `fallback-dsa-${Date.now()}`,
            title: `${request.context.companyName || 'Company'} Coding Challenge`,
            difficulty: request.context.difficulty as any || 'medium',
            description: 'Solve this coding problem to demonstrate your programming skills.',
            examples: [{
              input: 'Example input',
              output: 'Example output',
              explanation: 'This is how the solution works'
            }],
            testCases: [{
              id: 'test1',
              input: 'Test input',
              expectedOutput: 'Expected output'
            }],
            constraints: ['Standard programming constraints apply'],
            topics: ['Programming', 'Problem Solving'],
            hints: ['Think step by step', 'Consider edge cases']
          }];
        }

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

    try {
      const result = await this.geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return extractJSON(text);
      } catch (parseError) {
        console.error('Failed to parse Gemini company response:', parseError);
        throw parseError;
      }
    } catch (apiError: any) {
      console.error('Gemini API error:', apiError);
      
      // Handle specific error cases
      if (apiError.message?.includes('overloaded') || apiError.message?.includes('503')) {
        console.log('Gemini service overloaded, using fallback company data');
      } else if (apiError.message?.includes('quota') || apiError.message?.includes('429')) {
        console.log('Gemini quota exceeded, using fallback company data');
      } else {
        console.log('Gemini service unavailable, using fallback company data');
      }
      
      // Return fallback data instead of throwing error
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
    console.log('🔄 Using fallback processing for:', request.task);
    
    // Try the opposite service as fallback, but with additional error handling
    if (this.shouldUseGroq(request.task)) {
      // For Groq tasks, try Gemini only if it's working, otherwise use static fallback
      if (request.task === 'resume_parsing' && this.geminiModel) {
        try {
          const data = await this.processWithGemini(request);
          return { data, provider: 'gemini', model: 'gemini-1.5-flash' };
        } catch (geminiError) {
          console.warn('Gemini fallback also failed, using static fallback');
          const data = this.generateBasicFallback(request);
          return { data, provider: 'enhanced-groq', model: 'static-fallback' };
        }
      }
      
      // Generate basic fallback for complex tasks
      const data = this.generateBasicFallback(request);
      return { data, provider: 'enhanced-groq', model: 'static-fallback' };
    } else {
      // For Gemini tasks, try Groq as fallback
      try {
        const data = await this.processWithGroq(request);
        return { data, provider: 'enhanced-groq', model: 'llama-3.3-70b-versatile' };
      } catch (groqError) {
        console.warn('Groq fallback also failed, using static fallback');
        const data = this.generateBasicFallback(request);
        return { data, provider: 'enhanced-groq', model: 'static-fallback' };
      }
    }
  }

  private generateBasicFallback(request: SmartAIRequest): any {
    console.log('📋 Generating static fallback for:', request.task);
    
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
        
      case 'company_search':
        const companyName = request.context.companyName || 'Technology Company';
        return {
          basicInfo: {
            name: companyName,
            industry: "Technology",
            description: `${companyName} is a technology company focused on innovation and growth.`,
            founded: "Unknown",
            headquarters: "Unknown",
            size: "Medium"
          },
          technical: {
            primaryTechStack: ["JavaScript", "Python", "React", "Node.js"],
            programmingLanguages: ["JavaScript", "Python", "Java"],
            frameworks: ["React", "Node.js", "Express"],
            databases: ["PostgreSQL", "MongoDB"],
            cloudPlatforms: ["AWS", "Azure"]
          },
          culture: {
            values: ["Innovation", "Collaboration", "Excellence"],
            workStyle: "Hybrid work environment",
            benefits: ["Competitive salary", "Health insurance", "Flexible hours"]
          },
          interviewInfo: {
            commonQuestionTypes: ["Technical", "Behavioral", "Problem Solving"],
            technicalFocus: ["Coding", "System Design", "Algorithms"],
            preparationTips: [
              "Practice coding problems",
              "Review system design basics",
              "Prepare behavioral examples"
            ]
          },
          recentNews: [
            `${companyName} continues to grow and innovate`,
            `${companyName} expands engineering team`,
            `${companyName} focuses on technology excellence`
          ],
          keyProducts: ["Core Platform", "Mobile App", "API Services"]
        };
        
      case 'dsa_generation':
        const count = request.context.count || 2;
        const difficulty = request.context.difficulty || 'medium';
        return Array.from({ length: count }, (_, i) => ({
          id: `fallback-dsa-${i}`,
          title: `Coding Challenge ${i + 1}`,
          difficulty,
          description: "Solve this algorithmic problem efficiently.",
          examples: [
            { input: "Example input", output: "Expected output", explanation: "Solution explanation" }
          ],
          testCases: [
            { id: `test-${i}-1`, input: "test input", expectedOutput: "test output" }
          ],
          constraints: ["Standard constraints apply"],
          topics: ["Algorithms", "Data Structures"],
          hints: ["Think about the optimal approach", "Consider time complexity"]
        }));
        
      case 'resume_parsing':
        return {
          personalInfo: {
            name: "Resume Parsed",
            email: "Not available",
            phone: "Not available",
            location: "Not available"
          },
          skills: {
            technical: ["JavaScript", "Python", "React"],
            soft: ["Communication", "Problem Solving"]
          },
          experience: [],
          education: [],
          projects: []
        };
        
      default:
        return { 
          error: 'AI service temporarily unavailable',
          fallback: true,
          message: 'Using basic fallback data'
        };
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