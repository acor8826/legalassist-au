import React, { useEffect, useRef, useState } from "react";
import { Plus, X, ChevronDown, ChevronRight } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import DocumentCard from "./DocumentCard";

interface RightSidebarProps {
  folderId: string | null;
  onCreateFolder: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function RightSidebar({ folderId, onCreateFolder, isOpen, onClose }: RightSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);

  useEffect(() => {
    console.log('[RightSidebar] Component mounted');
    console.log('[RightSidebar] Window width:', window.innerWidth);
    console.log('[RightSidebar] isOpen:', isOpen);
  }, []);

  useEffect(() => {
    console.log('[RightSidebar] isOpen changed:', isOpen);
  }, [isOpen]);

  // Swipe gesture handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      if (window.innerWidth < 768) {
        onClose();
      }
    },
    trackMouse: false,
    trackTouch: true,
  });

  // Handle escape key to close on mobile
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

  // Handle click outside to close on mobile
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
          fixed md:static inset-y-0 right-0 z-50
          w-80 md:w-80 xl:w-96
          border-l border-slate-200 bg-white
          overflow-y-auto flex-shrink-0
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
        `}
        role="complementary"
        aria-label="Case files sidebar"
        aria-hidden={!isOpen && window.innerWidth < 768}
      >
        {/* Mobile header with close button */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-900">My Cases</h2>
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="
              p-2 rounded-lg hover:bg-slate-100 transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              min-w-[44px] min-h-[44px] flex items-center justify-center
            "
            aria-label="Close cases sidebar"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Desktop header */}
        <div className="hidden md:block p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">My Cases</h2>
            <button
              onClick={onCreateFolder}
              className="
                p-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white
                transition-colors
                min-w-[44px] min-h-[44px] flex items-center justify-center
              "
              title="Create New Case File"
              aria-label="Create new case file"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile accordion pattern */}
        <div className="md:hidden">
          <div className="border-b border-slate-200">
            <button
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              className="
                w-full flex items-center justify-between p-4
                hover:bg-slate-50 active:bg-slate-100
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
                min-h-[44px]
              "
              aria-expanded={isAccordionOpen}
              aria-controls="cases-content"
            >
              <span className="font-medium text-slate-900">Case Files</span>
              {isAccordionOpen ? (
                <ChevronDown className="w-5 h-5 text-slate-600" aria-hidden="true" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-600" aria-hidden="true" />
              )}
            </button>

            {isAccordionOpen && (
              <div id="cases-content" className="p-4 bg-slate-50">
                <button
                  onClick={() => {
                    onCreateFolder();
                    onClose();
                  }}
                  className="
                    w-full flex items-center justify-center gap-2
                    p-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white
                    font-medium transition-colors shadow-sm
                    min-h-[44px]
                  "
                  aria-label="Create new case file"
                >
                  <Plus className="w-5 h-5" />
                  <span>New Case File</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content - visible on accordion open (mobile) or always (desktop) */}
        <div
          className={`
            p-4
            ${window.innerWidth < 768 && !isAccordionOpen ? 'hidden md:block' : ''}
          `}
        >
          <DocumentCard folderId={folderId} />
        </div>
      </aside>
    </>
  );
}