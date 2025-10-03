---
STATUS: NEEDS_REVISION

✅ WHAT'S WORKING WELL:
- **Comprehensive accessibility implementation**: Excellent use of ARIA attributes (`aria-label`, `aria-busy`, `aria-live`, `aria-atomic`), proper role assignments, and semantic HTML. The toast notifications are properly announced to screen readers.
- **Robust error handling**: Well-structured error categorization (network, permission, generic) with user-friendly messages and retry functionality. The error handling logic is clear and maintainable.
- **Thorough test coverage**: The test suite covers success cases, error scenarios, loading states, accessibility, and edge cases. Good use of mocking and async testing patterns.

🔴 REQUIRED CHANGES:

1. **Memory Leak: Timeout Cleanup on Toast Close**
   ```typescript
   // ❌ Current (incorrect):
   const handleCloseToast = (): void => {
     if (toastTimeoutRef.current) {
       clearTimeout(toastTimeoutRef.current);
     }
     setToast({ show: false, type: "success", message: "" });
   };
   
   // ✅ Should be (correct):
   const handleCloseToast = useCallback((): void => {
     if (toastTimeoutRef.current) {
       clearTimeout(toastTimeoutRef.current);
       toastTimeoutRef.current = null; // Prevent dangling reference
     }
     setToast({ show: false, type: "success", message: "" });
   }, []);
   ```
   **Why**: Without setting the ref to `null`, you maintain a reference to a cleared timeout. While not critical, it's a best practice for cleanup. Also, `handleCloseToast` should be wrapped in `useCallback` since it's used in JSX and could cause unnecessary re-renders.

2. **Race Condition: Stale Closure in handleRetry**
   ```typescript
   // ❌ Current (incorrect):
   const handleRetry = useCallback((): void => {
     setToast({ show: false, type: "success", message: "" });
     handleAddToChat();
   }, [handleAddToChat]);
   
   // ✅ Should be (correct):
   const handleRetry = useCallback((): void => {
     setToast({ show: false, type: "success", message: "" });
     // Delay to allow toast to clear before starting new operation
     setTimeout(() => {
       handleAddToChat();
     }, 0);
   }, [handleAddToChat]);
   ```
   **Why**: Calling `handleAddToChat` immediately after setting toast state can cause race conditions where the new toast appears before the old one is removed from the DOM. The `setTimeout` ensures the state update completes first. Alternatively, you could use a functional state update pattern.

3. **Missing Type Safety: Toast State Reset**
   ```typescript
   // ❌ Current (incorrect):
   setToast({ show: false, type: "success", message: "" });
   
   // ✅ Should be (correct):
   const INITIAL_TOAST_STATE: ToastState = {
     show: false,
     type: "success",
     message: "",
   };
   
   // Then use:
   setToast(INITIAL_TOAST_STATE);
   // Or better yet:
   setToast({ ...INITIAL_TOAST_STATE });
   ```
   **Why**: You're resetting toast state in multiple places with hardcoded values. This is error-prone and violates DRY. Define a constant for the initial state to ensure consistency and make future changes easier.

4. **Accessibility Issue: Missing Focus Management**
   ```typescript
   // ❌ Current (missing):
   // No focus management after toast appears
   
   // ✅ Should be (correct):
   const toastRef = useRef<HTMLDivElement>(null);
   
   useEffect(() => {
     if (toast.show && toast.type === 'error') {
       // For errors, optionally move focus to retry button for keyboard users
       // This is debatable - only do if it improves UX
       const retryButton = toastRef.current?.querySelector('button[aria-label*="Retry"]');
       if (retryButton instanceof HTMLElement) {
         retryButton.focus();
       }
     }
   }, [toast.show, toast.type]);
   
   // In JSX:
   <div ref={toastRef} role="alert" ...>
   ```
   **Why**: For keyboard users, when an error occurs, they may want to immediately retry. Moving focus to the retry button (for errors only) improves keyboard navigation. However, this is optional and should be tested with real users - some prefer focus to remain on the triggering element.

5. **Performance Issue: Unnecessary Re-renders**
   ```typescript
   // ❌ Current (incorrect):
   const handleAddToChat = useCallback(async (): Promise<void> => {
     if (!onAddToChat || isAddingToChat) return;
     // ... rest of implementation
   }, [onAddToChat, isAddingToChat, file]);
   
   // ✅ Should be (correct):
   const handleAddToChat = useCallback(async (): Promise<void> => {
     if (!onAddToChat) return;
     
     // Use functional state update to avoid dependency on isAddingToChat
     setIsAddingToChat(prev => {
       if (prev) return prev; // Already adding, do nothing
       return true;
     });
     
     // ... rest of implementation
   }, [onAddToChat, file]);
   ```
   **Why**: Including `isAddingToChat` in the dependency array causes `handleAddToChat` to be recreated every time the loading state changes. Use functional state updates to remove this dependency and prevent unnecessary function recreations.

6. **Test Incompleteness: Missing Document Type Tests**
   ```typescript
   // ❌ Current (missing):
   // No tests for different document types (Google Docs, Sheets, Slides, PDFs)
   
   // ✅ Should be (correct):
   describe("Document Type Support", () => {
     it.each([
       { 
         mimeType: "application/pdf", 
         name: "document.pdf" 
       },
       { 
         mimeType: "application/vnd.google-apps.document", 
         name: "Google Doc" 
       },
       { 
         mimeType: "application/vnd.google-apps.spreadsheet", 
         name: "Google Sheet" 
       },
       { 
         mimeType: "application/vnd.google-apps.presentation", 
         name: "Google Slides" 
       },
     ])("should handle $name correctly", async ({ mimeType, name }) => {
       const file = { ...mockFile, mime_type: mimeType, name };
       mockOnAddToChat.mockResolvedValueOnce(undefined);
       
       render(
         <DocumentViewerModal
           file={file}
           onClose={mockOnClose}
           onAddToChat={mockOnAddToChat}
         />
       );
       
       const addButton = screen.getByRole("button", {
         name: /add document to chat/i,
       });
       fireEvent.click(addButton);
       
       await waitFor(() => {
         expect(mockOnAddToChat).toHaveBeenCalledWith(file);
       });
     });
   });
   ```
   **Why**: Requirement #9 states "Works for all document types" but there are no tests verifying this. Add parameterized tests to ensure the button works regardless of document type.

💡 SUGGESTIONS FOR IMPROVEMENT:

- **Extract Toast Component**: The toast notification logic is substantial enough to warrant its own component. Create a `<Toast />` component that accepts `{ show, type, message, onClose, onRetry }` props. This improves reusability and testability.

- **Add Loading State to Button Text**: Consider showing "Adding..." text on mobile where the icon might be hidden. Currently, mobile users only see the spinner without context.

- **Debounce Multiple Clicks**: While you prevent multiple simultaneous operations, consider adding visual feedback (e.g., button shake animation) when users click while already processing.

- **Add Analytics/Telemetry**: Consider adding event tracking for successful adds, errors, and retries to monitor feature usage and error rates in production.

- **Improve Error Messages**: Add more specific error types (e.g., file too large, unsupported format, quota exceeded) with actionable guidance.

- **Toast Positioning**: The fixed positioning (`bottom-4 right-4`) might overlap with other UI elements. Consider using a toast container with proper z-index management or a toast queue system for multiple notifications.

📚 LEARNING POINTS:

- **useCallback Dependencies**: Be mindful of what you include in dependency arrays. State values that change frequently (like `isAddingToChat`) can cause performance issues. Use functional state updates (`setState(prev => ...)`) to reduce dependencies.

- **Cleanup Patterns**: Always clean up side effects (timeouts, intervals, subscriptions). Set refs to `null` after cleanup to avoid memory leaks and make debugging easier.

- **Focus Management**: Accessibility isn't just about ARIA labels. Consider the keyboard user's journey through your UI. Where should focus go after actions complete? Should error states automatically receive focus?

- **Test Organization**: Group related tests with `describe` blocks and use `it.each` for parameterized tests. This makes test output more readable and reduces code duplication.

- **Type Safety Constants**: Instead of repeating object literals, define typed constants. This catches typos at compile time and serves as documentation.

- **Defensive Programming**: The check `if (!onAddToChat || isAddingToChat) return;` is good, but consider: what if `file` becomes null during processing? Add null checks before async operations.

🧪 TEST REQUIREMENTS:

**Missing Test Cases:**
1. ✅ Test that timeout is cleared when component unmounts during pending toast
2. ✅ Test behavior when `file` prop changes while adding to chat
3. ✅ Test that multiple rapid clicks don't create multiple toasts
4. ✅ Test toast behavior when modal is maximized/minimized
5. ✅ Test keyboard navigation (Tab, Shift+Tab) through button and toast
6. ✅ Test that retry button is keyboard accessible (Enter and Space keys)
7. ✅ Test concurrent operations: what happens if user closes modal while adding?

**Coverage Gaps:**
```typescript
// Add these tests:
it("should clear timeout when component unmounts", () => {
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
  
  // Unmount before timeout completes
  unmount();
  
  // Should not throw or cause memory leaks
  jest.advanceTimersByTime(3000);
  jest.useRealTimers();
});

it("should handle file prop changing during operation", async () => {
  const promise = new Promise<void>(resolve => setTimeout(resolve, 100));
  mockOnAddToChat.mockReturnValue(promise);
  
  const { rerender } = render(
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
  
  // Change file while operation is pending
  const newFile = { ...mockFile, id: "different-id" };
  rerender(
    <DocumentViewerModal
      file={newFile}
      onClose={mockOnClose}
      onAddToChat={mockOnAddToChat}
    />
  );
  
  await waitFor(() => {
    // Should still call with original file
    expect(mockOnAddToChat).toHaveBeenCalledWith(mockFile);
  });
});
```

NEXT STEPS:
1. **Fix the 6 critical issues** listed above, prioritizing the race condition and memory leak fixes
2. **Add the missing test cases** for document types and edge cases
3. **Consider extracting the Toast component** into a separate, reusable component
4. **Add error boundary** around the modal to catch any unexpected errors gracefully
5. **Test with real screen readers** (NVDA, JAWS, VoiceOver) to validate accessibility
6. **Review with UX team** to confirm toast positioning and focus management behavior
7. **Submit for final review** after addressing all required changes

---