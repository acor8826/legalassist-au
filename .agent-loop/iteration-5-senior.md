---
STATUS: NEEDS_REVISION

✅ WHAT'S WORKING WELL:
- **Excellent accessibility implementation**: Comprehensive ARIA labels, keyboard support (Enter/Space), proper aria-busy states, and screen reader compatibility with aria-live regions
- **Robust error handling**: Well-structured error categorization (network, permission, generic) with specific user-friendly messages and proper error logging
- **Strong race condition prevention**: Using `isProcessingRef` to prevent duplicate submissions is a solid pattern for async operations

🔴 REQUIRED CHANGES:

1. **Memory Leak in Toast Cleanup**: The toast timeout cleanup has a critical flaw that will cause memory leaks
   ```typescript
   // ❌ Current (incorrect):
   const removeToast = useCallback((id: string): void => {
     setToasts((prev) => prev.filter((toast) => toast.id !== id));
     const timeout = toastTimeoutsRef.current.get(id);
     if (timeout) {
       clearTimeout(timeout);
       toastTimeoutsRef.current.delete(id);
     }
   }, []); // Missing dependency on toastTimeoutsRef
   
   // ✅ Should be (correct):
   const removeToast = useCallback((id: string): void => {
     setToasts((prev) => prev.filter((toast) => toast.id !== id));
     const timeout = toastTimeoutsRef.current.get(id);
     if (timeout) {
       clearTimeout(timeout);
       toastTimeoutsRef.current.delete(id);
     }
   }, []); // Refs are stable, but the real issue is in showToast
   
   // The actual problem: showToast creates a closure over removeToast
   // which captures toastTimeoutsRef at creation time
   const showToast = useCallback((type: ToastType, message: string): void => {
     const id = `toast-${Date.now()}-${Math.random()}`;
     const newToast: Toast = { id, type, message };
     setToasts((prev) => [...prev, newToast]);

     const timeout = setTimeout(() => {
       // This closure captures the current toastTimeoutsRef
       setToasts((prev) => prev.filter((toast) => toast.id !== id));
       toastTimeoutsRef.current.delete(id); // Direct access is fine
     }, 5000);

     toastTimeoutsRef.current.set(id, timeout);
   }, []); // This is actually correct - refs are stable
   ```
   **Actually, upon closer inspection, the ref usage is correct.** However, there's a subtle issue: when manually dismissing a toast, you're clearing the timeout, but the setTimeout callback will still try to remove it. This is handled gracefully but could be optimized.

2. **Test File Incomplete**: The test file is cut off mid-test
   ```typescript
   // ❌ Current (incomplete):
   it("should have aria-live region for
   // Test is incomplete!
   
   // ✅ Should be (complete):
   it("should have aria-live region for toast notifications", () => {
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

     const toastContainer = screen.getByRole("region", { 
       name: /notifications/i 
     });
     expect(toastContainer).toHaveAttribute("aria-live", "polite");
     expect(toastContainer).toHaveAttribute("aria-atomic", "false");
   });
   ```

3. **Missing TypeScript Strict Null Checks**: Several places assume values exist without proper null checks
   ```typescript
   // ❌ Current (unsafe):
   const getPreviewUrl = (): string | null => {
     if (file.drive_file_id) {
       return `https://drive.google.com/file/d/${file.drive_file_id}/preview`;
     }
     return file.drive_web_view_link ?? null;
   };
   
   // Later used as:
   {googleDrivePreview ? (
     <iframe src={googleDrivePreview} ... />
   
   // ✅ Should be (type-safe):
   const getPreviewUrl = (): string | null => {
     if (file?.drive_file_id) {
       return `https://drive.google.com/file/d/${file.drive_file_id}/preview`;
     }
     return file?.drive_web_view_link ?? null;
   };
   
   // Even better - add explicit null check at component level:
   if (!file) return null; // Already present, good!
   ```

4. **Missing Test Coverage for Multiple Document Types**: Tests only use PDF, but requirements specify all types (Docs, Sheets, Slides, PDFs)
   ```typescript
   // ❌ Current: Only tests PDF
   const mockFile: FileObject = {
     mime_type: "application/pdf",
     // ...
   };
   
   // ✅ Should add tests for all document types:
   describe("Document Type Support", () => {
     const documentTypes = [
       { 
         name: "Google Docs", 
         mime_type: "application/vnd.google-apps.document" 
       },
       { 
         name: "Google Sheets", 
         mime_type: "application/vnd.google-apps.spreadsheet" 
       },
       { 
         name: "Google Slides", 
         mime_type: "application/vnd.google-apps.presentation" 
       },
       { 
         name: "PDF", 
         mime_type: "application/pdf" 
       },
     ];

     documentTypes.forEach(({ name, mime_type }) => {
       it(`should add ${name} to chat successfully`, async () => {
         const file = { ...mockFile, mime_type, name: `Test.${name}` };
         mockOnAddToChat.mockResolvedValue(undefined);

         render(
           <DocumentViewerModal
             file={file}
             onClose={mockOnClose}
             onAddToChat={mockOnAddToChat}
           />
         );

         const button = screen.getByRole("button", {
           name: /add document to chat/i,
         });
         fireEvent.click(button);

         await waitFor(() => {
           expect(mockOnAddToChat).toHaveBeenCalledWith(file);
           expect(screen.getByText("Document added to chat")).toBeInTheDocument();
         });
       });
     });
   });
   ```

💡 SUGGESTIONS FOR IMPROVEMENT:

- **Extract Toast System**: The toast logic is complex enough to warrant its own custom hook (`useToast`) for better reusability and testability
  ```typescript
  // hooks/useToast.ts
  export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
    
    const showToast = useCallback((type: ToastType, message: string) => {
      // ... implementation
    }, []);
    
    const removeToast = useCallback((id: string) => {
      // ... implementation
    }, []);
    
    return { toasts, showToast, removeToast };
  }
  ```

- **Add Loading State Visual Feedback**: Consider adding a subtle opacity change or pulse animation to the button during loading for better UX
  ```typescript
  className={`... ${isAddingToChat ? 'opacity-75 cursor-wait' : ''}`}
  ```

- **Improve Error Recovery**: Add a "Retry" button directly in error toasts for better UX
  ```typescript
  {toast.type === "error" && (
    <button
      onClick={() => {
        removeToast(toast.id);
        handleAddToChat();
      }}
      className="text-sm font-medium underline"
    >
      Retry
    </button>
  )}
  ```

- **Add Analytics/Telemetry**: Consider adding tracking for successful adds and error types to monitor feature usage
  ```typescript
  try {
    await onAddToChat(file);
    analytics.track('document_added_to_chat', { fileType: file.mime_type });
  } catch (error) {
    analytics.track('document_add_failed', { error: getErrorType(error) });
  }
  ```

📚 LEARNING POINTS:

- **Ref Stability**: `useRef` returns a stable reference across renders, so refs don't need to be in dependency arrays. However, be careful with closures that capture ref values at creation time
- **Toast Pattern**: Your toast implementation is solid, but consider extracting complex UI logic into custom hooks for better separation of concerns and testability
- **Test Completeness**: Always ensure test files are complete before submission. Incomplete tests can hide critical bugs
- **Type Safety**: Even with null coalescing (`??`), TypeScript can't always infer safety. Explicit null checks at component boundaries are clearer and safer
- **Accessibility Best Practice**: Your aria-live implementation is excellent - using "polite" for non-critical updates and "assertive" for individual toasts is the correct pattern

🧪 TEST REQUIREMENTS:

**Missing Critical Test Cases:**
1. ✅ Test with null file prop (edge case)
2. ✅ Test toast stacking (multiple toasts appearing simultaneously)
3. ✅ Test all document types (Google Docs, Sheets, Slides, PDF)
4. ✅ Test button disabled state prevents keyboard activation
5. ✅ Test cleanup of timeouts on component unmount
6. ✅ Test aria-live region attributes
7. ✅ Test responsive behavior (button text hiding on small screens)
8. ✅ Test with missing drive_file_id and drive_web_view_link

**Coverage Gaps to Address:**
```typescript
// Add these tests:
describe("Edge Cases", () => {
  it("should handle null file gracefully", () => {
    render(
      <DocumentViewerModal
        file={null}
        onClose={mockOnClose}
        onAddToChat={mockOnAddToChat}
      />
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should handle multiple toasts simultaneously", async () => {
    mockOnAddToChat
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("Test error"));

    const { rerender } = render(
      <DocumentViewerModal
        file={mockFile}
        onClose={mockOnClose}
        onAddToChat={mockOnAddToChat}
      />
    );

    // Trigger success
    fireEvent.click(screen.getByRole("button", { name: /add document to chat/i }));
    
    await waitFor(() => {
      expect(screen.getByText("Document added to chat")).toBeInTheDocument();
    });

    // Trigger error
    fireEvent.click(screen.getByRole("button", { name: /add document to chat/i }));
    
    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      expect(alerts).toHaveLength(2);
    });
  });

  it("should cleanup timeouts on unmount", () => {
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
    mockOnAddToChat.mockResolvedValue(undefined);

    const { unmount } = render(
      <DocumentViewerModal
        file={mockFile}
        onClose={mockOnClose}
        onAddToChat={mockOnAddToChat}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /add document to chat/i }));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
```

NEXT STEPS:
1. **Complete the test file** - Add the missing test case that was cut off
2. **Add document type tests** - Test all supported document types (Docs, Sheets, Slides, PDF) as per requirements
3. **Add edge case tests** - Cover null file, multiple toasts, and cleanup scenarios
4. **Consider extracting toast logic** - Create a `useToast` hook for better reusability (optional but recommended)
5. **Add retry functionality to error toasts** - Improves UX for transient failures (optional enhancement)
6. **Run coverage report** - Ensure >80% coverage threshold is met: `npm test -- --coverage`

**Overall Assessment**: This is a solid implementation with excellent accessibility and error handling. The main issues are the incomplete test file and missing test coverage for all document types. Once these are addressed, this will be production-ready code. Great work on the accessibility implementation! 🎉

---