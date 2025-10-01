import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Rnd } from "react-rnd";
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
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface FileObject {
  id: string;
  name: string;
  mime_type: string;
  drive_file_id?: string;
  drive_web_view_link?: string;
  [key: string]: any; // Allow for additional properties
}

interface DocumentViewerModalProps {
  file: FileObject | null;
  onClose: () => void;
}

export default function DocumentViewerModal({ file, onClose }: DocumentViewerModalProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [dimensions, setDimensions] = useState({ width: 900, height: window.innerHeight * 0.8 });

  // Mount/Unmount logging
  useEffect(() => {
    console.log("[Modal] Component mounted");
    return () => {
      console.log("[Modal] Component unmounted");
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        console.log("[Modal] Escape key pressed - closing modal");
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!file) return null;

  // Build PDF URL
  let pdfUrl = "";
  if (file.drive_file_id) {
    pdfUrl = `https://drive.google.com/uc?id=${file.drive_file_id}&export=download`;
    console.log("[Modal] Using drive_file_id URL:", pdfUrl);
  } else if (file.drive_web_view_link) {
    pdfUrl = file.drive_web_view_link.replace("/edit", "/export?format=pdf");
    console.log("[Modal] Using drive_web_view_link URL:", pdfUrl);
  } else {
    console.warn("[Modal] No valid URL found for file:", file);
  }

  console.log("[Modal] Received file:", {
    id: file.id,
    name: file.name,
    mime_type: file.mime_type,
    drive_file_id: file.drive_file_id,
    drive_web_view_link: file.drive_web_view_link,
    pdfUrl: pdfUrl,
    fullFile: file
  });

  const onLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log("[Modal] PDF loaded successfully. Pages:", numPages);
    setNumPages(numPages);
  };

  const onLoadError = (error: Error) => {
    console.error("[Modal] PDF load error:", error);
  };

  const goPrevPage = () => setPageNumber((p) => Math.max(p - 1, 1));
  const goNextPage = () => setPageNumber((p) => Math.min(p + 1, numPages));

  const handleBackdropClick = (e: React.MouseEvent) => {
    console.log("[Modal] Backdrop clicked - closing modal");
    onClose();
  };

  const handleContentClick = (e: React.MouseEvent) => {
    console.log("[Modal] Content clicked - preventing close");
    e.stopPropagation();
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      <Rnd
        default={{
          x: window.innerWidth / 2 - 450,
          y: window.innerHeight / 2 - (window.innerHeight * 0.4),
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
        onResize={(e, direction, ref, delta, position) => {
          const newWidth = ref.offsetWidth;
          const newHeight = ref.offsetHeight;
          console.log("[Modal] Resizing:", { width: newWidth, height: newHeight, direction });
          setDimensions({ width: newWidth, height: newHeight });
        }}
        className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
        style={{ border: "2px solid green" }}
        onClick={handleContentClick}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-white cursor-move"
          style={{ border: "2px solid red", backgroundColor: "rgba(255,0,0,0.1)" }}
        >
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 truncate">
              {file.name}
            </h2>
            <p className="text-sm text-slate-500">{file.mime_type}</p>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <button onClick={goPrevPage} className="p-1 hover:bg-slate-100 rounded">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <span className="text-sm text-slate-700">
              {pageNumber} / {numPages || "?"}
            </span>
            <button onClick={goNextPage} className="p-1 hover:bg-slate-100 rounded">
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
            {file.drive_web_view_link && (
              <a
                href={file.drive_web_view_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-sm transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Drive
              </a>
            )}
            <button
              onClick={() => {
                const newMaximized = !isMaximized;
                console.log("[Modal] Toggle maximize:", newMaximized);
                setIsMaximized(newMaximized);
              }}
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
        <div
          className="flex-1 overflow-auto bg-slate-50 flex justify-center items-start"
          style={{ border: "2px solid blue", backgroundColor: "rgba(0,0,255,0.1)" }}
        >
          {pdfUrl ? (
            <Document
              file={pdfUrl}
              onLoadSuccess={onLoadSuccess}
              onLoadError={onLoadError}
              loading={
                <div className="flex items-center justify-center p-8">
                  <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
                  <p className="ml-3 text-slate-500">Loading PDF...</p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                height={isMaximized ? window.innerHeight * 0.85 : window.innerHeight * 0.65}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                onLoadSuccess={(page) => {
                  console.log("[Modal] Page rendered:", {
                    pageNumber,
                    width: page.width,
                    height: page.height,
                    originalWidth: page.originalWidth,
                    originalHeight: page.originalHeight
                  });
                }}
              />
            </Document>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Could not load PDF preview
            </div>
          )}
        </div>
      </Rnd>
    </div>
  );

  return createPortal(modalContent, document.body);
}
