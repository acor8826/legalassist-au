# Mobile Navigation - Code Examples

## Table of Contents
1. [Basic Usage](#basic-usage)
2. [Integration Example](#integration-example)
3. [Customization Examples](#customization-examples)
4. [State Management](#state-management)
5. [Navigation Handlers](#navigation-handlers)

---

## Basic Usage

### Import Mobile Components

```tsx
// Option 1: Import individually
import TopBar from './components/mobile/TopBar';
import BottomNavigation from './components/mobile/BottomNavigation';
import FloatingActionButton from './components/mobile/FloatingActionButton';
import SearchOverlay from './components/mobile/SearchOverlay';

// Option 2: Import from barrel file
import {
  TopBar,
  BottomNavigation,
  FloatingActionButton,
  SearchOverlay
} from './components/mobile';
```

### Use in Component

```tsx
function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <TopBar onSearchClick={() => setIsSearchOpen(true)} />

      <main className="pt-14 pb-14">
        {/* Your content */}
      </main>

      <BottomNavigation />
      <FloatingActionButton onClick={() => console.log('FAB clicked')} />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
```

---

## Integration Example

### Complete App.tsx Integration

```tsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  TopBar,
  BottomNavigation,
  FloatingActionButton,
  SearchOverlay
} from './components/mobile';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  // Mobile navigation state
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleFABClick = () => {
    setShowCreateModal(true);
    // Or trigger different actions based on current route
  };

  const handleCreateAction = () => {
    console.log('Creating new item...');
    setShowCreateModal(false);
  };

  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col">
        {/* Mobile Top Bar (< 768px) */}
        <TopBar onSearchClick={() => setIsSearchOverlayOpen(true)} />

        {/* Desktop Header (>= 768px) */}
        <div className="hidden md:block">
          <Header />
        </div>

        {/* Main Content - with padding for mobile bars */}
        <main className="flex-1 overflow-auto pt-14 md:pt-0 pb-14 md:pb-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>

        {/* Desktop Footer (>= 768px) */}
        <div className="hidden md:block">
          <Footer />
        </div>

        {/* Mobile Navigation Components (< 768px) */}
        <BottomNavigation />
        <FloatingActionButton
          onClick={handleFABClick}
          ariaLabel="Create new chat or document"
        />
        <SearchOverlay
          isOpen={isSearchOverlayOpen}
          onClose={() => setIsSearchOverlayOpen(false)}
        />

        {/* Create Modal (example) */}
        {showCreateModal && (
          <CreateModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateAction}
          />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
```

---

## Customization Examples

### 1. Custom TopBar with Additional Actions

```tsx
import React from 'react';
import { Search, User, Bell } from 'lucide-react';

interface CustomTopBarProps {
  onSearchClick: () => void;
  onNotificationsClick: () => void;
  notificationCount?: number;
}

export default function CustomTopBar({
  onSearchClick,
  onNotificationsClick,
  notificationCount = 0
}: CustomTopBarProps) {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between h-14 px-4">
        <button className="text-lg font-bold text-sky-700">
          LegalAssist AU
        </button>

        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            onClick={onSearchClick}
            className="p-2.5 rounded-full hover:bg-slate-100 min-w-[44px] min-h-[44px]"
          >
            <Search className="w-5 h-5 text-slate-600" />
          </button>

          {/* Notifications */}
          <button
            onClick={onNotificationsClick}
            className="relative p-2.5 rounded-full hover:bg-slate-100 min-w-[44px] min-h-[44px]"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <button className="w-9 h-9 rounded-full bg-sky-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}
```

### 2. Context-Aware FAB

```tsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, MessageSquare, FileText } from 'lucide-react';

export default function ContextAwareFAB() {
  const location = useLocation();

  const getFABConfig = () => {
    switch (location.pathname) {
      case '/chat':
        return {
          icon: MessageSquare,
          label: 'New Chat',
          action: () => console.log('Create new chat')
        };
      case '/documents':
        return {
          icon: FileText,
          label: 'New Document',
          action: () => console.log('Create new document')
        };
      default:
        return {
          icon: Plus,
          label: 'Create New',
          action: () => console.log('Create new item')
        };
    }
  };

  const { icon: Icon, label, action } = getFABConfig();

  return (
    <button
      onClick={action}
      className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-blue-600 rounded-full shadow-lg"
      aria-label={label}
    >
      <Icon className="w-6 h-6 text-white m-auto" />
    </button>
  );
}
```

### 3. Enhanced SearchOverlay with Real Search

```tsx
import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'case' | 'topic';
}

interface EnhancedSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => Promise<SearchResult[]>;
}

export default function EnhancedSearchOverlay({
  isOpen,
  onClose,
  onSearch
}: EnhancedSearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchDebounced = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await onSearch(query);
        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchDebounced, 300);
    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-[60] bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <button onClick={onClose} className="p-2 min-w-[44px] min-h-[44px]">
          <X className="w-6 h-6" />
        </button>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="flex-1 px-4 py-3 bg-slate-100 rounded-full"
          autoFocus
        />
      </div>

      {/* Results */}
      <div className="overflow-y-auto h-[calc(100vh-80px)] p-4">
        {isLoading && <div className="text-center py-8">Loading...</div>}

        {!isLoading && results.length === 0 && query.length >= 2 && (
          <div className="text-center py-8 text-slate-500">
            No results found
          </div>
        )}

        {!isLoading && results.map((result) => (
          <div
            key={result.id}
            className="p-4 mb-2 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <div className="font-medium">{result.title}</div>
            <div className="text-sm text-slate-600">{result.description}</div>
            <div className="text-xs text-slate-500 mt-1">{result.type}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4. Custom Bottom Navigation with Badges

```tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FolderOpen, MessageSquare, BarChart3, Settings } from 'lucide-react';

interface NavTabWithBadge {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

export default function BottomNavigationWithBadges() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs: NavTabWithBadge[] = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'documents', label: 'Documents', icon: FolderOpen, path: '/documents', badge: 3 },
    { id: 'chat', label: 'Chat', icon: MessageSquare, path: '/chat', badge: 5 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`relative flex flex-col items-center justify-center flex-1 min-h-[44px]
                ${active ? 'text-sky-600' : 'text-slate-600'}`}
            >
              <Icon className="w-6 h-6 mb-0.5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-xs font-medium">{tab.label}</span>

              {/* Badge */}
              {tab.badge && tab.badge > 0 && (
                <span className="absolute top-1 right-1/4 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
```

---

## State Management

### Using Context for Mobile Navigation State

```tsx
// MobileNavigationContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface MobileNavigationContextType {
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

const MobileNavigationContext = createContext<MobileNavigationContextType | undefined>(undefined);

export function MobileNavigationProvider({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <MobileNavigationContext.Provider
      value={{
        isSearchOpen,
        setIsSearchOpen,
        isCreateModalOpen,
        setIsCreateModalOpen,
      }}
    >
      {children}
    </MobileNavigationContext.Provider>
  );
}

export function useMobileNavigation() {
  const context = useContext(MobileNavigationContext);
  if (context === undefined) {
    throw new Error('useMobileNavigation must be used within MobileNavigationProvider');
  }
  return context;
}
```

**Usage:**

```tsx
// App.tsx
import { MobileNavigationProvider } from './contexts/MobileNavigationContext';

function App() {
  return (
    <MobileNavigationProvider>
      <AppContent />
    </MobileNavigationProvider>
  );
}

// Any component
import { useMobileNavigation } from './contexts/MobileNavigationContext';

function SomeComponent() {
  const { setIsSearchOpen } = useMobileNavigation();

  return (
    <button onClick={() => setIsSearchOpen(true)}>
      Open Search
    </button>
  );
}
```

---

## Navigation Handlers

### Protected Routes with Authentication

```tsx
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = checkAuth(); // Your auth logic

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Usage in App.tsx
<Route
  path="/documents"
  element={
    <ProtectedRoute>
      <DocumentsPage />
    </ProtectedRoute>
  }
/>
```

### Navigation with Analytics

```tsx
import { useNavigate } from 'react-router-dom';

function useNavigateWithAnalytics() {
  const navigate = useNavigate();

  return (path: string, analyticsEvent?: string) => {
    // Log analytics
    if (analyticsEvent) {
      console.log('Navigation event:', analyticsEvent, path);
      // Send to analytics service
      // analytics.track(analyticsEvent, { path });
    }

    // Trigger haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    // Navigate
    navigate(path);
  };
}

// Usage
function MyComponent() {
  const navigate = useNavigateWithAnalytics();

  return (
    <button onClick={() => navigate('/documents', 'documents_tab_clicked')}>
      Go to Documents
    </button>
  );
}
```

---

## Testing Examples

### Unit Test for BottomNavigation

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

describe('BottomNavigation', () => {
  it('renders all navigation tabs', () => {
    render(
      <BrowserRouter>
        <BottomNavigation />
      </BrowserRouter>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('highlights active tab', () => {
    render(
      <BrowserRouter initialEntries={['/documents']}>
        <BottomNavigation />
      </BrowserRouter>
    );

    const documentsTab = screen.getByLabelText('Documents');
    expect(documentsTab).toHaveClass('text-sky-600');
  });

  it('navigates on tab click', () => {
    const { container } = render(
      <BrowserRouter>
        <BottomNavigation />
      </BrowserRouter>
    );

    const chatTab = screen.getByLabelText('Chat');
    fireEvent.click(chatTab);

    expect(window.location.pathname).toBe('/chat');
  });
});
```

### Integration Test

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

describe('Mobile Navigation Integration', () => {
  it('shows mobile navigation on small screens', () => {
    // Mock window.innerWidth
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));

    render(<App />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByLabelText('Open search')).toBeInTheDocument();
  });

  it('opens search overlay when search button clicked', () => {
    render(<App />);

    const searchButton = screen.getByLabelText('Open search');
    fireEvent.click(searchButton);

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('closes search overlay when close button clicked', () => {
    render(<App />);

    // Open search
    fireEvent.click(screen.getByLabelText('Open search'));

    // Close search
    fireEvent.click(screen.getByLabelText('Close search'));

    expect(screen.queryByPlaceholderText(/search/i)).not.toBeInTheDocument();
  });
});
```

---

## Performance Optimization

### Lazy Loading Mobile Components

```tsx
import React, { lazy, Suspense } from 'react';

// Lazy load mobile components
const TopBar = lazy(() => import('./components/mobile/TopBar'));
const BottomNavigation = lazy(() => import('./components/mobile/BottomNavigation'));
const FloatingActionButton = lazy(() => import('./components/mobile/FloatingActionButton'));
const SearchOverlay = lazy(() => import('./components/mobile/SearchOverlay'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TopBar onSearchClick={() => {}} />
      <BottomNavigation />
      <FloatingActionButton onClick={() => {}} />
      <SearchOverlay isOpen={false} onClose={() => {}} />
    </Suspense>
  );
}
```

### Memoization

```tsx
import React, { memo } from 'react';

const TopBar = memo(({ onSearchClick }: TopBarProps) => {
  // Component code
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.onSearchClick === nextProps.onSearchClick;
});

export default TopBar;
```

---

## Common Patterns

### Mobile-First Hook

```tsx
import { useState, useEffect } from 'react';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}

// Usage
function MyComponent() {
  const isMobile = useIsMobile();

  return (
    <div>
      {isMobile ? <MobileNav /> : <DesktopNav />}
    </div>
  );
}
```

---

This completes the code examples documentation!