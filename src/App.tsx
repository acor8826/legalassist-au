import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import Footer from "./components/Footer";
import CreateFolderModal from "./components/CreateFolderModal";
import AIChat from "./components/AIChat";
import Homepage from "./pages/Homepage";

function AppContent() {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNavSections, setExpandedNavSections] = useState<Set<string>>(new Set(['main']));

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

  return (
    <Routes>
      {/* Homepage route - standalone without layout */}
      <Route path="/homepage" element={<Homepage />} />
      
      {/* Main app routes with layout */}
      <Route path="/*" element={
        <div className="h-screen flex flex-col bg-slate-50 text-slate-800">
          <Header 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={handleSearch}
          />
          
          <main className="flex flex-1 overflow-hidden min-h-0">
            <LeftSidebar 
              expandedSections={expandedNavSections}
              onToggleSection={toggleNavSection}
            />

            <div className="flex-1 flex flex-col min-w-0">
              <AIChat />
            </div>

            <RightSidebar 
              folderId={folderId}
              onCreateFolder={() => setShowModal(true)}
            />
          </main>

          <Footer />

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