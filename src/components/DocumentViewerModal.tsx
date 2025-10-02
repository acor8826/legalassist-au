import React from "react";
import ReactDOM from "react-dom";
import { X, PlusCircle } from "lucide-react";
import { FileObject } from "./DocumentCard";

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
  if (!file) return null;

  const isImage = file.mime_type.startsWith("image/");
  const isPDF = file.mime_type === "application/pdf";
  const isOfficeDoc =
    file.mime_type.includes("word") ||
    file.mime_type.includes("presentation") ||
    file.mime_type.includes("sheet");

  const googleDrivePreview = file.drive_file_id
    ? `https://drive.google.com/file/d/${file.drive_file_id}/preview`
    : file.drive_web_view_link;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900 truncate">{file.name}</h2>
          <div className="flex items-center gap-2">
            {onAddToChat && (
              <button
                onClick={() => onAddToChat(file)}
                className="flex items-center gap-1 text-sky-600 hover:text-sky-800"
                title="Add this file to Chat"
              >
                <PlusCircle className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">
                  Add to Chat
                </span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isImage ? (
            <img
              src={file.drive_web_view_link}
              alt={file.name}
              className="max-h-[75vh] mx-auto rounded"
            />
          ) : isPDF || isOfficeDoc ? (
            <iframe
              src={googleDrivePreview}
              className="w-full h-[75vh]"
              title={file.name}
            />
          ) : (
            <p className="text-slate-600">
              Preview not available.{" "}
              <a
                href={file.drive_web_view_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 hover:underline"
              >
                Open in Drive
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DocumentViewerModal(props: DocumentViewerModalProps) {
  // ✅ Portal to body so it escapes sidebar layout
  return ReactDOM.createPortal(
    <DocumentViewerModalContent {...props} />,
    document.body
  );
}
