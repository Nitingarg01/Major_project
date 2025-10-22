'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, ArrowRight, Star, MapPin, Users, TrendingUp, Loader2, Zap, Award, Target, Brain } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface EnhancedCompanySearchProps {
  onSelect: (company: string, jobTitle: string, companyData?: any) => void,
  placeholder?: string,
  className?: string
}

interface CompanySuggestion {
  name: string,
  industry: string,
  description: string,
  relevanceScore: number,
  metadata: {
    hasSpecificQuestions: boolean,
    difficultyLevel: string,
    popularRoles: string[],
    techStack: string[];
  };
}

const POPULAR_COMPANIES = [;
  { name: 'Google', trend: 'hot', difficulty: 'High' },
  { name: 'Microsoft', trend: 'stable', difficulty: 'Medium' },
  { name: 'Amazon', trend: 'hot', difficulty: 'High' },
  { name: 'Apple', trend: 'stable', difficulty: 'High' },
  { name: 'Meta', trend: 'hot', difficulty: 'High' },
  { name: 'Netflix', trend: 'stable', difficulty: 'High' },
  { name: 'Tesla', trend: 'hot', difficulty: 'High' },
  { name: 'OpenAI', trend: 'trending', difficulty: 'High' }
];

const EnhancedCompanySearchWithIntelligence: React.FC<EnhancedCompanySearchProps> = ({ 
  onSelect, 
  placeholder = "Search companies with AI-powered intelligence (e.g., Google, OpenAI)", 
  className = "";
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showTrending, setShowTrending] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [companyIntelligence, setCompanyIntelligence] = useState<any>(null);
  
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
  }, [])

  useEffect(() => {
    if (query.length >= 2) {
      searchCompaniesWithIntelligence(query);
      setShowTrending(false);
    } else if (query.length === 0) {
      setSuggestions([]);
      setShowTrending(true);
      setIsOpen(true);
      setCompanyIntelligence(null);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setShowTrending(false);
      setCompanyIntelligence(null);
    }
  }, [query])

  const searchCompaniesWithIntelligence = async (searchQuery: string) => {
    setLoading(true);
    try {
      console.log('🔍 Searching with enhanced AI intelligence...');
      
      // Use the new company intelligence API
      const response = await fetch('/api/company-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: searchQuery,
          limit: 8
        }),
      })

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Enhanced intelligence data received:', data);
        
        if (data.success && data.companies) {
          setSuggestions(data.companies);
          setCompanyIntelligence(data.serviceInfo);
          setIsOpen(data.companies.length > 0);
          setSelectedIndex(0);
        }
      } else {
        // Fallback to basic search
        console.warn('⚠️ Intelligence API failed, using fallback');
        const fallbackSuggestions = POPULAR_COMPANIES;
          .filter(company => 
            company.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 6)
          .map(company => ({
            name: company.name,
            industry: getCompanyIndustry(company.name),
            description: `Leading company in ${getCompanyIndustry(company.name).toLowerCase()}`,
            relevanceScore: 70,
            metadata: {
              hasSpecificQuestions: true,
              difficultyLevel: company.difficulty,
              popularRoles: ['Software Engineer', 'Product Manager'],
              techStack: ['React', 'Python', 'AWS']
            }
          }))
        
        setSuggestions(fallbackSuggestions);
        setIsOpen(fallbackSuggestions.length > 0);
      }
    } catch (error) {
      console.error('❌ Error in enhanced company search:', error);
      // Fallback to popular companies
      const fallbackSuggestions = POPULAR_COMPANIES;
        .filter(company => 
          company.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
        .map(company => ({
          name: company.name,
          industry: getCompanyIndustry(company.name),
          description: `Leading company in ${getCompanyIndustry(company.name).toLowerCase()}`,
          relevanceScore: 70,
          metadata: {
            hasSpecificQuestions: false,
            difficultyLevel: company.difficulty,
            popularRoles: ['Software Engineer', 'Product Manager'],
            techStack: ['JavaScript', 'Python']
          }
        }))
      
      setSuggestions(fallbackSuggestions);
      setIsOpen(fallbackSuggestions.length > 0);
    } finally {
      setLoading(false);
    }
  }

  const getCompanyIndustry = (company: string): string => {
    const industryMap: { [key: string]: string } = {
      'Google': 'Technology',
      'Microsoft': 'Technology',
      'Amazon': 'E-commerce & Cloud',
      'Apple': 'Consumer Electronics',
      'Meta': 'Social Media',
      'Netflix': 'Entertainment',
      'Tesla': 'Automotive & Energy',
      'OpenAI': 'AI & Machine Learning',
      'Anthropic': 'AI & Machine Learning'
    }
    return industryMap[company] || 'Technology';
  }

  const saveRecentSearch = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentCompanySearches', JSON.stringify(updated));
  }

  const handleSelect = (companyName: string, companyData?: CompanySuggestion) => {
    setQuery(companyName);
    setIsOpen(false);
    saveRecentSearch(companyName);
    
    // Pass enhanced company data to parent component
    onSelect(companyName, '', companyData);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    const currentSuggestions = showTrending ?;
      [...recentSearches.slice(0, 3), ...POPULAR_COMPANIES.slice(0, 5).map(c => c.name)] : 
      suggestions

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
        if (showTrending) {
          const selected = currentSuggestions[selectedIndex];
          if (selected) {
            handleSelect(typeof selected === 'string' ? selected : (selected as any).name || String(selected))
          }
        } else {
          const selected = suggestions[selectedIndex];
          if (selected) {
            handleSelect(selected.name, selected);
          }
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  }

  useEffect(() => {
    if (suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      })
    }
  }, [selectedIndex])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'trending': return <TrendingUp className="w-3 h-3 text-purple-500" />
      case 'hot': return <Zap className="w-3 h-3 text-red-500" />
      case 'stable': return <Star className="w-3 h-3 text-blue-500" />
      default: return <Building2 className="w-3 h-3 text-gray-500" />;
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        {loading && (
          <Loader2 className="absolute right-12 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4 animate-spin" />
        )}
        {companyIntelligence?.enhancedIntelligence && (
          <Brain className="absolute right-12 top-1/2 transform -translate-y-1/2 text-purple-500 w-4 h-4" />
        )}
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
          className="w-full pl-12 pr-16 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus()
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Intelligence Status */}
      {companyIntelligence && query.length >= 2 && (
        <div className="mt-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <span className="text-purple-700 font-medium">Enhanced AI Intelligence Active</span>
            <Badge variant="secondary" className="text-xs bg-purple-100">
              {companyIntelligence.primary} powered
            </Badge>
          </div>
        </div>
      )}

      {/* Enhanced Suggestions Dropdown */}
      {isOpen && (
        <Card className="absolute z-50 w-full mt-2 border-2 border-gray-200 shadow-xl max-h-96 overflow-hidden">
          <CardContent className="p-0">
            {showTrending && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {recentSearches.length > 0 ? 'Recent & Trending Companies' : 'Trending Companies'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_COMPANIES.slice(0, 8).map((company, index) => (
                    <div
                      key={index}
                      ref={(el) => { suggestionRefs.current[index] = el }}
                      onClick={() => handleSelect(company.name)}
                      className={`px-3 py-2 cursor-pointer rounded-lg transition-all border ${
                        index === selectedIndex ? 'bg-purple-50 border-purple-200' : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTrendIcon(company.trend)}
                          <span className="text-sm font-medium text-gray-900">{company.name}</span>
                        </div>
                        <Badge className={`text-xs ${getDifficultyColor(company.difficulty)}`}>
                          {company.difficulty}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!showTrending && suggestions.length > 0 && (
              <div className="max-h-80 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    ref={(el) => { suggestionRefs.current[index] = el }}
                    onClick={() => handleSelect(suggestion.name, suggestion)}
                    className={`px-4 py-4 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all ${
                      index === selectedIndex ? 'bg-purple-50 border-l-4 border-l-purple-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {suggestion.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{suggestion.name}</h4>
                            {suggestion.metadata.hasSpecificQuestions && (
                              <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                                <Zap className="w-3 h-3 mr-1" />
                                AI Enhanced
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-3 mb-2">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {suggestion.industry}
                            </span>
                            <Badge className={`text-xs ${getDifficultyColor(suggestion.metadata.difficultyLevel)}`}>
                              {suggestion.metadata.difficultyLevel} Level
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600 mb-2">{suggestion.description}</div>
                          
                          {/* Tech Stack Preview */}
                          <div className="flex flex-wrap gap-1 mb-1">
                            {suggestion.metadata.techStack.slice(0, 4).map((tech, techIndex) => (
                              <span key={techIndex} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                {tech}
                              </span>
                            ))}
                            {suggestion.metadata.techStack.length > 4 && (
                              <span className="text-blue-600 text-xs">+{suggestion.metadata.techStack.length - 4}</span>
                            )}
                          </div>
                          
                          {/* Popular Roles */}
                          <div className="text-xs text-gray-500">
                            Popular: {suggestion.metadata.popularRoles.slice(0, 2).join(', ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <div className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-gray-500">{suggestion.relevanceScore}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!showTrending && suggestions.length === 0 && !loading && query.length >= 2 && (
              <div className="p-8 text-center">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No companies found for "{query}"</p>
                <p className="text-sm text-gray-500">Try a different search term or browse trending companies</p>
              </div>
            )}

            {/* Enhanced Features Footer */}
            <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Brain className="w-3 h-3 text-purple-500" />
                    AI-Powered Intelligence
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-blue-500" />
                    Company-Specific Questions
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const randomCompany = POPULAR_COMPANIES[;
                      Math.floor(Math.random() * POPULAR_COMPANIES.length);
                    ]
                    handleSelect(randomCompany.name);
                  }}
                  className="text-xs h-6 px-2"
                >
                  <Star className="w-3 h-3 mr-1" />
                  Random
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default EnhancedCompanySearchWithIntelligence;