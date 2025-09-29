import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import Navbar from "./components/Navbar";
import AIChat from "./components/AIChat";
import DocumentCard from "./components/DocumentCard";
import FolderPage from "./pages/FolderPage";

function AppContent() {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [folderName, setFolderName] = useState('');

  // Extract folderId from URL
  const folderId = location.pathname.startsWith('/folder/') 
    ? location.pathname.split('/folder/')[1] 
    : null;

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;

    try {
      // TODO: Call your API to create folder
      console.log('Creating folder:', folderName);
      setFolderName('');
      setShowModal(false);
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      
      <main className="flex flex-1 overflow-hidden min-h-0">
        {/* Chat - Always visible and persistent */}
        <div className="flex-1 flex flex-col min-w-0">
          <AIChat />
        </div>

        {/* Sidebar - Changes based on route */}
        <aside className="w-80 xl:w-96 border-l border-slate-200 bg-white overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">My Cases</h2>
              <button
                onClick={() => setShowModal(true)}
                className="p-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition-colors"
                title="Create New Case File"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-4">
            <DocumentCard folderId={folderId} />
          </div>
        </aside>

        {/* Hidden FolderPage for route matching */}
        <div className="hidden">
          <Routes>
            <Route path="/folder/:folderId" element={<FolderPage />} />
          </Routes>
        </div>
      </main>

      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" 
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4" 
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Create New Case File</h2>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Case file name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setFolderName('');
                }}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!folderName.trim()}
                className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create New Case File
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="p-4 text-xs text-center text-slate-500 border-t border-slate-200 flex-shrink-0">
        Your documents are securely stored in Australia. AI assistance is provided by ChatGPT, Claude, and other trusted systems.
        <div className="mt-1">
          <a href="#" className="underline hover:text-slate-700">Privacy Policy</a>
          {" | "}
          <a href="#" className="underline hover:text-slate-700">Accessibility</a>
          {" | "}
          <a href="#" className="underline hover:text-slate-700">Legal Aid Resources</a>
        </div>
      </footer>
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