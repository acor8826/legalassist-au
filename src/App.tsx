import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import AIChat from "./components/AIChat";
import FolderPage from "./pages/FolderPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-sky-50 text-slate-800">
        <Navbar />
        <main className="flex flex-1 p-6 gap-6">
          <div className="flex-1">
            <Routes>
              {/* Home/Dashboard */}
              <Route path="/" element={<Dashboard />} />

              {/* Folder Page with folderId param */}
              <Route path="/folder/:folderId" element={<FolderPage />} />
            </Routes>
          </div>

          <aside className="w-80">
            <AIChat />
          </aside>
        </main>

        <footer className="p-4 text-xs text-center text-slate-500">
          Your documents are securely stored in Australia. AI assistance is
          provided by ChatGPT, Claude, and other trusted systems.
          <div className="mt-1">
            <a href="#" className="underline">
              Privacy Policy
            </a>{" "}
            |{" "}
            <a href="#" className="underline">
              Accessibility
            </a>{" "}
            |{" "}
            <a href="#" className="underline">
              Legal Aid Resources
            </a>
          </div>
        </footer>
      </div>
    </Router>
  );
}
