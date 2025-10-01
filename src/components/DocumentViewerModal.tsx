import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Rnd } from "react-rnd";
import { X, ExternalLink, Maximize2, Minimize2 } from "lucide-react";

interface DocumentViewerModalProps {
  file: any;
  onClose: () => void;
}

export default function DocumentViewerModal({ file, onClose }: DocumentViewerModalProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    console.log('[DocumentViewerModal] Component mounted');
    console.log('[DocumentViewerModal] Window width:', window.innerWidth);
    console.log('[DocumentViewerModal] File:', file);
  }, []);

  // close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        console.log('[DocumentViewerModal] Escape key pressed - closing');
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!file) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <Rnd
        default={{
          x: window.innerWidth / 2 - 450,
          y: window.innerHeight / 2 - 300,
          width: 900,
          height: 600,
        }}
        minWidth={600}
        minHeight={400}
        bounds="window"
        enableResizing={!isMaximized}
        disableDragging={isMaximized}
        size={
          isMaximized
            ? { width: window.innerWidth - 40, height: window.innerHeight - 40 }
            : undefined
        }
        position={
          isMaximized
            ? { x: 20, y: 20 }
            : undefined
        }
        className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white cursor-move">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 truncate">
              {file.name}
            </h2>
            <p className="text-sm text-slate-500">{file.mime_type}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMaximized((prev) => !prev)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isMaximized ? (
                <Minimize2 className="w-5 h-5 text-slate-600" />
              ) : (
                <Maximize2 className="w-5 h-5 text-slate-600" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-slate-50" style={{ resize: 'both' }}>
          <iframe
            src={file.drive_web_view_link}
            className="w-full h-full"
            style={{ minWidth: '600px', minHeight: '400px' }}
            title={file.name}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex gap-3">
          <a
            href={file.drive_web_view_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Google Drive
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </Rnd>
    </div>
  );

  return createPortal(modalContent, document.body);
}
