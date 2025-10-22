/**
 * Enhanced Groq AI Service - Advanced AI Integration for Interview Tasks
 * Handles question generation, response analysis, and interview feedback
 * Uses Groq's llama-3.3-70b-versatile model with enhanced prompt engineering
 * Company-specific DSA problems and optimized interview questions
 */

import Groq from 'groq-sdk';
import { extractJSON } from './jsonExtractor';

// Load environment variables
const groqApiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || '';

interface GroqRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant',
    content: string
  }>;
  model?: string,
  max_tokens?: number,
  temperature?: number
}

interface InterviewQuestion {
  id: string,
  question: string,
  expectedAnswer: string,
  category: 'technical' | 'behavioral' | 'dsa' | 'aptitude' | 'system_design',
  difficulty: 'easy' | 'medium' | 'hard',
  points: number,
  timeLimit?: number,
  evaluationCriteria: string[],
  tags: string[],
  hints?: string[],
  companyRelevance?: number
}

interface DSAProblem {
  id: string,
  title: string,
  difficulty: 'easy' | 'medium' | 'hard',
  description: string,
  examples: Array<{
    input: string,
    output: string,
    explanation?: string
  }>;
  testCases: Array<{
    id: string,
    input: string,
    expectedOutput: string,
    hidden?: boolean
  }>;
  constraints: string[],
  topics: string[],
  hints?: string[],
  timeComplexity?: string,
  spaceComplexity?: string,
  companyContext?: string,
  realWorldApplication?: string
}

interface CompanyProfile {
  name: string,
  industry: string,
  techStack: string[],
  culture: string[],
  recentNews?: string[],
  interviewStyle: string,
  commonChallenges: string[],
  focusAreas: string[],
  valuedSkills: string[],
  tipicalProblems: string[];
}

export class EnhancedGroqAIService {
  private static instance: EnhancedGroqAIService,
  private groq: Groq,
  private model = 'llama-3.3-70b-versatile';
  private companyProfiles: Map<string, CompanyProfile> = new Map(),

  private constructor() {
    if (!groqApiKey) {
      console.warn('⚠️ Groq API key not found, service will use mock responses');
      throw new Error('Groq API key is required');
    }
    
    this.groq = new Groq({
      apiKey: groqApiKey,
      dangerouslyAllowBrowser: true
    });
    
    this.initializeCompanyProfiles();
    console.log('🚀 Enhanced GroqAIService initialized with advanced prompt engineering');
  }

  public static getInstance(): EnhancedGroqAIService {
    if (!EnhancedGroqAIService.instance) {
      EnhancedGroqAIService.instance = new EnhancedGroqAIService();
    }
    return EnhancedGroqAIService.instance;
  }

  private initializeCompanyProfiles() {
    const companies: CompanyProfile[] = [,
      {
        name: 'Google',
        industry: 'Technology',
        techStack: ['Go', 'Python', 'Java', 'C++', 'Kubernetes', 'TensorFlow', 'BigQuery', 'Spanner', 'Protocol Buffers'],
        culture: ['Innovation first', 'Data-driven decisions', 'Collaborative problem solving', 'Think 10x', 'User focus'],
        interviewStyle: 'Technical depth, system design at scale, behavioral (Googleyness), coding excellence',
        commonChallenges: ['Scaling to billions of users', 'Real-time data processing', 'Distributed systems', 'ML at scale'],
        focusAreas: ['Algorithms', 'System Design', 'Scalability', 'Data Structures', 'Machine Learning'],
        valuedSkills: ['Problem solving', 'Scalable thinking', 'Code optimization', 'System architecture'],
        tipicalProblems: ['Search algorithms', 'Graph problems', 'Tree traversals', 'Dynamic programming', 'Distributed systems']
      },
      {
        name: 'Meta',
        industry: 'Social Media Technology',
        techStack: ['React', 'PHP', 'Python', 'GraphQL', 'PyTorch', 'Hack', 'React Native', 'Flow', 'Jest'],
        culture: ['Move fast and break things', 'Be bold', 'Focus on impact', 'Be open', 'Build social value'],
        interviewStyle: 'Product sense, technical execution, leadership and drive, people and culture fit',
        commonChallenges: ['Social graph algorithms', 'Real-time feeds', 'Content moderation at scale', 'Mobile performance'],
        focusAreas: ['Frontend Architecture', 'Social Algorithms', 'Mobile Development', 'GraphQL', 'React Ecosystem'],
        valuedSkills: ['Product thinking', 'Fast execution', 'Social impact focus', 'Mobile-first development'],
        tipicalProblems: ['Graph algorithms', 'Feed ranking', 'Real-time updates', 'Social network analysis', 'Content filtering']
      },
      {
        name: 'Amazon',
        industry: 'E-commerce & Cloud Computing',
        techStack: ['Java', 'Python', 'AWS', 'DynamoDB', 'Lambda', 'S3', 'EC2', 'Kinesis', 'Spring'],
        culture: ['Customer obsession', 'Ownership', 'Invent and simplify', 'Bias for action', 'Dive deep', 'Frugality'],
        interviewStyle: 'Leadership principles focused, technical problems, system design, behavioral stories (STAR method)',
        commonChallenges: ['E-commerce at scale', 'Supply chain optimization', 'Cloud infrastructure', 'Cost optimization'],
        focusAreas: ['Distributed Systems', 'Microservices', 'Cost Optimization', 'Scalability', 'Cloud Architecture'],
        valuedSkills: ['Customer focus', 'Ownership mindset', 'System thinking', 'Cost consciousness'],
        tipicalProblems: ['Optimization problems', 'Tree and graph algorithms', 'Dynamic programming', 'System design', 'Caching strategies']
      },
      {
        name: 'Netflix',
        industry: 'Streaming & Entertainment',
        techStack: ['Java', 'Python', 'React', 'AWS', 'Microservices', 'Kafka', 'Cassandra', 'Spark', 'Hystrix'],
        culture: ['Freedom and responsibility', 'High performance', 'Candor', 'Innovation', 'Context not control'],
        interviewStyle: 'Culture fit (keeper test), technical mastery, real-world problem solving, engineering excellence',
        commonChallenges: ['Video streaming at scale', 'Recommendation algorithms', 'Global CDN', 'Microservices architecture'],
        focusAreas: ['Streaming Technology', 'Recommendation Systems', 'Microservices', 'Performance Optimization', 'A/B Testing'],
        valuedSkills: ['Engineering excellence', 'Independent decision making', 'Performance focus', 'Innovation mindset'],
        tipicalProblems: ['Recommendation algorithms', 'Caching strategies', 'Load balancing', 'Stream processing', 'Graph algorithms']
      },
      {
        name: 'Tesla',
        industry: 'Automotive & Clean Energy',
        techStack: ['Python', 'C++', 'React', 'PostgreSQL', 'Docker', 'Kubernetes', 'ROS', 'PyTorch', 'OpenCV'],
        culture: ['Innovation', 'Sustainability', 'First principles thinking', 'Move fast', 'Excellence', 'Mission driven'],
        interviewStyle: 'Technical excellence, innovation capacity, problem-solving approach, mission alignment, hands-on skills',
        commonChallenges: ['Autonomous driving algorithms', 'Battery optimization', 'Manufacturing automation', 'Real-time systems'],
        focusAreas: ['Computer Vision', 'Real-time Systems', 'Optimization Algorithms', 'Embedded Systems', 'Machine Learning'],
        valuedSkills: ['Systems thinking', 'Hardware-software integration', 'Performance optimization', 'Innovation'],
        tipicalProblems: ['Pathfinding algorithms', 'Computer vision problems', 'Optimization challenges', 'Real-time processing', 'Sensor fusion']
      },
      {
        name: 'Microsoft',
        industry: 'Technology Software',
        techStack: ['C#', 'TypeScript', 'Azure', 'PowerShell', '.NET', 'Teams', 'Office 365', 'SQL Server'],
        culture: ['Respect', 'Integrity', 'Accountability', 'Inclusive', 'Growth mindset', 'Customer success'],
        interviewStyle: 'Technical skills assessment, collaborative problem-solving, growth mindset evaluation, inclusive leadership',
        commonChallenges: ['Enterprise software scalability', 'Cloud platform reliability', 'Developer productivity tools', 'Integration challenges'],
        focusAreas: ['Cloud Computing', 'Enterprise Software', 'Developer Tools', 'Productivity Software', 'AI Integration'],
        valuedSkills: ['Collaborative leadership', 'Growth mindset', 'Customer empathy', 'Technical depth'],
        tipicalProblems: ['String algorithms', 'Tree problems', 'System integration', 'Performance optimization', 'Data processing']
      }
    ];

    companies.forEach(company => {
      this.companyProfiles.set(company.name.toLowerCase(), company);
    });
  }

  private async callGroqAPI(request: GroqRequest): Promise<string> {
    try {
      console.log(`🚀 Calling Enhanced Groq API with ${this.model}...`);
      
      const chatCompletion = await this.groq.chat.completions.create({
        messages: request.messages as any,
        model: request.model || this.model,
        max_tokens: request.max_tokens || 4000,
        temperature: request.temperature || 0.7;
      });

      const content = chatCompletion.choices[0]?.message?.content || '';
      console.log('✅ Enhanced Groq API response received');
      
      return content;
    } catch (error) {
      console.error('❌ Enhanced Groq API call failed:', error);
      throw error;
    }
  }

  // Enhanced interview question generation with better prompt engineering
  public async generateInterviewQuestions(params: {
    jobTitle: string,
    companyName: string,
    skills: string[],
    interviewType: 'technical' | 'behavioral' | 'mixed' | 'aptitude' | 'system_design',
    experienceLevel: 'entry' | 'mid' | 'senior',
    numberOfQuestions: number,
    companyIntelligence?: any
  }): Promise<InterviewQuestion[]> {
    
    const companyProfile = this.companyProfiles.get(params.companyName.toLowerCase());
    
    const systemMessage = `You are a senior technical interviewer at ${params.companyName} with 10+ years of experience. You excel at creating challenging, company-specific interview questions that accurately assess candidates for real-world success.;

COMPANY CONTEXT: ${params.companyName}
${companyProfile ? `
- Industry: ${companyProfile.industry}
- Tech Stack: ${companyProfile.techStack.join(', ')}
- Culture Values: ${companyProfile.culture.join(', ')}
- Interview Philosophy: ${companyProfile.interviewStyle}
- Common Challenges: ${companyProfile.commonChallenges.join(', ')}
- Focus Areas: ${companyProfile.focusAreas.join(', ')}
` : 'Research the company to create relevant questions.'}

Your questions should:
1. Test skills actually needed at ${params.companyName}
2. Reflect real challenges engineers face there
3. Match their technical culture and standards
4. Be practical and scenario-based, not theoretical
5. Include company-specific context and examples`;
    
    const userMessage = `Create exactly ${params.numberOfQuestions} ${params.interviewType} interview questions for:;

🎯 POSITION: ${params.jobTitle} at ${params.companyName}
📊 LEVEL: ${params.experienceLevel} (${this.getExperienceLevelGuidance(params.experienceLevel)})
🛠️ KEY SKILLS: ${params.skills.join(', ')}

${companyProfile ? `
🏢 COMPANY-SPECIFIC REQUIREMENTS:
- Must align with ${params.companyName}'s tech stack: ${companyProfile.techStack.slice(0, 5).join(', ')}
- Should reflect their culture: ${companyProfile.culture.slice(0, 3).join(', ')}
- Address their common challenges: ${companyProfile.commonChallenges.slice(0, 2).join(', ')}
- Focus on their valued skills: ${companyProfile.valuedSkills.join(', ')}
` : ''}

📋 QUESTION REQUIREMENTS:
- Each question must include realistic ${params.companyName} scenarios
- Avoid generic programming questions - make them company-contextual
- Include specific technologies they actually use
- Test both technical skills AND problem-solving approach
- Questions should feel like real work situations at ${params.companyName}

🎚️ DIFFICULTY DISTRIBUTION:
- Easy: ${Math.ceil(params.numberOfQuestions * 0.3)} questions (fundamentals, basic scenarios)
- Medium: ${Math.ceil(params.numberOfQuestions * 0.5)} questions (practical application, integration)
- Hard: ${Math.floor(params.numberOfQuestions * 0.2)} questions (complex scenarios, architecture decisions)

🎯 ${params.interviewType.toUpperCase()} FOCUS:
${this.getInterviewTypeFocus(params.interviewType, params.companyName, companyProfile)}

Return ONLY a valid JSON array:
[
  {
    "id": "unique-question-id",
    "question": "Detailed, company-specific question with realistic scenario and clear requirements",
    "expectedAnswer": "Comprehensive answer including key concepts, ${params.companyName}-specific considerations, code examples if relevant, and evaluation criteria",
    "category": "${params.interviewType}",
    "difficulty": "easy|medium|hard",
    "points": 10,
    "timeLimit": 8,
    "evaluationCriteria": ["Company-specific criteria", "Technical accuracy", "Problem-solving approach", "Communication clarity"],
    "tags": ["${params.companyName}", "${params.jobTitle}", "relevant-tech"],
    "hints": ["Company-specific guidance if candidate struggles"],
    "companyRelevance": 9
  }
]

🚀 MAKE QUESTIONS FEEL AUTHENTIC TO ${params.companyName} - like they came from their actual interview process!`;

    try {
      const response = await this.callGroqAPI({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 8000,
        temperature: 0.8
      });

      const questions = extractJSON(response);
      return questions.map((q: any, index: number) => ({
        ...q,
        id: q.id || `enhanced-groq-q-${Date.now()}-${index}`,
        category: params.interviewType,
        points: q.points || 10,
        timeLimit: q.timeLimit || 8,
        evaluationCriteria: q.evaluationCriteria || ['Technical accuracy', 'Company relevance', 'Problem-solving', 'Communication'],
        tags: [...(q.tags || []), params.companyName, params.jobTitle, params.interviewType],
        companyRelevance: q.companyRelevance || 8,
        provider: 'enhanced-groq',
        model: this.model
      }));
    } catch (error) {
      console.error('❌ Error generating enhanced interview questions:', error);
      return this.generateMockQuestions(params);
    }
  }

  // Enhanced company-specific DSA problems
  public async generateCompanySpecificDSAProblems(
    companyName: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    count: number = 6,
    jobTitle: string = 'Software Engineer';
  ): Promise<DSAProblem[]> {
    
    const companyProfile = this.companyProfiles.get(companyName.toLowerCase());
    
    const systemMessage = `You are a senior DSA problem creator at ${companyName}. You design coding problems that mirror real challenges engineers face at the company.;

COMPANY INTELLIGENCE: ${companyName}
${companyProfile ? `
- Industry: ${companyProfile.industry}
- Technical Challenges: ${companyProfile.commonChallenges.join(', ')}
- Typical Problem Types: ${companyProfile.tipicalProblems.join(', ')}
- Tech Focus: ${companyProfile.focusAreas.join(', ')}
- Real Use Cases: ${companyProfile.valuedSkills.join(', ')}
` : 'Create problems relevant to modern tech companies.'}

Your problems should:
1. Mirror actual work scenarios at ${companyName}
2. Use company-relevant context and examples
3. Test algorithms engineers actually need there
4. Include real-world constraints and optimizations
5. Feel like solving actual ${companyName} engineering challenges`;
    
    const userMessage = `Generate exactly ${count} company-specific DSA problems for ${jobTitle} interviews at ${companyName}.;

🎯 COMPANY CONTEXT: ${companyName}
${companyProfile ? `
🏢 REAL CHALLENGES THEY FACE:
${companyProfile.commonChallenges.map((challenge, i) => `${i + 1}. ${challenge}`).join('\n')}

🛠️ TYPICAL PROBLEM PATTERNS:
${companyProfile.tipicalProblems.map((problem, i) => `${i + 1}. ${problem}`).join('\n')}

💡 FOCUS AREAS: ${companyProfile.focusAreas.join(', ')}
` : ''}

📊 DIFFICULTY: ${difficulty}
🎚️ COUNT: ${count} unique problems

🚀 PROBLEM REQUIREMENTS:
- Each problem must feel like a REAL ${companyName} engineering challenge
- Use company-specific terminology and context
- Include realistic constraints from their domain
- Problems should test algorithms they actually need
- Add company-relevant examples and use cases
- Include real-world optimization considerations

${this.getCompanySpecificDSAGuidance(companyName, companyProfile)}

Return ONLY a valid JSON array:
[
  {
    "id": "unique-problem-id",
    "title": "Company-specific problem title reflecting real ${companyName} challenges",
    "difficulty": "${difficulty}",
    "description": "Clear problem description with ${companyName} context, realistic scenarios, and specific requirements that mirror actual work",
    "examples": [
      {
        "input": "realistic input reflecting ${companyName} data patterns",
        "output": "expected output with company-relevant format",
        "explanation": "detailed explanation connecting to ${companyName}'s real use cases and why this solution matters"
      }
    ],
    "testCases": [
      {
        "id": "test-1",
        "input": "test case reflecting real ${companyName} data scenarios",
        "expectedOutput": "expected result with company-appropriate formatting",
        "hidden": false
      },
      {
        "id": "test-2",
        "input": "edge case relevant to ${companyName}'s scale/challenges",
        "expectedOutput": "expected result handling company-specific constraints",
        "hidden": true
      }
    ],
    "constraints": ["realistic constraints reflecting ${companyName}'s scale", "performance requirements they actually face"],
    "topics": ["relevant algorithms", "data structures ${companyName} uses"],
    "hints": ["${companyName}-specific guidance", "hints connecting to their tech stack"],
    "timeComplexity": "optimal complexity for ${companyName}'s scale",
    "spaceComplexity": "space efficiency requirements",
    "companyContext": "how this problem relates to actual ${companyName} work",
    "realWorldApplication": "specific ${companyName} use cases where this algorithm is needed"
  }
]

🎯 MAKE EACH PROBLEM FEEL LIKE A REAL ${companyName} ENGINEERING CHALLENGE!`;

    try {
      const response = await this.callGroqAPI({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 10000,
        temperature: 0.8
      });

      const problems = extractJSON(response);
      
      // Debug logging
      console.log('Raw Groq response:', response.substring(0, 200) + '...');
      console.log('Extracted problems:', problems);
      
      // Validate that problems is an array
      if (!Array.isArray(problems)) {
        console.warn('DSA generation did not return an array, got:', typeof problems, problems);
        return this.generateMockDSAProblems(companyName, difficulty, count);
      }
      
      if (problems.length === 0) {
        console.warn('DSA generation returned empty array, using fallback');
        return this.generateMockDSAProblems(companyName, difficulty, count);
      }
      
      return problems.map((p: any, index: number) => ({
        ...p,
        id: p.id || `enhanced-dsa-${companyName.toLowerCase()}-${Date.now()}-${index}`,
        difficulty: difficulty,
        examples: p.examples || [],
        testCases: p.testCases || [],
        constraints: p.constraints || [],
        topics: p.topics || ['General'],
        hints: p.hints || [],
        companyContext: p.companyContext || `Relevant to ${companyName}'s engineering challenges`,
        realWorldApplication: p.realWorldApplication || `Used in ${companyName}'s systems`,
        provider: 'enhanced-groq',
        model: this.model
      }));
    } catch (error) {
      console.error('❌ Error generating company-specific DSA problems:', error);
      return this.generateMockDSAProblems(companyName, difficulty, count);
    }
  }

  // Enhanced response analysis with company-specific evaluation
  public async analyzeInterviewResponse(
    question: string,
    userAnswer: string,
    expectedAnswer: string,
    category: string,
    companyContext: string
  ): Promise<{
    score: number,
    feedback: string,
    suggestions: string[],
    strengths: string[],
    improvements: string[],
    companyFit: number
  }> {
    
    const companyProfile = this.companyProfiles.get(companyContext.toLowerCase());
    
    const systemMessage = `You are a senior technical interviewer at ${companyContext} with deep knowledge of their engineering culture, technical standards, and hiring criteria.;

COMPANY EVALUATION FRAMEWORK: ${companyContext}
${companyProfile ? `
- Culture Values: ${companyProfile.culture.join(', ')}
- Technical Standards: ${companyProfile.techStack.slice(0, 5).join(', ')}
- Interview Philosophy: ${companyProfile.interviewStyle}
- What They Value: ${companyProfile.valuedSkills.join(', ')}
- Common Challenges: ${companyProfile.commonChallenges.slice(0, 3).join(', ')}
` : 'Use industry best practices and company standards.'}

Provide analysis that reflects ${companyContext}'s actual hiring standards and technical culture.`;
    
    const userMessage = `Analyze this interview response using ${companyContext}'s evaluation criteria:;

📋 INTERVIEW DETAILS:
- Question Category: ${category}
- Company Context: ${companyContext}

❓ QUESTION: ${question}

💡 EXPECTED ANSWER GUIDELINES: ${expectedAnswer}

🗣️ CANDIDATE'S RESPONSE: ${userAnswer}

${companyProfile ? `
🏢 ${companyContext.toUpperCase()} EVALUATION CRITERIA:
- Cultural Alignment: Does the response reflect ${companyProfile.culture.slice(0, 3).join(', ')}?
- Technical Standards: Meets ${companyContext}'s technical depth expectations?
- Problem-Solving Style: Aligns with their approach (${companyProfile.interviewStyle})?
- Company Relevance: Shows understanding of ${companyContext}'s challenges?
` : ''}

🎯 COMPREHENSIVE ANALYSIS REQUIRED:
1. Technical accuracy and depth
2. Communication clarity and structure  
3. Problem-solving methodology demonstrated
4. Company culture and values alignment
5. Practical application and real-world relevance
6. ${companyContext}-specific considerations

Return ONLY valid JSON:
{
  "score": (0-10 overall score based on ${companyContext}'s standards),
  "feedback": "Detailed constructive feedback reflecting ${companyContext}'s evaluation style and expectations",
  "suggestions": ["specific actionable improvements for ${companyContext} interviews", "company-specific preparation advice", "technical areas to strengthen"],
  "strengths": ["what they did well according to ${companyContext}'s values", "positive aspects that align with company culture", "technical competencies demonstrated"],
  "improvements": ["priority areas for improvement specific to ${companyContext}", "cultural alignment opportunities", "technical depth enhancements"],
  "companyFit": (0-10 score for cultural and technical fit with ${companyContext})
}

💡 Provide analysis that feels authentic to ${companyContext}'s actual interview feedback style!`;

    try {
      const response = await this.callGroqAPI({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 4000,
        temperature: 0.5
      });

      const analysis = extractJSON(response);
      return {
        score: Math.max(0, Math.min(10, analysis.score || 5)),
        feedback: analysis.feedback || 'Response analyzed successfully with comprehensive feedback.',
        suggestions: analysis.suggestions || ['Continue practicing company-specific scenarios', 'Focus on technical depth', 'Improve communication clarity'],
        strengths: analysis.strengths || ['Attempted the question thoroughly', 'Showed technical understanding'],
        improvements: analysis.improvements || ['Add more company-specific context', 'Include more technical details'],
        companyFit: Math.max(0, Math.min(10, analysis.companyFit || 6))
      };
    } catch (error) {
      console.error('❌ Error analyzing response with Enhanced Groq:', error);
      return this.generateMockAnalysis(userAnswer, companyContext);
    }
  }

  // Helper methods for prompt engineering
  private getExperienceLevelGuidance(level: string): string {
    switch (level) {
      case 'entry':
        return 'Focus on fundamentals, learning ability, and potential. Questions should test core concepts and basic problem-solving.';
      case 'mid':
        return 'Balance theory and practice. Test system understanding, optimization skills, and practical application.';
      case 'senior':
        return 'Emphasize architecture, leadership, complex problem-solving, and strategic thinking. High-level system design.';
      default:
        return 'Balanced assessment of technical skills and practical application.';
    }
  }

  private getInterviewTypeFocus(type: string, companyName: string, profile?: CompanyProfile): string {
    switch (type) {
      case 'technical':
        return profile ?
          `Technical deep-dive focusing on ${profile.techStack.slice(0, 3).join(', ')}, real ${companyName} scenarios, and their engineering challenges: ${profile.commonChallenges.slice(0, 2).join(', ')}.` :
          `Technical skills assessment with practical coding scenarios and system design thinking.`;
      
      case 'behavioral':
        return profile ?
          `Behavioral assessment based on ${companyName}'s culture: ${profile.culture.slice(0, 3).join(', ')}. Focus on scenarios that demonstrate these values in action.` :
          `Leadership, teamwork, problem-solving approach, and cultural alignment assessment.`;
      
      case 'system_design':
        return profile ?
          `System design challenges reflecting ${companyName}'s scale and technical challenges: ${profile.commonChallenges.join(', ')}. Focus on their architecture patterns.` :
          `Scalable system architecture, design trade-offs, and technical decision-making.`;
      
      default:
        return `Comprehensive assessment covering multiple dimensions relevant to the role.`;
    }
  }

  private getCompanySpecificDSAGuidance(companyName: string, profile?: CompanyProfile): string {
    if (!profile) return 'Create challenging algorithmic problems relevant to modern software development.';
    
    const guidance = {
      'google': 'Focus on search algorithms, graph problems, large-scale data processing, and optimization challenges.',
      'meta': 'Emphasize social graph algorithms, real-time data structures, feed ranking problems, and mobile optimization.',
      'amazon': 'Include optimization problems, inventory management algorithms, logistics challenges, and cost-efficient solutions.',
      'netflix': 'Focus on recommendation algorithms, streaming optimization, caching strategies, and A/B testing scenarios.',
      'tesla': 'Include real-time algorithms, computer vision problems, optimization challenges, and embedded systems scenarios.',
      'microsoft': 'Focus on enterprise-scale problems, integration challenges, productivity optimization, and collaborative algorithms.'
    };

    return guidance[companyName.toLowerCase()] ||
           `Focus on problems relevant to ${profile.industry} industry, especially: ${profile.commonChallenges.slice(0, 2).join(' and ')}.`;
  }

  // Health check method
  public async healthCheck(): Promise<{
    groqAvailable: boolean,
    model: string,
    status: string,
    companyProfilesLoaded: number
  }> {
    try {
      console.log('🔍 Performing Enhanced Groq health check...');
      
      const testResponse = await this.callGroqAPI({
        messages: [
          { role: 'user', content: 'Health check - respond with "OK"' }
        ],
        max_tokens: 10,
        temperature: 0
      });

      const isHealthy = testResponse.toLowerCase().includes('ok');
      
      return {
        groqAvailable: isHealthy,
        model: this.model,
        status: isHealthy ? 'healthy' : 'degraded',
        companyProfilesLoaded: this.companyProfiles.size
      };
    } catch (error) {
      console.error('❌ Enhanced Groq health check failed:', error);
      return {
        groqAvailable: false,
        model: this.model,
        status: 'unhealthy',
        companyProfilesLoaded: this.companyProfiles.size
      };
    }
  }

  // Get company suggestions
  public getCompanySuggestions(query: string): string[] {
    const suggestions: string[] = [],
    const queryLower = query.toLowerCase();
    
    for (const [key, profile] of this.companyProfiles) {
      if (profile.name.toLowerCase().includes(queryLower)) {
        suggestions.push(profile.name);
      }
    }
    
    if (suggestions.length === 0) {
      return ['Google', 'Meta', 'Amazon', 'Microsoft', 'Netflix', 'Tesla']
        .filter(name => name.toLowerCase().includes(queryLower))
        .slice(0, 6);
    }
    
    return suggestions.slice(0, 10);
  }

  // Mock fallback methods
  private generateMockQuestions(params: any): InterviewQuestion[] {
    const mockQuestions: InterviewQuestion[] = [],
    
    for (let i = 0; i < params.numberOfQuestions; i++) {
      mockQuestions.push({
        id: `enhanced-mock-q-${i}`,
        question: `Describe your experience with ${params.skills[i % params.skills.length]} in the context of ${params.jobTitle} role at ${params.companyName}. How would you solve a real-world challenge they might face?`,
        expectedAnswer: `A comprehensive answer covering practical experience, specific examples relevant to ${params.companyName}, and problem-solving approach.`,
        category: params.interviewType,
        difficulty: ['easy', 'medium', 'hard'][i % 3] as 'easy' | 'medium' | 'hard',
        points: 10,
        timeLimit: 8,
        evaluationCriteria: ['Technical accuracy', 'Company relevance', 'Problem-solving approach', 'Communication clarity'],
        tags: [params.companyName, params.jobTitle, params.skills[i % params.skills.length]],
        hints: [`Think about ${params.companyName}'s specific technical challenges`],
        companyRelevance: 7
      });
    }
    
    return mockQuestions;
  }

  private generateMockDSAProblems(companyName: string, difficulty: string, count: number): DSAProblem[] {
    const problems: DSAProblem[] = [],
    
    const problemTemplates = [;
      {
        title: `${companyName} Scale Data Processing`,
        description: `You're working at ${companyName} and need to process large datasets efficiently. Design an algorithm to handle this at their scale.`,
        topics: ['Array', 'Hash Table', 'Optimization']
      },
      {
        title: `${companyName} System Load Balancing`,
        description: `Design a load balancing algorithm for ${companyName}'s distributed systems to ensure optimal performance.`,
        topics: ['Graph', 'Greedy', 'System Design']
      }
    ];

    for (let i = 0; i < count; i++) {
      const template = problemTemplates[i % problemTemplates.length];
      problems.push({
        id: `enhanced-mock-dsa-${companyName.toLowerCase()}-${i}`,
        title: template.title,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        description: template.description,
        examples: [
          {
            input: 'Company-specific example input',
            output: 'Expected output format',
            explanation: `This solution addresses ${companyName}'s specific technical challenges.`
          }
        ],
        testCases: [
          {
            id: `test-${i}-1`,
            input: 'Test case input',
            expectedOutput: 'Expected result'
          }
        ],
        constraints: [`Scalable to ${companyName}'s user base`, 'Optimized for their infrastructure'],
        topics: template.topics,
        hints: [`Consider ${companyName}'s technical architecture`, 'Think about their scale requirements'],
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        companyContext: `Relevant to ${companyName}'s engineering challenges`,
        realWorldApplication: `Used in ${companyName}'s production systems`
      });
    }
    
    return problems;
  }

  private generateMockAnalysis(userAnswer: string, companyContext: string) {
    const wordCount = userAnswer.split(' ').length;
    const score = Math.max(0, Math.min(10, wordCount / 15));
    
    return {
      score: Math.round(score * 10) / 10,
      feedback: `Your response demonstrates ${score >= 7 ? 'strong' : score >= 5 ? 'adequate' : 'basic'} understanding. For ${companyContext} interviews, consider adding more company-specific context and technical depth.`,
      suggestions: [`Research ${companyContext}'s specific technical challenges`, 'Add more detailed technical examples', 'Include practical implementation considerations'],
      strengths: wordCount > 50 ? ['Comprehensive response', 'Good technical engagement', 'Clear communication'] : ['Attempted the question', 'Basic understanding shown'],
      improvements: [`Study ${companyContext}'s technology stack in depth`, 'Practice company-specific scenarios', 'Enhance technical communication'],
      companyFit: Math.round(Math.max(3, Math.min(9, score + 1)) * 10) / 10
    };
  }
}

export default EnhancedGroqAIService;