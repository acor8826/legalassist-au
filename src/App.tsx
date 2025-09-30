import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Menu, PanelRightOpen } from "lucide-react";
import Header from "./components/Header";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import Footer from "./components/Footer";
import CreateFolderModal from "./components/CreateFolderModal";
import AIChat from "./components/AIChat";
import Homepage from "./pages/Homepage";
import TopBar from "./components/mobile/TopBar";
import BottomNavigation from "./components/mobile/BottomNavigation";
import FloatingActionButton from "./components/mobile/FloatingActionButton";
import SearchOverlay from "./components/mobile/SearchOverlay";

function AppContent() {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNavSections, setExpandedNavSections] = useState<Set<string>>(new Set(['main']));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const folderId = location.pathname.startsWith('/folder/')
    ? location.pathname.split('/folder/')[1]
    : null;

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    try {
      console.log('Creating folder:', folderName);
      setFolderName('');
      setShowModal(false);
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const toggleNavSection = (section: string) => {
    setExpandedNavSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const toggleRightSidebar = () => {
    setIsRightSidebarOpen(prev => !prev);
  };

  const closeRightSidebar = () => {
    setIsRightSidebarOpen(false);
  };

  const handleFABClick = () => {
    setShowCreateModal(true);
  };

  const handleCreateAction = () => {
    console.log('Creating new item...');
    setShowCreateModal(false);
  };

  return (
    <Routes>
      {/* Homepage route - standalone without layout */}
      <Route path="/homepage" element={<Homepage />} />

      {/* Main app routes with layout */}
      <Route path="/*" element={
        <div className="h-screen flex flex-col bg-slate-50 text-slate-800">
          {/* Mobile Top Bar */}
          <TopBar onSearchClick={() => setIsSearchOverlayOpen(true)} />

          {/* Desktop Header - Hidden on mobile */}
          <div className="hidden md:block">
            <Header
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearch}
            />
          </div>

          <main className="flex flex-1 overflow-hidden min-h-0 relative mt-0 md:mt-0 pt-14 md:pt-0 pb-14 md:pb-0">
            {/* Desktop sidebars - Always visible on desktop */}
            <div className="hidden md:block">
              <LeftSidebar
                expandedSections={expandedNavSections}
                onToggleSection={toggleNavSection}
                isOpen={true}
                onClose={() => {}}
              />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
              <AIChat />
            </div>

            <div className="hidden md:block">
              <RightSidebar
                folderId={folderId}
                onCreateFolder={() => setShowModal(true)}
                isOpen={true}
                onClose={() => {}}
              />
            </div>
          </main>

          {/* Desktop Footer - Hidden on mobile */}
          <div className="hidden md:block">
            <Footer />
          </div>

          {/* Mobile Navigation Components */}
          <BottomNavigation />
          <FloatingActionButton
            onClick={handleFABClick}
            ariaLabel="Create new chat or document"
          />
          <SearchOverlay
            isOpen={isSearchOverlayOpen}
            onClose={() => setIsSearchOverlayOpen(false)}
          />

          <CreateFolderModal
            isOpen={showModal}
            folderName={folderName}
            onFolderNameChange={setFolderName}
            onClose={() => {
              setShowModal(false);
              setFolderName('');
            }}
            onCreate={handleCreateFolder}
          />
        </div>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}