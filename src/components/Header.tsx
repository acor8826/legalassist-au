import React from "react";
import { Search } from "lucide-react";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export default function Header({ searchQuery, onSearchChange, onSearchSubmit }: HeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b border-slate-200 flex-shrink-0">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="text-lg font-bold text-sky-700">LegalAssist AU</div>
        
        <form onSubmit={onSearchSubmit} className="relative w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </form>
      </div>
    </div>
  );
}