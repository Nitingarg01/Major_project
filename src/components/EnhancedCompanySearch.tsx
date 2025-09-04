'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Search, Building2, Briefcase, ArrowRight, Star, MapPin, Users, DollarSign, Zap, TrendingUp } from 'lucide-react'
import { searchCompanyAndRole, parseJobQuery, getCompanyByName, ENHANCED_COMPANIES, POPULAR_SEARCH_SUGGESTIONS } from '@/lib/enhancedCompanyDatabase'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'

interface EnhancedCompanySearchProps {
  onSelect: (company: string, jobTitle: string, companyData?: any) => void;
  placeholder?: string;
  className?: string;
}

const EnhancedCompanySearch: React.FC<EnhancedCompanySearchProps> = ({ 
  onSelect, 
  placeholder = "Search for company and role (e.g., Google Software Engineer)", 
  className = "" 
}) => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [companyData, setCompanyData] = useState<any>(null)
  const [showTrending, setShowTrending] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([])

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentInterviewSearches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse recent searches')
      }
    }
  }, [])

  useEffect(() => {
    if (query.length >= 2) {
      const { suggestions: newSuggestions, companyData: detectedCompany } = searchCompanyAndRole(query)
      setSuggestions(newSuggestions)
      setCompanyData(detectedCompany)
      setIsOpen(newSuggestions.length > 0)
      setSelectedIndex(0)
      setShowTrending(false)
    } else if (query.length === 0) {
      setSuggestions([])
      setCompanyData(null)
      setShowTrending(true)
      setIsOpen(true)
    } else {
      setSuggestions([])
      setIsOpen(false)
      setCompanyData(null)
      setShowTrending(false)
    }
  }, [query])

  const saveRecentSearch = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentInterviewSearches', JSON.stringify(updated))
  }

  const handleSelect = (suggestion: string) => {
    const { company, jobTitle } = parseJobQuery(suggestion)
    setQuery(suggestion)
    setIsOpen(false)
    saveRecentSearch(suggestion)
    
    const detectedCompanyData = getCompanyByName(company)
    onSelect(company, jobTitle, detectedCompanyData)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    const currentSuggestions = showTrending ? 
      [...(recentSearches.length > 0 ? recentSearches : []), ...POPULAR_SEARCH_SUGGESTIONS.slice(0, 6)] : 
      suggestions

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, currentSuggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (currentSuggestions[selectedIndex]) {
          handleSelect(currentSuggestions[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'hard': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getSizeIcon = (size: string) => {
    switch (size) {
      case 'startup': return '🚀'
      case 'medium': return '🏢'
      case 'large': return '🏛️'
      case 'enterprise': return '🌐'
      default: return '🏢'
    }
  }

  const getWorkEnvironmentIcon = (env: string) => {
    switch (env) {
      case 'remote': return '🏡'
      case 'hybrid': return '🔄'
      case 'office': return '🏢'
      case 'flexible': return '⚡'
      default: return '🏢'
    }
  }

  const trendingSuggestions = showTrending ? 
    [...(recentSearches.length > 0 ? recentSearches : []), ...POPULAR_SEARCH_SUGGESTIONS.slice(0, 6)] : 
    []

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
              setIsOpen(true)
            } else {
              setShowTrending(true)
              setIsOpen(true)
            }
          }}
          onBlur={() => setTimeout(() => setIsOpen(false), 300)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setCompanyData(null)
              inputRef.current?.focus()
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Enhanced Company Preview */}
      {companyData && query.length >= 2 && (
        <Card className="mt-4 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl">
                  {getSizeIcon(companyData.size)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{companyData.name}</h3>
                  <p className="text-sm text-gray-600">{companyData.industry}</p>
                </div>
              </div>
              <Badge className={`${getDifficultyColor(companyData.difficulty)} border`}>
                {companyData.difficulty.toUpperCase()}
              </Badge>
            </div>

            {/* Company Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">{companyData.size}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">{companyData.locations[0]}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">{getWorkEnvironmentIcon(companyData.workEnvironment)}</span>
                <span className="text-gray-700 capitalize">{companyData.workEnvironment}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-gray-700">{companyData.averageRounds} rounds</span>
              </div>
            </div>

            {/* Tech Stack Preview */}
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Tech Stack:</p>
              <div className="flex flex-wrap gap-1">
                {companyData.techStack.slice(0, 6).map((tech: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-white border border-gray-300">
                    {tech}
                  </Badge>
                ))}
                {companyData.techStack.length > 6 && (
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                    +{companyData.techStack.length - 6} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Salary Range */}
            {companyData.salaryRange && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Salary Ranges</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-green-600 font-medium">Junior:</span>
                    <div className="text-green-700">{companyData.salaryRange.junior}</div>
                  </div>
                  <div>
                    <span className="text-green-600 font-medium">Mid:</span>
                    <div className="text-green-700">{companyData.salaryRange.mid}</div>
                  </div>
                  <div>
                    <span className="text-green-600 font-medium">Senior:</span>
                    <div className="text-green-700">{companyData.salaryRange.senior}</div>
                  </div>
                </div>
              </div>
            )}
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
                    {recentSearches.length > 0 ? 'Recent & Trending Searches' : 'Trending Searches'}
                  </span>
                </div>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {trendingSuggestions.map((suggestion, index) => {
                    const { company, jobTitle } = parseJobQuery(suggestion)
                    const isRecent = recentSearches.includes(suggestion)
                    
                    return (
                      <div
                        key={index}
                        ref={el => suggestionRefs.current[index] = el}
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
                  const { company, jobTitle } = parseJobQuery(suggestion)
                  const companyInfo = getCompanyByName(company)

                  return (
                    <div
                      key={index}
                      ref={el => suggestionRefs.current[index] = el}
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
                              {companyInfo && (
                                <Badge className={`${getDifficultyColor(companyInfo.difficulty)} text-xs`}>
                                  {companyInfo.difficulty}
                                </Badge>
                              )}
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
                    const randomSuggestion = POPULAR_SEARCH_SUGGESTIONS[
                      Math.floor(Math.random() * POPULAR_SEARCH_SUGGESTIONS.length)
                    ]
                    handleSelect(randomSuggestion)
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
  )
}

export default EnhancedCompanySearch