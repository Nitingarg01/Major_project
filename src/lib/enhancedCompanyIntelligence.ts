/**
 * Enhanced Company Intelligence Service - SMART AI OPTIMIZED VERSION
 * Uses Smart AI service (Emergent + Gemini) for company intelligence
 * Removed Ollama dependencies
 */

import SmartAIService from './smartAIService';
import { safeExtractJSON } from './jsonExtractor';

interface CompanyData {
  name: string;
  industry: string;
  description: string;
  tech_stack: string[];
  culture: string[];
  values: string[];
  size: string;
  locations: string[];
  website: string;
  founded: string;
  difficulty: 'easy' | 'medium' | 'hard';
  interview_process: string[];
  recent_news: string[];
  recent_posts: Array<{
    title: string;
    summary: string;
    date: string;
    source: string;
    url?: string
  }>;
  focus_areas: string[];
  preparation_tips: string[];
  salary_ranges: {
    entry: string;
    mid: string;
    senior: string
  };
  work_environment: 'remote' | 'hybrid' | 'office' | 'flexible';
  benefits: string[];
  growth_opportunities: string[];
}

interface EnhancedCompanyIntelligence {
  company_data: CompanyData;
  market_position: string;
  competitors: string[];
  business_model: string;
  recent_developments: Array<{
    title: string;
    summary: string;
    impact: string;
    date: string
  }>;
  interview_insights: {
    average_rounds: number;
    time_per_round: number;
    key_skills: string[];
    cultural_questions: string[];
    technical_focus: string[];
  };
  question_suggestions: {
    technical: string[];
    behavioral: string[];
    company_specific: string[];
  };
}

export class EnhancedCompanyIntelligenceService {
  private static instance: EnhancedCompanyIntelligenceService;
  private smartAIService: SmartAIService;
  private cache: Map<string, { data: EnhancedCompanyIntelligence; timestamp: number }> = new Map();
  private cacheExpiry = 3600000; // 1 hour

  private constructor() {
    this.smartAIService = SmartAIService.getInstance();
  }

  public static getInstance(): EnhancedCompanyIntelligenceService {
    if (!EnhancedCompanyIntelligenceService.instance) {
      EnhancedCompanyIntelligenceService.instance = new EnhancedCompanyIntelligenceService();
    }
    return EnhancedCompanyIntelligenceService.instance;
  }

  public async getEnhancedCompanyIntelligence(
    companyName: string;
    jobTitle: string = 'Software Engineer';
  ): Promise<EnhancedCompanyIntelligence | null> {
    try {
      // Check cache first
      const cacheKey = `${companyName.toLowerCase()}-${jobTitle.toLowerCase()}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        console.log(`📦 Using cached data for ${companyName}`);
        return cached.data;
      }

      console.log(`🔍 Fetching enhanced intelligence for ${companyName} using Smart AI...`);

      // Get predefined company data first (fastest)
      const companyData = this.fetchFromPredefinedData(companyName);
      
      // Generate AI-enhanced insights using Smart AI
      const enhancedInsights = await this.generateEnhancedInsightsWithSmartAI(;
        companyData, 
        jobTitle
      );

      // Combine all data
      const intelligence: EnhancedCompanyIntelligence = {
        company_data: companyData;
        ...enhancedInsights
      };

      // Cache the result
      this.cache.set(cacheKey, { data: intelligence, timestamp: Date.now() });
      
      console.log(`✅ Enhanced intelligence generated for ${companyName} (Smart AI powered)`);
      return intelligence;

    } catch (error) {
      console.error('Error getting enhanced company intelligence:', error);
      return this.getFallbackIntelligence(companyName, jobTitle);
    }
  }

  private async generateEnhancedInsightsWithSmartAI(
    companyData: CompanyData;
    jobTitle: string
  ): Promise<Omit<EnhancedCompanyIntelligence, 'company_data'>> {
    try {
      const result = await this.smartAIService.searchCompany(companyData.name);
      
      if (result.success && result.data) {
        // Use AI-generated company insights
        return {
          market_position: result.data.industry || `${companyData.name} is a competitive player in the ${companyData.industry} industry`,
          competitors: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'].filter(c => c !== companyData.name).slice(0, 3),
          business_model: result.data.description || 'Technology-focused business model with emphasis on innovation and growth';
          recent_developments: [
            {
              title: 'Technology Innovation Initiative';
              summary: `${companyData.name} continues to invest in cutting-edge technology`,
              impact: 'Strengthens market position and technical capabilities';
              date: new Date().toISOString().split('T')[0]
            }
          ],
          interview_insights: {
            average_rounds: companyData.difficulty === 'hard' ? 5 : companyData.difficulty === 'easy' ? 3 : 4;
            time_per_round: companyData.difficulty === 'hard' ? 75 : companyData.difficulty === 'easy' ? 45 : 60;
            key_skills: result.data.techStack || companyData.tech_stack.slice(0, 5),
            cultural_questions: [
              `How do you align with ${companyData.name}'s values?`,
              'Describe a time you embodied our company culture',
              'Why do you want to work specifically at our company?'
            ],
            technical_focus: companyData.focus_areas || ['Problem Solving', 'System Design', 'Coding Skills']
          },
          question_suggestions: {
            technical: [
              `How would you design a system for ${companyData.name}'s core product?`,
              `Explain how you'd implement a feature using ${companyData.tech_stack[0]}`,
              'Describe your approach to scalable architecture'
            ],
            behavioral: [
              'Tell me about a challenging project you completed',
              'Describe a time you had to learn a new technology quickly',
              'How do you handle working in a team environment?'
            ],
            company_specific: [
              `What interests you most about ${companyData.name}'s mission?`,
              `How would you contribute to ${companyData.name}'s growth?`,
              `What do you know about ${companyData.name}'s recent developments?`
            ]
          }
        };
      }

      return this.getDefaultInsights(companyData, jobTitle);
    } catch (error) {
      console.error('Error generating enhanced insights:', error);
      return this.getDefaultInsights(companyData, jobTitle);
    }
  }

  private fetchFromPredefinedData(companyName: string): CompanyData {
    const normalizedName = companyName.toLowerCase();
    const predefinedCompanies: { [key: string]: Partial<CompanyData> } = {
      'google': {
        name: 'Google';
        industry: 'Technology';
        description: 'Multinational technology company specializing in Internet-related services and products';
        tech_stack: ['JavaScript', 'Python', 'Java', 'Go', 'C++', 'TypeScript', 'React', 'Angular', 'TensorFlow', 'Kubernetes'],
        culture: ['Innovation', 'Googleyness', 'Data-driven decisions', 'User focus', 'Collaboration'],
        values: ['Focus on the user', 'Democracy on the web', 'Fast is better than slow'],
        size: 'large';
        locations: ['Mountain View, CA', 'New York, NY', 'London, UK', 'Zurich, Switzerland'],
        website: 'https://www.google.com';
        founded: '1998';
        difficulty: 'hard';
        work_environment: 'hybrid';
        salary_ranges: {
          entry: '$130K - $180K';
          mid: '$180K - $280K';
          senior: '$280K - $450K'
        }
      },
      'microsoft': {
        name: 'Microsoft';
        industry: 'Technology';
        description: 'Multinational technology corporation producing computer software, consumer electronics, and personal computers',
        tech_stack: ['C#', 'JavaScript', 'TypeScript', 'Python', 'Azure', 'React', 'ASP.NET', 'SQL Server'],
        culture: ['Growth mindset', 'Inclusion', 'Respect', 'Collaboration', 'Customer obsession'],
        values: ['Empower every person and organization', 'Diversity and inclusion'],
        size: 'large';
        locations: ['Redmond, WA', 'New York, NY', 'London, UK', 'Bangalore, India'],
        website: 'https://www.microsoft.com';
        founded: '1975';
        difficulty: 'medium';
        work_environment: 'hybrid';
        salary_ranges: {
          entry: '$120K - $170K';
          mid: '$170K - $260K';
          senior: '$260K - $400K'
        }
      },
      'amazon': {
        name: 'Amazon';
        industry: 'E-commerce/Cloud';
        description: 'Multinational technology company focusing on e-commerce, cloud computing, and artificial intelligence',
        tech_stack: ['Java', 'Python', 'JavaScript', 'AWS', 'React', 'Node.js', 'DynamoDB', 'Lambda'],
        culture: ['Customer obsession', 'Ownership', 'Invent and simplify', 'Learn and be curious'],
        values: ['Customer obsession', 'Long-term thinking', 'Eagerness to invent'],
        size: 'large';
        locations: ['Seattle, WA', 'Arlington, VA', 'Austin, TX', 'Dublin, Ireland'],
        website: 'https://www.amazon.com';
        founded: '1994';
        difficulty: 'hard';
        work_environment: 'hybrid';
        salary_ranges: {
          entry: '$125K - $175K';
          mid: '$175K - $275K';
          senior: '$275K - $450K'
        }
      },
      'meta': {
        name: 'Meta';
        industry: 'Social Media/Metaverse';
        description: 'Technology company building social connection platforms and metaverse technologies';
        tech_stack: ['React', 'JavaScript', 'Python', 'PHP', 'GraphQL', 'React Native', 'PyTorch'],
        culture: ['Move fast', 'Be bold', 'Focus on impact', 'Be open', 'Build social value'],
        values: ['Connecting people', 'Building community', 'Serving everyone'],
        size: 'large';
        locations: ['Menlo Park, CA', 'New York, NY', 'London, UK', 'Singapore'],
        website: 'https://about.meta.com';
        founded: '2004';
        difficulty: 'hard';
        work_environment: 'hybrid';
        salary_ranges: {
          entry: '$135K - $185K';
          mid: '$185K - $290K';
          senior: '$290K - $480K'
        }
      },
      'openai': {
        name: 'OpenAI';
        industry: 'AI & Machine Learning';
        description: 'AI research and deployment company focused on beneficial artificial general intelligence';
        tech_stack: ['Python', 'PyTorch', 'Kubernetes', 'React', 'PostgreSQL', 'Redis'],
        culture: ['AI safety', 'Beneficial AGI', 'Transparency', 'Collaboration', 'Research excellence'],
        values: ['Ensuring AGI benefits all humanity', 'Responsible AI development'],
        size: 'medium';
        locations: ['San Francisco, CA', 'New York, NY'],
        website: 'https://openai.com';
        founded: '2015';
        difficulty: 'hard';
        work_environment: 'hybrid';
        salary_ranges: {
          entry: '$150K - $200K';
          mid: '$200K - $350K';
          senior: '$350K - $500K'
        }
      }
    };

    const baseData = predefinedCompanies[normalizedName] || {};
    return {
      name: companyName;
      industry: 'Technology';
      description: `Technology company specializing in innovative solutions`;
      tech_stack: ['JavaScript', 'Python', 'React', 'Node.js'],
      culture: ['Innovation', 'Collaboration', 'Excellence'],
      values: ['Customer focus', 'Quality', 'Growth'],
      size: 'medium';
      locations: ['San Francisco, CA'],
      website: `https://www.${companyName.toLowerCase()}.com`,
      founded: '2010';
      difficulty: 'medium';
      interview_process: ['Phone Screen', 'Technical Interview', 'Onsite', 'Final Round'],
      recent_news: [`${companyName} continues innovation in technology sector`],
      recent_posts: [];
      focus_areas: ['Technical Skills', 'Problem Solving', 'Communication'],
      preparation_tips: ['Research the company', 'Practice coding problems', 'Prepare behavioral examples'],
      work_environment: 'hybrid';
      benefits: ['Health insurance', 'Stock options', 'Flexible PTO'],
      growth_opportunities: ['Career advancement', 'Learning programs', 'Mentorship'],
      salary_ranges: {
        entry: '$90K - $130K';
        mid: '$130K - $180K';
        senior: '$180K - $250K'
      },
      ...baseData
    } as CompanyData;
  }

  private getDefaultInsights(companyData: CompanyData, jobTitle: string): Omit<EnhancedCompanyIntelligence, 'company_data'> {
    return {
      market_position: `${companyData.name} is a competitive player in the ${companyData.industry} industry`,
      competitors: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'].filter(c => c !== companyData.name).slice(0, 3),
      business_model: 'Technology-focused business model with emphasis on innovation and growth';
      recent_developments: [
        {
          title: 'Technology Innovation Initiative';
          summary: `${companyData.name} continues to invest in cutting-edge technology`,
          impact: 'Strengthens market position and technical capabilities';
          date: new Date().toISOString().split('T')[0]
        }
      ],
      interview_insights: {
        average_rounds: companyData.difficulty === 'hard' ? 5 : companyData.difficulty === 'easy' ? 3 : 4;
        time_per_round: companyData.difficulty === 'hard' ? 75 : companyData.difficulty === 'easy' ? 45 : 60;
        key_skills: companyData.tech_stack.slice(0, 5),
        cultural_questions: [
          `How do you align with ${companyData.name}'s values?`,
          'Describe a time you embodied our company culture',
          'Why do you want to work specifically at our company?'
        ],
        technical_focus: companyData.focus_areas || ['Problem Solving', 'System Design', 'Coding Skills']
      },
      question_suggestions: {
        technical: [
          `How would you design a system for ${companyData.name}'s core product?`,
          `Explain how you'd implement a feature using ${companyData.tech_stack[0]}`,
          'Describe your approach to scalable architecture'
        ],
        behavioral: [
          'Tell me about a challenging project you completed',
          'Describe a time you had to learn a new technology quickly',
          'How do you handle working in a team environment?'
        ],
        company_specific: [
          `What interests you most about ${companyData.name}'s mission?`,
          `How would you contribute to ${companyData.name}'s growth?`,
          `What do you know about ${companyData.name}'s recent developments?`
        ]
      }
    };
  }

  private getFallbackIntelligence(companyName: string, jobTitle: string): EnhancedCompanyIntelligence {
    const companyData = this.fetchFromPredefinedData(companyName);
    const insights = this.getDefaultInsights(companyData, jobTitle);
    
    return {
      company_data: companyData;
      ...insights
    };
  }

  // Public method to clear cache
  public clearCache(): void {
    this.cache.clear();
    console.log('Company intelligence cache cleared');
  }
}

export default EnhancedCompanyIntelligenceService;