import React from "react";

interface CreateFolderModalProps {
  isOpen: boolean;
  folderName: string;
  onFolderNameChange: (name: string) => void;
  onClose: () => void;
  onCreate: () => void;
}

export default function CreateFolderModal({ 
  isOpen, 
  folderName, 
  onFolderNameChange, 
  onClose, 
  onCreate 
}: CreateFolderModalProps) {
  if (!isOpen) return null;

  console.log('[CreateFolderModal] Rendered - isOpen:', isOpen);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Create New Case File</h2>
        <input
          type="text"
          value={folderName}
          onChange={(e) => onFolderNameChange(e.target.value)}
          placeholder="Case file name"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          onKeyDown={(e) => e.key === 'Enter' && onCreate()}
          autoFocus
        />
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            disabled={!folderName.trim()}
            className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create New Case File
          </button>
        </div>
      </div>
    </div>
  );
}