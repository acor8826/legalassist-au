# ⚠️ INCOMPLETE

Maximum iterations (5) reached without approval.

## Latest Implementation
# Implementation: Add to Chat Button for DocumentViewerModal

## 1. Complete DocumentViewerModal.tsx

```typescript
import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import Draggable from "react-draggable";
import { X, MessageSquarePlus, Maximize2, Minimize2, Loader2 } from "lucide-react";
import { FileObject } from "./DocumentCard";

interface DocumentViewerModalProps {
  file: FileObject | null;
  onClose: () => void;
  onAddToChat?: (file: FileObject) => Promise<void>;
}

type ToastType = "success" | "error";
type ErrorType = "network" | "permission" | "generic";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

const ERROR_MESSAGES: Record<ErrorType, string> = {
  network: "Network error. Please check your connection and try again.",
  permission: "Permission denied. You may not have access to add this document.",
  generic: "Failed to add document to chat. Please try again.",
} as const;

function DocumentViewerModalContent({
  file,
  onClose,
  onAddToChat,
}: DocumentViewerModalProps) {
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isAddingToChat, setIsAddingToChat] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const isProcessingRef = useRef<boolean>(false);

  // Cleanup all toast timeouts on unmount
  useEffect(() => {
    return () => {
      toastTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      toastTimeoutsRef.current.clear();
    };
  }, []);

  const getErrorType = useCallback((error: unknown): ErrorType => {
    if (!error) return "generic";

    const errorMessage =
      error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

    if (
      errorMessage.includes("network") ||
      errorMessage.includes("fetch") ||
      errorMessage.includes("connection")
    ) {
      return "network";
    }

    if (
      errorMessage.includes("permission") ||
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("forbidden") ||
      errorMessage.includes("403")
    ) {
      return "permission";
    }

    return "generic";
  }, []);

  const showToast = useCallback((type: ToastType, message: string): void => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, type, message };
    setToasts((prev) => [...prev, newToast]);

    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      const timeoutRef = toastTimeoutsRef.current.get(id);
      if (timeoutRef) {
        clearTimeout(timeoutRef);
        toastTimeoutsRef.current.delete(id);
      }
    }, 5000);

    toastTimeoutsRef.current.set(id, timeout);
  }, []);

  const removeToast = useCallback((id: string): void => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timeout = toastTimeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      toastTimeoutsRef.current.delete(id);
    }
  }, []);

  const handleAddToChat = useCallback(async (): Promise<void> => {
    if (!onAddToChat || !file) return;

    // Prevent race conditions with ref-based guard
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

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
      isProcessingRef.current = false;
    }
  }, [file, onAddToChat, showToast, getErrorType]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>): void => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleAddToChat();
      }
    },
    [handleAddToChat]
  );

  if (!file) return null;

  const isImage = file.mime_type.startsWith("image/");
  const isPDF = file.mime_type === "application/pdf";
  const isOfficeDoc =
    file.mime_type.includes("word") ||
    file.mime_type.includes("presentation") ||
    file.mime_type.includes("sheet");

  const getPreviewUrl = (): string | null => {
    if (file.drive_file_id) {
      return `https://drive.google.com/file/d/${file.drive_file_id}/preview`;
    }
    return file.drive_web_view_link ?? null;
  };

  const googleDrivePreview = getPreviewUrl();

  const toggleMaximize = (): void => setIsMaximized((prev) => !prev);

  const modalContent = (
    <div
      className={`bg-white rounded-xl shadow-xl flex flex-col ${
        isMaximized
          ? "fixed inset-2 z-[10000] w-auto h-auto"
          : "max-w-4xl w-full max-h-[90vh]"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="document-viewer-title"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 cursor-move">
        <h2
          id="document-viewer-title"
          className="font-semibold text-slate-900 truncate"
        >
          {file.name}
        </h2>
        <div className="flex items-center gap-2">
          {/* Add to Chat button */}
          {onAddToChat && (
            <button
              onClick={handleAddToChat}
              onKeyDown={handleKeyDown}
              disabled={isAddingToChat}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              aria-label={
                isAddingToChat
                  ? "Adding document to chat"
                  : "Add document to chat"
              }
              aria-busy={isAddingToChat}
              title={
                isAddingToChat ? "Adding to chat..." : "Add this document to chat"
              }
              type="button"
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
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            aria-label={isMaximized ? "Restore window size" : "Maximize window"}
            title={isMaximized ? "Restore" : "Maximize"}
            type="button"
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
            type="button"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isImage ? (
          <img
            src={file.drive_web_view_link ?? ""}
            alt={file.name}
            className="max-h-[75vh] mx-auto rounded"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="flex items-center justify-center h-[75vh] text-slate-600">
                    <p>Failed to load image</p>
                  </div>
                `;
              }
            }}
          />
        ) : isPDF || isOfficeDoc ? (
          googleDrivePreview ? (
            <iframe
              src={googleDrivePreview}
              className="w-full h-[75vh] border-0 rounded"
              title={`Preview of ${file.name}`}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          ) : (
            <div className="flex items-center justify-center h-[75vh] text-slate-600">
              <div className="text-center">
                <p className="mb-2">Preview not available for this document.</p>
                {file.drive_web_view_link && (
                  <a
                    href={file.drive_web_view_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 hover:underline focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 rounded"
                  >
                    Open in Google Drive
                  </a>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-[75vh] text-slate-600">
            <div className="text-center">
              <p className="mb-2">Preview not available.</p>
              {file.drive_web_view_link && (
                <a
                  href={file.drive_web_view_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:underline focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 rounded"
                >
                  Open in Drive
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast Container */}
      {toasts.length > 0 && (
        <div
          className="fixed bottom-4 right-4 z-[10001] flex flex-col-reverse gap-2 max-h-screen overflow-y-auto pointer-events-none"
          aria-live="polite"
          aria-atomic="false"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              role="alert"
              aria-live="assertive"
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md animate-slide-in ${
                toast.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <span className="flex-1 text-sm font-medium">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className={`p-1 rounded hover:bg-white/50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  toast.type === "success"
                    ? "focus:ring-green-500"
                    : "focus:ring-red-500"
                }`}
                aria-label="Dismiss notification"
                type="button"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {isMaximized ? (
        modalContent
      ) : (
        <Draggable handle=".cursor-move" cancel="button,a,iframe,img">
          {modalContent}
        </Draggable>
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

// Mock react-draggable
jest.mock("react-draggable", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockFile: FileObject = {
  id: "test-file-1",
  name: "Test Document.pdf",
  mime_type: "application/pdf",
  size: 1024000,
  created_time: "2024-01-01T00:00:00Z",
  modified_time: "2024-01-02T00:00:00Z",
  drive_file_id: "drive-file-123",
  drive_web_view_link: "https://drive.google.com/file/d/drive-file-123/view",
  thumbnail_link: "https://drive.google.com/thumbnail/drive-file-123",
  owner_name: "Test Owner",
  owner_email: "owner@test.com",
  shared: false,
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
      const icon = button.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should have proper styling classes", () => {
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
      expect(button).toHaveClass("text-sky-600", "hover:text-sky-800");
    });
  });

  describe("Button Functionality", () => {
    it("should call onAddToChat with file when button is clicked", async () => {
      mockOnAddToChat.mockResolvedValue(undefined);

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

    it("should show loading state while processing", async () => {
      mockOnAddToChat.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

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
        expect(button).toHaveAttribute("aria-busy", "true");
        expect(button).toHaveAttribute("aria-label", "Adding document to chat");
        expect(button).toHaveTextContent("Adding...");
        expect(button).toBeDisabled();
      });
    });

    it("should show loading spinner during processing", async () => {
      mockOnAddToChat.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

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
        const spinner = button.querySelector(".animate-spin");
        expect(spinner).toBeInTheDocument();
      });
    });

    it("should prevent multiple simultaneous clicks", async () => {
      mockOnAddToChat.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

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
      fireEvent.click(button);
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnAddToChat).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Success Toast", () => {
    it("should show success toast after successful add", async () => {
      mockOnAddToChat.mockResolvedValue(undefined);

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
        expect(toast).toHaveTextContent("Document added to chat");
        expect(toast).toHaveClass("bg-green-50");
      });
    });

    it("should auto-dismiss success toast after 5 seconds", async () => {
      mockOnAddToChat.mockResolvedValue(undefined);

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

      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });

    it("should allow manual dismissal of success toast", async () => {
      mockOnAddToChat.mockResolvedValue(undefined);

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
    it("should show generic error toast on failure", async () => {
      mockOnAddToChat.mockRejectedValue(new Error("Something went wrong"));

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
          "Failed to add document to chat. Please try again."
        );
        expect(toast).toHaveClass("bg-red-50");
      });
    });

    it("should show network error toast for network errors", async () => {
      mockOnAddToChat.mockRejectedValue(new Error("Network connection failed"));

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

    it("should show permission error toast for permission errors", async () => {
      mockOnAddToChat.mockRejectedValue(new Error("403 Forbidden"));

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

    it("should handle non-Error objects thrown", async () => {
      mockOnAddToChat.mockRejectedValue("String error");

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
          "Failed to add document to chat. Please try again."
        );
      });
    });

    it("should log error to console", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const testError = new Error("Test error");
      mockOnAddToChat.mockRejectedValue(testError);

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

      consoleErrorSpy.mockRestore();
    });

    it("should re-enable button after error", async () => {
      mockOnAddToChat.mockRejectedValue(new Error("Test error"));

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

      expect(button).not.toBeDisabled();
      expect(button).toHaveAttribute("aria-busy", "false");
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

      const button = screen.getByRole("button", {
        name: /add document to chat/i,
      });
      expect(button).toHaveAttribute("aria-label", "Add document to chat");
      expect(button).toHaveAttribute("type", "button");
    });

    it("should update ARIA labels during loading", async () => {
      mockOnAddToChat.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

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
        expect(button).toHaveAttribute("aria-label", "Adding document to chat");
        expect(button).toHaveAttribute("aria-busy", "true");
      });
    });

    it("should support keyboard interaction with Enter key", async () => {
      mockOnAddToChat.mockResolvedValue(undefined);

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
      button.focus();
      fireEvent.keyDown(button, { key: "Enter", code: "Enter" });

      await waitFor(() => {
        expect(mockOnAddToChat).toHaveBeenCalledTimes(1);
      });
    });

    it("should support keyboard interaction with Space key", async () => {
      mockOnAddToChat.mockResolvedValue(undefined);

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
      button.focus();
      fireEvent.keyDown(button, { key: " ", code: "Space" });

      await waitFor(() => {
        expect(mockOnAddToChat).toHaveBeenCalledTimes(1);
      });
    });

    it("should not trigger on other keys", async () => {
      mockOnAddToChat.mockResolvedValue(undefined);

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
      button.focus();
      fireEvent.keyDown(button, { key: "a", code: "KeyA" });

      await waitFor(() => {
        expect(mockOnAddToChat).not.toHaveBeenCalled();
      });
    });

    it("should have aria-live region for

## Manual Steps
1. Review the latest iteration
2. Complete implementation manually
3. Run tests and verify
