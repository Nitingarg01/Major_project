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
  private model = 'phi3:mini'; // Optimized for Ryzen 3 + 12GB RAM - 3x faster than llama3.1:8b
  
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
    // Comprehensive company database with enhanced intelligence
    const companies = [
      // Big Tech (FAANG+)
      {
        name: 'Google',
        industry: 'Technology',
        techStack: ['Go', 'Python', 'Java', 'C++', 'Kubernetes', 'TensorFlow', 'BigQuery', 'Spanner'],
        culture: ['Innovation', 'Data-driven', 'Collaboration', 'Think big', 'Focus on user'],
        interviewStyle: 'Technical depth, system design, behavioral, Googleyness',
        commonQuestions: ['Design a search engine', 'Scale to billions of users', 'MapReduce concepts']
      },
      {
        name: 'Meta',
        industry: 'Social Media',
        techStack: ['React', 'PHP', 'Python', 'GraphQL', 'PyTorch', 'Hack', 'React Native'],
        culture: ['Move fast', 'Be bold', 'Focus on impact', 'Be open', 'Build social value'],
        interviewStyle: 'Product sense, technical execution, leadership, culture fit',
        commonQuestions: ['Design Facebook feed', 'How would you improve Instagram?', 'Handle fake news']
      },
      {
        name: 'Amazon',
        industry: 'E-commerce/Cloud',
        techStack: ['Java', 'Python', 'AWS', 'DynamoDB', 'Lambda', 'S3', 'EC2', 'Kinesis'],
        culture: ['Customer obsession', 'Ownership', 'Invent and simplify', 'Bias for action', 'Dive deep'],
        interviewStyle: 'Leadership principles, technical problems, system design, behavioral',
        commonQuestions: ['Design Amazon marketplace', 'Tell me about a time you failed', 'Scale AWS services']
      },
      {
        name: 'Microsoft',
        industry: 'Technology',
        techStack: ['C#', 'TypeScript', 'Azure', 'PowerShell', '.NET', 'Teams', 'Office 365'],
        culture: ['Respect', 'Integrity', 'Accountability', 'Inclusive', 'Growth mindset'],
        interviewStyle: 'Technical skills, problem-solving, collaboration, growth mindset',
        commonQuestions: ['Design Office 365', 'How do you handle conflict?', 'Azure architecture']
      },
      {
        name: 'Apple',
        industry: 'Consumer Electronics',
        techStack: ['Swift', 'Objective-C', 'iOS', 'macOS', 'Metal', 'Core Data', 'Xcode'],
        culture: ['Innovation', 'Excellence', 'Privacy', 'Simplicity', 'Think different'],
        interviewStyle: 'Product focus, technical excellence, attention to detail, design thinking',
        commonQuestions: ['Design iPhone feature', 'Optimize for performance', 'Privacy considerations']
      },
      {
        name: 'Netflix',
        industry: 'Streaming/Entertainment',
        techStack: ['Java', 'Python', 'React', 'AWS', 'Microservices', 'Kafka', 'Cassandra'],
        culture: ['Freedom and responsibility', 'High performance', 'Candor', 'Innovation'],
        interviewStyle: 'Culture fit, technical depth, real-world scenarios, keeper test',
        commonQuestions: ['Design video streaming', 'Handle service failures', 'Content recommendation']
      },

      // AI & ML Companies
      {
        name: 'OpenAI',
        industry: 'AI & Machine Learning',
        techStack: ['Python', 'PyTorch', 'Kubernetes', 'React', 'PostgreSQL', 'Redis'],
        culture: ['AI safety', 'Beneficial AGI', 'Transparency', 'Collaboration', 'Research excellence'],
        interviewStyle: 'Technical depth, AI/ML knowledge, ethics, research thinking',
        commonQuestions: ['Design language model', 'AI safety considerations', 'Scale ML training']
      },
      {
        name: 'Anthropic',
        industry: 'AI & Machine Learning',
        techStack: ['Python', 'PyTorch', 'JAX', 'React', 'Kubernetes', 'GCP'],
        culture: ['AI safety', 'Constitutional AI', 'Research rigor', 'Responsible development'],
        interviewStyle: 'Research background, AI alignment, technical depth, safety focus',
        commonQuestions: ['Constitutional AI principles', 'RLHF implementation', 'AI safety research']
      },
      {
        name: 'Hugging Face',
        industry: 'AI & Machine Learning',
        techStack: ['Python', 'PyTorch', 'Transformers', 'React', 'FastAPI', 'Docker'],
        culture: ['Open source', 'Democratizing AI', 'Community', 'Collaboration'],
        interviewStyle: 'Open source contributions, ML expertise, community building',
        commonQuestions: ['Model optimization', 'Transformer architecture', 'Open source strategy']
      },

      // High-Growth Tech
      {
        name: 'Tesla',
        industry: 'Automotive & Energy',
        techStack: ['Python', 'C++', 'React', 'PostgreSQL', 'Docker', 'Kubernetes', 'ROS'],
        culture: ['Innovation', 'Sustainability', 'First principles', 'Move fast', 'Excellence'],
        interviewStyle: 'Technical excellence, innovation, problem-solving, mission alignment',
        commonQuestions: ['Autonomous driving algorithms', 'Battery optimization', 'Manufacturing efficiency']
      },
      {
        name: 'SpaceX',
        industry: 'Aerospace',
        techStack: ['C++', 'Python', 'Linux', 'Docker', 'React', 'PostgreSQL'],
        culture: ['Mars mission', 'Innovation', 'First principles', 'Rapid iteration', 'Excellence'],
        interviewStyle: 'Technical depth, problem-solving, mission passion, innovation',
        commonQuestions: ['Rocket trajectory', 'Fault tolerance', 'Real-time systems']
      },
      {
        name: 'Uber',
        industry: 'Transportation',
        techStack: ['Go', 'Python', 'React', 'Kafka', 'Cassandra', 'MySQL', 'Kubernetes'],
        culture: ['Move fast', 'Customer obsession', 'Innovation', 'Global scale'],
        interviewStyle: 'System design, scalability, product sense, cultural fit',
        commonQuestions: ['Design ride matching', 'Surge pricing algorithm', 'Global scaling']
      },
      {
        name: 'Airbnb',
        industry: 'Travel & Hospitality',
        techStack: ['Ruby', 'React', 'Python', 'Kafka', 'Druid', 'MySQL', 'Kubernetes'],
        culture: ['Belong anywhere', 'Champion mission', 'Be a host', 'Embrace diversity'],
        interviewStyle: 'Product thinking, cultural values, technical depth, design sense',
        commonQuestions: ['Design booking system', 'Trust and safety', 'Internationalization']
      },

      // Enterprise & Cloud
      {
        name: 'Salesforce',
        industry: 'CRM & Enterprise',
        techStack: ['Java', 'JavaScript', 'Apex', 'Lightning', 'Heroku', 'PostgreSQL'],
        culture: ['Customer success', 'Innovation', 'Equality', 'Sustainability', 'Ohana'],
        interviewStyle: 'Customer focus, technical skills, cultural values, business acumen',
        commonQuestions: ['Design CRM system', 'Multi-tenancy', 'Customer success metrics']
      },
      {
        name: 'Oracle',
        industry: 'Enterprise Software',
        techStack: ['Java', 'SQL', 'PL/SQL', 'JavaScript', 'Oracle Cloud', 'Kubernetes'],
        culture: ['Excellence', 'Innovation', 'Integrity', 'Customer success'],
        interviewStyle: 'Technical depth, database expertise, enterprise solutions',
        commonQuestions: ['Database optimization', 'Enterprise architecture', 'Cloud migration']
      },
      {
        name: 'Snowflake',
        industry: 'Data & Analytics',
        techStack: ['Java', 'Scala', 'Python', 'React', 'Kubernetes', 'AWS', 'Azure'],
        culture: ['Data-driven', 'Innovation', 'Customer obsession', 'Excellence'],
        interviewStyle: 'Data architecture, cloud expertise, technical depth, product thinking',
        commonQuestions: ['Data warehouse design', 'Query optimization', 'Cloud data platform']
      },

      // Fintech
      {
        name: 'Stripe',
        industry: 'Fintech',
        techStack: ['Ruby', 'Scala', 'React', 'PostgreSQL', 'Kafka', 'Kubernetes'],
        culture: ['User obsession', 'Rigor', 'Transparency', 'Global scale'],
        interviewStyle: 'System design, financial systems, product thinking, attention to detail',
        commonQuestions: ['Payment processing', 'Financial compliance', 'Global payments']
      },
      {
        name: 'Square',
        industry: 'Fintech',
        techStack: ['Java', 'Kotlin', 'React', 'MySQL', 'Kafka', 'Kubernetes'],
        culture: ['Customer obsession', 'Simplicity', 'Innovation', 'Inclusion'],
        interviewStyle: 'Product focus, financial systems, technical depth, design thinking',
        commonQuestions: ['Point of sale system', 'Payment security', 'Small business tools']
      },
      {
        name: 'Robinhood',
        industry: 'Fintech',
        techStack: ['Python', 'Django', 'React', 'PostgreSQL', 'Kafka', 'Kubernetes'],
        culture: ['Democratize finance', 'Customer first', 'Innovation', 'Transparency'],
        interviewStyle: 'Financial markets, system reliability, product thinking, ethics',
        commonQuestions: ['Trading system design', 'Risk management', 'Market data processing']
      },

      // Developer Tools & Productivity
      {
        name: 'GitHub',
        industry: 'Developer Tools',
        techStack: ['Ruby', 'Go', 'TypeScript', 'React', 'MySQL', 'Redis'],
        culture: ['Open source', 'Developer happiness', 'Collaboration', 'Innovation'],
        interviewStyle: 'Open source experience, developer empathy, technical depth',
        commonQuestions: ['Version control systems', 'Developer workflows', 'Code collaboration']
      },
      {
        name: 'GitLab',
        industry: 'Developer Tools',
        techStack: ['Ruby', 'Go', 'Vue.js', 'PostgreSQL', 'Redis', 'Kubernetes'],
        culture: ['Transparency', 'Remote-first', 'Collaboration', 'Iteration', 'Results'],
        interviewStyle: 'DevOps expertise, remote collaboration, product thinking',
        commonQuestions: ['CI/CD pipelines', 'DevOps workflows', 'Remote team collaboration']
      },
      {
        name: 'Atlassian',
        industry: 'Software Development',
        techStack: ['Java', 'React', 'Node.js', 'MySQL', 'AWS', 'Kubernetes'],
        culture: ['Open work', 'Build with heart', 'Don\'t #@!% the customer', 'Play as a team'],
        interviewStyle: 'Team collaboration, product thinking, technical skills, cultural values',
        commonQuestions: ['Team productivity tools', 'Agile workflows', 'Developer experience']
      },

      // Communication & Collaboration
      {
        name: 'Slack',
        industry: 'Communication',
        techStack: ['PHP', 'JavaScript', 'React', 'MySQL', 'Redis', 'Kafka'],
        culture: ['Customer obsession', 'Craftsmanship', 'Empathy', 'Playfulness', 'Thriving'],
        interviewStyle: 'Product thinking, user experience, technical depth, team collaboration',
        commonQuestions: ['Real-time messaging', 'Team collaboration', 'Enterprise security']
      },
      {
        name: 'Zoom',
        industry: 'Video Communication',
        techStack: ['C++', 'JavaScript', 'React', 'MySQL', 'WebRTC', 'Kubernetes'],
        culture: ['Customer happiness', 'Innovation', 'Team collaboration', 'Global reach'],
        interviewStyle: 'Video technology, scalability, user experience, reliability',
        commonQuestions: ['Video streaming optimization', 'Real-time communication', 'Global infrastructure']
      },
      {
        name: 'Discord',
        industry: 'Gaming & Communication',
        techStack: ['JavaScript', 'Python', 'React', 'Cassandra', 'Redis', 'Kubernetes'],
        culture: ['Gaming community', 'User happiness', 'Innovation', 'Inclusive'],
        interviewStyle: 'Gaming knowledge, community building, technical depth, product passion',
        commonQuestions: ['Real-time chat systems', 'Gaming community features', 'Voice communication']
      }
    ];

    companies.forEach(company => {
      this.companyDatabase.set(company.name.toLowerCase(), company);
    });
  }

  public getCompanySuggestions(query: string): string[] {
    const suggestions: string[] = [];
    const queryLower = query.toLowerCase();
    
    // First, find exact and prefix matches
    for (const [key, company] of this.companyDatabase) {
      if (company.name.toLowerCase() === queryLower) {
        suggestions.unshift(company.name); // Exact match goes first
      } else if (company.name.toLowerCase().startsWith(queryLower)) {
        suggestions.push(company.name);
      }
    }
    
    // Then find partial matches
    for (const [key, company] of this.companyDatabase) {
      if (company.name.toLowerCase().includes(queryLower) && 
          !suggestions.includes(company.name)) {
        suggestions.push(company.name);
      }
    }
    
    // Also search by industry
    for (const [key, company] of this.companyDatabase) {
      if (company.industry && company.industry.toLowerCase().includes(queryLower) && 
          !suggestions.includes(company.name)) {
        suggestions.push(company.name);
      }
    }
    
    // If no matches found, return popular trending companies
    if (suggestions.length === 0 && query.length > 0) {
      const trendingCompanies = [
        'OpenAI', 'Anthropic', 'Google', 'Meta', 'Amazon', 'Microsoft', 
        'Apple', 'Tesla', 'SpaceX', 'Netflix', 'Uber', 'Airbnb', 
        'Stripe', 'GitHub', 'Slack', 'Zoom'
      ];
      return trendingCompanies.filter(name => 
        name.toLowerCase().includes(queryLower)
      ).slice(0, 8);
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
    
    // Enhanced problem templates based on real interview questions
    const problemTemplates = [
      {
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
        examples: [
          {
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0,1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
          },
          {
            input: 'nums = [3,2,4], target = 6',
            output: '[1,2]',
            explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
          }
        ],
        testCases: [
          { id: 'test1', input: '[2,7,11,15]\n9', expectedOutput: '[0,1]' },
          { id: 'test2', input: '[3,2,4]\n6', expectedOutput: '[1,2]' },
          { id: 'test3', input: '[3,3]\n6', expectedOutput: '[0,1]' }
        ],
        constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9', 'Only one valid answer exists.'],
        topics: ['Array', 'Hash Table'],
        hints: ['Use a hash table to store complements', 'The complement of nums[i] is target - nums[i]'],
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)'
      },
      {
        title: 'Valid Parentheses',
        description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets and in the correct order.',
        examples: [
          {
            input: 's = "()"',
            output: 'true',
            explanation: 'The string contains valid parentheses.'
          },
          {
            input: 's = "()[]{}"',
            output: 'true',
            explanation: 'All brackets are properly matched.'
          },
          {
            input: 's = "(]"',
            output: 'false',
            explanation: 'Brackets are not properly matched.'
          }
        ],
        testCases: [
          { id: 'test1', input: '()', expectedOutput: 'true' },
          { id: 'test2', input: '()[]{})("', expectedOutput: 'true' },
          { id: 'test3', input: '(]', expectedOutput: 'false' },
          { id: 'test4', input: '([)]', expectedOutput: 'false' }
        ],
        constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only "(", ")", "{", "}", "[", "]".'],
        topics: ['String', 'Stack'],
        hints: ['Use a stack to keep track of opening brackets', 'When you encounter a closing bracket, check if it matches the most recent opening bracket'],
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)'
      },
      {
        title: 'Merge Two Sorted Lists',
        description: 'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a sorted manner and return the head of the merged linked list.',
        examples: [
          {
            input: 'list1 = [1,2,4], list2 = [1,3,4]',
            output: '[1,1,2,3,4,4]',
            explanation: 'Merge the two sorted lists into one sorted list.'
          }
        ],
        testCases: [
          { id: 'test1', input: '[1,2,4]\n[1,3,4]', expectedOutput: '[1,1,2,3,4,4]' },
          { id: 'test2', input: '[]\n[]', expectedOutput: '[]' },
          { id: 'test3', input: '[]\n[0]', expectedOutput: '[0]' }
        ],
        constraints: ['The number of nodes in both lists is in the range [0, 50]', '-100 <= Node.val <= 100', 'Both list1 and list2 are sorted in non-decreasing order.'],
        topics: ['Linked List', 'Recursion'],
        hints: ['Use a dummy node to simplify the merging process', 'Compare the values of the current nodes from both lists'],
        timeComplexity: 'O(n + m)',
        spaceComplexity: 'O(1)'
      },
      {
        title: 'Maximum Subarray',
        description: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
        examples: [
          {
            input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
            output: '6',
            explanation: 'The subarray [4,-1,2,1] has the largest sum = 6.'
          }
        ],
        testCases: [
          { id: 'test1', input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' },
          { id: 'test2', input: '[1]', expectedOutput: '1' },
          { id: 'test3', input: '[5,4,-1,7,8]', expectedOutput: '23' }
        ],
        constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
        topics: ['Array', 'Dynamic Programming', 'Divide and Conquer'],
        hints: ['Try using Kadane\'s algorithm', 'Keep track of the maximum sum ending at the current position'],
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)'
      },
      {
        title: 'Binary Tree Inorder Traversal',
        description: 'Given the root of a binary tree, return the inorder traversal of its nodes\' values.',
        examples: [
          {
            input: 'root = [1,null,2,3]',
            output: '[1,3,2]',
            explanation: 'Inorder traversal visits left subtree, root, then right subtree.'
          }
        ],
        testCases: [
          { id: 'test1', input: '[1,null,2,3]', expectedOutput: '[1,3,2]' },
          { id: 'test2', input: '[]', expectedOutput: '[]' },
          { id: 'test3', input: '[1]', expectedOutput: '[1]' }
        ],
        constraints: ['The number of nodes in the tree is in the range [0, 100]', '-100 <= Node.val <= 100'],
        topics: ['Tree', 'Depth-First Search', 'Binary Tree'],
        hints: ['Use recursion or stack-based iterative approach', 'In inorder traversal: left -> root -> right'],
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)'
      },
      {
        title: 'Group Anagrams',
        description: 'Given an array of strings strs, group the anagrams together. You can return the answer in any order.',
        examples: [
          {
            input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
            output: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
            explanation: 'Group strings that are anagrams of each other.'
          }
        ],
        testCases: [
          { id: 'test1', input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
          { id: 'test2', input: '[""]', expectedOutput: '[[""]]' },
          { id: 'test3', input: '["a"]', expectedOutput: '[["a"]]' }
        ],
        constraints: ['1 <= strs.length <= 10^4', '0 <= strs[i].length <= 100', 'strs[i] consists of lowercase English letters.'],
        topics: ['Array', 'Hash Table', 'String', 'Sorting'],
        hints: ['Use sorted strings as keys in a hash map', 'All anagrams will have the same sorted representation'],
        timeComplexity: 'O(N * K log K)',
        spaceComplexity: 'O(N * K)'
      }
    ];

    // Adjust difficulty-specific problems
    let relevantProblems = problemTemplates;
    if (difficulty === 'easy') {
      relevantProblems = problemTemplates.slice(0, 3); // Two Sum, Valid Parentheses, Merge Lists
    } else if (difficulty === 'hard') {
      relevantProblems = problemTemplates.slice(3); // More complex problems
    }

    for (let i = 0; i < Math.min(count, relevantProblems.length); i++) {
      const template = relevantProblems[i % relevantProblems.length];
      
      // Add company context to make it more relevant
      let contextualDescription = template.description;
      if (companyData) {
        contextualDescription += `\n\nThis problem is commonly asked at ${companyName} and relates to their work with ${companyData.techStack?.slice(0, 2).join(' and ')}.`;
      }
      
      problems.push({
        id: `${companyName.toLowerCase()}-dsa-${i}-${Date.now()}`,
        title: `${template.title}${companyData ? ` (${companyName} Style)` : ''}`,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        description: contextualDescription,
        examples: template.examples,
        testCases: template.testCases,
        constraints: template.constraints,
        topics: template.topics,
        hints: template.hints,
        timeComplexity: template.timeComplexity,
        spaceComplexity: template.spaceComplexity,
        companySpecific: true,
        provider: 'fallback',
        model: 'built-in'
      });
    }

    // If we need more problems than templates, cycle through them
    while (problems.length < count) {
      const template = relevantProblems[problems.length % relevantProblems.length];
      problems.push({
        id: `${companyName.toLowerCase()}-dsa-${problems.length}-${Date.now()}`,
        title: `${template.title} (Variant ${Math.floor(problems.length / relevantProblems.length) + 1})`,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        description: template.description + ` This is a variation commonly used in ${companyName} interviews.`,
        examples: template.examples,
        testCases: template.testCases,
        constraints: template.constraints,
        topics: template.topics,
        hints: template.hints,
        timeComplexity: template.timeComplexity,
        spaceComplexity: template.spaceComplexity,
        companySpecific: true,
        provider: 'fallback',
        model: 'built-in'
      });
    }
    
    return problems.slice(0, count);
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