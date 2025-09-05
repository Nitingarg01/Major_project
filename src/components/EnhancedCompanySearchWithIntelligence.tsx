'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Search, Building2, Briefcase, ArrowRight, Star, MapPin, Users, DollarSign, Zap, TrendingUp, Clock, Globe, Lightbulb } from 'lucide-react'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'

interface CompanyIntelligence {
  company_data: {
    name: string;
    industry: string;
    description: string;
    tech_stack: string[];
    culture: string[];
    values: string[];
    size: string;
    locations: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    recent_news: string[];
    recent_posts: Array<{
      title: string;
      summary: string;
      date: string;
      source: string;
    }>;
    salary_ranges: {
      entry: string;
      mid: string;
      senior: string;
    };
    work_environment: string;
  };
  interview_insights: {
    average_rounds: number;
    time_per_round: number;
    key_skills: string[];
    cultural_questions: string[];
  };
  question_suggestions: {
    technical: string[];
    behavioral: string[];
    company_specific: string[];
  };
}

interface EnhancedCompanySearchProps {
  onSelect: (company: string, jobTitle: string, companyData?: any) => void;
  placeholder?: string;
  className?: string;
}

const POPULAR_COMPANIES = [
  'Google Software Engineer',
  'Microsoft Software Engineer', 
  'Amazon Software Engineer',
  'Meta Software Engineer',
  'Apple iOS Developer',
  'Netflix Software Engineer',
  'Tesla Software Engineer',
  'Uber Software Engineer',
  'Airbnb Software Engineer',
  'Spotify Software Engineer'
];

const EnhancedCompanySearchWithIntelligence: React.FC<EnhancedCompanySearchProps> = ({ 
  onSelect, 
  placeholder = "Search for company and role (e.g., Google Software Engineer)", 
  className = "" 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [companyIntelligence, setCompanyIntelligence] = useState<CompanyIntelligence | null>(null);
  const [loadingIntelligence, setLoadingIntelligence] = useState(false);
  const [showTrending, setShowTrending] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentCompanySearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches');
      }
    }
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      const filtered = POPULAR_COMPANIES.filter(company => 
        company.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 8));
      setIsOpen(filtered.length > 0);
      setSelectedIndex(0);
      setShowTrending(false);
      
      // Fetch company intelligence
      fetchCompanyIntelligence(query);
    } else if (query.length === 0) {
      setSuggestions([]);
      setCompanyIntelligence(null);
      setShowTrending(true);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setCompanyIntelligence(null);
      setShowTrending(false);
    }
  }, [query]);

  const fetchCompanyIntelligence = async (searchQuery: string) => {
    const { company, jobTitle } = parseJobQuery(searchQuery);
    
    if (!company) return;

    setLoadingIntelligence(true);
    try {
      const response = await fetch('/api/company-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: company, jobTitle })
      });

      if (response.ok) {
        const data = await response.json();
        setCompanyIntelligence(data.intelligence);
      } else {
        console.error('Failed to fetch company intelligence');
      }
    } catch (error) {
      console.error('Error fetching company intelligence:', error);
    } finally {
      setLoadingIntelligence(false);
    }
  };

  const parseJobQuery = (query: string): { company: string; jobTitle: string } => {
    const lowerQuery = query.toLowerCase();
    
    // Common job title patterns
    const jobTitlePatterns = [
      'software engineer', 'frontend engineer', 'backend engineer', 'full stack engineer',
      'data scientist', 'product manager', 'devops engineer', 'mobile developer',
      'ios developer', 'android developer', 'machine learning engineer', 'data engineer'
    ];
    
    let jobTitle = 'Software Engineer'; // default
    let company = '';
    
    // Find job title
    for (const pattern of jobTitlePatterns) {
      if (lowerQuery.includes(pattern)) {
        jobTitle = pattern.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        break;
      }
    }
    
    // Find company name
    const companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Tesla', 'Uber', 'Airbnb', 'Spotify'];
    for (const comp of companies) {
      if (lowerQuery.includes(comp.toLowerCase())) {
        company = comp;
        break;
      }
    }
    
    return { company, jobTitle };
  };

  const saveRecentSearch = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentCompanySearches', JSON.stringify(updated));
  };

  const handleSelect = (suggestion: string) => {
    const { company, jobTitle } = parseJobQuery(suggestion);
    setQuery(suggestion);
    setIsOpen(false);
    saveRecentSearch(suggestion);
    onSelect(company, jobTitle, companyIntelligence);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const currentSuggestions = showTrending ? 
      [...(recentSearches.length > 0 ? recentSearches : []), ...POPULAR_COMPANIES.slice(0, 6)] : 
      suggestions;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, currentSuggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (currentSuggestions[selectedIndex]) {
          handleSelect(currentSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSizeIcon = (size: string) => {
    switch (size) {
      case 'startup': return '🚀';
      case 'small': return '🏢';
      case 'medium': return '🏛️';
      case 'large': return '🌐';
      default: return '🏢';
    }
  };

  const trendingSuggestions = showTrending ? 
    [...(recentSearches.length > 0 ? recentSearches : []), ...POPULAR_COMPANIES.slice(0, 6)] : 
    [];

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.length >= 2) {
              setIsOpen(true);
            } else {
              setShowTrending(true);
              setIsOpen(true);
            }
          }}
          onBlur={() => setTimeout(() => setIsOpen(false), 300)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setCompanyIntelligence(null);
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Enhanced Company Intelligence Preview */}
      {companyIntelligence && query.length >= 2 && (
        <Card className="mt-4 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl">
                  {getSizeIcon(companyIntelligence.company_data.size)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{companyIntelligence.company_data.name}</h3>
                  <p className="text-sm text-gray-600">{companyIntelligence.company_data.industry}</p>
                </div>
              </div>
              <Badge className={`${getDifficultyColor(companyIntelligence.company_data.difficulty)} border`}>
                {companyIntelligence.company_data.difficulty.toUpperCase()} INTERVIEW
              </Badge>
            </div>

            {/* Company Description */}
            <p className="text-sm text-gray-700 mb-4">{companyIntelligence.company_data.description}</p>

            {/* Company Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700 capitalize">{companyIntelligence.company_data.size}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">{companyIntelligence.company_data.locations[0]}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-purple-600" />
                <span className="text-gray-700 capitalize">{companyIntelligence.company_data.work_environment}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-gray-700">{companyIntelligence.interview_insights.average_rounds} rounds</span>
              </div>
            </div>

            {/* Recent News */}
            {companyIntelligence.company_data.recent_news.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Recent News:
                </h4>
                <div className="space-y-1">
                  {companyIntelligence.company_data.recent_news.slice(0, 2).map((news, index) => (
                    <div key={index} className="text-xs text-gray-600 bg-white/50 rounded px-2 py-1">
                      • {news}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Posts */}
            {companyIntelligence.company_data.recent_posts.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-1" />
                  Recent Updates:
                </h4>
                <div className="space-y-1">
                  {companyIntelligence.company_data.recent_posts.slice(0, 2).map((post, index) => (
                    <div key={index} className="text-xs text-gray-600 bg-white/50 rounded px-2 py-1">
                      <div className="font-medium">{post.title}</div>
                      <div className="text-gray-500">{post.summary}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack Preview */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Tech Stack:</p>
              <div className="flex flex-wrap gap-1">
                {companyIntelligence.company_data.tech_stack.slice(0, 6).map((tech: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-white border border-gray-300">
                    {tech}
                  </Badge>
                ))}
                {companyIntelligence.company_data.tech_stack.length > 6 && (
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                    +{companyIntelligence.company_data.tech_stack.length - 6} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Salary Range */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Salary Ranges</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-green-600 font-medium">Entry:</span>
                  <div className="text-green-700">{companyIntelligence.company_data.salary_ranges.entry}</div>
                </div>
                <div>
                  <span className="text-green-600 font-medium">Mid:</span>
                  <div className="text-green-700">{companyIntelligence.company_data.salary_ranges.mid}</div>
                </div>
                <div>
                  <span className="text-green-600 font-medium">Senior:</span>
                  <div className="text-green-700">{companyIntelligence.company_data.salary_ranges.senior}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading Intelligence */}
      {loadingIntelligence && query.length >= 2 && (
        <Card className="mt-4 border-2 border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-gray-600">Gathering company intelligence...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Suggestions Dropdown */}
      {isOpen && (
        <Card className="absolute z-50 w-full mt-2 border-2 border-gray-200 shadow-xl max-h-96 overflow-hidden">
          <CardContent className="p-0">
            {showTrending && trendingSuggestions.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {recentSearches.length > 0 ? 'Recent & Popular Searches' : 'Popular Searches'}
                  </span>
                </div>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {trendingSuggestions.map((suggestion, index) => {
                    const { company, jobTitle } = parseJobQuery(suggestion);
                    const isRecent = recentSearches.includes(suggestion);
                    
                    return (
                      <div
                        key={index}
                        onClick={() => handleSelect(suggestion)}
                        className={`px-4 py-3 cursor-pointer rounded-lg transition-all ${
                          index === selectedIndex ? 'bg-blue-50 border-2 border-blue-200' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              {isRecent && <span className="text-xs">🕐</span>}
                              <Star className="w-4 h-4 text-yellow-500" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{suggestion}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-2">
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {company}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-3 h-3" />
                                  {jobTitle}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {!showTrending && suggestions.length > 0 && (
              <div className="max-h-80 overflow-y-auto">
                {suggestions.map((suggestion, index) => {
                  const { company, jobTitle } = parseJobQuery(suggestion);

                  return (
                    <div
                      key={index}
                      onClick={() => handleSelect(suggestion)}
                      className={`px-4 py-4 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all ${
                        index === selectedIndex ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {company.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{suggestion}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {company}
                              </span>
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                {jobTitle}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Quick Actions */}
            <div className="p-3 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Use ↑↓ to navigate, Enter to select</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const randomSuggestion = POPULAR_COMPANIES[
                      Math.floor(Math.random() * POPULAR_COMPANIES.length)
                    ];
                    handleSelect(randomSuggestion);
                  }}
                  className="text-xs h-6 px-2"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Surprise me
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedCompanySearchWithIntelligence;