import axios from 'axios';

interface CompanyData {
  name: string;
  industry: string;
  techStack: string[];
  culture: string[];
  values: string[];
  recentNews: string[];
  commonQuestions: string[];
  interviewProcess: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  focusAreas: string[];
  preparationTips: string[];
}

interface CompanyIntelligence {
  companyData: CompanyData;
  marketPosition: string;
  competitorAnalysis: string[];
  businessModel: string;
  recentUpdates: string[];
  interviewInsights: {
    averageRounds: number;
    timePerRound: number;
    keySkillsRequired: string[];
    culturalFitQuestions: string[];
  };
}

// Company search suggestions for autofill
export const COMPANY_SUGGESTIONS = [
  'Google Software Engineer',
  'Google Frontend Engineer', 
  'Google Backend Engineer',
  'Google Full Stack Engineer',
  'Google Data Scientist',
  'Google Product Manager',
  'Microsoft Software Engineer',
  'Microsoft Azure Engineer',
  'Microsoft Full Stack Developer',
  'Microsoft Data Engineer',
  'Amazon Software Engineer',
  'Amazon AWS Engineer',
  'Amazon Full Stack Developer',
  'Amazon DevOps Engineer',
  'Meta Software Engineer',
  'Meta Frontend Engineer',
  'Meta React Developer',
  'Meta Full Stack Engineer',
  'Apple iOS Developer',
  'Apple Software Engineer',
  'Apple Full Stack Developer',
  'Netflix Software Engineer',
  'Tesla Software Engineer',
  'Uber Software Engineer',
  'Airbnb Software Engineer',
  'LinkedIn Software Engineer',
  'Spotify Software Engineer',
  'Twitter Software Engineer',
  'Salesforce Software Engineer',
  'Oracle Software Engineer',
  'IBM Software Engineer'
];

// Enhanced company database with real insights
const companyDatabase: { [key: string]: CompanyData } = {
  'Google': {
    name: 'Google',
    industry: 'Technology',
    techStack: ['JavaScript', 'Python', 'Java', 'Go', 'C++', 'TypeScript', 'React', 'Angular', 'TensorFlow', 'Kubernetes'],
    culture: ['Innovation', 'Googleyness', 'Data-driven decisions', 'User focus', 'Collaboration'],
    values: ['Focus on the user', 'Democracy on the web', 'Fast is better than slow', 'Great just isn\'t good enough'],
    recentNews: [
      'AI-first company transformation with Bard and Gemini',
      'Major cloud computing expansion',
      'Quantum computing breakthroughs',
      'Sustainability initiatives and carbon neutrality goals'
    ],
    commonQuestions: [
      'How would you improve Google Search?',
      'Design a system for YouTube recommendations',
      'How do you handle billions of search queries?',
      'Explain machine learning to a non-technical person',
      'How would you optimize Google Maps for developing countries?'
    ],
    interviewProcess: ['Phone Screen', 'Technical Phone Interview', 'Onsite (4-5 rounds)', 'Hiring Committee Review'],
    difficulty: 'hard',
    focusAreas: ['System Design', 'Algorithms', 'Data Structures', 'Machine Learning', 'Cultural Fit'],
    preparationTips: [
      'Master system design for large-scale systems',
      'Understand Google\'s core products deeply',
      'Practice LeetCode medium/hard problems',
      'Study distributed systems concepts',
      'Prepare for behavioral questions around Googleyness'
    ]
  },
  'Microsoft': {
    name: 'Microsoft',
    industry: 'Technology',
    techStack: ['C#', 'JavaScript', 'TypeScript', 'Python', 'Azure', 'React', 'ASP.NET', 'SQL Server', 'Power Platform'],
    culture: ['Growth mindset', 'Inclusion', 'Respect', 'Collaboration', 'Customer obsession'],
    values: ['Empower every person and organization', 'Diversity and inclusion', 'Environmental sustainability'],
    recentNews: [
      'AI integration across all products with Copilot',
      'Azure cloud growth and expansion',
      'Teams platform evolution',
      'GitHub acquisition benefits realization'
    ],
    commonQuestions: [
      'How would you improve Microsoft Teams?',
      'Design a cloud storage system like OneDrive',
      'Explain the benefits of cloud computing',
      'How do you handle software compatibility issues?',
      'Describe a time you showed growth mindset'
    ],
    interviewProcess: ['Recruiter Screen', 'Technical Interview', 'Onsite Loop (4-5 interviews)', 'Hiring Manager Discussion'],
    difficulty: 'medium',
    focusAreas: ['Cloud Architecture', 'Software Engineering', 'Problem Solving', 'Leadership', 'Growth Mindset'],
    preparationTips: [
      'Understand Microsoft\'s cloud-first strategy',
      'Practice system design with Azure services',
      'Prepare growth mindset examples',
      'Study Microsoft\'s cultural values',
      'Know their recent AI initiatives'
    ]
  },
  'Amazon': {
    name: 'Amazon',
    industry: 'E-commerce/Cloud',
    techStack: ['Java', 'Python', 'JavaScript', 'AWS', 'React', 'Node.js', 'DynamoDB', 'Lambda', 'S3'],
    culture: ['Customer obsession', 'Ownership', 'Invent and simplify', 'Learn and be curious', 'Hire and develop the best'],
    values: ['Customer obsession', 'Long-term thinking', 'Eagerness to invent', 'Operational excellence'],
    recentNews: [
      'AWS continued dominance in cloud market',
      'Amazon Prime and logistics expansion',
      'Alexa and smart home innovations',
      'Sustainability initiatives and carbon pledge'
    ],
    commonQuestions: [
      'Tell me about a time you disagreed with your manager',
      'How would you design Amazon\'s recommendation system?',
      'Explain AWS to a non-technical person',
      'Describe a time you had to work with limited resources',
      'How do you prioritize customer needs?'
    ],
    interviewProcess: ['Phone Screen', 'Technical Assessment', 'Onsite Loop (5-7 interviews)', 'Bar Raiser Interview'],
    difficulty: 'hard',
    focusAreas: ['Leadership Principles', 'System Design', 'Data Structures', 'AWS Knowledge', 'Customer Focus'],
    preparationTips: [
      'Master all 16 Leadership Principles with STAR examples',
      'Understand AWS services deeply',
      'Practice large-scale system design',
      'Prepare customer obsession stories',
      'Study Amazon\'s business model'
    ]
  },
  'Meta': {
    name: 'Meta',
    industry: 'Social Media/Metaverse',
    techStack: ['React', 'JavaScript', 'Python', 'PHP', 'GraphQL', 'React Native', 'PyTorch', 'Hack'],
    culture: ['Move fast', 'Be bold', 'Focus on impact', 'Be open', 'Build social value'],
    values: ['Connecting people', 'Building community', 'Serving everyone', 'Privacy and safety'],
    recentNews: [
      'Metaverse and VR/AR investments',
      'AI research and development',
      'Privacy-focused messaging',
      'Creator economy initiatives'
    ],
    commonQuestions: [
      'How would you design Facebook\'s newsfeed?',
      'What metrics would you track for Instagram Stories?',
      'How do you handle fake news on social platforms?',
      'Design a chat application like WhatsApp',
      'How would you improve user engagement?'
    ],
    interviewProcess: ['Recruiter Call', 'Technical Phone Screen', 'Onsite (4-5 rounds)', 'Hiring Committee'],
    difficulty: 'hard',
    focusAreas: ['System Design', 'Product Sense', 'Algorithms', 'Social Impact', 'Innovation'],
    preparationTips: [
      'Understand social media algorithms',
      'Study Meta\'s product ecosystem',
      'Practice system design for social platforms',
      'Prepare for product thinking questions',
      'Know their metaverse strategy'
    ]
  },
  'Apple': {
    name: 'Apple',
    industry: 'Technology/Consumer Electronics',
    techStack: ['Swift', 'Objective-C', 'JavaScript', 'Python', 'iOS', 'macOS', 'React', 'Machine Learning'],
    culture: ['Innovation', 'Excellence', 'Privacy', 'Simplicity', 'Attention to detail'],
    values: ['Think different', 'Privacy is a fundamental human right', 'Environmental responsibility'],
    recentNews: [
      'Apple Silicon chip development',
      'Privacy-focused features across products',
      'Services revenue growth',
      'Sustainability and carbon neutral goals'
    ],
    commonQuestions: [
      'How would you improve the iPhone camera?',
      'Design a feature for Apple Watch health monitoring',
      'Explain Apple\'s approach to privacy',
      'How do you ensure software quality?',
      'What makes Apple products unique?'
    ],
    interviewProcess: ['Phone Screen', 'Technical Interview', 'Onsite (3-6 rounds)', 'Final Review'],
    difficulty: 'medium',
    focusAreas: ['iOS Development', 'Hardware-Software Integration', 'User Experience', 'Quality', 'Innovation'],
    preparationTips: [
      'Master iOS development and Swift',
      'Understand Apple\'s design principles',
      'Study their hardware-software integration',
      'Prepare quality-focused examples',
      'Know Apple\'s privacy stance'
    ]
  }
};

export class CompanyIntelligenceService {
  private static instance: CompanyIntelligenceService;
  
  public static getInstance(): CompanyIntelligenceService {
    if (!CompanyIntelligenceService.instance) {
      CompanyIntelligenceService.instance = new CompanyIntelligenceService();
    }
    return CompanyIntelligenceService.instance;
  }

  async getCompanyIntelligence(companyName: string): Promise<CompanyIntelligence | null> {
    try {
      // Normalize company name
      const normalizedName = this.normalizeCompanyName(companyName);
      const companyData = companyDatabase[normalizedName];
      
      if (!companyData) {
        return this.getGenericCompanyData(companyName);
      }

      // Fetch recent news and updates
      const recentUpdates = await this.fetchRecentNews(companyName);
      
      return {
        companyData,
        marketPosition: await this.getMarketPosition(companyName),
        competitorAnalysis: this.getCompetitors(normalizedName),
        businessModel: this.getBusinessModel(normalizedName),
        recentUpdates,
        interviewInsights: {
          averageRounds: this.getAverageRounds(companyData.difficulty),
          timePerRound: this.getTimePerRound(companyData.difficulty),
          keySkillsRequired: companyData.focusAreas,
          culturalFitQuestions: this.generateCulturalQuestions(companyData.culture)
        }
      };
    } catch (error) {
      console.error('Error getting company intelligence:', error);
      return null;
    }
  }

  private normalizeCompanyName(name: string): string {
    const normalized = name.toLowerCase().trim();
    const mappings: { [key: string]: string } = {
      'google': 'Google',
      'alphabet': 'Google',
      'microsoft': 'Microsoft',
      'msft': 'Microsoft',
      'amazon': 'Amazon',
      'aws': 'Amazon',
      'meta': 'Meta',
      'facebook': 'Meta',
      'apple': 'Apple',
      'netflix': 'Netflix',
      'tesla': 'Tesla',
      'uber': 'Uber',
      'airbnb': 'Airbnb',
      'linkedin': 'LinkedIn',
      'spotify': 'Spotify'
    };
    
    return mappings[normalized] || name;
  }

  private async fetchRecentNews(companyName: string): Promise<string[]> {
    try {
      // Use API Ninja for company news
      const response = await axios.get(`https://api.api-ninjas.com/v1/news`, {
        headers: {
          'X-Api-Key': process.env.API_NINJA_API_KEY
        },
        params: {
          query: `${companyName} technology innovation`,
          limit: 3
        }
      });

      if (response.data && response.data.length > 0) {
        return response.data.map((article: any) => article.title);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    }

    // Fallback to database news
    const companyData = companyDatabase[this.normalizeCompanyName(companyName)];
    return companyData?.recentNews || [];
  }

  private getMarketPosition(companyName: string): string {
    const positions: { [key: string]: string } = {
      'Google': 'Global leader in search, advertising, and cloud computing with dominant market position',
      'Microsoft': 'Leading enterprise software and cloud services provider with strong growth',
      'Amazon': 'E-commerce pioneer and cloud computing leader with expanding market reach',
      'Meta': 'Social media giant pivoting to metaverse with massive user base',
      'Apple': 'Premium consumer electronics leader with strong brand loyalty and ecosystem'
    };
    
    return positions[companyName] || 'Growing technology company with market opportunities';
  }

  private getCompetitors(companyName: string): string[] {
    const competitors: { [key: string]: string[] } = {
      'Google': ['Microsoft', 'Amazon', 'Apple', 'Meta'],
      'Microsoft': ['Google', 'Amazon', 'Apple', 'Oracle'],
      'Amazon': ['Google', 'Microsoft', 'Alibaba', 'Walmart'],
      'Meta': ['Google', 'Apple', 'Twitter', 'TikTok'],
      'Apple': ['Google', 'Microsoft', 'Samsung', 'Amazon']
    };
    
    return competitors[companyName] || [];
  }

  private getBusinessModel(companyName: string): string {
    const models: { [key: string]: string } = {
      'Google': 'Advertising-based revenue with cloud and subscription services',
      'Microsoft': 'Software licensing, cloud services, and enterprise solutions',
      'Amazon': 'E-commerce marketplace with cloud computing and advertising',
      'Meta': 'Advertising-based social media platform with metaverse investments',
      'Apple': 'Premium hardware sales with growing services revenue'
    };
    
    return models[companyName] || 'Technology-based business model';
  }

  private getAverageRounds(difficulty: string): number {
    const rounds = {
      'easy': 3,
      'medium': 4,
      'hard': 5
    };
    return rounds[difficulty as keyof typeof rounds] || 4;
  }

  private getTimePerRound(difficulty: string): number {
    const times = {
      'easy': 45,
      'medium': 60,
      'hard': 75
    };
    return times[difficulty as keyof typeof times] || 60;
  }

  private generateCulturalQuestions(culture: string[]): string[] {
    const culturalQuestions: string[] = [];
    
    culture.forEach(value => {
      switch (value.toLowerCase()) {
        case 'innovation':
          culturalQuestions.push('Tell me about a time you innovated or thought outside the box');
          break;
        case 'customer obsession':
          culturalQuestions.push('Describe a time you went above and beyond for a customer');
          break;
        case 'growth mindset':
          culturalQuestions.push('Tell me about a time you learned from failure');
          break;
        case 'collaboration':
          culturalQuestions.push('Describe a challenging team project and your role');
          break;
        case 'ownership':
          culturalQuestions.push('Tell me about a time you took ownership of a difficult situation');
          break;
        default:
          culturalQuestions.push(`How do you embody ${value} in your work?`);
      }
    });
    
    return culturalQuestions;
  }

  private getGenericCompanyData(companyName: string): CompanyIntelligence {
    return {
      companyData: {
        name: companyName,
        industry: 'Technology',
        techStack: ['JavaScript', 'Python', 'React', 'Node.js'],
        culture: ['Innovation', 'Collaboration', 'Excellence'],
        values: ['Customer focus', 'Quality', 'Growth'],
        recentNews: ['Company growth and expansion', 'New product launches', 'Technology innovations'],
        commonQuestions: [
          'Tell me about yourself',
          'Why do you want to work here?',
          'What are your strengths and weaknesses?',
          'Describe a challenging project',
          'Where do you see yourself in 5 years?'
        ],
        interviewProcess: ['Phone Screen', 'Technical Interview', 'Final Round', 'Decision'],
        difficulty: 'medium',
        focusAreas: ['Technical Skills', 'Problem Solving', 'Communication', 'Cultural Fit'],
        preparationTips: [
          'Research the company thoroughly',
          'Practice common interview questions',
          'Prepare technical examples',
          'Show enthusiasm and cultural fit'
        ]
      },
      marketPosition: 'Competitive position in the technology market',
      competitorAnalysis: [],
      businessModel: 'Technology-based business model',
      recentUpdates: [],
      interviewInsights: {
        averageRounds: 4,
        timePerRound: 60,
        keySkillsRequired: ['Technical Skills', 'Problem Solving'],
        culturalFitQuestions: ['Why do you want to work here?', 'Tell me about a team project']
      }
    };
  }

  // Generate company-specific questions based on intelligence
  generateCompanySpecificQuestions(
    companyIntelligence: CompanyIntelligence, 
    jobTitle: string, 
    difficulty: 'easy' | 'medium' | 'hard',
    round: 'technical' | 'behavioral' | 'system-design' | 'cultural-fit'
  ): string[] {
    const { companyData } = companyIntelligence;
    const questions: string[] = [];

    switch (round) {
      case 'technical':
        questions.push(...this.generateTechnicalQuestions(companyData, jobTitle, difficulty));
        break;
      case 'behavioral':
        questions.push(...this.generateBehavioralQuestions(companyData, difficulty));
        break;
      case 'system-design':
        questions.push(...this.generateSystemDesignQuestions(companyData, difficulty));
        break;
      case 'cultural-fit':
        questions.push(...companyIntelligence.interviewInsights.culturalFitQuestions);
        break;
    }

    return questions.slice(0, 5); // Return top 5 questions
  }

  private generateTechnicalQuestions(
    companyData: CompanyData, 
    jobTitle: string, 
    difficulty: 'easy' | 'medium' | 'hard'
  ): string[] {
    const questions: string[] = [];
    const techStack = companyData.techStack;
    
    // Add company-specific technical questions
    if (companyData.name === 'Google') {
      questions.push(
        'Implement a function to find the shortest path in a graph',
        'Design a distributed cache system',
        'How would you optimize search query performance?',
        'Implement a machine learning model for recommendation systems',
        'Explain how you would handle billions of concurrent users'
      );
    } else if (companyData.name === 'Amazon') {
      questions.push(
        'Design a scalable inventory management system',
        'Implement a recommendation algorithm for products',
        'How would you design Amazon Prime delivery system?',
        'Optimize database queries for high-traffic e-commerce',
        'Design a microservices architecture for AWS'
      );
    }
    
    // Add technology-specific questions based on tech stack
    techStack.forEach(tech => {
      if (tech === 'React') {
        questions.push('Explain React hooks and lifecycle methods');
      } else if (tech === 'Python') {
        questions.push('Implement a decorator pattern in Python');
      } else if (tech === 'JavaScript') {
        questions.push('Explain async/await and promises in JavaScript');
      }
    });
    
    return questions;
  }

  private generateBehavioralQuestions(companyData: CompanyData, difficulty: 'easy' | 'medium' | 'hard'): string[] {
    const questions: string[] = [];
    
    // Company-specific behavioral questions
    if (companyData.name === 'Amazon') {
      questions.push(
        'Tell me about a time you had to work backwards from a customer need',
        'Describe a situation where you had to dive deep into a problem',
        'Give an example of when you disagreed and committed',
        'Tell me about a time you had to deliver results with limited resources'
      );
    } else if (companyData.name === 'Google') {
      questions.push(
        'Describe a time you had to learn something completely new',
        'Tell me about a project where you had to collaborate across teams',
        'Give an example of when you challenged the status quo',
        'Describe how you handled a situation with ambiguous requirements'
      );
    }
    
    // General behavioral questions based on company culture
    companyData.culture.forEach(value => {
      if (value === 'Innovation') {
        questions.push('Tell me about your most innovative solution to a problem');
      } else if (value === 'Collaboration') {
        questions.push('Describe a time you had to work with a difficult team member');
      }
    });
    
    return questions;
  }

  private generateSystemDesignQuestions(companyData: CompanyData, difficulty: 'easy' | 'medium' | 'hard'): string[] {
    const questions: string[] = [];
    
    // Company-specific system design questions
    if (companyData.name === 'Google') {
      questions.push(
        'Design a system like Google Search',
        'How would you build YouTube\'s video streaming service?',
        'Design Google Maps navigation system',
        'Build a system for Gmail\'s spam detection'
      );
    } else if (companyData.name === 'Meta') {
      questions.push(
        'Design Facebook\'s news feed system',
        'How would you build Instagram\'s photo sharing service?',
        'Design a chat system like WhatsApp',
        'Build a notification system for social media'
      );
    } else if (companyData.name === 'Amazon') {
      questions.push(
        'Design Amazon\'s product catalog system',
        'How would you build Amazon Prime\'s delivery tracking?',
        'Design a recommendation system for e-commerce',
        'Build a payment processing system'
      );
    }
    
    return questions;
  }
}

export default CompanyIntelligenceService;