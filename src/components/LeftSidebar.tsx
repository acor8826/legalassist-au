import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { Home as HomeIcon, FileText, Upload as UploadIcon, HelpCircle, ChevronDown, ChevronRight, X } from "lucide-react";

interface LeftSidebarProps {
  expandedSections: Set<string>;
  onToggleSection: (section: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function LeftSidebar({ expandedSections, onToggleSection, isOpen, onClose }: LeftSidebarProps) {
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    console.log('[LeftSidebar] Component mounted');
    console.log('[LeftSidebar] Window width:', window.innerWidth);
    console.log('[LeftSidebar] isOpen:', isOpen);
    console.log('[LeftSidebar] Should show as drawer:', window.innerWidth < 768);
  }, []);

  // Log isOpen changes
  useEffect(() => {
    console.log('[LeftSidebar] isOpen changed:', isOpen);
  }, [isOpen]);

  // Swipe gesture handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      console.log('[LeftSidebar] Swipe left detected');
      if (window.innerWidth < 768) {
        console.log('[LeftSidebar] Closing sidebar');
        onClose();
      }
    },
    trackMouse: false,
    trackTouch: true,
  });

  // Handle escape key to close drawer on mobile
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && window.innerWidth < 768) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && window.innerWidth < 768 && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle click outside to close drawer on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        window.innerWidth < 768 &&
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const handleNavigate = (path: string) => {
    navigate(path);
    // Close drawer on mobile after navigation
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop overlay - Mobile only */}
      <div
        className={`
          fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        {...swipeHandlers}
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 md:w-64
          border-r border-slate-200 bg-white
          overflow-y-auto flex-shrink-0
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        role="navigation"
        aria-label="Main navigation"
        aria-hidden={!isOpen && window.innerWidth < 768}
      >
        {/* Mobile header with close button */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Menu</h2>
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="
              p-2 rounded-lg hover:bg-slate-100 transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              min-w-[44px] min-h-[44px] flex items-center justify-center
            "
            aria-label="Close navigation menu"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {/* Main Navigation Section */}
          <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
            <button
              onClick={() => onToggleSection("main")}
              className="
                w-full flex items-center justify-between p-3
                hover:bg-slate-50 active:bg-slate-100
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
                min-h-[44px]
              "
              aria-expanded={expandedSections.has("main")}
              aria-controls="main-navigation"
            >
              <span className="font-semibold text-slate-900 text-base">Navigation</span>
              {expandedSections.has("main") ? (
                <ChevronDown className="w-5 h-5 text-slate-600" aria-hidden="true" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-600" aria-hidden="true" />
              )}
            </button>

            {expandedSections.has("main") && (
              <div id="main-navigation" className="border-t border-slate-200 bg-slate-50">
                <button
                  onClick={() => handleNavigate("/")}
                  className="
                    w-full flex items-center gap-3 p-3
                    hover:bg-white active:bg-slate-100
                    transition-colors text-left border-b border-slate-100
                    focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
                    min-h-[44px]
                  "
                  aria-label="Go to home page"
                >
                  <HomeIcon className="w-5 h-5 text-slate-600 flex-shrink-0" aria-hidden="true" />
                  <span className="text-slate-700 text-base">Home</span>
                </button>
                <button
                  onClick={() => handleNavigate("/")}
                  className="
                    w-full flex items-center gap-3 p-3
                    hover:bg-white active:bg-slate-100
                    transition-colors text-left border-b border-slate-100
                    focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
                    min-h-[44px]
                  "
                  aria-label="Go to documents page"
                >
                  <FileText className="w-5 h-5 text-slate-600 flex-shrink-0" aria-hidden="true" />
                  <span className="text-slate-700 text-base">Documents</span>
                </button>
                <button
                  onClick={() => handleNavigate("/upload")}
                  className="
                    w-full flex items-center gap-3 p-3
                    hover:bg-white active:bg-slate-100
                    transition-colors text-left border-b border-slate-100
                    focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
                    min-h-[44px]
                  "
                  aria-label="Upload documents"
                >
                  <UploadIcon className="w-5 h-5 text-slate-600 flex-shrink-0" aria-hidden="true" />
                  <span className="text-slate-700 text-base">Upload</span>
                </button>
                <button
                  onClick={() => handleNavigate("/support")}
                  className="
                    w-full flex items-center gap-3 p-3
                    hover:bg-white active:bg-slate-100
                    transition-colors text-left
                    focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
                    min-h-[44px]
                  "
                  aria-label="Get support"
                >
                  <HelpCircle className="w-5 h-5 text-slate-600 flex-shrink-0" aria-hidden="true" />
                  <span className="text-slate-700 text-base">Support</span>
                </button>
              </div>
            )}
          </div>

          {/* Resources Section */}
          <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
            <button
              onClick={() => onToggleSection("resources")}
              className="
                w-full flex items-center justify-between p-3
                hover:bg-slate-50 active:bg-slate-100
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
                min-h-[44px]
              "
              aria-expanded={expandedSections.has("resources")}
              aria-controls="resources-navigation"
            >
              <span className="font-semibold text-slate-900 text-base">Resources</span>
              {expandedSections.has("resources") ? (
                <ChevronDown className="w-5 h-5 text-slate-600" aria-hidden="true" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-600" aria-hidden="true" />
              )}
            </button>

            {expandedSections.has("resources") && (
              <div id="resources-navigation" className="border-t border-slate-200 bg-slate-50">
                <a
                  href="#privacy"
                  className="
                    flex items-center gap-3 p-3
                    hover:bg-white active:bg-slate-100
                    transition-colors border-b border-slate-100
                    focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
                    min-h-[44px]
                  "
                  onClick={() => {
                    if (window.innerWidth < 768) onClose();
                  }}
                >
                  <span className="text-slate-700 text-base">Privacy Policy</span>
                </a>
                <a
                  href="#accessibility"
                  className="
                    flex items-center gap-3 p-3
                    hover:bg-white active:bg-slate-100
                    transition-colors border-b border-slate-100
                    focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
                    min-h-[44px]
                  "
                  onClick={() => {
                    if (window.innerWidth < 768) onClose();
                  }}
                >
                  <span className="text-slate-700 text-base">Accessibility</span>
                </a>
                <a
                  href="#legal-aid"
                  className="
                    flex items-center gap-3 p-3
                    hover:bg-white active:bg-slate-100
                    transition-colors
                    focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
                    min-h-[44px]
                  "
                  onClick={() => {
                    if (window.innerWidth < 768) onClose();
                  }}
                >
                  <span className="text-slate-700 text-base">Legal Aid Resources</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}