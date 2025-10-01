import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FolderOpen, MessageSquare, BarChart3, Settings } from 'lucide-react';

interface NavTab {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

const tabs: NavTab[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    path: '/',
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FolderOpen,
    path: '/documents',
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: MessageSquare,
    path: '/chat',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/analytics',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
  },
];

interface BottomNavigationProps {
  onToggleSidebar?: () => void;
  onToggleRightSidebar?: () => void;
}

export default function BottomNavigation({ onToggleSidebar, onToggleRightSidebar }: BottomNavigationProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('[BottomNavigation] Component mounted');
    console.log('[BottomNavigation] Window width:', window.innerWidth);
    console.log('[BottomNavigation] Should be visible:', window.innerWidth < 768);
  }, []);

  useEffect(() => {
    console.log('[BottomNavigation] Location changed:', location.pathname);
  }, [location.pathname]);

  const handleTabClick = (path: string, tabLabel: string) => {
    console.log(`[BottomNavigation] Tab clicked: ${tabLabel} (${path})`);

    // Trigger haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    navigate(path);
  };

  const isActive = (path: string) => {
    let active = false;
    if (path === '/') {
      active = location.pathname === '/' || location.pathname === '/homepage';
    } else {
      active = location.pathname.startsWith(path);
    }
    console.log(`[BottomNavigation] isActive(${path}): ${active} (current: ${location.pathname})`);
    return active;
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.path, tab.label)}
              className={`
                flex flex-col items-center justify-center
                min-w-[64px] min-h-[44px]
                flex-1
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
                ${active ? 'text-sky-600' : 'text-slate-600'}
              `}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className={`
                  w-6 h-6 mb-0.5
                  transition-all duration-200
                  ${active ? 'scale-110' : 'scale-100'}
                `}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={`
                  text-xs font-medium
                  ${active ? 'text-sky-600' : 'text-slate-600'}
                `}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}