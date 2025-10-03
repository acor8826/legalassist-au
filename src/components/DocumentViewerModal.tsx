import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Draggable from "react-draggable";
import { X, PlusCircle, Maximize2, Minimize2, ExternalLink } from "lucide-react";
import { FileObject } from "../types";

interface DocumentViewerModalProps {
  file: FileObject | null;
  onClose: () => void;
  onAddToChat?: (file: FileObject) => void;
}

function DocumentViewerModalContent({
  file,
  onClose,
  onAddToChat,
}: DocumentViewerModalProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [frameReady, setFrameReady] = useState(false);
  const [frameError, setFrameError] = useState(false);

  // Reset frame state when file changes
  useEffect(() => {
    setFrameReady(false);
    setFrameError(false);
  }, [file?.id]);

  if (!file) {
    return null;
  }

  const isImage = file.mime_type?.startsWith("image/");
  const isPDF = file.mime_type === "application/pdf";
  const isOfficeDoc =
    file.mime_type?.includes("word") ||
    file.mime_type?.includes("presentation") ||
    file.mime_type?.includes("sheet") ||
    file.mime_type?.includes("spreadsheet") ||
    file.mime_type?.includes("document");

  // Best-available preview
  const previewUrl = file.drive_file_id
    ? file.mime_type?.includes("document")
      ? `https://docs.google.com/document/d/${file.drive_file_id}/preview`
      : file.mime_type?.includes("spreadsheet")
      ? `https://docs.google.com/spreadsheets/d/${file.drive_file_id}/preview`
      : file.mime_type?.includes("presentation")
      ? `https://docs.google.com/presentation/d/${file.drive_file_id}/preview`
      : `https://drive.google.com/file/d/${file.drive_file_id}/preview`
    : file.drive_web_view_link;

  // Editing link
  const editUrl = file.drive_file_id
    ? file.mime_type?.includes("document")
      ? `https://docs.google.com/document/d/${file.drive_file_id}/edit`
      : file.mime_type?.includes("spreadsheet")
      ? `https://docs.google.com/spreadsheets/d/${file.drive_file_id}/edit`
      : file.mime_type?.includes("presentation")
      ? `https://docs.google.com/presentation/d/${file.drive_file_id}/edit`
      : `https://drive.google.com/file/d/${file.drive_file_id}/view`
    : file.drive_web_view_link;

  const toggleMaximize = () => setIsMaximized((prev) => !prev);

  const modalContent = (
    <div
      className={`bg-white rounded-xl shadow-xl flex flex-col ${
        isMaximized ? "fixed inset-2 z-[10000] w-auto h-auto" : "max-w-4xl w-full max-h-[90vh]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 cursor-move">
        <h2 className="font-semibold text-slate-900 truncate">{file.name}</h2>

        <div className="flex items-center gap-2">
          {/* Add to Chat */}
          <button
            onClick={() => {
              if (onAddToChat) onAddToChat(file);
              else alert(`Added ${file.name} to Chat!`);
            }}
            className="flex items-center gap-1 text-sky-600 hover:text-sky-800"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Add to Chat</span>
          </button>

          {/* Open in Drive */}
          <a
            href={editUrl || file.drive_web_view_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-700 p-1"
          >
            <ExternalLink className="w-5 h-5" />
          </a>

          {/* Fullscreen */}
          <button
            onClick={toggleMaximize}
            className="text-slate-500 hover:text-slate-700"
          >
            {isMaximized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {/* Close */}
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isImage ? (
          <img src={file.drive_web_view_link} alt={file.name} className="max-h-[75vh] mx-auto rounded" />
        ) : isPDF || isOfficeDoc ? (
          <>
            <iframe
              src={previewUrl}
              className="w-full h-[75vh]"
              title={file.name}
              onLoad={() => setFrameReady(true)}
              onError={() => setFrameError(true)}
            />
            {!frameReady && (
              <div className="mt-3 text-xs text-slate-500">
                Loading preview… If it doesn’t appear, open{" "}
                <a href={editUrl} target="_blank" className="text-sky-600 underline">
                  in Google Drive
                </a>.
              </div>
            )}
            {frameError && (
              <div className="mt-3 text-xs text-red-600">
                Couldn’t load embedded preview.{" "}
                <a href={editUrl} target="_blank" className="text-sky-600 underline">
                  Open in Drive
                </a>{" "}
                instead.
              </div>
            )}
          </>
        ) : (
          <p className="text-slate-600">
            Preview not available.{" "}
            <a href={editUrl} target="_blank" className="text-sky-600 hover:underline">
              Open in Drive
            </a>
            .
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      {isMaximized ? modalContent : <Draggable handle=".cursor-move">{modalContent}</Draggable>}
    </div>
  );
}

export default function DocumentViewerModal(props: DocumentViewerModalProps) {
  return ReactDOM.createPortal(<DocumentViewerModalContent {...props} />, document.body);
}
