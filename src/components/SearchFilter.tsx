import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface FilterTag {
  key: string;
  value: string;
}

interface SearchFilterProps {
  onSearch: (query: string, filters: FilterTag[]) => void;
  placeholder?: string;
  initialFilters?: FilterTag[];
  initialQuery?: string;
}

export function SearchFilter({ 
  onSearch, 
  placeholder = "Search...", 
  initialFilters = [], 
  initialQuery = "" 
}: SearchFilterProps) {
  const [query, setQuery] = useState(initialQuery);
  const [filterInput, setFilterInput] = useState('');
  const [filters, setFilters] = useState<FilterTag[]>(initialFilters);
  const [showFilterHelp, setShowFilterHelp] = useState(false);

  const handleSearch = () => {
    onSearch(query.trim(), filters);
  };

  const handleAddFilter = (input: string) => {
    const match = input.match(/^([^:]+):(.+)$/);
    if (match) {
      const [, key, value] = match;
      const newFilter = { key: key.trim(), value: value.trim() };
      const newFilters = [...filters, newFilter];
      setFilters(newFilters);
      setFilterInput('');
      onSearch(query, newFilters);
    }
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    setFilters(newFilters);
    onSearch(query, newFilters);
  };

  const handleQueryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filterInput) {
      handleAddFilter(filterInput);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleQueryKeyDown}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            value={filterInput}
            onChange={(e) => setFilterInput(e.target.value)}
            onKeyDown={handleFilterKeyDown}
            placeholder="Add filter (key:value)"
            onFocus={() => setShowFilterHelp(true)}
            onBlur={() => setTimeout(() => setShowFilterHelp(false), 200)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {showFilterHelp && (
            <div className="absolute top-full mt-1 left-0 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10">
              <p className="text-sm text-gray-600">
                Add filters using the format <code className="bg-gray-100 px-1 rounded">key:value</code>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Example: <code className="bg-gray-100 px-1 rounded">status:completed</code>
              </p>
            </div>
          )}
        </div>
      </div>
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              <span className="font-medium">{filter.key}:</span>
              <span>{filter.value}</span>
              <button
                onClick={() => handleRemoveFilter(index)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}