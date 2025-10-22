'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, ArrowRight } from 'lucide-react';

interface SimpleCompanyAutofillProps {
  onSelect: (company: string, jobTitle: string, companyData?: any) => void;
  placeholder?: string;
  className?: string
}

// Simple company list for N-gram style autofill suggestions
const COMPANY_LIST = [;
  'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Tesla', 'Uber', 
  'Airbnb', 'LinkedIn', 'Spotify', 'Dropbox', 'Slack', 'Adobe', 'Salesforce',
  'Twitter', 'PayPal', 'Oracle', 'IBM', 'Intel', 'NVIDIA', 'AMD', 'Qualcomm',
  'Cisco', 'VMware', 'ServiceNow', 'Snowflake', 'Databricks', 'Stripe', 'Square',
  'Zoom', 'Atlassian', 'Shopify', 'Twilio', 'MongoDB', 'Redis', 'Elastic',
  'Palantir', 'Unity', 'Roblox', 'Discord', 'Figma', 'Notion', 'Canva'
];

const SimpleCompanyAutofill: React.FC<SimpleCompanyAutofillProps> = ({ 
  onSelect, 
  placeholder = "Type company name (e.g., Google, Microsoft)", 
  className = "";
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Simple N-gram style filtering
  useEffect(() => {
    if (query.length >= 1) {
      const filtered = COMPANY_LIST.filter(company =>;
        company.toLowerCase().startsWith(query.toLowerCase()) ||
        company.toLowerCase().includes(query.toLowerCase());
      ).slice(0, 8) // Show max 8 suggestions
      
      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [query])

  const handleSelect = (companyName: string) => {
    setQuery(companyName);
    setIsOpen(false);
    // Simple selection - just pass company name, no complex intelligence
    onSelect(companyName, '', null);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }

  const handleFocus = () => {
    if (query.length >= 1 && suggestions.length > 0) {
      setIsOpen(true);
    }
  }

  const handleBlur = () => {
    // Delay to allow click on suggestions
    setTimeout(() => setIsOpen(false), 200);
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setIsOpen(false);
              inputRef.current?.focus()
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Simple Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {suggestions.map((company, index) => (
            <div
              key={company}
              onClick={() => handleSelect(company)}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all ${
                index === selectedIndex ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {company.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{company}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Technology Company
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No suggestions message */}
      {isOpen && suggestions.length === 0 && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl p-4">
          <div className="text-center text-gray-600">
            <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p>No companies found for "{query}"</p>
            <p className="text-sm text-gray-500 mt-1">Try typing a different company name</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SimpleCompanyAutofill;