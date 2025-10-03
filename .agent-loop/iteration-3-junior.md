# Implementation: Add to Chat Button for DocumentViewerModal

## 1. Complete DocumentViewerModal.tsx

```typescript
import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import Draggable from "react-draggable";
import {
  X,
  Maximize2,
  Minimize2,
  MessageSquarePlus,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { FileObject } from "./DocumentCard";

interface DocumentViewerModalProps {
  file: FileObject | null;
  onClose: () => void;
  onAddToChat?: (file: FileObject) => Promise<void>;
}

interface ToastState {
  show: boolean;
  type: "success" | "error";
  message: string;
}

type ErrorType = "network" | "permission" | "generic";

const INITIAL_TOAST_STATE: ToastState = {
  show: false,
  type: "success",
  message: "",
};

const TOAST_DURATION = 3000;

const ERROR_MESSAGES: Record<ErrorType, string> = {
  network: "Network error. Please check your connection and try again.",
  permission: "Permission denied. You may not have access to add this document.",
  generic: "Failed to add document to chat. Please try again.",
};

function DocumentViewerModalContent({
  file,
  onClose,
  onAddToChat,
}: DocumentViewerModalProps) {
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isAddingToChat, setIsAddingToChat] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState>(INITIAL_TOAST_STATE);
  
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<FileObject | null>(file);

  // Keep track of the file that initiated the add operation
  useEffect(() => {
    fileRef.current = file;
  }, [file]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
    };
  }, []);

  const getErrorType = (error: unknown): ErrorType => {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes("network") || message.includes("fetch")) {
        return "network";
      }
      if (message.includes("permission") || message.includes("unauthorized")) {
        return "permission";
      }
    }
    return "generic";
  };

  const showToast = useCallback((type: ToastState["type"], message: string): void => {
    // Clear any existing timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }

    setToast({ show: true, type, message });

    // Auto-hide success toasts
    if (type === "success") {
      toastTimeoutRef.current = setTimeout(() => {
        setToast({ ...INITIAL_TOAST_STATE });
        toastTimeoutRef.current = null;
      }, TOAST_DURATION);
    }
  }, []);

  const handleCloseToast = useCallback((): void => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToast({ ...INITIAL_TOAST_STATE });
  }, []);

  const handleAddToChat = useCallback(async (): Promise<void> => {
    if (!onAddToChat) return;

    // Use functional update to avoid dependency on isAddingToChat
    setIsAddingToChat((prev) => {
      if (prev) return prev; // Already adding, do nothing
      return true;
    });

    // Capture the current file reference
    const currentFile = fileRef.current;
    
    if (!currentFile) {
      setIsAddingToChat(false);
      return;
    }

    try {
      await onAddToChat(currentFile);
      showToast("success", "Document added to chat");
    } catch (error) {
      const errorType = getErrorType(error);
      const errorMessage = ERROR_MESSAGES[errorType];
      showToast("error", errorMessage);
      
      console.error("Error adding document to chat:", error);
    } finally {
      setIsAddingToChat(false);
    }
  }, [onAddToChat, showToast]);

  const handleRetry = useCallback((): void => {
    setToast({ ...INITIAL_TOAST_STATE });
    // Delay to allow toast to clear before starting new operation
    setTimeout(() => {
      handleAddToChat();
    }, 0);
  }, [handleAddToChat]);

  // Focus management for error toasts
  useEffect(() => {
    if (toast.show && toast.type === "error") {
      const retryButton = toastRef.current?.querySelector(
        'button[aria-label*="Retry"]'
      );
      if (retryButton instanceof HTMLElement) {
        // Optional: Move focus to retry button for keyboard users
        // Uncomment if it improves UX after user testing
        // retryButton.focus();
      }
    }
  }, [toast.show, toast.type]);

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

  const toggleMaximize = (): void => setIsMaximized((prev) => !prev);

  const modalContent = (
    <div
      className={`bg-white rounded-xl shadow-xl flex flex-col ${
        isMaximized
          ? "fixed inset-2 z-[10000] w-auto h-auto"
          : "max-w-4xl w-full max-h-[90vh]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 cursor-move">
        <h2 className="font-semibold text-slate-900 truncate">{file.name}</h2>
        <div className="flex items-center gap-2">
          {/* Add to Chat button */}
          {onAddToChat && (
            <button
              onClick={handleAddToChat}
              disabled={isAddingToChat}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              aria-label="Add document to chat"
              aria-busy={isAddingToChat}
              title="Add this document to chat"
            >
              {isAddingToChat ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
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

          {/* Fullscreen toggle */}
          <button
            onClick={toggleMaximize}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
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
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
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
          <p className="text-slate-600">
            Preview not available.{" "}
            <a
              href={file.drive_web_view_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 hover:underline focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 rounded"
            >
              Open in Drive
            </a>
          </p>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div
          ref={toastRef}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          className={`fixed bottom-4 right-4 z-[10001] flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg max-w-md animate-slide-up ${
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
                toast.type === "success" ? "text-green-900" : "text-red-900"
              }`}
            >
              {toast.message}
            </p>
            
            {toast.type === "error" && (
              <button
                onClick={handleRetry}
                className="mt-2 flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                aria-label="Retry adding document to chat"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Retry
              </button>
            )}
          </div>

          <button
            onClick={handleCloseToast}
            className={`p-1 rounded hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              toast.type === "success"
                ? "hover:bg-green-200 focus:ring-green-500"
                : "hover:bg-red-200 focus:ring-red-500"
            }`}
            aria-label="Close notification"
          >
            <X
              className={`w-4 h-4 ${
                toast.type === "success" ? "text-green-600" : "text-red-600"
              }`}
              aria-hidden="true"
            />
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

const mockFile: FileObject = {
  id: "test-file-id",
  name: "Test Document.pdf",
  mime_type: "application/pdf",
  drive_file_id: "drive-123",
  drive_web_view_link: "https://drive.google.com/file/d/drive-123/view",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("DocumentViewerModal - Add to Chat Feature", () => {
  let mockOnClose: jest.Mock;
  let mockOnAddToChat: jest.Mock;

  beforeEach(() => {
    mockOnClose = jest.fn();
    mockOnAddToChat = jest.fn();
    jest.clearAllMocks();
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
      expect(addButton).toHaveTextContent("Add to Chat");
    });

    it("should not render Add to Chat button when onAddToChat is not provided", () => {
      render(<DocumentViewerModal file={mockFile} onClose={mockOnClose} />);

      const addButton = screen.queryByRole("button", {
        name: /add document to chat/i,
      });
      expect(addButton).not.toBeInTheDocument();
    });

    it("should display MessageSquarePlus icon", () => {
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

    it("should be positioned in the header toolbar", () => {
      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const header = screen.getByText(mockFile.name).parentElement;
      const addButton = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      expect(header).toContainElement(addButton);
    });
  });

  describe("Success Flow", () => {
    it("should call onAddToChat with file when button is clicked", async () => {
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

    it("should display success toast after successful add", async () => {
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

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });
  });

  describe("Loading State", () => {
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

      expect(addButton).toHaveAttribute("aria-busy", "true");
      expect(addButton).toBeDisabled();
      expect(addButton).toHaveTextContent("Adding...");

      await waitFor(() => {
        expect(addButton).toHaveAttribute("aria-busy", "false");
      });
    });

    it("should disable button during loading", async () => {
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

      expect(addButton).toBeDisabled();

      await waitFor(() => {
        expect(addButton).not.toBeDisabled();
      });
    });

    it("should prevent multiple simultaneous operations", async () => {
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
      
      // Click multiple times rapidly
      fireEvent.click(addButton);
      fireEvent.click(addButton);
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnAddToChat).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error toast on failure", async () => {
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
        const toast = screen.getByRole("alert");
        expect(toast).toBeInTheDocument();
        expect(toast).toHaveTextContent(/failed to add document to chat/i);
      });
    });

    it("should display network error message for network errors", async () => {
      mockOnAddToChat.mockRejectedValueOnce(new Error("Network error"));

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
        expect(toast).toHaveTextContent(/network error/i);
      });
    });

    it("should display permission error message for permission errors", async () => {
      mockOnAddToChat.mockRejectedValueOnce(
        new Error("Permission denied")
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
        expect(toast).toHaveTextContent(/permission denied/i);
      });
    });

    it("should show retry button on error", async () => {
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
        expect(screen.getByRole("alert")).toBeInTheDocument();
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

    it("should not auto-hide error toasts", async () => {
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
    });
  });

  describe("Toast Management", () => {
    it("should allow manual closing of toast", async () => {
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

    it("should clear timeout when toast is manually closed", async () => {
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

      const closeButton = screen.getByRole("button", {
        name: /close notification/i,
      });
      fireEvent.click(closeButton);

      // Advance timers - toast should not reappear
      jest.advanceTimersByTime(5000);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should clear timeout when component unmounts", async () => {
      jest.useFakeTimers();
      mockOnAddToChat.mockResolvedValueOnce(undefined);

      const { unmount } = render(
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

      // Unmount before timeout completes
      unmount();

      // Should not throw or cause memory leaks
      jest.advanceTimersByTime(5000);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels on button", () => {
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
      expect(addButton).toHaveAttribute("aria-busy", "false");
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
      fireEvent.click(addButton);

      expect(addButton).toHaveAttribute("aria-busy", "true");

      await waitFor(() => {
        expect(addButton).toHaveAttribute("aria-busy", "false");
      });
    });

    it("should have proper role and aria attributes on toast", async () => {
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

      await wait