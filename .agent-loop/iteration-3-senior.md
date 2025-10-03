---
STATUS: NEEDS_REVISION

✅ WHAT'S WORKING WELL:
- **Comprehensive error handling**: The implementation includes specific error types (network, permission, generic) with appropriate user-facing messages, which is excellent UX.
- **Strong accessibility foundation**: Proper use of ARIA attributes (`aria-label`, `aria-busy`, `role="alert"`, `aria-live="assertive"`), semantic HTML, and keyboard navigation support.
- **Thorough test coverage**: The test suite covers success flows, error scenarios, loading states, toast management, and accessibility - well-structured and comprehensive.

🔴 REQUIRED CHANGES:

1. **Race Condition with File Reference**: The `fileRef` pattern doesn't properly handle file changes during async operations.
   ```typescript
   // ❌ Current (incorrect):
   const fileRef = useRef<FileObject | null>(file);
   
   useEffect(() => {
     fileRef.current = file;
   }, [file]);
   
   const handleAddToChat = useCallback(async (): Promise<void> => {
     // ...
     const currentFile = fileRef.current;
     if (!currentFile) {
       setIsAddingToChat(false);
       return;
     }
     try {
       await onAddToChat(currentFile);
       // ...
   }, [onAddToChat, showToast]); // Missing 'file' dependency!
   
   // ✅ Should be (correct):
   const handleAddToChat = useCallback(async (): Promise<void> => {
     if (!onAddToChat || !file) return;
     
     setIsAddingToChat((prev) => {
       if (prev) return prev;
       return true;
     });
     
     try {
       await onAddToChat(file); // Use file directly from closure
       showToast("success", "Document added to chat");
     } catch (error) {
       const errorType = getErrorType(error);
       const errorMessage = ERROR_MESSAGES[errorType];
       showToast("error", errorMessage);
       console.error("Error adding document to chat:", error);
     } finally {
       setIsAddingToChat(false);
     }
   }, [file, onAddToChat, showToast]); // Include all dependencies
   ```
   **Why**: The ref pattern is unnecessary complexity here. Using `file` directly in the callback closure is safer and follows React best practices. The current implementation has a stale closure issue where `handleAddToChat` doesn't update when `file` changes.

2. **Missing Type Safety for Error Handling**: The `getErrorType` function uses unsafe type checking.
   ```typescript
   // ❌ Current (incorrect):
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
   
   // ✅ Should be (correct):
   interface ChatError extends Error {
     code?: string;
     statusCode?: number;
   }
   
   const getErrorType = (error: unknown): ErrorType => {
     if (error instanceof Error) {
       const chatError = error as ChatError;
       
       // Check error codes first (more reliable than string matching)
       if (chatError.code === 'NETWORK_ERROR' || chatError.statusCode === 0) {
         return "network";
       }
       if (chatError.statusCode === 403 || chatError.code === 'PERMISSION_DENIED') {
         return "permission";
       }
       
       // Fallback to message checking
       const message = error.message.toLowerCase();
       if (message.includes("network") || message.includes("fetch") || message.includes("connection")) {
         return "network";
       }
       if (message.includes("permission") || message.includes("unauthorized") || message.includes("forbidden")) {
         return "permission";
       }
     }
     return "generic";
   };
   ```
   **Why**: String matching on error messages is fragile. Real-world errors often have status codes or error codes that are more reliable. This also provides better TypeScript typing.

3. **Memory Leak in Toast Timeout**: The cleanup logic has a subtle bug with functional state updates.
   ```typescript
   // ❌ Current (incorrect):
   const handleAddToChat = useCallback(async (): Promise<void> => {
     // ...
     setIsAddingToChat((prev) => {
       if (prev) return prev; // Already adding, do nothing
       return true;
     });
     // If prev was true, we return early from the setter but NOT from handleAddToChat!
     // The async operation continues even though we're already processing
   
   // ✅ Should be (correct):
   const handleAddToChat = useCallback(async (): Promise<void> => {
     if (!onAddToChat || !file) return;
     
     // Use a ref to track if operation is in progress
     if (isAddingToChat) return; // Guard at function level
     
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
   }, [file, onAddToChat, showToast, isAddingToChat]);
   ```
   **Why**: The functional update pattern in `setIsAddingToChat` doesn't prevent the function from continuing execution. If called twice rapidly, both calls will proceed past the setState, potentially causing duplicate operations. Need to check the state value directly.

💡 SUGGESTIONS FOR IMPROVEMENT:

- **Extract Toast Component**: The toast notification logic is substantial and reusable. Consider extracting it into a separate `<Toast>` component or using a toast library like `react-hot-toast` or `sonner` for better maintainability.

- **Add Optimistic UI Updates**: Consider showing the document as "added" immediately in the chat interface before the async operation completes, then roll back on error. This improves perceived performance.

- **Enhance Loading State UX**: Add a progress indicator or estimated time for large documents. Consider disabling the close button during critical operations to prevent accidental interruption.

- **Type the onAddToChat callback more strictly**:
  ```typescript
  interface DocumentViewerModalProps {
    file: FileObject | null;
    onClose: () => void;
    onAddToChat?: (file: FileObject) => Promise<{ success: boolean; message?: string }>;
  }
  ```
  This allows the backend to provide specific success/error messages.

- **Add telemetry/analytics**: Track success/failure rates, error types, and user retry behavior to improve the feature over time.

📚 LEARNING POINTS:

- **useCallback Dependencies**: Always include ALL values from the component scope that are used inside the callback. ESLint's `exhaustive-deps` rule catches these issues. The `fileRef` pattern was an anti-pattern trying to work around this, but it creates more problems than it solves.

- **Refs vs State**: Use refs for values that don't trigger re-renders (like DOM references, timers, previous values). Use state for values that should trigger re-renders. Don't use refs to "escape" dependency arrays - that usually indicates a design problem.

- **Error Handling Best Practices**: 
  1. Define error interfaces/types
  2. Check structured error properties (codes, status) before string matching
  3. Always log errors for debugging (you did this well!)
  4. Provide actionable error messages to users

- **Functional State Updates**: `setState(prev => ...)` is great for avoiding stale closures, but it doesn't prevent the function from continuing. Always guard at the function level for async operations.

🧪 TEST REQUIREMENTS:

- **Missing Test**: File changes during operation
  ```typescript
  it("should use the correct file even if prop changes during operation", async () => {
    const file1 = { ...mockFile, id: "file-1", name: "File 1.pdf" };
    const file2 = { ...mockFile, id: "file-2", name: "File 2.pdf" };
    
    let resolveAdd: () => void;
    const addPromise = new Promise<void>((resolve) => { resolveAdd = resolve; });
    mockOnAddToChat.mockReturnValue(addPromise);
    
    const { rerender } = render(
      <DocumentViewerModal file={file1} onClose={mockOnClose} onAddToChat={mockOnAddToChat} />
    );
    
    fireEvent.click(screen.getByRole("button", { name: /add document to chat/i }));
    
    // Change file while operation is in progress
    rerender(
      <DocumentViewerModal file={file2} onClose={mockOnClose} onAddToChat={mockOnAddToChat} />
    );
    
    resolveAdd!();
    
    await waitFor(() => {
      expect(mockOnAddToChat).toHaveBeenCalledWith(file1); // Should use original file
    });
  });
  ```

- **Missing Test**: Verify console.error is called on failures (important for debugging)
  ```typescript
  it("should log errors to console", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const testError = new Error("Test error");
    mockOnAddToChat.mockRejectedValueOnce(testError);
    
    render(<DocumentViewerModal file={mockFile} onClose={mockOnClose} onAddToChat={mockOnAddToChat} />);
    
    fireEvent.click(screen.getByRole("button", { name: /add document to chat/i }));
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error adding document to chat:", testError);
    });
    
    consoleErrorSpy.mockRestore();
  });
  ```

- **Missing Test**: Verify button styling classes are applied correctly (visual regression prevention)

- **Test Improvement**: The test file is cut off at line 567. Complete the accessibility test:
  ```typescript
  it("should have proper role and aria attributes on toast", async () => {
    mockOnAddToChat.mockResolvedValueOnce(undefined);
    
    render(<DocumentViewerModal file={mockFile} onClose={mockOnClose} onAddToChat={mockOnAddToChat} />);
    
    fireEvent.click(screen.getByRole("button", { name: /add document to chat/i }));
    
    await waitFor(() => {
      const toast = screen.getByRole("alert");
      expect(toast).toHaveAttribute("aria-live", "assertive");
      expect(toast).toHaveAttribute("aria-atomic", "true");
    });
  });
  ```

NEXT STEPS:
1. **Fix the critical race condition**: Remove `fileRef` and add `file` to `handleAddToChat` dependencies
2. **Improve error type detection**: Add status code checking and define proper error interfaces
3. **Fix the duplicate operation guard**: Check `isAddingToChat` at function level, not just in setState
4. **Add the missing test cases**: File changes during operation, console.error verification, and complete the accessibility test
5. **Run tests and verify >80% coverage**: Use `jest --coverage` to confirm
6. **Consider the suggestions**: Especially extracting the toast component for reusability

Once these changes are made, the implementation will be production-ready. The foundation is solid - these are refinements to make it bulletproof.

---