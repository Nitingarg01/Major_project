/**
 * Preference-Based Question Generator
 * Generates interview questions based on user preferences with company-unique DSA problems
 */

import { UserInterviewPreferences, QuestionGenerationRequest, EnhancedQuestion, DSACompanyProblem } from '@/types/userPreferences';
import { userPreferencesService } from './userPreferencesService';
import { enhancedDSAGenerator } from './enhancedDSAGenerator';
import { optimizedAIService } from './optimizedAIService';
import { extractJSON } from './jsonExtractor';

export class PreferenceBasedQuestionGenerator {
  private static instance: PreferenceBasedQuestionGenerator;

  private constructor() {}

  public static getInstance(): PreferenceBasedQuestionGenerator {
    if (!PreferenceBasedQuestionGenerator.instance) {
      PreferenceBasedQuestionGenerator.instance = new PreferenceBasedQuestionGenerator();
    }
    return PreferenceBasedQuestionGenerator.instance;
  }

  /**
   * Main method to generate preference-based questions
   */
  async generatePreferenceBasedQuestions(request: QuestionGenerationRequest): Promise<{
    success: boolean;
    questions: EnhancedQuestion[];
    metadata: {
      totalQuestions: number;
      preferenceAlignment: number;
      companySpecific: boolean;
      uniqueDSAProblems: number;
      generationTime: number;
      provider: string;
      model: string;
    };
  }> {
    const startTime = Date.now();
    console.log(`🎯 Generating preference-based questions for ${request.companyName} ${request.jobTitle}`);

    try {
      // Get question distribution based on user preferences
      const questionDistribution = userPreferencesService.getQuestionDistribution(
        request.userPreferences,
        request.numberOfQuestions,
        request.interviewType
      );

      console.log('📊 Question distribution:', questionDistribution);

      const allQuestions: EnhancedQuestion[] = [];
      let uniqueDSACount = 0;
      let totalPreferenceAlignment = 0;

      // Generate Technical Questions
      if (questionDistribution.technical > 0) {
        console.log(`💻 Generating ${questionDistribution.technical} technical questions with preferences...`);
        const techQuestions = await this.generateTechnicalQuestionsWithPreferences(
          request,
          questionDistribution.technical
        );
        allQuestions.push(...techQuestions);
        totalPreferenceAlignment += techQuestions.reduce((sum, q) => sum + (q.preferences?.alignsWithUserPrefs ? 1 : 0), 0);
      }

      // Generate Behavioral Questions  
      if (questionDistribution.behavioral > 0) {
        console.log(`🤝 Generating ${questionDistribution.behavioral} behavioral questions with preferences...`);
        const behavioralQuestions = await this.generateBehavioralQuestionsWithPreferences(
          request,
          questionDistribution.behavioral
        );
        allQuestions.push(...behavioralQuestions);
        totalPreferenceAlignment += behavioralQuestions.reduce((sum, q) => sum + (q.preferences?.alignsWithUserPrefs ? 1 : 0), 0);
      }

      // Generate Company-Unique DSA Questions - The Special Feature!
      if (questionDistribution.dsa > 0) {
        console.log(`⚡ Generating ${questionDistribution.dsa} UNIQUE company-specific DSA problems...`);
        const dsaQuestions = await this.generateCompanyUniqueDSAQuestions(
          request,
          questionDistribution.dsa
        );
        allQuestions.push(...dsaQuestions);
        uniqueDSACount = dsaQuestions.length;
        totalPreferenceAlignment += dsaQuestions.length; // DSA questions always align with preferences;
      }

      // Generate System Design Questions
      if (questionDistribution.system_design > 0) {
        console.log(`🏗️ Generating ${questionDistribution.system_design} system design questions...`);
        const systemQuestions = await this.generateSystemDesignQuestionsWithPreferences(
          request,
          questionDistribution.system_design
        );
        allQuestions.push(...systemQuestions);
        totalPreferenceAlignment += systemQuestions.reduce((sum, q) => sum + (q.preferences?.alignsWithUserPrefs ? 1 : 0), 0);
      }

      // Generate Aptitude Questions
      if (questionDistribution.aptitude > 0) {
        console.log(`🧠 Generating ${questionDistribution.aptitude} aptitude questions...`);
        const aptitudeQuestions = await this.generateAptitudeQuestionsWithPreferences(
          request,
          questionDistribution.aptitude
        );
        allQuestions.push(...aptitudeQuestions);
        totalPreferenceAlignment += aptitudeQuestions.reduce((sum, q) => sum + (q.preferences?.alignsWithUserPrefs ? 1 : 0), 0);
      }

      // Shuffle questions for variety
      const shuffledQuestions = this.shuffleQuestions(allQuestions);
      const generationTime = Date.now() - startTime;

      console.log(`✅ Generated ${shuffledQuestions.length} preference-based questions in ${generationTime}ms`);
      console.log(`🎯 Preference alignment: ${Math.round((totalPreferenceAlignment / shuffledQuestions.length) * 100)}%`);
      console.log(`🔥 Unique DSA problems: ${uniqueDSACount}`);

      return {
        success: true,
        questions: shuffledQuestions,
        metadata: {
          totalQuestions: shuffledQuestions.length,
          preferenceAlignment: Math.round((totalPreferenceAlignment / shuffledQuestions.length) * 100),
          companySpecific: true,
          uniqueDSAProblems: uniqueDSACount,
          generationTime,
          provider: 'preference-based-generator',
          model: 'enhanced-ai-with-preferences'
        }
      };

    } catch (error) {
      console.error('❌ Error in preference-based question generation:', error);
      return {
        success: false,
        questions: [],
        metadata: {
          totalQuestions: 0,
          preferenceAlignment: 0,
          companySpecific: false,
          uniqueDSAProblems: 0,
          generationTime: Date.now() - startTime,
          provider: 'error',
          model: 'none'
        }
      };
    }
  }

  /**
   * Generate technical questions aligned with user preferences
   */
  private async generateTechnicalQuestionsWithPreferences(
    request: QuestionGenerationRequest,
    count: number
  ): Promise<EnhancedQuestion[]> {
    const { userPreferences, companyName, jobTitle, skills, experienceLevel } = request;
    const techPrefs = userPreferences.technicalPreferences;
    const companyPrefs = userPreferences.companyPreferences;

    const systemMessage = `You are an expert technical interviewer creating preference-aligned questions for ${companyName}.`;

    const userMessage = `Generate ${count} technical interview questions for ${jobTitle} at ${companyName}.;

User Technical Preferences:
- Focus Areas: ${techPrefs.focusAreas.join(', ')}
- Industry Specific: ${techPrefs.industrySpecific}
- Modern Tech Stack: ${techPrefs.modernTechStack}
- Legacy Experience: ${techPrefs.legacySystemExperience}

Company Preferences:
- Focus on Company Culture: ${companyPrefs.focusOnCompanyCulture}  
- Include Company News: ${companyPrefs.includeCompanyNews}
- Tech Stack Alignment: ${companyPrefs.techStackAlignment}
- Industry Trends: ${companyPrefs.industryTrends}

Required Skills: ${skills.join(', ')}
Experience Level: ${experienceLevel}

Advanced Settings:
- Question Depth: ${userPreferences.advancedSettings.questionDepth}
- Include Follow-ups: ${userPreferences.advancedSettings.includeFollowUps}

Generate questions that perfectly align with these preferences and are specific to ${companyName}'s technical challenges.

Return ONLY valid JSON array:
[
  {
    "id": "unique-tech-id",
    "question": "Preference-aligned technical question specific to ${companyName}",
    "expectedAnswer": "Comprehensive answer covering preferred focus areas and company context",
    "category": "technical",
    "difficulty": "easy|medium|hard",
    "points": 15,
    "timeLimit": 8,
    "evaluationCriteria": ["Technical Depth", "Company Alignment", "Modern Practices"],
    "tags": ["${companyName}", "${jobTitle}", "preference-aligned"],
    "hints": ["Preference-specific hints"],
    "companyRelevance": 9,
    "companyContext": "How this relates to ${companyName}'s specific technical needs"
  }
]`;

    try {
      const response = await optimizedAIService.callEmergentAPI({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        provider: 'openai',
        model: 'gpt-4o-mini',
        max_tokens: 4000,
        temperature: 0.7
      });

      const questions = extractJSON(response.content);
      
      return questions.map((q: any, index: number) => this.enhanceQuestionWithPreferences(
        q,
        'technical',
        userPreferences,
        'emergent-openai',
        'gpt-4o-mini',
        index
      ));

    } catch (error) {
      console.error('❌ Error generating technical questions:', error);
      return this.generateFallbackTechnicalQuestions(request, count);
    }
  }

  /**
   * Generate behavioral questions aligned with user preferences
   */
  private async generateBehavioralQuestionsWithPreferences(
    request: QuestionGenerationRequest,
    count: number
  ): Promise<EnhancedQuestion[]> {
    const { userPreferences, companyName, jobTitle, experienceLevel } = request;
    const behavioralPrefs = userPreferences.behavioralPreferences;

    const systemMessage = `You are an expert behavioral interviewer creating preference-aligned questions for ${companyName}.`;

    const preferredTypes = [];
    if (behavioralPrefs.leadershipQuestions) preferredTypes.push('leadership scenarios');
    if (behavioralPrefs.conflictResolution) preferredTypes.push('conflict resolution');
    if (behavioralPrefs.teamCollaboration) preferredTypes.push('team collaboration');
    if (behavioralPrefs.problemSolving) preferredTypes.push('problem-solving approach');
    if (behavioralPrefs.cultureFit) preferredTypes.push('cultural fit');
    if (behavioralPrefs.situationalJudgment) preferredTypes.push('situational judgment');

    const userMessage = `Generate ${count} behavioral interview questions for ${jobTitle} at ${companyName}.;

User Behavioral Preferences (focus on these types):
${preferredTypes.map(type => `- ${type}`).join('\n')}

Company: ${companyName}
Role: ${jobTitle}
Experience Level: ${experienceLevel}

Advanced Settings:
- Question Depth: ${userPreferences.advancedSettings.questionDepth}
- Include Follow-ups: ${userPreferences.advancedSettings.includeFollowUps}

Create questions that align with the user's preferred behavioral assessment types and ${companyName}'s culture.

Return ONLY valid JSON array:
[
  {
    "id": "unique-behavioral-id",
    "question": "Behavioral question focusing on preferred assessment types",
    "expectedAnswer": "Expected response covering behavioral competencies and company values",
    "category": "behavioral",
    "difficulty": "medium",
    "points": 12,
    "timeLimit": 6,
    "evaluationCriteria": ["${preferredTypes[0] || 'Leadership'}", "Communication", "Company Culture Fit"],
    "tags": ["behavioral", "${companyName}", "preference-aligned"],
    "hints": ["Think about specific examples", "Consider company values"],
    "companyRelevance": 8,
    "companyContext": "How this behavioral trait is valued at ${companyName}"
  }
]`;

    try {
      const response = await optimizedAIService.callEmergentAPI({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        provider: 'openai',
        model: 'gpt-4o-mini',
        max_tokens: 3000,
        temperature: 0.6
      });

      const questions = extractJSON(response.content);
      
      return questions.map((q: any, index: number) => this.enhanceQuestionWithPreferences(
        q,
        'behavioral',
        userPreferences,
        'emergent-openai',
        'gpt-4o-mini',
        index
      ));

    } catch (error) {
      console.error('❌ Error generating behavioral questions:', error);
      return this.generateFallbackBehavioralQuestions(request, count);
    }
  }

  /**
   * Generate company-unique DSA questions - The MAIN FEATURE!
   */
  private async generateCompanyUniqueDSAQuestions(
    request: QuestionGenerationRequest,
    count: number
  ): Promise<EnhancedQuestion[]> {
    const { userPreferences, companyName, experienceLevel } = request;

    console.log(`🔥 Creating UNIQUE DSA problems specifically for ${companyName}...`);

    // Get difficulty progression based on user preferences
    const difficulties = userPreferencesService.getDSADifficultyProgression(
      userPreferences,
      count,
      experienceLevel
    );

    // Generate unique company-specific DSA problems
    const uniqueDSAProblems = await enhancedDSAGenerator.generateUniqueCompanyDSAProblems(
      companyName,
      userPreferences,
      count,
      difficulties,
      experienceLevel
    );

    // Convert DSA problems to enhanced questions
    const dsaQuestions: EnhancedQuestion[] = uniqueDSAProblems.map((problem, index) => ({
      id: problem.id,
      question: `${problem.title}\n\n${problem.description}\n\nCompany Context: ${problem.companyContext}\n\nReal-World Application: ${problem.realWorldApplication}`,
      expectedAnswer: `Implement an efficient solution with ${problem.expectedComplexity.time} time complexity and ${problem.expectedComplexity.space} space complexity. Consider ${companyName}'s scale requirements: ${problem.companySpecificContext.scaleRequirements}`,
      category: 'dsa',
      difficulty: problem.difficulty,
      points: this.getDSAPoints(problem.difficulty),
      timeLimit: this.getDSATimeLimit(problem.difficulty),
      evaluationCriteria: [
        'Correctness',
        'Efficiency', 
        'Code Quality',
        `${companyName} Scale Considerations`,
        'Real-world Application'
      ],
      tags: [
        companyName,
        'unique-dsa',
        'company-specific',
        ...problem.topics
      ],
      hints: problem.hints,
      companyRelevance: problem.uniquenessScore,
      uniquenessScore: problem.uniquenessScore,
      companyContext: problem.companyContext,
      preferences: {
        alignsWithUserPrefs: true,
        preferenceFactors: [
          'Company-specific focus',
          'Real-world scenarios',
          'Preferred difficulty progression',
          'Unique problem generation'
        ]
      },
      metadata: {
        generatedBy: 'enhanced-dsa-generator',
        model: 'preference-based-unique',
        provider: 'company-specific',
        generatedAt: new Date(),
        userPreferenceVersion: userPreferences.version || '1.0'
      }
    }));

    console.log(`✅ Generated ${dsaQuestions.length} UNIQUE DSA problems for ${companyName}`);
    return dsaQuestions;
  }

  /**
   * Generate system design questions with preferences
   */
  private async generateSystemDesignQuestionsWithPreferences(
    request: QuestionGenerationRequest,
    count: number
  ): Promise<EnhancedQuestion[]> {
    const { userPreferences, companyName, jobTitle, skills, experienceLevel } = request;
    
    const systemMessage = `You are a senior system design interviewer at ${companyName} creating preference-aligned architecture questions.`;

    const userMessage = `Generate ${count} system design questions for ${jobTitle} at ${companyName}.;

Experience Level: ${experienceLevel} (adjust complexity accordingly)
Skills: ${skills.join(', ')}
Question Depth: ${userPreferences.advancedSettings.questionDepth}

Focus on ${companyName}'s actual system design challenges and scale requirements.

Return ONLY valid JSON array:
[
  {
    "id": "unique-system-id",
    "question": "System design question specific to ${companyName}'s architecture challenges",
    "expectedAnswer": "Expected system design approach covering scalability, reliability, and ${companyName}-specific requirements",
    "category": "system_design",
    "difficulty": "medium",
    "points": 20,
    "timeLimit": 15,
    "evaluationCriteria": ["Scalability", "System Design", "${companyName} Architecture", "Trade-offs"],
    "tags": ["system-design", "${companyName}", "architecture"],
    "hints": ["Consider ${companyName}'s scale", "Think about real-world constraints"],
    "companyRelevance": 9,
    "companyContext": "How this system design challenge relates to ${companyName}'s infrastructure"
  }
]`;

    try {
      const response = await optimizedAIService.callEmergentAPI({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        provider: 'openai',
        model: 'gpt-4o-mini',
        max_tokens: 3000,
        temperature: 0.7
      });

      const questions = extractJSON(response.content);
      
      return questions.map((q: any, index: number) => this.enhanceQuestionWithPreferences(
        q,
        'system_design',
        userPreferences,
        'emergent-openai', 
        'gpt-4o-mini',
        index
      ));

    } catch (error) {
      console.error('❌ Error generating system design questions:', error);
      return this.generateFallbackSystemDesignQuestions(request, count);
    }
  }

  /**
   * Generate aptitude questions with preferences
   */
  private async generateAptitudeQuestionsWithPreferences(
    request: QuestionGenerationRequest,
    count: number
  ): Promise<EnhancedQuestion[]> {
    // For aptitude questions, we'll use a simpler approach since they're less company-specific
    const questions: EnhancedQuestion[] = [];
    
    for (let i = 0; i < count; i++) {
      questions.push({
        id: `aptitude-pref-${Date.now()}-${i}`,
        question: `Aptitude Question ${i + 1}: Solve this logical reasoning problem designed for ${request.jobTitle} candidates.`,
        expectedAnswer: 'Systematic approach to solving the logical problem with clear reasoning.',
        category: 'aptitude',
        difficulty: 'medium',
        points: 8,
        timeLimit: 3,
        evaluationCriteria: ['Logical Reasoning', 'Problem Solving', 'Analytical Skills'],
        tags: ['aptitude', request.companyName, 'preference-aligned'],
        hints: ['Think systematically', 'Consider all possibilities'],
        companyRelevance: 6,
        preferences: {
          alignsWithUserPrefs: true,
          preferenceFactors: ['Analytical thinking focus']
        },
        metadata: {
          generatedBy: 'preference-aptitude-generator',
          model: 'template-based',
          provider: 'internal',
          generatedAt: new Date(),
          userPreferenceVersion: request.userPreferences.version || '1.0'
        }
      });
    }

    return questions;
  }

  /**
   * Enhance a question with preference metadata
   */
  private enhanceQuestionWithPreferences(
    question: any,
    category: string,
    userPreferences: UserInterviewPreferences,
    provider: string,
    model: string,
    index: number
  ): EnhancedQuestion {
    const preferenceFactors = this.analyzePreferenceAlignment(question, userPreferences, category);
    
    return {
      id: question.id || `${category}-pref-${Date.now()}-${index}`,
      question: question.question,
      expectedAnswer: question.expectedAnswer,
      category: category as any,
      difficulty: question.difficulty || 'medium',
      points: question.points || 12,
      timeLimit: question.timeLimit || 6,
      evaluationCriteria: question.evaluationCriteria || ['Technical Knowledge', 'Communication', 'Problem Solving'],
      tags: question.tags || [category, 'preference-aligned'],
      hints: question.hints || [],
      companyRelevance: question.companyRelevance || 7,
      uniquenessScore: question.uniquenessScore,
      companyContext: question.companyContext,
      preferences: {
        alignsWithUserPrefs: preferenceFactors.length > 0,
        preferenceFactors: preferenceFactors
      },
      metadata: {
        generatedBy: 'preference-based-generator',
        model: model,
        provider: provider,
        generatedAt: new Date(),
        userPreferenceVersion: userPreferences.version || '1.0'
      }
    };
  }

  /**
   * Analyze how well a question aligns with user preferences
   */
  private analyzePreferenceAlignment(
    question: any,
    userPreferences: UserInterviewPreferences,
    category: string
  ): string[] {
    const alignmentFactors: string[] = [];

    if (category === 'technical') {
      const techPrefs = userPreferences.technicalPreferences;
      if (techPrefs.industrySpecific && question.companyContext) {
        alignmentFactors.push('Industry-specific content');
      }
      if (techPrefs.modernTechStack && question.tags?.some((tag: string) => 
        ['react', 'node', 'python', 'aws', 'kubernetes'].includes(tag.toLowerCase()))) {
        alignmentFactors.push('Modern tech stack alignment');
      }
    }

    if (category === 'behavioral') {
      const behavioralPrefs = userPreferences.behavioralPreferences;
      if (behavioralPrefs.leadershipQuestions && question.question.toLowerCase().includes('lead')) {
        alignmentFactors.push('Leadership focus');
      }
      if (behavioralPrefs.teamCollaboration && question.question.toLowerCase().includes('team')) {
        alignmentFactors.push('Team collaboration focus');
      }
    }

    if (category === 'dsa') {
      alignmentFactors.push('Company-specific DSA problems');
      if (userPreferences.dsaPreferences.realWorldScenarios) {
        alignmentFactors.push('Real-world application');
      }
      if (userPreferences.dsaPreferences.companySpecificFocus) {
        alignmentFactors.push('Company-unique problems');
      }
    }

    return alignmentFactors;
  }

  /**
   * Helper methods for DSA questions
   */
  private getDSAPoints(difficulty: 'easy' | 'medium' | 'hard'): number {
    switch (difficulty) {
      case 'easy': return 15;
      case 'medium': return 25;
      case 'hard': return 40;
      default: return 20;
    }
  }

  private getDSATimeLimit(difficulty: 'easy' | 'medium' | 'hard'): number {
    switch (difficulty) {
      case 'easy': return 20;
      case 'medium': return 35;
      case 'hard': return 50;
      default: return 30;
    }
  }

  /**
   * Shuffle questions for variety
   */
  private shuffleQuestions(questions: EnhancedQuestion[]): EnhancedQuestion[] {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Fallback methods for error cases
   */
  private generateFallbackTechnicalQuestions(request: QuestionGenerationRequest, count: number): EnhancedQuestion[] {
    return Array.from({ length: count }, (_, index) => ({
      id: `tech-fallback-${Date.now()}-${index}`,
      question: `Technical Question ${index + 1}: Describe your experience with ${request.skills[index % request.skills.length]} and how it applies to ${request.jobTitle} role at ${request.companyName}.`,
      expectedAnswer: `Detailed technical explanation covering experience, challenges, and practical applications.`,
      category: 'technical',
      difficulty: 'medium',
      points: 15,
      timeLimit: 8,
      evaluationCriteria: ['Technical Depth', 'Communication', 'Real Experience'],
      tags: ['technical', request.companyName, 'fallback'],
      hints: ['Include specific examples', 'Discuss challenges faced'],
      companyRelevance: 6,
      preferences: {
        alignsWithUserPrefs: true,
        preferenceFactors: ['Technical focus']
      },
      metadata: {
        generatedBy: 'fallback-generator',
        model: 'template',
        provider: 'internal',
        generatedAt: new Date(),
        userPreferenceVersion: '1.0'
      }
    }));
  }

  private generateFallbackBehavioralQuestions(request: QuestionGenerationRequest, count: number): EnhancedQuestion[] {
    return Array.from({ length: count }, (_, index) => ({
      id: `behavioral-fallback-${Date.now()}-${index}`,
      question: `Behavioral Question ${index + 1}: Tell me about a challenging situation you faced in your role and how you handled it, particularly in the context of ${request.companyName}'s work environment.`,
      expectedAnswer: `STAR format response demonstrating problem-solving, leadership, and professional growth.`,
      category: 'behavioral',
      difficulty: 'medium',
      points: 12,
      timeLimit: 6,
      evaluationCriteria: ['Communication', 'Problem Solving', 'Professional Growth'],
      tags: ['behavioral', request.companyName, 'fallback'],
      hints: ['Use STAR format', 'Focus on your role and impact'],
      companyRelevance: 6,
      preferences: {
        alignsWithUserPrefs: true,
        preferenceFactors: ['Behavioral assessment']
      },
      metadata: {
        generatedBy: 'fallback-generator',
        model: 'template',
        provider: 'internal',
        generatedAt: new Date(),
        userPreferenceVersion: '1.0'
      }
    }));
  }

  private generateFallbackSystemDesignQuestions(request: QuestionGenerationRequest, count: number): EnhancedQuestion[] {
    return Array.from({ length: count }, (_, index) => ({
      id: `system-fallback-${Date.now()}-${index}`,
      question: `System Design Question ${index + 1}: Design a scalable system for ${request.companyName} that handles their core business requirements with high availability and performance.`,
      expectedAnswer: `Complete system design covering architecture, scalability, data flow, and technology choices appropriate for ${request.companyName}'s scale.`,
      category: 'system_design',
      difficulty: 'medium',
      points: 20,
      timeLimit: 15,
      evaluationCriteria: ['System Architecture', 'Scalability', 'Technology Choices', 'Trade-offs'],
      tags: ['system-design', request.companyName, 'fallback'],
      hints: ['Consider scale requirements', 'Think about trade-offs'],
      companyRelevance: 7,
      preferences: {
        alignsWithUserPrefs: true,
        preferenceFactors: ['System design focus']
      },
      metadata: {
        generatedBy: 'fallback-generator',
        model: 'template',
        provider: 'internal',
        generatedAt: new Date(),
        userPreferenceVersion: '1.0'
      }
    }));
  }
}

export const preferenceBasedQuestionGenerator = PreferenceBasedQuestionGenerator.getInstance();