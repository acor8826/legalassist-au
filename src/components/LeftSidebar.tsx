import React from "react";
import { useNavigate } from "react-router-dom";
import { Home as HomeIcon, FileText, Upload as UploadIcon, HelpCircle, ChevronDown, ChevronRight } from "lucide-react";

interface LeftSidebarProps {
  expandedSections: Set<string>;
  onToggleSection: (section: string) => void;
}

export default function LeftSidebar({ expandedSections, onToggleSection }: LeftSidebarProps) {
  const navigate = useNavigate();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white overflow-y-auto flex-shrink-0">
      <div className="p-4 space-y-2">
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <button
            onClick={() => onToggleSection('main')}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
          >
            <span className="font-semibold text-slate-900">Navigation</span>
            {expandedSections.has('main') ? (
              <ChevronDown className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-600" />
            )}
          </button>
          
          {expandedSections.has('main') && (
            <div className="border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center gap-3 p-3 hover:bg-white transition-colors text-left border-b border-slate-100"
              >
                <HomeIcon className="w-5 h-5 text-slate-600" />
                <span className="text-slate-700">Home</span>
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center gap-3 p-3 hover:bg-white transition-colors text-left border-b border-slate-100"
              >
                <FileText className="w-5 h-5 text-slate-600" />
                <span className="text-slate-700">Documents</span>
              </button>
              <button
                className="w-full flex items-center gap-3 p-3 hover:bg-white transition-colors text-left border-b border-slate-100"
              >
                <UploadIcon className="w-5 h-5 text-slate-600" />
                <span className="text-slate-700">Upload</span>
              </button>
              <button
                className="w-full flex items-center gap-3 p-3 hover:bg-white transition-colors text-left"
              >
                <HelpCircle className="w-5 h-5 text-slate-600" />
                <span className="text-slate-700">Support</span>
              </button>
            </div>
          )}
        </div>

        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <button
            onClick={() => onToggleSection('resources')}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
          >
            <span className="font-semibold text-slate-900">Resources</span>
            {expandedSections.has('resources') ? (
              <ChevronDown className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-600" />
            )}
          </button>
          
          {expandedSections.has('resources') && (
            <div className="border-t border-slate-200 bg-slate-50">
              <a href="#" className="flex items-center gap-3 p-3 hover:bg-white transition-colors border-b border-slate-100">
                <span className="text-sm text-slate-700">Privacy Policy</span>
              </a>
              <a href="#" className="flex items-center gap-3 p-3 hover:bg-white transition-colors border-b border-slate-100">
                <span className="text-sm text-slate-700">Accessibility</span>
              </a>
              <a href="#" className="flex items-center gap-3 p-3 hover:bg-white transition-colors">
                <span className="text-sm text-slate-700">Legal Aid Resources</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}