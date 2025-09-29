// src/components/ChatLayout.tsx
import React from "react";
import AIChat from "./AIChat";
import DocumentCard from "./DocumentCard";

export default function ChatLayout() {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Main Chat Area - Center */}
      <div className="flex-1 flex flex-col">
        <AIChat />
      </div>

      {/* Right Sidebar - Documents/Folders */}
      <div className="w-80 xl:w-96 border-l border-slate-200 bg-white overflow-y-auto">
        <div className="p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 className="font-semibold text-slate-900">My Documents</h2>
        </div>
        <div className="p-4">
          <DocumentCard />
        </div>
      </div>
    </div>
  );
}