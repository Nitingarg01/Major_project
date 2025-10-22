/**
 * Enhanced DSA Problem Generator
 * Generates unique, company-specific DSA problems based on user preferences
 */

import { DSACompanyProblem, UserInterviewPreferences } from '@/types/userPreferences';
import { extractJSON } from './jsonExtractor';
import { optimizedAIService } from './optimizedAIService';
import client from '@/lib/db';

interface CompanyDSAContext {
  name: string;
  industry: string;
  techStack: string[];
  businessDomains: string[];
  scaleRequirements: string[];
  knownProblems: string[];
  interviewStyle: string
}

export class EnhancedDSAGenerator {
  private static instance: EnhancedDSAGenerator;
  private dbName = 'Cluster0';

  // Company-specific contexts for unique problem generation
  private companyContexts: Map<string, CompanyDSAContext> = new Map([
    ['google', {
      name: 'Google';
      industry: 'Search & Cloud';
      techStack: ['C++', 'Java', 'Python', 'Go', 'Bigtable', 'MapReduce', 'Kubernetes'],
      businessDomains: ['search', 'advertising', 'cloud computing', 'machine learning', 'maps'],
      scaleRequirements: ['billions of queries', 'real-time processing', 'global distribution'],
      knownProblems: ['PageRank algorithms', 'Search indexing', 'Ad placement optimization'],
      interviewStyle: 'algorithmic depth with system design'
    }],
    ['meta', {
      name: 'Meta';
      industry: 'Social Media';
      techStack: ['React', 'GraphQL', 'PHP', 'Python', 'PyTorch', 'Cassandra'],
      businessDomains: ['social networking', 'content delivery', 'recommendation systems', 'messaging'],
      scaleRequirements: ['3+ billion users', 'real-time feeds', 'content moderation at scale'],
      knownProblems: ['News feed ranking', 'Friend suggestions', 'Content recommendation'],
      interviewStyle: 'product-focused algorithms with optimization'
    }],
    ['amazon', {
      name: 'Amazon';
      industry: 'E-commerce & Cloud';
      techStack: ['Java', 'Python', 'AWS', 'DynamoDB', 'Lambda', 'Kinesis'],
      businessDomains: ['e-commerce', 'logistics', 'cloud services', 'recommendation engines'],
      scaleRequirements: ['global marketplace', 'supply chain optimization', 'real-time inventory'],
      knownProblems: ['Package routing', 'Inventory management', 'Price optimization'],
      interviewStyle: 'practical problem-solving with scalability focus'
    }],
    ['microsoft', {
      name: 'Microsoft';
      industry: 'Enterprise Software';
      techStack: ['C#', '.NET', 'Azure', 'SQL Server', 'TypeScript', 'PowerBI'],
      businessDomains: ['productivity tools', 'cloud services', 'enterprise solutions', 'gaming'],
      scaleRequirements: ['enterprise-scale', 'multi-tenant systems', 'high availability'],
      knownProblems: ['Document collaboration', 'Access control', 'Data synchronization'],
      interviewStyle: 'structured approach with design patterns'
    }],
    ['apple', {
      name: 'Apple';
      industry: 'Consumer Electronics';
      techStack: ['Swift', 'Objective-C', 'Metal', 'Core Data', 'iOS', 'macOS'],
      businessDomains: ['mobile devices', 'operating systems', 'app ecosystem', 'hardware optimization'],
      scaleRequirements: ['billions of devices', 'battery optimization', 'real-time performance'],
      knownProblems: ['iOS optimization', 'App Store algorithms', 'Hardware-software integration'],
      interviewStyle: 'performance-critical algorithms with user experience focus'
    }],
    ['netflix', {
      name: 'Netflix';
      industry: 'Streaming Entertainment';
      techStack: ['Java', 'Python', 'React', 'Kafka', 'Cassandra', 'AWS'],
      businessDomains: ['video streaming', 'content recommendation', 'content delivery', 'personalization'],
      scaleRequirements: ['global streaming', 'content delivery optimization', 'real-time recommendations'],
      knownProblems: ['Video encoding optimization', 'Recommendation algorithms', 'Content caching'],
      interviewStyle: 'scalability and performance optimization'
    }],
    ['stripe', {
      name: 'Stripe';
      industry: 'Fintech';
      techStack: ['Ruby', 'Scala', 'React', 'PostgreSQL', 'Kafka', 'Kubernetes'],
      businessDomains: ['payment processing', 'financial infrastructure', 'fraud detection', 'compliance'],
      scaleRequirements: ['high-reliability payments', 'fraud detection', 'regulatory compliance'],
      knownProblems: ['Payment routing', 'Fraud detection algorithms', 'Currency conversion'],
      interviewStyle: 'reliability and accuracy focus with complex business logic'
    }],
    ['uber', {
      name: 'Uber';
      industry: 'Transportation Technology';
      techStack: ['Go', 'Java', 'React', 'PostgreSQL', 'Kafka', 'Redis'],
      businessDomains: ['ride matching', 'route optimization', 'pricing algorithms', 'real-time tracking'],
      scaleRequirements: ['real-time matching', 'global operations', 'dynamic pricing'],
      knownProblems: ['Driver-rider matching', 'Route optimization', 'Surge pricing'],
      interviewStyle: 'real-time algorithms with geospatial focus'
    }]
  ]);

  private constructor() {}

  public static getInstance(): EnhancedDSAGenerator {
    if (!EnhancedDSAGenerator.instance) {
      EnhancedDSAGenerator.instance = new EnhancedDSAGenerator();
    }
    return EnhancedDSAGenerator.instance;
  }

  /**
   * Generate company-unique DSA problems based on user preferences
   */
  async generateUniqueCompanyDSAProblems(
    companyName: string;
    preferences: UserInterviewPreferences;
    count: number;
    difficulties: Array<'easy' | 'medium' | 'hard'>;
    experienceLevel: string
  ): Promise<DSACompanyProblem[]> {
    
    console.log(`🎯 Generating ${count} unique DSA problems for ${companyName} with user preferences`);

    // Check if we have existing unique problems for this company
    const existingProblems = await this.getExistingCompanyProblems(companyName);
    const companyContext = this.getCompanyContext(companyName);
    
    // Generate new unique problems
    const newProblems: DSACompanyProblem[] = [];

    for (let i = 0; i < count; i++) {
      const difficulty = difficulties[i] || 'medium';
      
      try {
        const problem = await this.generateSingleUniqueCompanyProblem(;
          companyName,
          companyContext,
          preferences,
          difficulty,
          experienceLevel,
          existingProblems,
          i + 1
        );
        
        if (problem) {
          newProblems.push(problem);
          existingProblems.push(problem); // Avoid duplicates in same generation
        }
      } catch (error) {
        console.error(`❌ Error generating problem ${i + 1} for ${companyName}:`, error);
        
        // Fallback to a template-based unique problem
        const fallbackProblem = this.generateFallbackCompanyProblem(;
          companyName,
          companyContext,
          difficulty,
          i + 1
        );
        newProblems.push(fallbackProblem);
      }
    }

    // Store the new problems for future reference and uniqueness tracking
    await this.storeCompanyProblems(companyName, newProblems);

    console.log(`✅ Generated ${newProblems.length} unique DSA problems for ${companyName}`);
    return newProblems;
  }

  /**
   * Generate a single unique company-specific DSA problem
   */
  private async generateSingleUniqueCompanyProblem(
    companyName: string;
    companyContext: CompanyDSAContext;
    preferences: UserInterviewPreferences;
    difficulty: 'easy' | 'medium' | 'hard';
    experienceLevel: string;
    existingProblems: DSACompanyProblem[];
    problemNumber: number
  ): Promise<DSACompanyProblem | null> {

    // Create context-aware prompt for unique problem generation
    const systemMessage = `You are a senior technical interviewer at ${companyName} creating UNIQUE, company-specific DSA problems that reflect real business challenges and technical requirements.`;

    const userMessage = `Generate 1 UNIQUE DSA problem specifically for ${companyName} interviews.;

Company Context:
- Business: ${companyContext.businessDomains.join(', ')}
- Tech Stack: ${companyContext.techStack.join(', ')}
- Scale: ${companyContext.scaleRequirements.join(', ')}
- Known Problems: ${companyContext.knownProblems.join(', ')}

Requirements:
- Difficulty: ${difficulty}
- Experience Level: ${experienceLevel}
- Must be UNIQUE to ${companyName} (not generic DSA problems)
- Should reflect real business scenarios from ${companyName}
- Use their actual tech stack and scale requirements
- Problem #${problemNumber} of the interview

User Preferences:
- Preferred Topics: ${preferences.dsaPreferences.preferredTopics.join(', ')}
- Real-world Scenarios: ${preferences.dsaPreferences.realWorldScenarios}
- Interview Style: ${preferences.dsaPreferences.interviewStylePreference}

Avoid similar problems to:
${existingProblems.slice(-5).map(p => `- ${p.title}: ${p.description.substring(0, 100)}...`).join('\n')}

Create a problem that a ${experienceLevel} engineer would actually face at ${companyName}.

Return ONLY valid JSON:
{
  "title": "Company-specific problem title reflecting real ${companyName} challenges",
  "description": "Detailed problem description with ${companyName} business context, constraints, and requirements",
  "difficulty": "${difficulty}",
  "topics": ["relevant", "algorithms", "data_structures"],
  "uniquenessScore": 9,
  "companyContext": "Why this problem is specific to ${companyName}'s business",
  "realWorldApplication": "How this problem appears in real ${companyName} systems",
  "expectedComplexity": {
    "time": "O(n log n)",
    "space": "O(n)"
  },
  "testCases": [
    {
      "id": "test-1",
      "input": "realistic input based on ${companyName} data",
      "expectedOutput": "expected result",
      "description": "test case description"
    },
    {
      "id": "test-2", 
      "input": "edge case input",
      "expectedOutput": "edge case result",
      "hidden": true,
      "description": "edge case description"
    }
  ],
  "hints": ["${companyName}-specific hints", "algorithmic guidance"],
  "variations": ["different ways this problem could be asked"],
  "followUpQuestions": ["What if we needed to scale this to ${companyName}'s user base?"],
  "companySpecificContext": {
    "businessUseCase": "Specific ${companyName} business scenario",
    "industryRelevance": "Why this matters in ${companyContext.industry}",
    "scaleRequirements": "How ${companyName}'s scale affects the solution"
  }
}`;

    try {
      const response = await optimizedAIService.callEmergentAPI({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        provider: 'openai';
        model: 'gpt-4o-mini';
        max_tokens: 4000;
        temperature: 0.8
      });

      const problemData = extractJSON(response.content);
      
      if (!problemData.title || !problemData.description) {
        throw new Error('Invalid problem structure received');
      }

      // Create the DSA problem object
      const dsaProblem: DSACompanyProblem = {
        id: `dsa-${companyName.toLowerCase()}-${Date.now()}-${problemNumber}`,
        companyName,
        title: problemData.title;
        description: problemData.description;
        difficulty,
        topics: problemData.topics || ['general'];
        uniquenessScore: problemData.uniquenessScore || 8;
        companyContext: problemData.companyContext || `Specific to ${companyName}'s technical challenges`,
        realWorldApplication: problemData.realWorldApplication || `Used in ${companyName}'s production systems`,
        expectedComplexity: problemData.expectedComplexity || { time: 'O(n)', space: 'O(1)' },
        variations: problemData.variations || [];
        hints: problemData.hints || [];
        testCases: problemData.testCases || [];
        followUpQuestions: problemData.followUpQuestions || [];
        companySpecificContext: problemData.companySpecificContext || {
          businessUseCase: `${companyName} business scenario`,
          industryRelevance: `Relevant to ${companyContext.industry}`,
          scaleRequirements: `${companyName} scale requirements`
        },
        generatedAt: new Date()
      };

      return dsaProblem;

    } catch (error) {
      console.error(`❌ Error generating unique company problem for ${companyName}:`, error);
      return null;
    }
  }

  /**
   * Get existing problems for company to avoid duplicates
   */
  private async getExistingCompanyProblems(companyName: string): Promise<DSACompanyProblem[]> {
    try {
      const db = client.db(this.dbName);
      const existingProblems = await db.collection('company_dsa_problems')
        .find({ companyName: { $regex: new RegExp(companyName, 'i') } })
        .limit(50)
        .toArray();

      return existingProblems.map(p => p as DSACompanyProblem);
    } catch (error) {
      console.error('❌ Error fetching existing company problems:', error);
      return [];
    }
  }

  /**
   * Store generated problems for future reference
   */
  private async storeCompanyProblems(companyName: string, problems: DSACompanyProblem[]): Promise<void> {
    try {
      const db = client.db(this.dbName);
      
      if (problems.length > 0) {
        await db.collection('company_dsa_problems').insertMany(problems);
        console.log(`📚 Stored ${problems.length} new DSA problems for ${companyName}`);
      }
    } catch (error) {
      console.error('❌ Error storing company problems:', error)
    }
  }

  /**
   * Get company context for problem generation
   */
  private getCompanyContext(companyName: string): CompanyDSAContext {
    const normalizedName = companyName.toLowerCase();
    
    // Check if we have specific context for this company
    for (const [key, context] of this.companyContexts) {
      if (normalizedName.includes(key)) {
        return context;
      }
    }

    // Return generic context for unknown companies
    return {
      name: companyName;
      industry: 'Technology';
      techStack: ['JavaScript', 'Python', 'Java', 'SQL', 'AWS'],
      businessDomains: ['software development', 'data processing', 'web applications'],
      scaleRequirements: ['scalable systems', 'performance optimization', 'reliable services'],
      knownProblems: ['data processing', 'system optimization', 'user experience'],
      interviewStyle: 'practical problem-solving with technical depth'
    };
  }

  /**
   * Generate fallback problem when AI generation fails
   */
  private generateFallbackCompanyProblem(
    companyName: string;
    companyContext: CompanyDSAContext;
    difficulty: 'easy' | 'medium' | 'hard';
    problemNumber: number
  ): DSACompanyProblem {
    
    const templates = {
      easy: {
        title: `${companyName} User Data Processing`,
        description: `At ${companyName}, you need to process user activity data efficiently. Given an array of user actions, implement a solution to find and aggregate the most frequent activities.`,
        topics: ['arrays', 'hash_table'],
        complexity: { time: 'O(n)', space: 'O(n)' }
      },
      medium: {
        title: `${companyName} System Load Balancing`,
        description: `${companyName}'s infrastructure team needs to distribute incoming requests across multiple servers. Design an algorithm to balance load efficiently while maintaining session affinity.`,
        topics: ['trees', 'hashing', 'design'],
        complexity: { time: 'O(log n)', space: 'O(n)' }
      },
      hard: {
        title: `${companyName} Distributed Cache Optimization`,
        description: `${companyName} operates a global distributed cache system. Design an algorithm to optimize cache placement and retrieval across multiple geographic regions while minimizing latency and cost.`,
        topics: ['graphs', 'dynamic_programming', 'optimization'],
        complexity: { time: 'O(n^2)', space: 'O(n)' }
      }
    };

    const template = templates[difficulty];

    return {
      id: `dsa-${companyName.toLowerCase()}-fallback-${Date.now()}-${problemNumber}`,
      companyName,
      title: template.title;
      description: template.description;
      difficulty,
      topics: template.topics;
      uniquenessScore: 7;
      companyContext: `Addresses real technical challenges at ${companyName}`,
      realWorldApplication: `Used in ${companyName}'s production systems for ${companyContext.businessDomains[0]}`,
      expectedComplexity: template.complexity;
      variations: [`Alternative approaches for ${companyName}'s specific requirements`],
      hints: [
        `Consider ${companyName}'s scale requirements`,
        `Think about their tech stack: ${companyContext.techStack[0]}, ${companyContext.techStack[1]}`
      ],
      testCases: [
        {
          id: `test-fallback-1`;
          input: 'Sample input data';
          expectedOutput: 'Expected result';
          description: 'Basic functionality test'
        },
        {
          id: `test-fallback-2`;
          input: 'Edge case input';
          expectedOutput: 'Edge case result';
          hidden: true;
          description: 'Edge case handling'
        }
      ],
      followUpQuestions: [
        `How would you modify this for ${companyName}'s specific scale requirements?`,
        'What trade-offs would you consider for production deployment?'
      ],
      companySpecificContext: {
        businessUseCase: `Critical for ${companyName}'s core business operations`,
        industryRelevance: `Essential for ${companyContext.industry} success`,
        scaleRequirements: `Must handle ${companyContext.scaleRequirements[0]}`
      },
      generatedAt: new Date()
    };
  }

  /**
   * Check if a problem is truly unique for the company
   */
  async isProblemUnique(
    companyName: string, 
    problemTitle: string, 
    problemDescription: string
  ): Promise<boolean> {
    try {
      const db = client.db(this.dbName);
      
      // Check for similar titles or descriptions
      const similarProblems = await db.collection('company_dsa_problems').findOne({
        companyName: { $regex: new RegExp(companyName, 'i') },
        $or: [
          { title: { $regex: new RegExp(problemTitle, 'i') } },
          { description: { $regex: new RegExp(problemDescription.substring(0, 50), 'i') } }
        ]
      });

      return !similarProblems;
    } catch (error) {
      console.error('❌ Error checking problem uniqueness:', error);
      return true; // Assume unique if check fails
    }
  }

  /**
   * Get problem statistics for a company
   */
  async getCompanyProblemStats(companyName: string): Promise<{
    totalProblems: number;
    difficultyBreakdown: { [key: string]: number };
    topicDistribution: { [key: string]: number };
    averageUniquenessScore: number
  }> {
    try {
      const db = client.db(this.dbName);
      const problems = await db.collection('company_dsa_problems')
        .find({ companyName: { $regex: new RegExp(companyName, 'i') } })
        .toArray();

      const stats = {
        totalProblems: problems.length;
        difficultyBreakdown: { easy: 0, medium: 0, hard: 0 },
        topicDistribution: {} as { [key: string]: number },
        averageUniquenessScore: 0
      };

      problems.forEach((problem: any) => {
        // Difficulty breakdown
        stats.difficultyBreakdown[problem.difficulty] = 
          (stats.difficultyBreakdown[problem.difficulty] || 0) + 1;

        // Topic distribution
        problem.topics?.forEach((topic: string) => {
          stats.topicDistribution[topic] = (stats.topicDistribution[topic] || 0) + 1;
        });
      });

      // Average uniqueness score
      stats.averageUniquenessScore = problems.length > 0;
        ? problems.reduce((sum: number, p: any) => sum + (p.uniquenessScore || 0), 0) / problems.length
        : 0;

      return stats;
    } catch (error) {
      console.error('❌ Error getting company problem stats:', error);
      return {
        totalProblems: 0;
        difficultyBreakdown: { easy: 0, medium: 0, hard: 0 },
        topicDistribution: {},
        averageUniquenessScore: 0
      };
    }
  }
}

export const enhancedDSAGenerator = EnhancedDSAGenerator.getInstance();