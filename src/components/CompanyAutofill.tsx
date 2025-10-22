'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, Briefcase, ArrowRight } from 'lucide-react';
import { searchCompanyAndRole, parseJobQuery } from '@/lib/companyIntelligence';
import { Badge } from './ui/badge';

interface CompanyAutofillProps {
  onSelect: (company: string, jobTitle: string, companyData?: any) => void;
  placeholder?: string;
  className?: string;
}

const CompanyAutofill = ({ onSelect, placeholder = "Search for company and role (e.g., Google Software Engineer)", className = "" }: CompanyAutofillProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [companyData, setCompanyData] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (query.length >= 2) {
      const { suggestions: newSuggestions, companyData: detectedCompany } = searchCompanyAndRole(query);
      setSuggestions(newSuggestions);
      setCompanyData(detectedCompany);
      setIsOpen(newSuggestions.length > 0);
      setSelectedIndex(0);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setCompanyData(null);
    }
  }, [query])

  const handleSelect = (suggestion: string) => {
    const { company, jobTitle } = parseJobQuery(suggestion);
    setQuery(suggestion);
    setIsOpen(false);
    onSelect(company, jobTitle, companyData);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break
      case 'Enter':
        e.preventDefault()
        if (suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
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

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setSuggestions.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      {/* Company Preview */}
      {companyData && query.length >= 2 && (
        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-800">{companyData.name}</span>
            <Badge variant="secondary" className="text-xs">
              {companyData.difficulty} difficulty
            </Badge>
          </div>
          <div className="text-xs text-blue-700">
            <div className="flex items-center gap-1 mb-1">
              <Briefcase className="w-3 h-3" />
              <span>{companyData.industry}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {companyData.techStack.slice(0, 4).map((tech: string, index: number) => (
                <span key={index} className="bg-blue-100 px-2 py-0.5 rounded text-xs">
                  {tech}
                </span>
              ))}
              {companyData.techStack.length > 4 && (
                <span className="text-blue-600">+{companyData.techStack.length - 4} more</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => {
            const { company, jobTitle } = parseJobQuery(suggestion);
            return (
              <div
                key={index}
                ref={(el) => { suggestionRefs.current[index] = el }}
                onClick={() => handleSelect(suggestion)}
                className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                  index === selectedIndex ? 'bg-blue-50 border-blue-200' : '';
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{suggestion}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {company || 'Company'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {jobTitle}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CompanyAutofill;