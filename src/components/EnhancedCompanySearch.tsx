'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, ArrowRight, Star, MapPin, Users, TrendingUp, Loader2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface EnhancedCompanySearchProps {
  onSelect: (company: string, jobTitle: string, companyData?: any) => void;
  placeholder?: string;
  className?: string;
}

interface CompanySuggestion {
  name: string;
  industry: string;
  description: string;
}

const POPULAR_COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Tesla', 'Uber', 
  'Airbnb', 'LinkedIn', 'Spotify', 'Dropbox', 'Slack', 'Adobe', 'Salesforce',
  'Twitter', 'PayPal', 'Oracle', 'IBM', 'Intel', 'NVIDIA', 'AMD', 'Qualcomm'
];

const EnhancedCompanySearch: React.FC<EnhancedCompanySearchProps> = ({ 
  onSelect, 
  placeholder = "Search for companies (e.g., Google, Microsoft, Amazon)", 
  className = "";
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showTrending, setShowTrending] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentCompanySearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches')
      }
    }
  }, [])

  useEffect(() => {
    if (query.length >= 2) {
      searchCompanies(query);
      setShowTrending(false);
    } else if (query.length === 0) {
      setSuggestions([]);
      setShowTrending(true);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setShowTrending(false);
    }
  }, [query])

  const searchCompanies = async (searchQuery: string) => {
    setLoading(true);
    try {
      // First, check if it matches popular companies for quick response
      const popularMatches = POPULAR_COMPANIES
        .filter(company => 
          company.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
        .map(company => ({
          name: company,
          industry: getCompanyIndustry(company),
          description: `Explore opportunities at ${company}`
        }))

      if (popularMatches.length > 0) {
        setSuggestions(popularMatches);
        setIsOpen(true);
        setSelectedIndex(0);
      }

      // Use Groq API for additional company suggestions
      const response = await fetch('/api/company-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      })

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.companies) {
          // Combine popular matches with AI-generated suggestions
          const aiSuggestions = data.companies.map((company: any) => ({
            name: company.name,
            industry: company.industry || 'Technology',
            description: company.description || `Leading company in ${company.industry || 'technology'}`
          }))
          
          // Remove duplicates and combine
          const combined = [...popularMatches]
          aiSuggestions.forEach((aiSugg: CompanySuggestion) => {
            if (!combined.some(existing => existing.name.toLowerCase() === aiSugg.name.toLowerCase())) {
              combined.push(aiSugg)
            }
          })
          
          setSuggestions(combined.slice(0, 8));
          setIsOpen(combined.length > 0);
          setSelectedIndex(0);
        }
      }
    } catch (error) {
      console.error('Error searching companies:', error)
      // Fallback to popular companies only
      const fallbackMatches = POPULAR_COMPANIES
        .filter(company => 
          company.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
        .map(company => ({
          name: company,
          industry: getCompanyIndustry(company),
          description: `Explore opportunities at ${company}`
        }))
      
      setSuggestions(fallbackMatches);
      setIsOpen(fallbackMatches.length > 0);
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
      'Tesla': 'Automotive',
      'Uber': 'Transportation',
      'Airbnb': 'Travel & Hospitality',
      'LinkedIn': 'Professional Network',
      'Spotify': 'Music Streaming',
      'Dropbox': 'Cloud Storage',
      'Slack': 'Communication',
      'Adobe': 'Creative Software',
      'Salesforce': 'CRM',
      'Twitter': 'Social Media',
      'PayPal': 'Fintech',
      'Oracle': 'Enterprise Software',
      'IBM': 'Technology Services',
      'Intel': 'Semiconductors',
      'NVIDIA': 'Graphics & AI',
      'AMD': 'Semiconductors',
      'Qualcomm': 'Mobile Technology'
    }
    return industryMap[company] || 'Technology';
  }

  const saveRecentSearch = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentCompanySearches', JSON.stringify(updated))
  }

  const handleSelect = (companyName: string) => {
    setQuery(companyName);
    setIsOpen(false);
    saveRecentSearch(companyName);
    
    // Since we're only suggesting companies now, we don't parse job title
    onSelect(companyName, '', null);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    const currentSuggestions = showTrending ? 
      [...recentSearches, ...POPULAR_COMPANIES.slice(0, 6)] : 
      suggestions

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, currentSuggestions.length - 1));
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break
      case 'Enter':
        e.preventDefault()
        if (showTrending) {
          const selected = currentSuggestions[selectedIndex]
          if (selected) {
            handleSelect(typeof selected === 'string' ? selected : selected.name);
          }
        } else {
          const selected = suggestions[selectedIndex]
          if (selected) {
            handleSelect(selected.name);
          }
        }
        break
      case 'Escape':
        setIsOpen(false);
        break
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

  const trendingSuggestions = showTrending ? 
    [...recentSearches, ...POPULAR_COMPANIES.slice(0, 8)] : 
    []

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        {loading && (
          <Loader2 className="absolute right-12 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4 animate-spin" />
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
          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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

      {/* Enhanced Suggestions Dropdown */}
      {isOpen && (
        <Card className="absolute z-50 w-full mt-2 border-2 border-gray-200 shadow-xl max-h-96 overflow-hidden">
          <CardContent className="p-0">
            {showTrending && trendingSuggestions.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {recentSearches.length > 0 ? 'Recent & Popular Companies' : 'Popular Companies'}
                  </span>
                </div>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {trendingSuggestions.map((company, index) => {
                    const companyName = typeof company === 'string' ? company : company;
                    const isRecent = recentSearches.includes(companyName);
                    
                    return (
                      <div
                        key={index}
                        ref={(el) => { suggestionRefs.current[index] = el }}
                        onClick={() => handleSelect(companyName)}
                        className={`px-4 py-3 cursor-pointer rounded-lg transition-all ${
                          index === selectedIndex ? 'bg-blue-50 border-2 border-blue-200' : 'hover:bg-gray-50';
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              {isRecent && <span className="text-xs">🕐</span>}
                              <Star className="w-4 h-4 text-yellow-500" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{companyName}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-2">
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {getCompanyIndustry(companyName)}
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
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    ref={(el) => { suggestionRefs.current[index] = el }}
                    onClick={() => handleSelect(suggestion.name)}
                    className={`px-4 py-4 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all ${
                      index === selectedIndex ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50';
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {suggestion.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{suggestion.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {suggestion.industry}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">{suggestion.description}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!showTrending && suggestions.length === 0 && !loading && query.length >= 2 && (
              <div className="p-8 text-center">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No companies found for "{query}"</p>
                <p className="text-sm text-gray-500">Try a different search term or select from popular companies</p>
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
                    const randomCompany = POPULAR_COMPANIES[
                      Math.floor(Math.random() * POPULAR_COMPANIES.length)
                    ]
                    handleSelect(randomCompany);
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

export default EnhancedCompanySearch;