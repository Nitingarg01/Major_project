import { NextRequest, NextResponse } from 'next/server';
import { HybridAIService } from '@/lib/hybridAIService';

export async function POST(request: NextRequest) {
  try {
    console.log('🏢 Enhanced Company Intelligence API called');
    
    const body = await request.json();
    const { query, limit = 10 } = body;

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters long' },
        { status: 400 }
      );
    }

    console.log(`🔍 Searching for companies matching: "${query}"`);

    // Get enhanced company suggestions from hybrid AI service
    const hybridService = HybridAIService.getInstance();
    const suggestions = hybridService.getCompanySuggestions(query);
    
    // Enhance suggestions with additional intelligence
    const enhancedSuggestions = suggestions.slice(0, limit).map(company => ({
      name: company;
      industry: getCompanyIndustry(company),
      description: `Leading company in ${getCompanyIndustry(company).toLowerCase()}`,
      relevanceScore: calculateRelevanceScore(company, query),
      metadata: {
        hasSpecificQuestions: true;
        difficultyLevel: getDifficultyLevel(company),
        popularRoles: getPopularRoles(company),
        techStack: getTechStack(company)
      }
    }));

    // Sort by relevance score
    enhancedSuggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Get service health for response
    const serviceHealth = await hybridAIService.getServiceHealth();

    return NextResponse.json({
      success: true;
      query,
      companies: enhancedSuggestions;
      totalFound: enhancedSuggestions.length;
      serviceInfo: {
        primary: serviceHealth.primary;
        enhancedIntelligence: true;
        companyDatabase: true
      },
      features: {
        companySpecificQuestions: true;
        industryContext: true;
        difficultyAdaptation: true;
        techStackAwareness: true
      }
    });

  } catch (error: any) {
    console.error('❌ Error in company intelligence:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to get company intelligence';
        details: error.message;
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET endpoint for trending companies and statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'trending';
    
    let responseData;
    
    switch (type) {
      case 'trending':
        responseData = getTrendingCompanies();
        break;
      case 'industries':
        responseData = getIndustryBreakdown();
        break;
      case 'popular':
        responseData = getPopularCompanies();
        break;
      default:
        responseData = getTrendingCompanies();
    }

    return NextResponse.json({
      success: true;
      type,
      data: responseData;
      lastUpdated: new Date()
    });

  } catch (error: any) {
    console.error('❌ Error getting company data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch company data';
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Helper functions for enhanced company intelligence

const getCompanyIndustry = (company: string): string => {
  const industryMap: { [key: string]: string } = {
    'Google': 'Technology',
    'Microsoft': 'Technology',
    'Amazon': 'E-commerce & Cloud',
    'Apple': 'Consumer Electronics',
    'Meta': 'Social Media',
    'Netflix': 'Entertainment',
    'Tesla': 'Automotive & Energy',
    'Uber': 'Transportation',
    'Airbnb': 'Travel & Hospitality',
    'LinkedIn': 'Professional Network',
    'Spotify': 'Music Streaming',
    'Dropbox': 'Cloud Storage',
    'Slack': 'Communication',
    'Adobe': 'Creative Software',
    'Salesforce': 'CRM & Enterprise',
    'Twitter': 'Social Media',
    'PayPal': 'Fintech',
    'Oracle': 'Enterprise Software',
    'IBM': 'Technology Services',
    'Intel': 'Semiconductors',
    'NVIDIA': 'Graphics & AI',
    'AMD': 'Semiconductors',
    'Qualcomm': 'Mobile Technology',
    'Zoom': 'Video Communication',
    'Atlassian': 'Software Development',
    'Shopify': 'E-commerce Platform',
    'Twilio': 'Communication APIs',
    'MongoDB': 'Database Technology',
    'Redis': 'Database Technology',
    'Elastic': 'Search & Analytics'
  };
  return industryMap[company] || 'Technology';
};

const calculateRelevanceScore = (company: string, query: string): number => {
  const queryLower = query.toLowerCase();
  const companyLower = company.toLowerCase();
  
  // Exact match gets highest score
  if (companyLower === queryLower) return 100;
  
  // Starts with query gets high score
  if (companyLower.startsWith(queryLower)) return 90;
  
  // Contains query gets medium score
  if (companyLower.includes(queryLower)) return 70;
  
  // Default score
  return 50;
};

const getDifficultyLevel = (company: string): string => {
  const difficultCompanies = ['Google', 'Meta', 'Amazon', 'Apple', 'Netflix', 'Tesla'];
  const moderateCompanies = ['Microsoft', 'Adobe', 'Salesforce', 'Uber', 'Airbnb'];
  
  if (difficultCompanies.includes(company)) return 'High';
  if (moderateCompanies.includes(company)) return 'Medium';
  return 'Medium';
};

const getPopularRoles = (company: string): string[] => {
  const roleMap: { [key: string]: string[] } = {
    'Google': ['Software Engineer', 'Product Manager', 'Data Scientist', 'Site Reliability Engineer'],
    'Microsoft': ['Software Engineer', 'Program Manager', 'Cloud Architect', 'Data Engineer'],
    'Amazon': ['Software Engineer', 'Product Manager', 'Solutions Architect', 'Data Scientist'],
    'Apple': ['Software Engineer', 'Hardware Engineer', 'Product Designer', 'iOS Developer'],
    'Meta': ['Software Engineer', 'Product Manager', 'Data Scientist', 'ML Engineer'],
    'Netflix': ['Software Engineer', 'Data Engineer', 'Content Analyst', 'DevOps Engineer'],
    'Tesla': ['Software Engineer', 'Firmware Engineer', 'Data Engineer', 'Manufacturing Engineer']
  };
  return roleMap[company] || ['Software Engineer', 'Product Manager', 'Data Analyst', 'DevOps Engineer'];
};

const getTechStack = (company: string): string[] => {
  const techMap: { [key: string]: string[] } = {
    'Google': ['Go', 'Python', 'Java', 'C++', 'Kubernetes', 'TensorFlow'],
    'Microsoft': ['C#', 'TypeScript', 'Azure', 'PowerShell', '.NET', 'React'],
    'Amazon': ['Java', 'Python', 'AWS', 'DynamoDB', 'Lambda', 'React'],
    'Apple': ['Swift', 'Objective-C', 'iOS', 'macOS', 'Metal', 'Core Data'],
    'Meta': ['React', 'PHP', 'Python', 'GraphQL', 'PyTorch', 'React Native'],
    'Netflix': ['Java', 'Python', 'React', 'AWS', 'Microservices', 'Kafka'],
    'Tesla': ['Python', 'C++', 'React', 'PostgreSQL', 'Docker', 'Kubernetes']
  };
  return techMap[company] || ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker'];
};

const getTrendingCompanies = () => {
  return [
    { name: 'OpenAI', category: 'AI & ML', growth: '+150%' },
    { name: 'Anthropic', category: 'AI & ML', growth: '+120%' },
    { name: 'ByteDance', category: 'Social Media', growth: '+80%' },
    { name: 'SpaceX', category: 'Aerospace', growth: '+75%' },
    { name: 'Stripe', category: 'Fintech', growth: '+60%' },
    { name: 'Databricks', category: 'Data & Analytics', growth: '+55%' },
    { name: 'Snowflake', category: 'Data & Analytics', growth: '+45%' },
    { name: 'Figma', category: 'Design Tools', growth: '+40%' }
  ];
};

const getIndustryBreakdown = () => {
  return [
    { industry: 'Technology', companies: 45, percentage: 35 },
    { industry: 'Fintech', companies: 25, percentage: 20 },
    { industry: 'Healthcare', companies: 15, percentage: 12 },
    { industry: 'E-commerce', companies: 12, percentage: 10 },
    { industry: 'Entertainment', companies: 10, percentage: 8 },
    { industry: 'Transportation', companies: 8, percentage: 6 },
    { industry: 'Education', companies: 6, percentage: 5 },
    { industry: 'Other', companies: 5, percentage: 4 }
  ];
};

const getPopularCompanies = () => {
  return [
    'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 
    'Netflix', 'Tesla', 'Uber', 'Airbnb', 'LinkedIn',
    'Spotify', 'Adobe', 'Salesforce', 'Oracle', 'IBM',
    'NVIDIA', 'Intel', 'Qualcomm', 'PayPal', 'Zoom'
  ];
};