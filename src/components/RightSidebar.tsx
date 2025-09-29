import React from "react";
import { Plus } from "lucide-react";
import DocumentCard from "./DocumentCard";

interface RightSidebarProps {
  folderId: string | null;
  onCreateFolder: () => void;
}

export default function RightSidebar({ folderId, onCreateFolder }: RightSidebarProps) {
  return (
    <aside className="w-80 xl:w-96 border-l border-slate-200 bg-white overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">My Cases</h2>
          <button
            onClick={onCreateFolder}
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
  );
}