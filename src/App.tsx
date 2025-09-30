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
    <div className="h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Mobile Top Bar */}
      <TopBar onSearchClick={() => setIsSearchOverlayOpen(true)} />

      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearch}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar
          expandedSections={expandedNavSections}
          onToggleSection={toggleNavSection}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/*" element={<AIChat />} />
          </Routes>
        </main>

        {/* Right Sidebar */}
        <RightSidebar
          folderId={folderId}
          onCreateFolder={handleCreateFolder}
          isOpen={isRightSidebarOpen}
          onClose={() => setIsRightSidebarOpen(false)}
        />
      </div>

      {/* Footer */}
      <Footer />

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setShowCreateModal(true)} />

      {/* Bottom Navigation (mobile only) */}
      <BottomNavigation
        onToggleSidebar={() => setIsSidebarOpen((p) => !p)}
        onToggleRightSidebar={() => setIsRightSidebarOpen((p) => !p)}
      />

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={showCreateModal}
        folderName={folderName}
        onFolderNameChange={setFolderName}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateFolder}
      />

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOverlayOpen}
        onClose={() => setIsSearchOverlayOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
