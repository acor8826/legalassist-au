---
STATUS: NEEDS_REVISION

✅ WHAT'S WORKING WELL:
- **Comprehensive error handling**: The error categorization system (network, permission, generic) with specific error messages is well-designed and user-friendly
- **Solid accessibility foundation**: Good use of ARIA attributes (`aria-label`, `aria-busy`, `aria-live`), semantic HTML with proper `role="alert"`, and keyboard-accessible buttons
- **Thorough test coverage**: The test suite covers most scenarios including loading states, error handling, toast behavior, and edge cases like rapid clicking prevention

🔴 REQUIRED CHANGES:

1. **Memory Leak in Toast Timeout Management**: The timeout cleanup logic has a critical flaw that will cause memory leaks
   ```typescript
   // ❌ Current (incorrect):
   const removeToast = useCallback((id: string) => {
     setToasts((prev) => prev.filter((toast) => toast.id !== id));
     const timeout = toastTimeoutsRef.current.get(id);
     if (timeout) {
       clearTimeout(timeout);
       toastTimeoutsRef.current.delete(id);
     }
   }, []); // Empty dependency array is correct
   
   const showToast = useCallback(
     (type: ToastType, message: string) => {
       const id = `toast-${Date.now()}-${Math.random()}`;
       const newToast: Toast = { id, type, message };
       setToasts((prev) => [...prev, newToast]);
       
       const timeout = setTimeout(() => {
         removeToast(id); // ❌ This captures the current removeToast
       }, 5000);
       
       toastTimeoutsRef.current.set(id, timeout);
     },
     [removeToast] // ❌ This dependency causes showToast to be recreated
   );
   
   // ✅ Should be (correct):
   const removeToast = useCallback((id: string) => {
     setToasts((prev) => prev.filter((toast) => toast.id !== id));
     const timeout = toastTimeoutsRef.current.get(id);
     if (timeout) {
       clearTimeout(timeout);
       toastTimeoutsRef.current.delete(id);
     }
   }, []);
   
   const showToast = useCallback((type: ToastType, message: string) => {
     const id = `toast-${Date.now()}-${Math.random()}`;
     const newToast: Toast = { id, type, message };
     setToasts((prev) => [...prev, newToast]);
     
     const timeout = setTimeout(() => {
       // ✅ Use a function that doesn't capture removeToast
       setToasts((prev) => prev.filter((toast) => toast.id !== id));
       const timeoutRef = toastTimeoutsRef.current.get(id);
       if (timeoutRef) {
         clearTimeout(timeoutRef);
         toastTimeoutsRef.current.delete(id);
       }
     }, 5000);
     
     toastTimeoutsRef.current.set(id, timeout);
   }, []); // ✅ No dependencies - stable reference
   ```
   **Why this matters**: The current implementation creates a new `showToast` function every time `removeToast` changes (which it doesn't, but React doesn't know that). More critically, the setTimeout captures the `removeToast` function, creating unnecessary closure chains. The fix inlines the cleanup logic to avoid dependency issues.

2. **Race Condition in handleAddToChat**: The loading state check happens too late, allowing potential race conditions
   ```typescript
   // ❌ Current (incorrect):
   const handleAddToChat = useCallback(async (): Promise<void> => {
     if (!onAddToChat || !file || isAddingToChat) return;
     // ❌ Between the check above and setState below, another click could occur
     
     setIsAddingToChat(true);
     try {
       await onAddToChat(file);
       showToast("success", "Document added to chat");
     } catch (error) {
       // ...
     } finally {
       setIsAddingToChat(false);
     }
   }, [file, onAddToChat, showToast, getErrorType, isAddingToChat]);
   // ❌ isAddingToChat as dependency causes function to be recreated during loading
   
   // ✅ Should be (correct):
   const handleAddToChat = useCallback(async (): Promise<void> => {
     if (!onAddToChat || !file) return;
     
     // ✅ Use functional setState to check current state atomically
     setIsAddingToChat((current) => {
       if (current) return current; // Already processing, don't change state
       return true; // Start processing
     });
     
     // ✅ Double-check after state update (for extra safety)
     const shouldProceed = await new Promise<boolean>((resolve) => {
       setIsAddingToChat((current) => {
         resolve(current);
         return current;
       });
     });
     
     if (!shouldProceed) return;
     
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
   }, [file, onAddToChat, showToast, getErrorType]); 
   // ✅ Remove isAddingToChat from dependencies
   ```
   **Why this matters**: Including `isAddingToChat` in the dependency array means the function is recreated every time the loading state changes, which defeats the purpose of `useCallback`. The functional setState pattern ensures atomic state updates and prevents race conditions.

3. **Missing TypeScript Strict Null Checks**: Several places assume values exist without proper type guards
   ```typescript
   // ❌ Current (incorrect):
   const googleDrivePreview = file.drive_file_id
     ? `https://drive.google.com/file/d/${file.drive_file_id}/preview`
     : file.drive_web_view_link;
   // ❌ What if file.drive_web_view_link is also null/undefined?
   
   <iframe
     src={googleDrivePreview}
     className="w-full h-[75vh]"
     title={file.name}
   />
   // ❌ iframe with undefined src will cause console errors
   
   // ✅ Should be (correct):
   const googleDrivePreview = file.drive_file_id
     ? `https://drive.google.com/file/d/${file.drive_file_id}/preview`
     : file.drive_web_view_link ?? '';
   
   // ✅ Better: Add validation and fallback UI
   const getPreviewUrl = (): string | null => {
     if (file.drive_file_id) {
       return `https://drive.google.com/file/d/${file.drive_file_id}/preview`;
     }
     return file.drive_web_view_link ?? null;
   };
   
   const googleDrivePreview = getPreviewUrl();
   
   // In render:
   {googleDrivePreview ? (
     <iframe
       src={googleDrivePreview}
       className="w-full h-[75vh]"
       title={file.name}
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
             className="text-sky-600 hover:underline"
           >
             Open in Google Drive
           </a>
         )}
       </div>
     </div>
   )}
   ```
   **Why this matters**: TypeScript's strict mode should catch these, but runtime safety is crucial. An undefined iframe src will cause console errors and poor UX.

💡 SUGGESTIONS FOR IMPROVEMENT:

- **Extract Toast System**: The toast logic (100+ lines) should be extracted into a custom hook `useToast()` for reusability and testability
  ```typescript
  // hooks/useToast.ts
  export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const toastTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
    
    // ... toast logic here
    
    return { toasts, showToast, removeToast };
  }
  ```

- **Memoize Error Messages**: The `ERROR_MESSAGES` object is recreated on every render. Move it outside the component or use `useMemo`
  ```typescript
  // ✅ Move outside component (best)
  const ERROR_MESSAGES: Record<ErrorType, string> = {
    network: "Network error. Please check your connection and try again.",
    permission: "Permission denied. You may not have access to add this document.",
    generic: "Failed to add document to chat. Please try again.",
  } as const;
  ```

- **Add Loading State to Button Text**: Use a more semantic approach for responsive text
  ```typescript
  // Current: Uses CSS classes (hidden sm:inline)
  <span className="hidden sm:inline">
    {isAddingToChat ? "Adding..." : "Add to Chat"}
  </span>
  
  // Better: Use aria-label for screen readers, visual text for sighted users
  <button
    aria-label={isAddingToChat ? "Adding document to chat" : "Add document to chat"}
    title={isAddingToChat ? "Adding to chat..." : "Add this document to chat"}
  >
    {/* Icon */}
    <span className="sr-only sm:not-sr-only sm:inline">
      {isAddingToChat ? "Adding..." : "Add to Chat"}
    </span>
  </button>
  ```

- **Improve Toast Positioning**: Multiple toasts will overlap. Add proper stacking
  ```typescript
  // Add to toast container
  <div className="fixed bottom-4 right-4 z-[10001] flex flex-col-reverse gap-2 max-h-screen overflow-y-auto pointer-events-none">
    {/* flex-col-reverse makes new toasts appear at bottom */}
  ```

- **Add Optimistic UI Update**: Show success immediately, rollback on error
  ```typescript
  const handleAddToChat = useCallback(async () => {
    // Show optimistic success
    const optimisticToastId = showToast("success", "Adding document to chat...");
    
    try {
      await onAddToChat(file);
      // Update to final success
      updateToast(optimisticToastId, "success", "Document added to chat");
    } catch (error) {
      // Remove optimistic, show error
      removeToast(optimisticToastId);
      showToast("error", errorMessage);
    }
  }, []);
  ```

📚 LEARNING POINTS:

- **useCallback Dependencies**: Only include values that the function actually *uses* and that *change*. State setters from `useState` are stable and don't need to be included. Including state values like `isAddingToChat` causes the callback to be recreated on every state change, defeating the purpose of memoization.

- **Functional setState Pattern**: When new state depends on current state, always use the functional form: `setState(prev => ...)`. This ensures you're working with the most current value and prevents race conditions, especially in async operations.

- **Closure Gotchas in setTimeout**: When using `setTimeout` with callbacks, be careful about what values you're capturing. If you capture a function from `useCallback`, you create a dependency chain. Either inline the logic or use refs for values that shouldn't trigger recreations.

- **TypeScript Nullability**: Even with strict mode, runtime checks are essential. Use nullish coalescing (`??`), optional chaining (`?.`), and explicit null checks to prevent runtime errors. The type system can't protect against API responses or external data.

- **Accessibility Beyond ARIA**: While ARIA attributes are important, semantic HTML and proper focus management matter more. A `<button>` is already keyboard accessible; ARIA enhances but doesn't replace semantics.

🧪 TEST REQUIREMENTS:

1. **Missing Test: Toast Cleanup on Unmount**
   ```typescript
   it("should cleanup all toast timeouts on unmount", () => {
     mockOnAddToChat.mockResolvedValue(undefined);
     const { unmount } = render(
       <DocumentViewerModal
         file={mockFile}
         onClose={mockOnClose}
         onAddToChat={mockOnAddToChat}
       />
     );
     
     const button = screen.getByRole("button", { name: /add document to chat/i });
     fireEvent.click(button);
     
     // Spy on clearTimeout
     const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
     
     unmount();
     
     expect(clearTimeoutSpy).toHaveBeenCalled();
   });
   ```

2. **Missing Test: Multiple Toasts Simultaneously**
   ```typescript
   it("should handle multiple toasts at once", async () => {
     mockOnAddToChat
       .mockRejectedValueOnce(new Error("Error 1"))
       .mockRejectedValueOnce(new Error("Error 2"));
     
     render(
       <DocumentViewerModal
         file={mockFile}
         onClose={mockOnClose}
         onAddToChat={mockOnAddToChat}
       />
     );
     
     const button = screen.getByRole("button", { name: /add document to chat/i });
     
     fireEvent.click(button);
     await waitFor(() => expect(mockOnAddToChat).toHaveBeenCalledTimes(1));
     
     fireEvent.click(button);
     await waitFor(() => expect(mockOnAddToChat).toHaveBeenCalledTimes(2));
     
     const toasts = screen.getAllByRole("alert");
     expect(toasts).toHaveLength(2);
   });
   ```

3. **Missing Test: Keyboard Navigation**
   ```typescript
   it("should support keyboard interaction (Enter and Space)", () => {
     mockOnAddToChat.mockResolvedValue(undefined);
     render(
       <DocumentViewerModal
         file={mockFile}
         onClose={mockOnClose}
         onAddToChat={mockOnAddToChat}
       />
     );
     
     const button = screen.getByRole("button", { name: /add document to chat/i });
     
     // Test Enter key
     fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
     expect(mockOnAddToChat).toHaveBeenCalledTimes(1);
     
     // Test Space key
     fireEvent.keyDown(button, { key: " ", code: "Space" });
     expect(mockOnAddToChat).toHaveBeenCalledTimes(2);
   });
   ```

4. **Missing Test: Error with Non-Error Objects**
   ```typescript
   it("should handle non-Error objects thrown", async () => {
     mockOnAddToChat.mockRejectedValueOnce("String error");
     
     render(
       <DocumentViewerModal
         file={mockFile}
         onClose={mockOnClose}
         onAddToChat={mockOnAddToChat}
       />
     );
     
     const button = screen.getByRole("button", { name: /add document to chat/i });
     fireEvent.click(button);
     
     await waitFor(() => {
       const toast = screen.getByRole("alert");
       expect(toast).toHaveTextContent("Failed to add document to chat");
     });
   });
   ```

5. **Test File Incomplete