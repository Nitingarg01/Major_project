/**
 * Ollama Service - Offline LLM Integration
 * Replaces Groq and Emergent LLM services with local Ollama instance
 * Provides company-specific, relevant interview questions
 */

import { extractJSON } from './jsonExtractor';

interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  };
}

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

interface InterviewQuestion {
  id: string;
  question: string;
  expectedAnswer: string;
  category: 'technical' | 'behavioral' | 'dsa' | 'aptitude' | 'system_design';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit?: number;
  evaluationCriteria: string[];
  tags: string[];
  hints?: string[];
  companyRelevance: number;
}

interface DSAProblem {
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
  companySpecific?: boolean;
}

interface CompanyData {
  name: string;
  industry?: string;
  techStack?: string[];
  culture?: string[];
  recentNews?: string[];
  interviewStyle?: string;
  commonQuestions?: string[];
}

export class OllamaService {
  private static instance: OllamaService;
  private baseUrl = 'http://localhost:11434';
  private model = 'llama3.1:8b';
  
  // Company database for enhanced question generation
  private companyDatabase: Map<string, CompanyData> = new Map();

  private constructor() {
    this.initializeCompanyDatabase();
    console.log('🦙 OllamaService initialized with model:', this.model);
  }

  public static getInstance(): OllamaService {
    if (!OllamaService.instance) {
      OllamaService.instance = new OllamaService();
    }
    return OllamaService.instance;
  }

  private initializeCompanyDatabase() {
    // Popular tech companies with their specific data
    const companies = [
      {
        name: 'Google',
        industry: 'Technology',
        techStack: ['Go', 'Python', 'Java', 'C++', 'Kubernetes', 'TensorFlow'],
        culture: ['Innovation', 'Data-driven', 'Collaboration', 'Think big'],
        interviewStyle: 'Technical depth, system design, behavioral',
        commonQuestions: ['Design a search engine', 'Scale to billions of users']
      },
      {
        name: 'Meta',
        industry: 'Social Media',
        techStack: ['React', 'PHP', 'Python', 'GraphQL', 'PyTorch'],
        culture: ['Move fast', 'Be bold', 'Focus on impact', 'Be open'],
        interviewStyle: 'Product sense, technical execution, leadership',
        commonQuestions: ['Design Facebook feed', 'How would you improve Instagram?']
      },
      {
        name: 'Amazon',
        industry: 'E-commerce/Cloud',
        techStack: ['Java', 'Python', 'AWS', 'DynamoDB', 'Lambda'],
        culture: ['Customer obsession', 'Ownership', 'Invent and simplify', 'Bias for action'],
        interviewStyle: 'Leadership principles, technical problems, system design',
        commonQuestions: ['Design Amazon marketplace', 'Tell me about a time you failed']
      },
      {
        name: 'Microsoft',
        industry: 'Technology',
        techStack: ['C#', 'TypeScript', 'Azure', 'PowerShell', '.NET'],
        culture: ['Respect', 'Integrity', 'Accountability', 'Inclusive'],
        interviewStyle: 'Technical skills, problem-solving, collaboration',
        commonQuestions: ['Design Office 365', 'How do you handle conflict?']
      },
      {
        name: 'Apple',
        industry: 'Consumer Electronics',
        techStack: ['Swift', 'Objective-C', 'iOS', 'macOS', 'Metal'],
        culture: ['Innovation', 'Excellence', 'Privacy', 'Simplicity'],
        interviewStyle: 'Product focus, technical excellence, attention to detail',
        commonQuestions: ['Design iPhone feature', 'Optimize for performance']
      },
      {
        name: 'Netflix',
        industry: 'Streaming/Entertainment',
        techStack: ['Java', 'Python', 'React', 'AWS', 'Microservices'],
        culture: ['Freedom and responsibility', 'High performance', 'Candor'],
        interviewStyle: 'Culture fit, technical depth, real-world scenarios',
        commonQuestions: ['Design video streaming', 'Handle service failures']
      }
    ];

    companies.forEach(company => {
      this.companyDatabase.set(company.name.toLowerCase(), company);
    });
  }

  public getCompanySuggestions(query: string): string[] {
    const suggestions: string[] = [];
    const queryLower = query.toLowerCase();
    
    for (const [key, company] of this.companyDatabase) {
      if (company.name.toLowerCase().includes(queryLower) || key.includes(queryLower)) {
        suggestions.push(company.name);
      }
    }
    
    // Add some generic suggestions if no matches
    if (suggestions.length === 0 && query.length > 0) {
      const commonCompanies = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Uber', 'Airbnb'];
      return commonCompanies.filter(name => 
        name.toLowerCase().includes(queryLower)
      );
    }
    
    return suggestions.slice(0, 10); // Limit to 10 suggestions
  }

  private async callOllama(request: OllamaRequest): Promise<OllamaResponse> {
    try {
      console.log('🚀 Calling Ollama API with model:', request.model);
      
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          prompt: request.prompt,
          stream: false,
          options: {
            temperature: request.options?.temperature || 0.7,
            top_p: request.options?.top_p || 0.9,
            num_predict: request.options?.max_tokens || 4000,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Ollama API response received');
      
      return data as OllamaResponse;
    } catch (error) {
      console.error('❌ Ollama API call failed:', error);
      throw error;
    }
  }

  public async generateInterviewQuestions(params: {
    jobTitle: string;
    companyName: string;
    skills: string[];
    interviewType: 'technical' | 'behavioral' | 'mixed' | 'system_design';
    experienceLevel: 'entry' | 'mid' | 'senior';
    numberOfQuestions: number;
  }): Promise<InterviewQuestion[]> {
    
    const companyData = this.companyDatabase.get(params.companyName.toLowerCase());
    
    const systemPrompt = `You are an expert technical interviewer specializing in creating company-specific, highly relevant interview questions for ${params.companyName}.

COMPANY CONTEXT:
${companyData ? `
- Industry: ${companyData.industry}
- Tech Stack: ${companyData.techStack?.join(', ')}
- Culture: ${companyData.culture?.join(', ')}
- Interview Style: ${companyData.interviewStyle}
- Common Focus Areas: ${companyData.commonQuestions?.join(', ')}
` : 'Research and use general knowledge about this company.'}

CRITICAL REQUIREMENTS:
1. Questions MUST be specific to ${params.companyName} and their actual tech stack/culture
2. Address ${params.experienceLevel} level complexity appropriately
3. Focus on ${params.interviewType} interview format
4. Include real-world scenarios this company would face
5. Make questions practical and role-relevant for ${params.jobTitle}

Generate exactly ${params.numberOfQuestions} questions that are:
- Highly relevant to ${params.companyName}'s actual work and challenges
- Appropriate for ${params.experienceLevel} ${params.jobTitle} role
- Focus on skills: ${params.skills.join(', ')}
- Include company-specific context and scenarios
- Avoid generic questions that could apply to any company

Return ONLY a valid JSON array with this exact structure:
[
  {
    "id": "unique-question-id",
    "question": "Detailed company-specific question with context",
    "expectedAnswer": "Comprehensive expected answer with company-specific insights",
    "category": "${params.interviewType}",
    "difficulty": "easy|medium|hard",
    "points": 10,
    "timeLimit": 5,
    "evaluationCriteria": ["specific criteria for this company"],
    "tags": ["${params.companyName}", "${params.jobTitle}", "relevant-tech"],
    "hints": ["helpful company-specific hints"],
    "companyRelevance": 9
  }
]

Focus on making questions that only someone interviewing at ${params.companyName} would encounter.`;

    try {
      const response = await this.callOllama({
        model: this.model,
        prompt: systemPrompt,
        options: {
          temperature: 0.8,
          max_tokens: 6000
        }
      });

      const questionsText = response.response;
      let questions = extractJSON(questionsText);
      
      if (!Array.isArray(questions)) {
        throw new Error('Invalid JSON response format');
      }

      return questions.map((q: any, index: number) => ({
        ...q,
        id: q.id || `ollama-q-${Date.now()}-${index}`,
        category: params.interviewType,
        points: q.points || 10,
        timeLimit: q.timeLimit || 5,
        evaluationCriteria: q.evaluationCriteria || ['Technical accuracy', 'Company relevance', 'Communication'],
        tags: [...(q.tags || []), params.companyName, params.jobTitle],
        companyRelevance: q.companyRelevance || 8,
        provider: 'ollama',
        model: this.model
      }));
    } catch (error) {
      console.error('❌ Error generating interview questions:', error);
      return this.generateFallbackQuestions(params);
    }
  }

  public async generateDSAProblems(
    companyName: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    count: number = 6
  ): Promise<DSAProblem[]> {
    
    const companyData = this.companyDatabase.get(companyName.toLowerCase());
    
    const systemPrompt = `You are an expert algorithm and data structures interviewer creating ${companyName}-specific coding problems.

COMPANY CONTEXT:
${companyData ? `
- ${companyName} works with: ${companyData.techStack?.join(', ')}
- Common challenges: ${companyData.commonQuestions?.join(', ')}
- Focus on problems they would actually encounter
` : `Research ${companyName}'s technical challenges and create relevant problems.`}

Create exactly ${count} ${difficulty} DSA problems that are:
1. Specific to challenges ${companyName} engineers would face
2. Realistic interview problems for their technical stack
3. Appropriate ${difficulty} level complexity
4. Include comprehensive test cases and examples
5. Provide company-relevant context in problem descriptions

Return ONLY a valid JSON array:
[
  {
    "id": "unique-problem-id",
    "title": "Company-specific problem title",
    "difficulty": "${difficulty}",
    "description": "Problem description with ${companyName} context and requirements",
    "examples": [
      {
        "input": "sample input format",
        "output": "expected output format",
        "explanation": "explanation with company context"
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
    "constraints": ["constraint 1", "constraint 2"],
    "topics": ["relevant algorithms and data structures"],
    "hints": ["company-specific hints"],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "companySpecific": true
  }
]`;

    try {
      const response = await this.callOllama({
        model: this.model,
        prompt: systemPrompt,
        options: {
          temperature: 0.7,
          max_tokens: 8000
        }
      });

      const problemsText = response.response;
      let problems = extractJSON(problemsText);
      
      if (!Array.isArray(problems)) {
        throw new Error('Invalid JSON response format');
      }

      return problems.map((p: any, index: number) => ({
        ...p,
        id: p.id || `ollama-dsa-${Date.now()}-${index}`,
        difficulty: difficulty,
        examples: p.examples || [],
        testCases: p.testCases || [],
        constraints: p.constraints || [],
        topics: p.topics || ['General'],
        hints: p.hints || [],
        companySpecific: true,
        provider: 'ollama',
        model: this.model
      }));
    } catch (error) {
      console.error('❌ Error generating DSA problems:', error);
      return this.generateFallbackDSAProblems(companyName, difficulty, count);
    }
  }

  public async analyzeInterviewResponse(
    question: string,
    userAnswer: string,
    expectedAnswer: string,
    category: string,
    companyContext: string
  ): Promise<{
    score: number;
    feedback: string;
    suggestions: string[];
    strengths: string[];
    improvements: string[];
  }> {
    
    const companyData = this.companyDatabase.get(companyContext.toLowerCase());
    
    const systemPrompt = `You are a senior technical interviewer at ${companyContext} evaluating a candidate's response.

COMPANY EVALUATION STANDARDS:
${companyData ? `
- ${companyContext} values: ${companyData.culture?.join(', ')}
- Technical focus: ${companyData.techStack?.join(', ')}
- Interview style: ${companyData.interviewStyle}
` : `Use industry standards and known practices for ${companyContext}.`}

EVALUATION TASK:
Question (${category}): ${question}
Expected Answer: ${expectedAnswer}
Candidate Answer: ${userAnswer}

Provide detailed analysis considering ${companyContext}'s specific standards and culture.

Return ONLY valid JSON:
{
  "score": (0-10 score based on company standards),
  "feedback": "Detailed feedback considering company culture and technical standards",
  "suggestions": ["specific improvement suggestions for ${companyContext}"],
  "strengths": ["what they did well according to company values"],
  "improvements": ["areas to improve specifically for ${companyContext}"]
}

Consider:
- Technical accuracy for ${companyContext}'s tech stack
- Communication style fitting company culture
- Problem-solving approach they value
- Company-specific best practices`;

    try {
      const response = await this.callOllama({
        model: this.model,
        prompt: systemPrompt,
        options: {
          temperature: 0.5,
          max_tokens: 3000
        }
      });

      const analysisText = response.response;
      const analysis = extractJSON(analysisText);
      
      return {
        score: Math.max(0, Math.min(10, analysis.score || 5)),
        feedback: analysis.feedback || 'Response analyzed successfully.',
        suggestions: analysis.suggestions || ['Continue practicing for this company'],
        strengths: analysis.strengths || ['Attempted the question'],
        improvements: analysis.improvements || ['Add more company-specific insights']
      };
    } catch (error) {
      console.error('❌ Error analyzing response:', error);
      return this.generateFallbackAnalysis(userAnswer, companyContext);
    }
  }

  public async analyzeOverallPerformance(
    questions: any[],
    answers: string[],
    jobTitle: string,
    companyName: string,
    skills: string[]
  ): Promise<any> {
    const companyData = this.companyDatabase.get(companyName.toLowerCase());
    
    const systemPrompt = `You are a senior hiring manager at ${companyName} evaluating overall interview performance for a ${jobTitle} position.

COMPANY STANDARDS:
${companyData ? `
- ${companyName} culture: ${companyData.culture?.join(', ')}
- Technical requirements: ${companyData.techStack?.join(', ')}
- Evaluation style: ${companyData.interviewStyle}
` : `Use industry standards for ${companyName}.`}

PERFORMANCE ANALYSIS:
Position: ${jobTitle} at ${companyName}
Required Skills: ${skills.join(', ')}

Questions and Responses:
${questions.map((q, index) => `
Q${index + 1} [${q.difficulty}] [${q.category}]: ${q.question}
Expected: ${q.expectedAnswer}
Candidate: ${answers[index] || 'No answer provided'}
Points: ${q.points}
`).join('\n')}

Provide comprehensive analysis considering ${companyName}'s hiring standards.

Return ONLY valid JSON:
{
  "overallScore": (0-10 based on company standards),
  "parameterScores": {
    "Technical Knowledge": (0-10),
    "Problem Solving": (0-10),
    "Communication Skills": (0-10),
    "Company Culture Fit": (0-10),
    "Practical Application": (0-10)
  },
  "overallVerdict": "Summary considering ${companyName}'s standards",
  "adviceForImprovement": [
    {
      "question": "Question text",
      "advice": "Company-specific improvement advice"
    }
  ],
  "strengths": ["company-relevant strengths"],
  "improvements": ["areas to improve for ${companyName}"],
  "recommendations": ["specific recommendations for ${companyName} interviews"]
}`;

    try {
      const response = await this.callOllama({
        model: this.model,
        prompt: systemPrompt,
        options: {
          temperature: 0.3,
          max_tokens: 5000
        }
      });

      const analysisText = response.response;
      return extractJSON(analysisText);
    } catch (error) {
      console.error('❌ Error analyzing overall performance:', error);
      return this.generateFallbackOverallAnalysis(questions, answers, companyName);
    }
  }

  // Health check method
  public async healthCheck(): Promise<{
    ollamaAvailable: boolean;
    modelLoaded: boolean;
    status: string;
    companyDatabaseSize: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
      });
      
      const models = await response.json();
      const modelExists = models.models?.some((m: any) => m.name === this.model);
      
      return {
        ollamaAvailable: true,
        modelLoaded: modelExists,
        status: modelExists ? 'ready' : 'model_not_loaded',
        companyDatabaseSize: this.companyDatabase.size
      };
    } catch (error) {
      return {
        ollamaAvailable: false,
        modelLoaded: false,
        status: 'service_unavailable',
        companyDatabaseSize: this.companyDatabase.size
      };
    }
  }

  // Fallback methods for error cases
  private generateFallbackQuestions(params: any): InterviewQuestion[] {
    const companyData = this.companyDatabase.get(params.companyName.toLowerCase());
    const questions: InterviewQuestion[] = [];
    
    for (let i = 0; i < params.numberOfQuestions; i++) {
      questions.push({
        id: `fallback-q-${i}`,
        question: `Based on ${params.companyName}'s focus on ${companyData?.techStack?.[0] || 'technology'}, describe your experience with ${params.skills[i % params.skills.length]} and how it applies to their ${params.jobTitle} role.`,
        expectedAnswer: `A comprehensive answer covering experience with ${params.skills[i % params.skills.length]}, specific examples relevant to ${params.companyName}, and understanding of their technical challenges.`,
        category: params.interviewType,
        difficulty: ['easy', 'medium', 'hard'][i % 3] as 'easy' | 'medium' | 'hard',
        points: 10,
        timeLimit: 5,
        evaluationCriteria: ['Technical accuracy', 'Company relevance', 'Communication clarity'],
        tags: [params.companyName, params.jobTitle, params.skills[i % params.skills.length]],
        hints: [`Think about ${params.companyName}'s specific use cases`],
        companyRelevance: 7
      });
    }
    
    return questions;
  }

  private generateFallbackDSAProblems(companyName: string, difficulty: string, count: number): DSAProblem[] {
    const problems: DSAProblem[] = [];
    const companyData = this.companyDatabase.get(companyName.toLowerCase());
    
    const problemTemplates = [
      {
        title: `${companyName} Data Processing`,
        description: `Solve a data processing problem typical at ${companyName} involving their ${companyData?.techStack?.[0] || 'main technology'} stack.`,
        topics: ['Array', 'Hash Table']
      },
      {
        title: `${companyName} System Optimization`,
        description: `Optimize a system component commonly used at ${companyName} for better performance.`,
        topics: ['Dynamic Programming', 'Optimization']
      }
    ];

    for (let i = 0; i < count; i++) {
      const template = problemTemplates[i % problemTemplates.length];
      problems.push({
        id: `fallback-dsa-${i}`,
        title: template.title,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        description: template.description,
        examples: [
          {
            input: 'Example input',
            output: 'Example output',
            explanation: `Explanation relevant to ${companyName}'s context`
          }
        ],
        testCases: [
          {
            id: `test-${i}-1`,
            input: 'Test input',
            expectedOutput: 'Expected output'
          }
        ],
        constraints: ['1 <= n <= 1000', 'Time limit: 2 seconds'],
        topics: template.topics,
        hints: [`Consider ${companyName}'s typical data patterns`],
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        companySpecific: true
      });
    }
    
    return problems;
  }

  private generateFallbackAnalysis(userAnswer: string, companyContext: string) {
    const wordCount = userAnswer.split(' ').length;
    const score = Math.min(10, Math.max(3, wordCount / 15));
    
    return {
      score,
      feedback: `Your response shows ${score >= 7 ? 'good' : score >= 5 ? 'adequate' : 'basic'} understanding. For ${companyContext} interviews, consider adding more specific technical details and company-relevant examples.`,
      suggestions: [`Research ${companyContext}'s specific technologies`, 'Add more detailed technical explanations', 'Include real-world examples'],
      strengths: wordCount > 30 ? ['Comprehensive response', 'Good technical depth'] : ['Attempted the question'],
      improvements: [`Study ${companyContext}'s tech stack`, 'Practice company-specific scenarios', 'Improve technical communication']
    };
  }

  private generateFallbackOverallAnalysis(questions: any[], answers: string[], companyName: string) {
    const avgWordCount = answers.reduce((sum, ans) => sum + ans.split(' ').length, 0) / answers.length;
    const score = Math.min(10, Math.max(4, avgWordCount / 20));
    
    return {
      overallScore: score,
      parameterScores: {
        "Technical Knowledge": Math.min(10, score + 1),
        "Problem Solving": score,
        "Communication Skills": Math.min(10, score + 0.5),
        "Company Culture Fit": Math.max(3, score - 0.5),
        "Practical Application": score
      },
      overallVerdict: `The candidate demonstrated ${score >= 7 ? 'strong' : score >= 5 ? 'adequate' : 'basic'} performance for ${companyName} interview standards.`,
      adviceForImprovement: questions.slice(0, 3).map((q, i) => ({
        question: q.question,
        advice: `For ${companyName}, focus more on their specific technical challenges and company culture values.`
      })),
      strengths: ["Attempted all questions", "Showed problem-solving approach", "Professional communication"],
      improvements: [`Study ${companyName}'s specific technologies`, "Practice company-specific scenarios", "Improve technical depth"],
      recommendations: [`Research ${companyName}'s recent projects`, "Practice with their tech stack", "Study their culture and values"]
    };
  }
}

export default OllamaService;