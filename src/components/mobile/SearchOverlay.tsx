import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Clock, TrendingUp } from 'lucide-react';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const recentSearches = [
  'Contract law basics',
  'Property settlement',
  'Family court procedures',
];

const suggestedQueries = [
  'How to file a civil claim',
  'Understanding employment rights',
  'Divorce proceedings in Australia',
  'Tenant rights and responsibilities',
];

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log('[SearchOverlay] isOpen changed:', isOpen);
    console.log('[SearchOverlay] Window width:', window.innerWidth);

    if (isOpen) {
      // Prevent body scroll when overlay is open
      document.body.style.overflow = 'hidden';
      console.log('[SearchOverlay] Body scroll disabled');

      // Focus input when overlay opens
      setTimeout(() => {
        inputRef.current?.focus();
        console.log('[SearchOverlay] Input focused');
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
      console.log('[SearchOverlay] Body scroll enabled');
      // Clear search when closing
      setSearchQuery('');
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('[SearchOverlay] Searching for:', searchQuery);
      // Here you would implement actual search logic
      onClose();
    }
  };

  const handleSuggestionClick = (query: string) => {
    setSearchQuery(query);
    console.log('[SearchOverlay] Selected suggestion:', query);
    // Here you would implement actual search logic
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`
        md:hidden fixed inset-0 z-[60] bg-white
        transition-opacity duration-300
        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      {/* Search Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-200 bg-white">
        <button
          onClick={onClose}
          className="
            p-2 rounded-full hover:bg-slate-100 active:bg-slate-200
            transition-colors
            min-w-[44px] min-h-[44px]
            flex items-center justify-center
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          "
          aria-label="Close search"
        >
          <X className="w-6 h-6 text-slate-600" />
        </button>

        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents, cases, or topics..."
              className="
                w-full pl-12 pr-4 py-3 rounded-full
                bg-slate-100
                focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                text-base
                min-h-[44px]
                transition-colors
              "
            />
          </div>
        </form>
      </div>

      {/* Search Content */}
      <div className="overflow-y-auto h-[calc(100vh-80px)] p-4">
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Recent Searches
              </h3>
            </div>
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    text-left
                    hover:bg-slate-100 active:bg-slate-200
                    transition-colors
                    min-h-[44px]
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                  "
                >
                  <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-700">{search}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Queries */}
        {suggestedQueries.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Suggested Topics
              </h3>
            </div>
            <div className="space-y-2">
              {suggestedQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(query)}
                  className="
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    text-left
                    hover:bg-slate-100 active:bg-slate-200
                    transition-colors
                    min-h-[44px]
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                  "
                >
                  <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-700">{query}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}