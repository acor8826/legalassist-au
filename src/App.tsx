import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
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
import ErrorBoundary from "./components/ErrorBoundary";

function AppContent() {
  const location = useLocation();
  const [folderName, setFolderName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNavSections, setExpandedNavSections] = useState<Set<string>>(
    new Set(["main"])
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  React.useEffect(() => {
    console.log('[App] Component mounted');
    console.log('[App] Window width:', window.innerWidth);
    console.log('[App] Initial location:', location.pathname);
  }, []);

  React.useEffect(() => {
    console.log('[App] Location changed to:', location.pathname);
  }, [location.pathname]);

  const folderId = location.pathname.startsWith("/folder/")
    ? location.pathname.split("/folder/")[1]
    : null;

  const handleCreateFolder = () => {
    if (!folderName.trim()) return;
    console.log("Creating folder:", folderName);
    setFolderName("");
    setShowCreateModal(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const toggleNavSection = (section: string) => {
    setExpandedNavSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  return (
    <ErrorBoundary componentName="App">
      <div className="h-screen flex flex-col bg-slate-50 text-slate-800">
        {/* Mobile Top Bar - Add safe-area-top padding */}
        <ErrorBoundary componentName="TopBar">
          <TopBar onSearchClick={() => setIsSearchOverlayOpen(true)} />
        </ErrorBoundary>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <ErrorBoundary componentName="Header">
            <Header
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearch}
            />
          </ErrorBoundary>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <ErrorBoundary componentName="LeftSidebar">
            <LeftSidebar
              expandedSections={expandedNavSections}
              onToggleSection={toggleNavSection}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          </ErrorBoundary>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto pb-14 lg:pb-0">
            <ErrorBoundary componentName="MainContent">
              <Routes>
                <Route path="/homepage" element={<Homepage />} />
                <Route path="/*" element={<AIChat />} />
              </Routes>
            </ErrorBoundary>
          </main>

          {/* Right Sidebar */}
          <ErrorBoundary componentName="RightSidebar">
            <RightSidebar
              folderId={folderId}
              onCreateFolder={handleCreateFolder}
              isOpen={isRightSidebarOpen}
              onClose={() => setIsRightSidebarOpen(false)}
            />
          </ErrorBoundary>
        </div>

        {/* Footer */}
        <ErrorBoundary componentName="Footer">
          <Footer />
        </ErrorBoundary>

        {/* Floating Action Button */}
        <ErrorBoundary componentName="FloatingActionButton">
          <FloatingActionButton onClick={() => setShowCreateModal(true)} />
        </ErrorBoundary>

        {/* Bottom Navigation (mobile only) */}
        <ErrorBoundary componentName="BottomNavigation">
          <BottomNavigation
            onToggleSidebar={() => setIsSidebarOpen((p) => !p)}
            onToggleRightSidebar={() => setIsRightSidebarOpen((p) => !p)}
          />
        </ErrorBoundary>

        {/* Create Folder Modal */}
        <ErrorBoundary componentName="CreateFolderModal">
          <CreateFolderModal
            isOpen={showCreateModal}
            folderName={folderName}
            onFolderNameChange={setFolderName}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateFolder}
          />
        </ErrorBoundary>

        {/* Search Overlay */}
        <ErrorBoundary componentName="SearchOverlay">
          <SearchOverlay
            isOpen={isSearchOverlayOpen}
            onClose={() => setIsSearchOverlayOpen(false)}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
