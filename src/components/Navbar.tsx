import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    setIsSearchOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 min-h-[56px]">
        {/* Logo */}
        <div className="flex items-center">
          <div className="text-base sm:text-lg font-bold text-sky-700 truncate">
            LegalAssist AU
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="
              text-slate-600 hover:text-sky-700 transition-colors
              px-3 py-2 rounded-lg hover:bg-slate-50
              min-h-[44px] flex items-center
              font-medium
            "
          >
            Home
          </a>
          <a
            href="#"
            className="
              text-slate-600 hover:text-sky-700 transition-colors
              px-3 py-2 rounded-lg hover:bg-slate-50
              min-h-[44px] flex items-center
              font-medium
            "
          >
            Documents
          </a>
          <a
            href="#"
            className="
              text-slate-600 hover:text-sky-700 transition-colors
              px-3 py-2 rounded-lg hover:bg-slate-50
              min-h-[44px] flex items-center
              font-medium
            "
          >
            Upload
          </a>
          <a
            href="#"
            className="
              text-slate-600 hover:text-sky-700 transition-colors
              px-3 py-2 rounded-lg hover:bg-slate-50
              min-h-[44px] flex items-center
              font-medium
            "
          >
            Support
          </a>
        </div>
      </div>
    </nav>
  );
}