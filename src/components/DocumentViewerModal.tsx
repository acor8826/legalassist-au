import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Rnd, RndResizeCallback } from "react-rnd";
import { Document, Page, pdfjs } from "react-pdf";
import {
  X,
  ExternalLink,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface FileObject {
  id: string;
  name: string;
  mime_type: string;
  drive_file_id?: string;
  drive_web_view_link?: string;
  [key: string]: any;
}

interface DocumentViewerModalProps {
  file: FileObject | null;
  onClose: () => void;
}

export default function DocumentViewerModal({ file, onClose }: DocumentViewerModalProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [dimensions, setDimensions] = useState({
    width: 900,
    height: window.innerHeight * 0.8,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!file) return null;

  const isPdf = file.mime_type === "application/pdf";
  const isGoogleDrive = !!file.drive_file_id || !!file.drive_web_view_link;

  // Build Google Drive URL - use /edit for editing capability with minimal UI
  let fileUrl = "";
  if (file.drive_file_id) {
    if (file.mime_type.includes("wordprocessingml")) {
      fileUrl = `https://docs.google.com/document/d/${file.drive_file_id}/edit?rm=minimal&embedded=true`;
    } else if (file.mime_type.includes("spreadsheet")) {
      fileUrl = `https://docs.google.com/spreadsheets/d/${file.drive_file_id}/edit?rm=minimal&embedded=true`;
    } else if (file.mime_type.includes("presentation")) {
      fileUrl = `https://docs.google.com/presentation/d/${file.drive_file_id}/edit?rm=minimal&embedded=true`;
    } else if (isPdf) {
      fileUrl = `https://drive.google.com/file/d/${file.drive_file_id}/preview`;
    } else {
      fileUrl = `https://drive.google.com/file/d/${file.drive_file_id}/preview`;
    }
  } else if (file.drive_web_view_link) {
    const baseUrl = file.drive_web_view_link.split('?')[0];
    if (!baseUrl.includes('/edit')) {
      fileUrl = baseUrl.replace('/preview', '/edit') + '?rm=minimal&embedded=true';
    } else {
      fileUrl = baseUrl + '?rm=minimal&embedded=true';
    }
  }

  const onLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onLoadError = (error: Error) => {
    console.error("[Modal] PDF load error:", error);
  };

  const goPrevPage = () => setPageNumber((p) => Math.max(p - 1, 1));
  const goNextPage = () => setPageNumber((p) => Math.min(p + 1, numPages));

  const handleResize: RndResizeCallback = (e, direction, ref) => {
    setDimensions({ width: ref.offsetWidth, height: ref.offsetHeight });
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <Rnd
        default={{
          x: window.innerWidth / 2 - 450,
          y: window.innerHeight / 2 - window.innerHeight * 0.4,
          width: 900,
          height: window.innerHeight * 0.8,
        }}
        minWidth={600}
        minHeight={window.innerHeight * 0.3}
        maxWidth={window.innerWidth * 0.95}
        maxHeight={window.innerHeight * 0.95}
        bounds="window"
        enableResizing={!isMaximized}
        disableDragging={isMaximized}
        size={
          isMaximized
            ? { width: window.innerWidth * 0.95, height: window.innerHeight * 0.95 }
            : undefined
        }
        position={
          isMaximized
            ? { x: window.innerWidth * 0.025, y: window.innerHeight * 0.025 }
            : undefined
        }
        onResize={handleResize}
        className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e: { stopPropagation: () => any }) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-white">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 truncate">
              {file.name}
            </h2>
            <p className="text-sm text-slate-500">{file.mime_type}</p>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2">
            {isPdf && !isGoogleDrive && (
              <>
                <button onClick={goPrevPage} className="p-1 hover:bg-slate-100 rounded">
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <span className="text-sm text-slate-700">
                  {pageNumber} / {numPages || "?"}
                </span>
                <button onClick={goNextPage} className="p-1 hover:bg-slate-100 rounded">
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
                <button onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}>
                  <ZoomOut className="w-5 h-5 text-slate-600" />
                </button>
                <button onClick={() => setScale((s) => s + 0.25)}>
                  <ZoomIn className="w-5 h-5 text-slate-600" />
                </button>
              </>
            )}
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-sm transition-colors"
              >
                <ExternalLink className="w-4 h-4 inline-block mr-1" />
                Drive
              </a>
            )}
            <button
              onClick={() => setIsMaximized((m) => !m)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isMaximized ? (
                <Minimize2 className="w-5 h-5 text-slate-600" />
              ) : (
                <Maximize2 className="w-5 h-5 text-slate-600" />
              )}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="w-full h-full border-0 bg-slate-50 rounded-lg shadow-xl"
style={{ margin: "0 auto", maxWidth: "95%" }}

>
          {isGoogleDrive && !isPdf ? (
            <iframe
              src={fileUrl}
              className="w-full h-full border-0 block"
              title={file.name}
              allow="autoplay"
            />
          ) : isPdf ? (
            <div className="w-full h-full overflow-auto flex justify-center items-start bg-slate-50">
              <Document file={fileUrl} onLoadSuccess={onLoadSuccess} onLoadError={onLoadError}>
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              Preview not available
            </div>
          )}
        </div>
      </Rnd>
    </div>
  );

  return createPortal(modalContent, document.body);
}