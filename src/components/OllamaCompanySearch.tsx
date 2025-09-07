'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Search, Building2, CheckCircle, Sparkles } from 'lucide-react'

interface CompanySuggestion {
  name: string;
  industry?: string;
  techStack?: string[];
  matchScore?: number;
}

interface OllamaCompanySearchProps {
  onCompanySelect: (company: string) => void;
  initialValue?: string;
  placeholder?: string;
  className?: string;
}

const OllamaCompanySearch: React.FC<OllamaCompanySearchProps> = ({
  onCompanySelect,
  initialValue = '',
  placeholder = 'Search for a company (e.g., Google, Meta, Amazon)...',
  className = ''
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOllamaAvailable, setIsOllamaAvailable] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Popular companies for initial suggestions
  const popularCompanies = [
    'Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix',
    'Uber', 'Airbnb', 'Tesla', 'Spotify', 'LinkedIn', 'Twitter',
    'Salesforce', 'Adobe', 'Intel', 'NVIDIA', 'PayPal', 'Square'
  ];

  // Check Ollama service availability on mount
  useEffect(() => {
    checkOllamaHealth();
  }, []);

  const checkOllamaHealth = async () => {
    try {
      const response = await fetch('/api/ollama-health');
      const data = await response.json();
      setIsOllamaAvailable(data.status === 'healthy');
    } catch (error) {
      console.error('Failed to check Ollama health:', error);
      setIsOllamaAvailable(false);
    }
  };

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length > 0) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Try Ollama service first
      if (isOllamaAvailable) {
        const response = await fetch(`/api/ollama-generate-questions?company=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
          setLoading(false);
          return;
        }
      }

      // Fallback to local filtering of popular companies
      const filtered = popularCompanies.filter(company =>
        company.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSuggestions(filtered);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // Fallback to local filtering
      const filtered = popularCompanies.filter(company =>
        company.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onCompanySelect(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (query.trim()) {
          setShowSuggestions(false);
          onCompanySelect(query.trim());
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            autoComplete="off"
          />
          
          {/* Ollama Status Indicator */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
            )}
            {isOllamaAvailable && (
              <div className="flex items-center space-x-1 text-green-600">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-medium">AI</span>
              </div>
            )}
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`flex items-center px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors ${
                  index === selectedIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <Building2 className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-gray-900 font-medium">
                  {suggestion}
                </span>
                {isOllamaAvailable && (
                  <Sparkles className="w-3 h-3 text-blue-500 ml-auto" />
                )}
              </div>
            ))}
            
            {/* Enhanced by Ollama indicator */}
            {isOllamaAvailable && (
              <div className="border-t border-gray-100 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center text-xs text-gray-600">
                  <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                  <span>Enhanced by Ollama AI for company-specific questions</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-2 text-sm text-gray-500">
        {isOllamaAvailable ? (
          <div className="flex items-center">
            <Sparkles className="w-4 h-4 text-blue-500 mr-1" />
            <span>AI-powered suggestions will generate company-specific interview questions</span>
          </div>
        ) : (
          <span>Type a company name to see suggestions</span>
        )}
      </div>
    </div>
  );
};

export default OllamaCompanySearch;