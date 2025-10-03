# Implementation: Add to Chat Button for DocumentViewerModal

## 1. Complete DocumentViewerModal.tsx

```typescript
import React, { useState } from "react";
import ReactDOM from "react-dom";
import Draggable from "react-draggable";
import { X, MessageSquarePlus, Maximize2, Minimize2, Loader2 } from "lucide-react";
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
  retryAction?: () => void;
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

  const handleAddToChat = async (): Promise<void> => {
    if (!onAddToChat || isAddingToChat) return;

    setIsAddingToChat(true);
    setToast({ show: false, type: "success", message: "" });

    try {
      await onAddToChat(file);
      setToast({
        show: true,
        type: "success",
        message: "Document added to chat",
      });

      // Auto-hide success toast after 3 seconds
      setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add document to chat";

      setToast({
        show: true,
        type: "error",
        message: errorMessage,
        retryAction: handleAddToChat,
      });
    } finally {
      setIsAddingToChat(false);
    }
  };

  const handleToastClose = (): void => {
    setToast({ show: false, type: "success", message: "" });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleAddToChat();
    }
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
              onKeyDown={handleKeyDown}
              disabled={isAddingToChat}
              className="flex items-center gap-2 px-3 py-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              title="Add this document to chat"
              aria-label={`Add ${file.name} to chat`}
              aria-busy={isAddingToChat}
            >
              {isAddingToChat ? (
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              ) : (
                <MessageSquarePlus className="w-5 h-5" aria-hidden="true" />
              )}
              <span className="text-sm font-medium hidden sm:inline">
                {isAddingToChat ? "Adding..." : "Add to Chat"}
              </span>
            </button>
          )}

          {/* Fullscreen toggle */}
          <button
            onClick={toggleMaximize}
            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            title={isMaximized ? "Restore" : "Maximize"}
            aria-label={isMaximized ? "Restore window size" : "Maximize window"}
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
            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            title="Close"
            aria-label="Close document viewer"
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
          className={`fixed bottom-4 right-4 z-[10001] max-w-md rounded-lg shadow-lg p-4 ${
            toast.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  toast.type === "success" ? "text-green-800" : "text-red-800"
                }`}
              >
                {toast.message}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {toast.type === "error" && toast.retryAction && (
                <button
                  onClick={toast.retryAction}
                  className="text-sm font-medium text-red-700 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1"
                  aria-label="Retry adding document to chat"
                >
                  Retry
                </button>
              )}
              <button
                onClick={handleToastClose}
                className={`${
                  toast.type === "success"
                    ? "text-green-500 hover:text-green-700"
                    : "text-red-500 hover:text-red-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 rounded ${
                  toast.type === "success"
                    ? "focus:ring-green-500"
                    : "focus:ring-red-500"
                }`}
                aria-label="Close notification"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
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
      role="presentation"
    >
      {isMaximized ? (
        modalContent
      ) : (
        <Draggable handle=".cursor-move" cancel="button, a, iframe, img">
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
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import DocumentViewerModal from "./DocumentViewerModal";
import { FileObject } from "./DocumentCard";

// Mock react-draggable
jest.mock("react-draggable", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="draggable">{children}</div>
  ),
}));

// Mock ReactDOM.createPortal
jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  createPortal: (node: React.ReactNode) => node,
}));

describe("DocumentViewerModal", () => {
  const mockFile: FileObject = {
    id: "file-1",
    name: "Test Document.pdf",
    mime_type: "application/pdf",
    drive_file_id: "drive-123",
    drive_web_view_link: "https://drive.google.com/file/d/drive-123/view",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  const mockOnClose = jest.fn();
  const mockOnAddToChat = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe("Rendering", () => {
    it("should render modal with file name", () => {
      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      expect(screen.getByText("Test Document.pdf")).toBeInTheDocument();
    });

    it("should not render when file is null", () => {
      const { container } = render(
        <DocumentViewerModal
          file={null}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should render Add to Chat button when onAddToChat is provided", () => {
      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      expect(screen.getByRole("button", { name: /add.*to chat/i })).toBeInTheDocument();
      expect(screen.getByText("Add to Chat")).toBeInTheDocument();
    });

    it("should not render Add to Chat button when onAddToChat is not provided", () => {
      render(<DocumentViewerModal file={mockFile} onClose={mockOnClose} />);

      expect(screen.queryByRole("button", { name: /add.*to chat/i })).not.toBeInTheDocument();
    });

    it("should render with proper ARIA attributes", () => {
      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-labelledby", "modal-title");

      const addButton = screen.getByRole("button", { name: /add.*to chat/i });
      expect(addButton).toHaveAttribute("aria-label", "Add Test Document.pdf to chat");
      expect(addButton).toHaveAttribute("aria-busy", "false");
    });
  });

  describe("Add to Chat Functionality", () => {
    it("should call onAddToChat when button is clicked", async () => {
      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", { name: /add.*to chat/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnAddToChat).toHaveBeenCalledWith(mockFile);
        expect(mockOnAddToChat).toHaveBeenCalledTimes(1);
      });
    });

    it("should show loading state while adding to chat", async () => {
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockOnAddToChat.mockReturnValue(promise);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", { name: /add.*to chat/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("Adding...")).toBeInTheDocument();
        expect(addButton).toHaveAttribute("aria-busy", "true");
        expect(addButton).toBeDisabled();
      });

      resolvePromise!();
    });

    it("should display success toast after successfully adding to chat", async () => {
      jest.useFakeTimers();
      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", { name: /add.*to chat/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText("Document added to chat")).toBeInTheDocument();
      });

      // Toast should auto-hide after 3 seconds
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it("should display error toast when adding to chat fails", async () => {
      mockOnAddToChat.mockRejectedValueOnce(new Error("Network error"));

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", { name: /add.*to chat/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });
    });

    it("should show retry button in error toast", async () => {
      mockOnAddToChat.mockRejectedValueOnce(new Error("Network error"));

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", { name: /add.*to chat/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
      });
    });

    it("should retry adding to chat when retry button is clicked", async () => {
      mockOnAddToChat
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", { name: /add.*to chat/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });

      const retryButton = screen.getByRole("button", { name: /retry/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockOnAddToChat).toHaveBeenCalledTimes(2);
        expect(screen.getByText("Document added to chat")).toBeInTheDocument();
      });
    });

    it("should handle generic error without error message", async () => {
      mockOnAddToChat.mockRejectedValueOnce("Unknown error");

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", { name: /add.*to chat/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("Failed to add document to chat")).toBeInTheDocument();
      });
    });

    it("should not call onAddToChat when button is disabled", async () => {
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockOnAddToChat.mockReturnValue(promise);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", { name: /add.*to chat/i });
      
      // First click
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(addButton).toBeDisabled();
      });

      // Second click while disabled
      fireEvent.click(addButton);

      expect(mockOnAddToChat).toHaveBeenCalledTimes(1);

      resolvePromise!();
    });
  });

  describe("Keyboard Accessibility", () => {
    it("should trigger add to chat on Enter key", async () => {
      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", { name: /add.*to chat/i });
      addButton.focus();
      fireEvent.keyDown(addButton, { key: "Enter", code: "Enter" });

      await waitFor(() => {
        expect(mockOnAddToChat).toHaveBeenCalledWith(mockFile);
      });
    });

    it("should trigger add to chat on Space key", async () => {
      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", { name: /add.*to chat/i });
      addButton.focus();
      fireEvent.keyDown(addButton, { key: " ", code: "Space" });

      await waitFor(() => {
        expect(mockOnAddToChat).toHaveBeenCalledWith(mockFile);
      });
    });

    it("should have focus ring styles", () => {
      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", { name: /add.*to chat/i });
      expect(addButton).toHaveClass("focus:outline-none", "focus:ring-2", "focus:ring-sky-500");
    });
  });

  describe("Toast Notifications", () => {
    it("should close toast when close button is clicked", async () => {
      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", { name: /add.*to chat/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });

      const closeToastButton = screen.getByRole("button", { name: /close notification/i });
      fireEvent.click(closeToastButton);

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });

    it("should have proper ARIA attributes for toast", async () => {
      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", { name: /add.*to chat/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        const alert = screen.getByRole("alert");
        expect(alert).toHaveAttribute("aria-live", "polite");
        expect(alert).toHaveAttribute("aria-atomic", "true");
      });
    });
  });

  describe("Document Types", () => {
    it("should work with Google Docs", async () => {
      const docFile: FileObject = {
        ...mockFile,
        name: "Document.docx",
        mime_type: "application/vnd.google-apps.document",
      };

      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={docFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", { name: /add.*to chat/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnAddToChat).toHaveBeenCalledWith(docFile);
      });
    });

    it("should work with Google Sheets", async () => {
      const sheetFile: FileObject = {
        ...mockFile,
        name: "Spreadsheet.xlsx",
        mime_type: "application/vnd.google-apps.spreadsheet",
      };

      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={sheetFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", { name: /add.*to chat/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnAddToChat).toHaveBeenCalledWith(sheetFile);
      });
    });

    it("should work with Google Slides", async () => {
      const slideFile: FileObject = {
        ...mockFile,
        name: "Presentation.pptx",
        mime_type: "application/vnd.google-apps.presentation",
      };

      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={slideFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", { name: /add.*to chat/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnAddToChat).toHaveBeenCalledWith(slideFile);
      });
    });

    it("should work with images", async () => {
      const imageFile: FileObject = {
        ...mockFile,
        name: "Image.png",
        mime_type: "image/png",
      };

      mockOnAddToChat.mockResolvedValueOnce(undefined);

      render(
        <DocumentViewerModal
          file={imageFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", { name: /add.*to chat/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnAddToChat).toHaveBeenCalledWith(imageFile);
      });
    });
  });

  describe("Modal Controls", () => {
    it("should close modal when close button is clicked", () => {
      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const closeButton = screen.getByRole("button", { name: /close document viewer/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should toggle maximize state", () => {
      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const maximizeButton = screen.getByRole("button", { name: /maximize window/i });
      fireEvent.click(maximizeButton);

      expect(screen.getByRole("button", { name: /restore window size/i })).toBeInTheDocument();
    });

    it("should close modal when clicking backdrop", () => {
      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const backdrop = screen.getByRole("presentation");
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should not close modal when clicking inside modal", () => {
      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const dialog = screen.getByRole("dialog");
      fireEvent.click(dialog);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Button States and Styling", () => {
    it("should have correct styling classes", () => {
      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", { name: /add.*to chat/i });
      expect(addButton).toHaveClass(
        "flex",
        "items-center",
        "gap-2",
        "text-sky-600",
        "hover:text-sky-800"
      );
    });

    it("should show disabled styles when loading", async () => {
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockOnAddToChat.mockReturnValue(promise);

      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const addButton = screen.getByRole("button", { name: /add.*to chat/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(addButton).toHaveClass("disabled:opacity-50", "disabled:cursor-not-allowed");
      });

      resolvePromise!();
    });

    it("should hide button text on small screens", () => {
      render(
        <DocumentViewerModal
          file={mockFile}
          onClose={mockOnClose}
          onAddToChat={mockOnAddToChat}
        />
      );

      const buttonText = screen.getByText("Add to Chat");
      expect(buttonText).toHaveClass("hidden", "sm:inline");
    });
  });
});
```

## 3. Implementation Notes

### Key Features Implemented:

1. **"Add to Chat" Button**:
   - Positioned in modal header toolbar next to maximize/close buttons
   - Uses `MessageSquarePlus`