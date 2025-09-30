import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';

interface TopBarProps {
  onSearchClick: () => void;
}

export default function TopBar({ onSearchClick }: TopBarProps) {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo - Acts as home button */}
        <button
          onClick={handleLogoClick}
          className="
            text-lg font-bold text-sky-700
            min-h-[44px] min-w-[44px]
            flex items-center
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg
            -ml-2 px-2
          "
          aria-label="Go to home"
        >
          LegalAssist AU
        </button>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Search button */}
          <button
            onClick={onSearchClick}
            className="
              p-2.5 rounded-full hover:bg-slate-100 active:bg-slate-200
              transition-colors
              min-w-[44px] min-h-[44px]
              flex items-center justify-center
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            "
            aria-label="Open search"
          >
            <Search className="w-5 h-5 text-slate-600" />
          </button>

          {/* User profile avatar */}
          <button
            className="
              w-9 h-9 rounded-full bg-sky-600 hover:bg-sky-700 active:bg-sky-800
              transition-colors
              flex items-center justify-center
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              min-w-[44px] min-h-[44px]
            "
            aria-label="User profile"
          >
            <User className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}