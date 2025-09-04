// Enhanced Company Database with more companies and roles
export interface CompanyData {
  name: string
  industry: string
  size: 'startup' | 'medium' | 'large' | 'enterprise'
  difficulty: 'easy' | 'medium' | 'hard'
  techStack: string[]
  culture: string[]
  values: string[]
  focusAreas: string[]
  preparationTips: string[]
  commonQuestions: string[]
  interviewStyle: 'casual' | 'formal' | 'technical-heavy' | 'culture-fit' | 'mixed'
  averageRounds: number
  salaryRange?: {
    junior: string
    mid: string
    senior: string
  }
  locations: string[]
  benefits: string[]
  workEnvironment: 'remote' | 'hybrid' | 'office' | 'flexible'
}

export interface JobRole {
  title: string
  level: 'entry' | 'mid' | 'senior' | 'lead' | 'principal'
  category: 'engineering' | 'product' | 'design' | 'data' | 'marketing' | 'sales' | 'operations'
  keywords: string[]
  responsibilities: string[]
  requiredSkills: string[]
  preferredSkills: string[]
}

export const ENHANCED_COMPANIES: { [key: string]: CompanyData } = {
  'google': {
    name: 'Google',
    industry: 'Technology',
    size: 'enterprise',
    difficulty: 'hard',
    techStack: ['Python', 'Java', 'C++', 'Go', 'JavaScript', 'TypeScript', 'Kubernetes', 'TensorFlow', 'BigQuery', 'Cloud Platform'],
    culture: ['Innovation', 'Collaboration', 'Data-driven', 'User-focused', 'Learning'],
    values: ['Focus on the user', 'Think big', 'Strive for excellence', 'Take ownership'],
    focusAreas: ['Machine Learning', 'Cloud Computing', 'Search', 'Mobile', 'AI'],
    preparationTips: [
      'Practice system design for large scale applications',
      'Be ready to code on a whiteboard or shared document',
      'Study Google\'s products and think about improvements',
      'Prepare for behavioral questions about Googleyness',
      'Practice algorithms and data structures extensively'
    ],
    commonQuestions: [
      'Design a search engine',
      'How would you improve Google Maps?',
      'Design a distributed cache system',
      'Tell me about a time you had to learn something quickly',
      'How would you handle a system with billions of users?'
    ],
    interviewStyle: 'technical-heavy',
    averageRounds: 5,
    salaryRange: {
      junior: '$120k-150k',
      mid: '$180k-250k',
      senior: '$280k-400k'
    },
    locations: ['Mountain View', 'San Francisco', 'Seattle', 'New York', 'Austin'],
    benefits: ['Health insurance', '401k matching', 'Free meals', 'Learning budget', 'Stock options'],
    workEnvironment: 'hybrid'
  },

  'meta': {
    name: 'Meta',
    industry: 'Social Media',
    size: 'enterprise',
    difficulty: 'hard',
    techStack: ['React', 'JavaScript', 'Python', 'PHP', 'Hack', 'C++', 'PyTorch', 'GraphQL', 'MySQL', 'Cassandra'],
    culture: ['Move fast', 'Be bold', 'Focus on impact', 'Be open', 'Build social value'],
    values: ['Connect people', 'Give people voice', 'Bring the world closer'],
    focusAreas: ['Social Media', 'Virtual Reality', 'AI', 'Messaging', 'Creator Economy'],
    preparationTips: [
      'Understand Meta\'s mission of connecting people',
      'Practice system design for social media scale',
      'Know React and frontend technologies well',
      'Prepare for questions about handling controversial content',
      'Study Meta\'s products like Instagram, WhatsApp, Messenger'
    ],
    commonQuestions: [
      'Design a social media feed',
      'How to detect fake accounts?',
      'Design a messaging system like WhatsApp',
      'How would you improve Instagram Stories?',
      'Design a content moderation system'
    ],
    interviewStyle: 'mixed',
    averageRounds: 4,
    salaryRange: {
      junior: '$125k-160k',
      mid: '$190k-270k',
      senior: '$300k-450k'
    },
    locations: ['Menlo Park', 'Seattle', 'New York', 'Austin', 'London'],
    benefits: ['Health insurance', 'Parental leave', 'Mental health support', 'Stock options', 'Gym membership'],
    workEnvironment: 'hybrid'
  },

  'amazon': {
    name: 'Amazon',
    industry: 'E-commerce & Cloud',
    size: 'enterprise',
    difficulty: 'hard',
    techStack: ['Java', 'Python', 'JavaScript', 'AWS', 'DynamoDB', 'Lambda', 'S3', 'EC2', 'React', 'Node.js'],
    culture: ['Customer obsession', 'Ownership', 'Invent and simplify', 'Learn and be curious'],
    values: ['Customer first', 'Long-term thinking', 'Innovation', 'Operational excellence'],
    focusAreas: ['E-commerce', 'Cloud Computing', 'AI/ML', 'Logistics', 'Voice Technology'],
    preparationTips: [
      'Master all 16 Amazon Leadership Principles with STAR examples',
      'Focus heavily on customer obsession and ownership',
      'Practice system design for e-commerce and cloud platforms',
      'Understand AWS services and their use cases',
      'Prepare for scenario-based behavioral questions'
    ],
    commonQuestions: [
      'Design an e-commerce recommendation system',
      'Tell me about a time you obsessed over customers',
      'How would you design Amazon Prime delivery system?',
      'Describe a time you had to make a decision with incomplete information',
      'Design a cloud storage system like S3'
    ],
    interviewStyle: 'culture-fit',
    averageRounds: 5,
    salaryRange: {
      junior: '$110k-140k',
      mid: '$160k-220k',
      senior: '$250k-350k'
    },
    locations: ['Seattle', 'San Francisco', 'Austin', 'New York', 'Boston'],
    benefits: ['Health insurance', '401k', 'Stock vesting', 'Career development', 'Parental leave'],
    workEnvironment: 'office'
  },

  'microsoft': {
    name: 'Microsoft',
    industry: 'Technology',
    size: 'enterprise',
    difficulty: 'medium',
    techStack: ['C#', '.NET', 'Azure', 'TypeScript', 'Python', 'React', 'SQL Server', 'Power Platform', 'Office 365'],
    culture: ['Respect', 'Integrity', 'Accountability', 'Inclusive', 'Growth mindset'],
    values: ['Empower every person', 'Achieve more', 'Diverse and inclusive'],
    focusAreas: ['Cloud Computing', 'Productivity Software', 'Gaming', 'AI', 'Mixed Reality'],
    preparationTips: [
      'Understand Microsoft\'s transformation to cloud-first',
      'Know Azure services and their competitors',
      'Practice coding in C# or your preferred language',
      'Prepare examples showing growth mindset',
      'Study Microsoft\'s inclusive culture initiatives'
    ],
    commonQuestions: [
      'Design a cloud-based document collaboration system',
      'How would you improve Microsoft Teams?',
      'Tell me about a time you learned from failure',
      'Design a real-time multiplayer game system',
      'How would you handle scaling Office 365?'
    ],
    interviewStyle: 'mixed',
    averageRounds: 4,
    salaryRange: {
      junior: '$100k-130k',
      mid: '$140k-190k',
      senior: '$220k-300k'
    },
    locations: ['Redmond', 'San Francisco', 'Austin', 'Atlanta', 'Dublin'],
    benefits: ['Health insurance', 'Stock purchase plan', 'Flexible time off', 'Learning resources'],
    workEnvironment: 'hybrid'
  },

  'apple': {
    name: 'Apple',
    industry: 'Consumer Electronics',
    size: 'enterprise',
    difficulty: 'hard',
    techStack: ['Swift', 'Objective-C', 'C++', 'JavaScript', 'Python', 'iOS', 'macOS', 'Metal', 'Core ML'],
    culture: ['Innovation', 'Excellence', 'Privacy', 'Environmental responsibility', 'Accessibility'],
    values: ['Privacy is a human right', 'Simplicity is sophistication', 'Think different'],
    focusAreas: ['Consumer Electronics', 'Software Platforms', 'Services', 'Privacy', 'Design'],
    preparationTips: [
      'Understand Apple\'s focus on user experience and design',
      'Know iOS development and Apple\'s ecosystem',
      'Practice questions about privacy and security',
      'Prepare to discuss Apple products you use',
      'Study Apple\'s design principles and Human Interface Guidelines'
    ],
    commonQuestions: [
      'How would you improve Siri?',
      'Design a privacy-focused messaging app',
      'Tell me about a time you prioritized user experience',
      'How would you optimize battery life for iPhone?',
      'Design a payment system like Apple Pay'
    ],
    interviewStyle: 'technical-heavy',
    averageRounds: 6,
    salaryRange: {
      junior: '$130k-160k',
      mid: '$180k-240k',
      senior: '$280k-400k'
    },
    locations: ['Cupertino', 'San Francisco', 'Austin', 'Seattle', 'Munich'],
    benefits: ['Health insurance', 'Stock options', 'Employee discounts', 'Gym membership', 'Transportation'],
    workEnvironment: 'office'
  },

  'netflix': {
    name: 'Netflix',
    industry: 'Entertainment',
    size: 'large',
    difficulty: 'hard',
    techStack: ['Java', 'Python', 'JavaScript', 'React', 'Node.js', 'AWS', 'Microservices', 'Kafka', 'Cassandra'],
    culture: ['Freedom and responsibility', 'High performance', 'Context not control', 'Keeper test'],
    values: ['Entertainment the world', 'Courage', 'Selflessness', 'Innovation'],
    focusAreas: ['Streaming Technology', 'Content Recommendation', 'Global Scale', 'Personalization'],
    preparationTips: [
      'Understand Netflix\'s culture of high performance',
      'Practice system design for video streaming',
      'Know about content delivery networks and global scale',
      'Prepare for questions about recommendation algorithms',
      'Study Netflix\'s microservices architecture'
    ],
    commonQuestions: [
      'Design a video streaming service like Netflix',
      'How would you improve Netflix recommendations?',
      'Design a system to handle millions of concurrent users',
      'Tell me about a time you took ownership of a problem',
      'How would you detect and prevent account sharing?'
    ],
    interviewStyle: 'technical-heavy',
    averageRounds: 4,
    salaryRange: {
      junior: '$150k-180k',
      mid: '$200k-280k',
      senior: '$350k-500k'
    },
    locations: ['Los Gatos', 'Los Angeles', 'New York', 'Amsterdam', 'Singapore'],
    benefits: ['Unlimited PTO', 'Health insurance', 'Stock options', 'Parental leave', 'Learning budget'],
    workEnvironment: 'flexible'
  },

  'uber': {
    name: 'Uber',
    industry: 'Transportation',
    size: 'large',
    difficulty: 'medium',
    techStack: ['Go', 'Java', 'Python', 'React', 'Node.js', 'Kafka', 'Redis', 'PostgreSQL', 'Kubernetes'],
    culture: ['Move fast', 'Build globally', 'Customer obsession', 'Celebrate differences'],
    values: ['We build globally', 'We are customer obsessed', 'We celebrate differences'],
    focusAreas: ['Mobility', 'Delivery', 'Freight', 'Maps & Navigation', 'Marketplace'],
    preparationTips: [
      'Understand Uber\'s marketplace and two-sided platform',
      'Practice system design for real-time matching systems',
      'Know about maps, GPS, and location-based services',
      'Prepare for questions about scaling globally',
      'Study Uber\'s business model and unit economics'
    ],
    commonQuestions: [
      'Design a ride-sharing system like Uber',
      'How would you match drivers with riders?',
      'Design a real-time location tracking system',
      'How would you handle surge pricing?',
      'Design UberEats delivery optimization'
    ],
    interviewStyle: 'mixed',
    averageRounds: 4,
    salaryRange: {
      junior: '$120k-150k',
      mid: '$160k-220k',
      senior: '$240k-350k'
    },
    locations: ['San Francisco', 'New York', 'Seattle', 'Chicago', 'Amsterdam'],
    benefits: ['Health insurance', 'Stock options', 'Commuter benefits', 'Parental leave'],
    workEnvironment: 'hybrid'
  },

  'airbnb': {
    name: 'Airbnb',
    industry: 'Travel & Hospitality',
    size: 'large',
    difficulty: 'medium',
    techStack: ['Ruby on Rails', 'JavaScript', 'React', 'Java', 'Python', 'AWS', 'MySQL', 'Redis', 'Kafka'],
    culture: ['Belong anywhere', 'Champion the mission', 'Be a host', 'Embrace the adventure'],
    values: ['Belong anywhere', 'Create a world where anyone can belong anywhere'],
    focusAreas: ['Travel Platform', 'Trust & Safety', 'Payments', 'Search & Discovery', 'Host Tools'],
    preparationTips: [
      'Understand Airbnb\'s mission of belonging',
      'Practice system design for marketplace platforms',
      'Know about trust and safety in two-sided markets',
      'Prepare for questions about international expansion',
      'Study Airbnb\'s design thinking and user research'
    ],
    commonQuestions: [
      'Design a vacation rental platform like Airbnb',
      'How would you build trust between hosts and guests?',
      'Design a search and recommendation system for listings',
      'How would you handle fraud prevention?',
      'Design a pricing optimization system'
    ],
    interviewStyle: 'mixed',
    averageRounds: 4,
    salaryRange: {
      junior: '$130k-160k',
      mid: '$170k-230k',
      senior: '$260k-380k'
    },
    locations: ['San Francisco', 'Seattle', 'New York', 'Dublin', 'Singapore'],
    benefits: ['Health insurance', 'Travel credits', 'Stock options', 'Parental leave', 'Learning budget'],
    workEnvironment: 'remote'
  },

  'stripe': {
    name: 'Stripe',
    industry: 'Fintech',
    size: 'large',
    difficulty: 'hard',
    techStack: ['Ruby', 'JavaScript', 'Scala', 'Go', 'React', 'Kafka', 'MongoDB', 'PostgreSQL'],
    culture: ['Move fast', 'Think rigorously', 'Trust and transparency', 'Global mindset'],
    values: ['Increase the GDP of the internet', 'Users first', 'Think big'],
    focusAreas: ['Online Payments', 'Financial Infrastructure', 'Developer Tools', 'Global Commerce'],
    preparationTips: [
      'Understand payment processing and financial systems',
      'Practice system design for high-volume transactions',
      'Know about security and compliance in fintech',
      'Study Stripe\'s API design and developer experience',
      'Prepare for questions about international payments'
    ],
    commonQuestions: [
      'Design a payment processing system like Stripe',
      'How would you handle failed payments?',
      'Design a fraud detection system',
      'How would you ensure PCI compliance?',
      'Design a subscription billing system'
    ],
    interviewStyle: 'technical-heavy',
    averageRounds: 5,
    salaryRange: {
      junior: '$140k-170k',
      mid: '$190k-260k',
      senior: '$300k-450k'
    },
    locations: ['San Francisco', 'Seattle', 'New York', 'Dublin', 'Singapore'],
    benefits: ['Health insurance', 'Stock options', 'Learning budget', 'Parental leave'],
    workEnvironment: 'remote'
  },

  'spotify': {
    name: 'Spotify',
    industry: 'Music Streaming',
    size: 'large',
    difficulty: 'medium',
    techStack: ['Java', 'Python', 'JavaScript', 'React', 'Kafka', 'Cassandra', 'PostgreSQL', 'GCP'],
    culture: ['Innovation', 'Collaboration', 'Passion', 'Playfulness', 'Sincerity'],
    values: ['We are here to democratize music', 'We believe in the power of music'],
    focusAreas: ['Music Streaming', 'Audio Content', 'Personalization', 'Creator Tools', 'Podcasts'],
    preparationTips: [
      'Understand music streaming technology and challenges',
      'Practice system design for audio streaming',
      'Know about recommendation algorithms and personalization',
      'Study Spotify\'s approach to playlists and discovery',
      'Prepare for questions about creator economy'
    ],
    commonQuestions: [
      'Design a music streaming service like Spotify',
      'How would you improve music recommendations?',
      'Design a system for podcast streaming',
      'How would you handle offline music downloads?',
      'Design a collaborative playlist feature'
    ],
    interviewStyle: 'mixed',
    averageRounds: 4,
    salaryRange: {
      junior: '$90k-120k',
      mid: '$130k-180k',
      senior: '$200k-280k'
    },
    locations: ['Stockholm', 'New York', 'Boston', 'London', 'Berlin'],
    benefits: ['Health insurance', 'Spotify Premium', 'Parental leave', 'Learning budget'],
    workEnvironment: 'hybrid'
  }
}

export const JOB_ROLES: { [key: string]: JobRole } = {
  'software-engineer': {
    title: 'Software Engineer',
    level: 'mid',
    category: 'engineering',
    keywords: ['software engineer', 'developer', 'programmer', 'sde', 'software developer'],
    responsibilities: [
      'Design and develop software applications',
      'Write clean, maintainable code',
      'Collaborate with cross-functional teams',
      'Debug and troubleshoot issues',
      'Participate in code reviews'
    ],
    requiredSkills: ['Programming', 'Problem solving', 'Data structures', 'Algorithms'],
    preferredSkills: ['System design', 'Database design', 'API development', 'Testing']
  },
  'senior-software-engineer': {
    title: 'Senior Software Engineer',
    level: 'senior',
    category: 'engineering',
    keywords: ['senior software engineer', 'senior developer', 'senior sde', 'lead developer'],
    responsibilities: [
      'Lead technical design and architecture decisions',
      'Mentor junior developers',
      'Drive technical initiatives',
      'Design scalable systems',
      'Participate in technical strategy'
    ],
    requiredSkills: ['Advanced programming', 'System design', 'Leadership', 'Architecture'],
    preferredSkills: ['Distributed systems', 'Performance optimization', 'Team management', 'Technical strategy']
  },
  'frontend-engineer': {
    title: 'Frontend Engineer',
    level: 'mid',
    category: 'engineering',
    keywords: ['frontend engineer', 'frontend developer', 'ui developer', 'react developer'],
    responsibilities: [
      'Build user interfaces and experiences',
      'Implement responsive designs',
      'Optimize frontend performance',
      'Collaborate with designers',
      'Write frontend tests'
    ],
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React/Angular/Vue', 'Responsive design'],
    preferredSkills: ['TypeScript', 'State management', 'Testing frameworks', 'Build tools']
  },
  'backend-engineer': {
    title: 'Backend Engineer',
    level: 'mid',
    category: 'engineering',
    keywords: ['backend engineer', 'backend developer', 'server developer', 'api developer'],
    responsibilities: [
      'Build server-side applications and APIs',
      'Design database schemas',
      'Implement business logic',
      'Ensure system security',
      'Optimize backend performance'
    ],
    requiredSkills: ['Server-side programming', 'Database design', 'API development', 'Security'],
    preferredSkills: ['Microservices', 'Cloud platforms', 'DevOps', 'Distributed systems']
  },
  'fullstack-engineer': {
    title: 'Full Stack Engineer',
    level: 'mid',
    category: 'engineering',
    keywords: ['fullstack engineer', 'full stack developer', 'fullstack developer'],
    responsibilities: [
      'Work on both frontend and backend',
      'Build end-to-end features',
      'Design system architecture',
      'Collaborate across teams',
      'Handle deployment and operations'
    ],
    requiredSkills: ['Frontend technologies', 'Backend technologies', 'Database design', 'System integration'],
    preferredSkills: ['DevOps', 'Cloud platforms', 'API design', 'Performance optimization']
  },
  'data-scientist': {
    title: 'Data Scientist',
    level: 'mid',
    category: 'data',
    keywords: ['data scientist', 'ml engineer', 'machine learning engineer', 'ai engineer'],
    responsibilities: [
      'Analyze complex datasets',
      'Build machine learning models',
      'Extract insights from data',
      'Create data visualizations',
      'Collaborate with stakeholders'
    ],
    requiredSkills: ['Python/R', 'Machine learning', 'Statistics', 'Data visualization', 'SQL'],
    preferredSkills: ['Deep learning', 'Big data tools', 'MLOps', 'A/B testing']
  },
  'product-manager': {
    title: 'Product Manager',
    level: 'mid',
    category: 'product',
    keywords: ['product manager', 'pm', 'senior product manager', 'lead product manager'],
    responsibilities: [
      'Define product strategy and roadmap',
      'Gather and prioritize requirements',
      'Work with engineering and design',
      'Analyze product metrics',
      'Communicate with stakeholders'
    ],
    requiredSkills: ['Product strategy', 'Analytics', 'Communication', 'Project management'],
    preferredSkills: ['Technical background', 'User research', 'A/B testing', 'Market analysis']
  },
  'data-engineer': {
    title: 'Data Engineer',
    level: 'mid',
    category: 'data',
    keywords: ['data engineer', 'big data engineer', 'etl developer', 'data pipeline engineer'],
    responsibilities: [
      'Build data pipelines and infrastructure',
      'Design data warehouses',
      'Ensure data quality and reliability',
      'Optimize data processing',
      'Support data science teams'
    ],
    requiredSkills: ['SQL', 'Python/Scala', 'ETL processes', 'Data warehousing', 'Big data tools'],
    preferredSkills: ['Spark', 'Kafka', 'Airflow', 'Cloud data services', 'Stream processing']
  }
}

export const POPULAR_SEARCH_SUGGESTIONS = [
  'Google Software Engineer',
  'Meta Frontend Engineer',
  'Amazon Senior Software Engineer',
  'Microsoft Data Scientist',
  'Apple iOS Developer',
  'Netflix Backend Engineer',
  'Uber Full Stack Engineer',
  'Airbnb Product Manager',
  'Stripe Payment Engineer',
  'Spotify Machine Learning Engineer',
  'Tesla Software Engineer',
  'Salesforce Developer',
  'Adobe Creative Engineer',
  'LinkedIn Data Engineer',
  'Twitter Backend Engineer',
  'Dropbox Senior Engineer',
  'Slack Frontend Developer',
  'Zoom Video Engineer',
  'DocuSign Software Engineer',
  'Shopify E-commerce Engineer'
]

export function searchCompanyAndRole(query: string): {
  suggestions: string[]
  companyData: CompanyData | null
} {
  const lowerQuery = query.toLowerCase()
  
  // Find matching company
  let matchedCompany: CompanyData | null = null
  for (const [key, company] of Object.entries(ENHANCED_COMPANIES)) {
    if (company.name.toLowerCase().includes(lowerQuery) || 
        lowerQuery.includes(company.name.toLowerCase())) {
      matchedCompany = company
      break
    }
  }
  
  // Generate suggestions
  const suggestions = POPULAR_SEARCH_SUGGESTIONS
    .filter(suggestion => 
      suggestion.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 8)
  
  // If no direct matches, show popular suggestions
  if (suggestions.length === 0 && lowerQuery.length >= 2) {
    const roleMatches = Object.values(JOB_ROLES)
      .filter(role => 
        role.keywords.some(keyword => 
          keyword.toLowerCase().includes(lowerQuery) ||
          lowerQuery.includes(keyword.toLowerCase())
        )
      )
      .slice(0, 5)
    
    if (roleMatches.length > 0) {
      const topCompanies = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple']
      roleMatches.forEach(role => {
        topCompanies.forEach(company => {
          suggestions.push(`${company} ${role.title}`)
        })
      })
    }
  }
  
  return {
    suggestions: suggestions.slice(0, 8),
    companyData: matchedCompany
  }
}

export function parseJobQuery(query: string): { company: string, jobTitle: string } {
  const parts = query.trim().split(' ')
  
  if (parts.length >= 2) {
    // First word is likely company, rest is job title
    const company = parts[0]
    const jobTitle = parts.slice(1).join(' ')
    return { company, jobTitle }
  }
  
  return { company: query, jobTitle: 'Software Engineer' }
}

export function getCompanyByName(name: string): CompanyData | null {
  const key = name.toLowerCase().replace(/\s+/g, '')
  return ENHANCED_COMPANIES[key] || null
}