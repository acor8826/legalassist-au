# Implementation: Add to Chat Button for DocumentViewerModal

## 1. Complete DocumentViewerModal.tsx

```typescript
import React, { useState, useCallback, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import Draggable from "react-draggable";
import { X, MessageSquarePlus, Maximize2, Minimize2, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { FileObject } from "./DocumentCard";

interface DocumentViewerModalProps {
  file: FileObject | null;
  onClose: () => void;
  onAddToChat?: (file: FileObject) => Promise<void>;
}

type ToastType = "success" | "error";
type ErrorType = "network" | "permission" | "generic";

interface ChatError extends Error {
  code?: string;
  statusCode?: number;
}

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

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
  const [isMaximized, setIsMaximized] = useState(false);
  const [isAddingToChat, setIsAddingToChat] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      toastTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      toastTimeoutsRef.current.clear();
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timeout = toastTimeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      toastTimeoutsRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: Toast = { id, type, message };

      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss after 5 seconds
      const timeout = setTimeout(() => {
        removeToast(id);
      }, 5000);

      toastTimeoutsRef.current.set(id, timeout);
    },
    [removeToast]
  );

  const getErrorType = useCallback((error: unknown): ErrorType => {
    if (error instanceof Error) {
      const chatError = error as ChatError;

      // Check error codes first (more reliable than string matching)
      if (chatError.code === "NETWORK_ERROR" || chatError.statusCode === 0) {
        return "network";
      }
      if (
        chatError.statusCode === 403 ||
        chatError.code === "PERMISSION_DENIED"
      ) {
        return "permission";
      }

      // Fallback to message checking
      const message = error.message.toLowerCase();
      if (
        message.includes("network") ||
        message.includes("fetch") ||
        message.includes("connection")
      ) {
        return "network";
      }
      if (
        message.includes("permission") ||
        message.includes("unauthorized") ||
        message.includes("forbidden")
      ) {
        return "permission";
      }
    }
    return "generic";
  }, []);

  const handleAddToChat = useCallback(async (): Promise<void> => {
    if (!onAddToChat || !file || isAddingToChat) return;

    setIsAddingToChat(true);

    try {
      await onAddToChat(file);
      showToast("success", "Document added to chat");
    } catch (error) {
      const errorType = getErrorType(error);
      const errorMessage = ERROR_MESSAGES[errorType];
      showToast("error", errorMessage);
      console.error("Error adding document to chat:", error);
    } finally {
      setIsAddingToChat(false);
    }
  }, [file, onAddToChat, showToast, getErrorType, isAddingToChat]);

  const handleRetry = useCallback(
    (toastId: string) => {
      removeToast(toastId);
      handleAddToChat();
    },
    [removeToast, handleAddToChat]
  );

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

  const toggleMaximize = () => setIsMaximized((prev) => !prev);

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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                isAddingToChat
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-sky-50 text-sky-700 hover:bg-sky-100 hover:text-sky-800 active:bg-sky-200"
              }`}
              aria-label="Add document to chat"
              aria-busy={isAddingToChat}
              title={
                isAddingToChat
                  ? "Adding to chat..."
                  : "Add this document to chat"
              }
            >
              {isAddingToChat ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <MessageSquarePlus className="w-4 h-4" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">
                {isAddingToChat ? "Adding..." : "Add to Chat"}
              </span>
            </button>
          )}

          {/* Fullscreen toggle */}
          <button
            onClick={toggleMaximize}
            className="text-slate-500 hover:text-slate-700 p-1 rounded transition-colors hover:bg-slate-100"
            aria-label={isMaximized ? "Restore window size" : "Maximize window"}
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 p-1 rounded transition-colors hover:bg-slate-100"
            aria-label="Close document viewer"
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

      {/* Toast notifications */}
      <div
        className="fixed bottom-4 right-4 z-[10001] flex flex-col gap-2 pointer-events-none"
        aria-live="assertive"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg max-w-md ${
              toast.type === "success"
                ? "bg-green-50 text-green-900 border border-green-200"
                : "bg-red-50 text-red-900 border border-red-200"
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
              <p className="text-sm font-medium">{toast.message}</p>
              {toast.type === "error" && (
                <button
                  onClick={() => handleRetry(toast.id)}
                  className="mt-2 text-xs font-semibold text-red-700 hover:text-red-800 underline"
                  aria-label="Retry adding document to chat"
                >
                  Retry
                </button>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className={`flex-shrink-0 p-1 rounded transition-colors ${
                toast.type === "success"
                  ? "text-green-600 hover:text-green-800 hover:bg-green-100"
                  : "text-red-600 hover:text-red-800 hover:bg-red-100"
              }`}
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
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
  id: "test-file-123",
  name: "Test Document.pdf",
  mime_type: "application/pdf",
  drive_file_id: "drive-file-123",
  drive_web_view_link: "https://drive.google.com/file/d/drive-file-123/view",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("DocumentViewerModal - Add to Chat Feature", () => {
  let mockOnClose: jest.Mock;
  let mockOnAddToChat: jest.Mock;

  beforeEach(() => {
    mockOnClose = jest.fn();
    mockOnAddToChat = jest.fn();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Button Rendering", () => {
    it("should render Add to Chat button when onAddToChat prop is provided", () => {
      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const button = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Add to Chat");
    });

    it("should not render Add to Chat button when onAddToChat prop is not provided", () => {
      render(<DocumentViewerModal file={mockFile} onClose={mockOnClose} />);

      const button = screen.queryByRole("button", {
        name: /add document to chat/i,
      });
      expect(button).not.toBeInTheDocument();
    });

    it("should render MessageSquarePlus icon", () => {
      const { container } = render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const button = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      const svg = button.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should have correct styling classes", () => {
      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const button = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      expect(button).toHaveClass(
        "bg-sky-50",
        "text-sky-700",
        "hover:bg-sky-100"
      );
    });
  });

  describe("Button Interaction", () => {
    it("should call onAddToChat with correct file when clicked", async () => {
      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const button = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnAddToChat).toHaveBeenCalledTimes(1);
        expect(mockOnAddToChat).toHaveBeenCalledWith(mockFile);
      });
    });

    it("should prevent multiple simultaneous clicks", async () => {
      let resolveAdd: () => void;
      const addPromise = new Promise<void>((resolve) => {
        resolveAdd = resolve;
      });
      mockOnAddToChat.mockReturnValue(addPromise);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const button = screen.getByRole("button", {
        name: /add document to chat/i,
      });

      // Click multiple times rapidly
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      // Resolve the promise
      resolveAdd!();

      await waitFor(() => {
        expect(mockOnAddToChat).toHaveBeenCalledTimes(1);
      });
    });

    it("should use the correct file even if prop changes during operation", async () => {
      const file1 = { ...mockFile, id: "file-1", name: "File 1.pdf" };
      const file2 = { ...mockFile, id: "file-2", name: "File 2.pdf" };

      let resolveAdd: () => void;
      const addPromise = new Promise<void>((resolve) => {
        resolveAdd = resolve;
      });
      mockOnAddToChat.mockReturnValue(addPromise);

      const { rerender } = render(
        <DocumentViewerModal
          file={file1}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const button = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(button);

      // Change file while operation is in progress
      rerender(
        <DocumentViewerModal
          file={file2}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      resolveAdd!();

      await waitFor(() => {
        expect(mockOnAddToChat).toHaveBeenCalledWith(file1);
      });
    });
  });

  describe("Loading States", () => {
    it("should show loading spinner while processing", async () => {
      let resolveAdd: () => void;
      const addPromise = new Promise<void>((resolve) => {
        resolveAdd = resolve;
      });
      mockOnAddToChat.mockReturnValue(addPromise);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const button = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(button);

      // Check loading state
      await waitFor(() => {
        expect(button).toHaveAttribute("aria-busy", "true");
        expect(button).toHaveTextContent("Adding...");
        expect(button).toBeDisabled();
      });

      // Check for spinner icon
      const spinner = button.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();

      // Resolve and check loading state is cleared
      resolveAdd!();

      await waitFor(() => {
        expect(button).toHaveAttribute("aria-busy", "false");
        expect(button).toHaveTextContent("Add to Chat");
        expect(button).not.toBeDisabled();
      });
    });

    it("should disable button during processing", async () => {
      let resolveAdd: () => void;
      const addPromise = new Promise<void>((resolve) => {
        resolveAdd = resolve;
      });
      mockOnAddToChat.mockReturnValue(addPromise);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const button = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      expect(button).not.toBeDisabled();

      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });

      resolveAdd!();

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });

    it("should apply disabled styling during processing", async () => {
      let resolveAdd: () => void;
      const addPromise = new Promise<void>((resolve) => {
        resolveAdd = resolve;
      });
      mockOnAddToChat.mockReturnValue(addPromise);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const button = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveClass(
          "bg-slate-100",
          "text-slate-400",
          "cursor-not-allowed"
        );
      });

      resolveAdd!();

      await waitFor(() => {
        expect(button).toHaveClass("bg-sky-50", "text-sky-700");
      });
    });
  });

  describe("Success Toast", () => {
    it("should display success toast when document is added successfully", async () => {
      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const button = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(button);

      await waitFor(() => {
        const toast = screen.getByRole("alert");
        expect(toast).toBeInTheDocument();
        expect(toast).toHaveTextContent("Document added to chat");
      });
    });

    it("should display success toast with correct styling", async () => {
      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const button = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(button);

      await waitFor(() => {
        const toast = screen.getByRole("alert");
        expect(toast).toHaveClass("bg-green-50", "text-green-900");
      });
    });

    it("should show CheckCircle icon in success toast", async () => {
      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const button = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(button);

      await waitFor(() => {
        const toast = screen.getByRole("alert");
        const icon = toast.querySelector("svg");
        expect(icon).toBeInTheDocument();
      });
    });

    it("should auto-dismiss success toast after 5 seconds", async () => {
      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const button = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });

      // Fast-forward time by 5 seconds
      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });

    it("should allow manual dismissal of success toast", async () => {
      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const button = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });

      const dismissButton = screen.getByRole("button", {
        name: /dismiss notification/i,
      });
      fireEvent.click(dismissButton);

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error toast on failure", async () => {
      const error = new Error("Test error");
      mockOnAddToChat.mockRejectedValueOnce(error);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const button = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(button);

      await waitFor(() => {
        const toast = screen.getByRole("alert");
        expect(toast).toBeInTheDocument();
        expect(toast).toHaveTextContent(
          "Failed to add document to chat. Please try again."
        );
      });
    });

    it("should display network error message for network errors", async () => {
      const error = new Error("Network error occurred");
      mockOnAddToChat.mockRejectedValueOnce(error);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const button = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(button);

      await waitFor(() => {
        const toast = screen.getByRole("alert");
        expect(toast).toHaveTextContent(
          "Network error. Please check your connection and try again."
        );
      });
    });

    it("should display permission error message for permission errors", async () => {
      const error = new Error("Permission denied");
      mockOnAddToChat.mockRejectedValueOnce(error);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const button = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(button);

      await waitFor(() => {
        const toast = screen.getByRole("alert");
        expect(toast).toHaveTextContent(
          "Permission denied. You may not have access to add this document."
        );
      });
    });

    it("should detect network errors by status code", async () => {
      const error = new Error("Request failed") as any;
      error.statusCode = 0;
      mockOnAddToChat.mockRejectedValueOnce(error);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const button = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(button);

      await waitFor(() => {
        const toast = screen.getByRole("alert");
        expect(toast).toHaveTextContent(
          "Network error. Please check your connection and try again."
        );
      });
    });

    it("should detect permission errors by status code", async () => {
      const error = new Error("Forbidden") as any;
      error.statusCode = 403;
      mockOnAddToChat.mockRejectedValueOnce(error);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const button = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(button);

      await waitFor(() => {
        const toast = screen.getByRole("alert");
        expect(toast).toHaveTextContent(
          "Permission denied. You may not have access to add this document."
        );
      });
    });

    it("should detect errors by error code", async () => {
      const error = new Error("Error") as any;
      error.code = "NETWORK_ERROR";
      mockOnAddToChat.mockRejectedValueOnce(error);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const button = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(button);

      await waitFor(() => {
        const toast = screen.getByRole("alert");
        expect(toast).toHaveTextContent(
          "Network error. Please check your connection and try again."
        );
      });
    });

    it("should log errors to console", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation();
      const testError = new Error("Test error");
      mockOnAddToChat.mockRejectedValueOnce(testError);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const button = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error adding document to chat:",
          testError
        );
      });

      consoleErrorSpy