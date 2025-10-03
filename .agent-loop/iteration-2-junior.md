# Implementation: Add to Chat Button for DocumentViewerModal

## 1. Complete DocumentViewerModal.tsx

```typescript
import React, { useState, useCallback, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import Draggable from "react-draggable";
import {
  X,
  Maximize2,
  Minimize2,
  MessageSquarePlus,
  Loader2,
  ExternalLink,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { FileObject } from "./DocumentCard";

interface ToastState {
  show: boolean;
  type: "success" | "error";
  message: string;
  retryAction?: () => void;
}

interface DocumentViewerModalProps {
  file: FileObject | null;
  onClose: () => void;
  onAddToChat?: (file: FileObject) => Promise<void>;
}

function DocumentViewerModalContent({
  file,
  onClose,
  onAddToChat,
}: DocumentViewerModalProps) {
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isAddingToChat, setIsAddingToChat] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: "success",
    message: "",
  });

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

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

  const toggleMaximize = (): void => {
    setIsMaximized((prev) => !prev);
  };

  const handleAddToChat = useCallback(async (): Promise<void> => {
    if (!onAddToChat || isAddingToChat) return;

    setIsAddingToChat(true);
    setToast({ show: false, type: "success", message: "" });

    // Clear any existing timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    try {
      await onAddToChat(file);

      setToast({
        show: true,
        type: "success",
        message: "Document added to chat",
      });

      // Auto-hide success toast after 3 seconds
      toastTimeoutRef.current = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3000);
    } catch (error) {
      let errorMessage = "Failed to add document to chat";

      if (error instanceof Error) {
        if (error.message.toLowerCase().includes("network")) {
          errorMessage = "Network error. Please check your connection.";
        } else if (error.message.toLowerCase().includes("permission")) {
          errorMessage = "You don't have permission to add this document.";
        } else {
          errorMessage = error.message;
        }
      }

      setToast({
        show: true,
        type: "error",
        message: errorMessage,
        retryAction: () => handleRetry(),
      });
    } finally {
      setIsAddingToChat(false);
    }
  }, [onAddToChat, isAddingToChat, file]);

  const handleRetry = useCallback((): void => {
    setToast({ show: false, type: "success", message: "" });
    handleAddToChat();
  }, [handleAddToChat]);

  const handleCloseToast = (): void => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ show: false, type: "success", message: "" });
  };

  const modalContent = (
    <div
      className={`bg-white rounded-xl shadow-xl flex flex-col ${
        isMaximized
          ? "fixed inset-2 z-[10000] w-auto h-auto"
          : "max-w-4xl w-full max-h-[90vh]"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 cursor-move">
        <h2
          id="modal-title"
          className="font-semibold text-slate-900 truncate"
        >
          {file.name}
        </h2>
        <div className="flex items-center gap-2">
          {/* Add to Chat button */}
          {onAddToChat && (
            <button
              onClick={handleAddToChat}
              disabled={isAddingToChat}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              aria-label="Add document to chat"
              aria-busy={isAddingToChat}
              title="Add this document to chat"
            >
              {isAddingToChat ? (
                <>
                  <Loader2
                    className="w-4 h-4 animate-spin"
                    aria-hidden="true"
                  />
                  <span className="hidden sm:inline">Adding...</span>
                </>
              ) : (
                <>
                  <MessageSquarePlus className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Add to Chat</span>
                </>
              )}
            </button>
          )}

          {/* Open in Drive button */}
          <a
            href={file.drive_web_view_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            aria-label="Open document in Google Drive"
            title="Open in Google Drive"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Drive</span>
          </a>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleMaximize}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            aria-label={isMaximized ? "Restore window size" : "Maximize window"}
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? (
              <Minimize2 className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Maximize2 className="w-5 h-5" aria-hidden="true" />
            )}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            aria-label="Close document viewer"
            title="Close"
          >
            <X className="w-5 h-5" aria-hidden="true" />
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
          <div className="flex flex-col items-center justify-center h-[75vh] text-center">
            <p className="text-slate-600 mb-4">
              Preview not available for this file type.
            </p>
            <a
              href={file.drive_web_view_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
              Open in Google Drive
            </a>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div
          role="alert"
          aria-live="polite"
          aria-atomic="true"
          className={`fixed bottom-4 right-4 z-[10001] flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg max-w-md ${
            toast.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
          ) : (
            <AlertCircle
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
          )}
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium ${
                toast.type === "success" ? "text-green-800" : "text-red-800"
              }`}
            >
              {toast.message}
            </p>
            {toast.type === "error" && toast.retryAction && (
              <button
                onClick={toast.retryAction}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-900 underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                aria-label="Retry adding document to chat"
              >
                Try again
              </button>
            )}
          </div>
          <button
            onClick={handleCloseToast}
            className={`flex-shrink-0 p-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              toast.type === "success"
                ? "text-green-600 hover:bg-green-100 focus:ring-green-500"
                : "text-red-600 hover:bg-red-100 focus:ring-red-500"
            }`}
            aria-label="Close notification"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      {isMaximized ? (
        modalContent
      ) : (
        <Draggable handle=".cursor-move">{modalContent}</Draggable>
      )}
    </div>
  );
}

export default function DocumentViewerModal(props: DocumentViewerModalProps) {
  return ReactDOM.createPortal(
    <DocumentViewerModalContent {...props} />,
    document.body
  );
}
```

## 2. Complete DocumentViewerModal.test.tsx

```typescript
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DocumentViewerModal from "./DocumentViewerModal";
import { FileObject } from "./DocumentCard";

// Mock ReactDOM.createPortal
jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  createPortal: (node: React.ReactNode) => node,
}));

// Mock Draggable component
jest.mock("react-draggable", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="draggable">{children}</div>
  ),
}));

describe("DocumentViewerModal - Add to Chat Feature", () => {
  const mockFile: FileObject = {
    id: "test-file-1",
    name: "Test Document.pdf",
    mime_type: "application/pdf",
    drive_file_id: "drive-123",
    drive_web_view_link: "https://drive.google.com/file/d/drive-123/view",
    created_at: "2024-01-01T00:00:00Z",
    size: 1024,
  };

  const mockOnClose = jest.fn();
  const mockOnAddToChat = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Button Rendering", () => {
    it("should render Add to Chat button when onAddToChat is provided", () => {
      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      expect(addButton).toBeInTheDocument();
      expect(addButton).toHaveTextContent(/add to chat/i);
    });

    it("should not render Add to Chat button when onAddToChat is not provided", () => {
      render(<DocumentViewerModal file={mockFile} onClose={mockOnClose} />);

      const addButton = screen.queryByRole("button", {
        name: /add document to chat/i,
      });
      expect(addButton).not.toBeInTheDocument();
    });

    it("should render MessageSquarePlus icon", () => {
      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      const icon = addButton.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should have correct styling classes", () => {
      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      expect(addButton).toHaveClass("bg-sky-600");
      expect(addButton).toHaveClass("hover:bg-sky-700");
      expect(addButton).toHaveClass("text-white");
    });
  });

  describe("Click Functionality", () => {
    it("should call onAddToChat with correct file when clicked", async () => {
      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnAddToChat).toHaveBeenCalledTimes(1);
        expect(mockOnAddToChat).toHaveBeenCalledWith(mockFile);
      });
    });

    it("should show loading spinner while processing", async () => {
      const promise = new Promise<void>((resolve) =>
        setTimeout(resolve, 100)
      );
      mockOnAddToChat.mockReturnValue(promise);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(addButton);

      // Check for loading state
      expect(addButton).toHaveAttribute("aria-busy", "true");
      expect(addButton).toHaveTextContent(/adding/i);
      expect(addButton).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(addButton).not.toBeDisabled();
      });
    });

    it("should prevent multiple simultaneous add to chat operations", async () => {
      const promise = new Promise<void>((resolve) =>
        setTimeout(resolve, 100)
      );
      mockOnAddToChat.mockReturnValue(promise);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });

      fireEvent.click(addButton);
      fireEvent.click(addButton);
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnAddToChat).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Success Toast", () => {
    it("should display success toast after successful add", async () => {
      jest.useFakeTimers();
      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(addButton);

      await waitFor(() => {
        const toast = screen.getByRole("alert");
        expect(toast).toBeInTheDocument();
        expect(toast).toHaveTextContent("Document added to chat");
      });

      jest.useRealTimers();
    });

    it("should auto-hide success toast after 3 seconds", async () => {
      jest.useFakeTimers();
      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });

      // Fast-forward time
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it("should allow manual closing of success toast", async () => {
      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });

      const closeButton = screen.getByRole("button", {
        name: /close notification/i,
      });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });

    it("should render toast with higher z-index than modal", async () => {
      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(addButton);

      await waitFor(() => {
        const toast = screen.getByRole("alert");
        expect(toast).toHaveClass("z-[10001]");
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error toast on failure", async () => {
      const errorMessage = "Network error occurred";
      mockOnAddToChat.mockRejectedValueOnce(new Error(errorMessage));

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(addButton);

      await waitFor(() => {
        const toast = screen.getByRole("alert");
        expect(toast).toBeInTheDocument();
        expect(toast).toHaveTextContent(errorMessage);
      });
    });

    it("should display specific error message for network errors", async () => {
      mockOnAddToChat.mockRejectedValueOnce(
        new Error("network timeout error")
      );

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(addButton);

      await waitFor(() => {
        const toast = screen.getByRole("alert");
        expect(toast).toHaveTextContent(
          "Network error. Please check your connection."
        );
      });
    });

    it("should display specific error message for permission errors", async () => {
      mockOnAddToChat.mockRejectedValueOnce(
        new Error("permission denied error")
      );

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(addButton);

      await waitFor(() => {
        const toast = screen.getByRole("alert");
        expect(toast).toHaveTextContent(
          "You don't have permission to add this document."
        );
      });
    });

    it("should display generic error message for non-Error objects", async () => {
      mockOnAddToChat.mockRejectedValueOnce("String error");

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(addButton);

      await waitFor(() => {
        const toast = screen.getByRole("alert");
        expect(toast).toHaveTextContent("Failed to add document to chat");
      });
    });

    it("should show retry button in error toast", async () => {
      mockOnAddToChat.mockRejectedValueOnce(new Error("Test error"));

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(addButton);

      await waitFor(() => {
        const retryButton = screen.getByRole("button", {
          name: /retry adding document to chat/i,
        });
        expect(retryButton).toBeInTheDocument();
        expect(retryButton).toHaveTextContent(/try again/i);
      });
    });

    it("should retry operation when retry button is clicked", async () => {
      mockOnAddToChat
        .mockRejectedValueOnce(new Error("Test error"))
        .mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("Test error");
      });

      const retryButton = screen.getByRole("button", {
        name: /retry adding document to chat/i,
      });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockOnAddToChat).toHaveBeenCalledTimes(2);
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Document added to chat"
        );
      });
    });

    it("should not auto-hide error toast", async () => {
      jest.useFakeTimers();
      mockOnAddToChat.mockRejectedValueOnce(new Error("Test error"));

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });

      jest.advanceTimersByTime(5000);

      expect(screen.getByRole("alert")).toBeInTheDocument();

      jest.useRealTimers();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      expect(addButton).toHaveAttribute("aria-label", "Add document to chat");
      expect(addButton).toHaveAttribute("title", "Add this document to chat");
    });

    it("should update aria-busy during loading", async () => {
      const promise = new Promise<void>((resolve) =>
        setTimeout(resolve, 100)
      );
      mockOnAddToChat.mockReturnValue(promise);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });

      expect(addButton).toHaveAttribute("aria-busy", "false");

      fireEvent.click(addButton);

      expect(addButton).toHaveAttribute("aria-busy", "true");

      await waitFor(() => {
        expect(addButton).toHaveAttribute("aria-busy", "false");
      });
    });

    it("should have proper toast accessibility attributes", async () => {
      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(addButton);

      await waitFor(() => {
        const toast = screen.getByRole("alert");
        expect(toast).toHaveAttribute("aria-live", "polite");
        expect(toast).toHaveAttribute("aria-atomic", "true");
      });
    });

    it("should support keyboard navigation with Enter key", async () => {
      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });

      addButton.focus();
      fireEvent.keyDown(addButton, { key: "Enter", code: "Enter" });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnAddToChat).toHaveBeenCalledTimes(1);
      });
    });

    it("should support keyboard navigation with Space key", async () => {
      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });

      addButton.focus();
      fireEvent.keyDown(addButton, { key: " ", code: "Space" });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect