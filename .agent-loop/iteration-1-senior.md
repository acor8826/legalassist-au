---
STATUS: NEEDS_REVISION

✅ WHAT'S WORKING WELL:
- **Comprehensive test coverage**: The test suite is thorough with 80%+ coverage, testing all major scenarios including error handling, keyboard accessibility, and different document types.
- **Strong accessibility foundation**: Good use of ARIA attributes (aria-label, aria-busy, aria-live), proper role attributes, and keyboard navigation support.
- **Clean component structure**: Well-organized code with clear separation of concerns and proper TypeScript typing throughout.

🔴 REQUIRED CHANGES:

1. **Missing Performance Optimization - Unnecessary Re-renders**:
The `handleAddToChat` function is recreated on every render, which can cause performance issues and breaks React best practices. Additionally, the `handleKeyDown` function duplicates the click handler logic unnecessarily.

```typescript
// ❌ Current (incorrect):
const handleAddToChat = async (): Promise<void> => {
  if (!onAddToChat || isAddingToChat) return;
  // ... rest of function
};

const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handleAddToChat();
  }
};

// ✅ Should be (correct):
const handleAddToChat = useCallback(async (): Promise<void> => {
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
      retryAction: () => handleAddToChat(), // Recursive call is safe here
    });
  } finally {
    setIsAddingToChat(false);
  }
}, [onAddToChat, isAddingToChat, file]);

// Remove handleKeyDown entirely - native button behavior handles Enter/Space
```
**Why**: `useCallback` memoizes the function, preventing unnecessary re-renders of child components. The `handleKeyDown` is redundant because buttons natively handle Enter and Space keys.

2. **Memory Leak - setTimeout Not Cleaned Up**:
The setTimeout for auto-hiding the success toast is not cleaned up when the component unmounts, causing potential memory leaks and React warnings.

```typescript
// ❌ Current (incorrect):
setTimeout(() => {
  setToast((prev) => ({ ...prev, show: false }));
}, 3000);

// ✅ Should be (correct):
const timeoutId = setTimeout(() => {
  setToast((prev) => ({ ...prev, show: false }));
}, 3000);

// Store timeout ID in a ref and clean up
// Add this at the top of the component:
const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

// In handleAddToChat success block:
if (toastTimeoutRef.current) {
  clearTimeout(toastTimeoutRef.current);
}
toastTimeoutRef.current = setTimeout(() => {
  setToast((prev) => ({ ...prev, show: false }));
}, 3000);

// Add cleanup effect:
useEffect(() => {
  return () => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
  };
}, []);
```
**Why**: Without cleanup, if the modal closes before 3 seconds, the setTimeout will try to update state on an unmounted component, causing memory leaks and console warnings.

3. **Accessibility Issue - Circular Dependency in retryAction**:
The `retryAction` in the error toast creates a new function reference on every render, and the recursive call pattern can cause issues with the `useCallback` dependency array.

```typescript
// ❌ Current (incorrect):
setToast({
  show: true,
  type: "error",
  message: errorMessage,
  retryAction: handleAddToChat, // This creates dependency issues
});

// ✅ Should be (correct):
// Separate the retry logic:
const handleRetry = useCallback(() => {
  setToast({ show: false, type: "success", message: "" });
  // Trigger the add to chat again
  if (onAddToChat && !isAddingToChat) {
    handleAddToChat();
  }
}, [onAddToChat, isAddingToChat, handleAddToChat]);

// In the error catch block:
setToast({
  show: true,
  type: "error",
  message: errorMessage,
  retryAction: handleRetry,
});

// Update ToastState interface:
interface ToastState {
  show: boolean;
  type: "success" | "error";
  message: string;
  retryAction?: () => void;
}
```
**Why**: This prevents circular dependencies and makes the retry logic more explicit and testable.

4. **Missing Import Statement**:
The code uses `useCallback`, `useEffect`, and `useRef` but doesn't import them from React.

```typescript
// ❌ Current (incorrect):
import React, { useState } from "react";

// ✅ Should be (correct):
import React, { useState, useCallback, useEffect, useRef } from "react";
```
**Why**: Missing imports will cause runtime errors. TypeScript might not catch this if React is globally available.

💡 SUGGESTIONS FOR IMPROVEMENT:

- **Extract Toast Component**: The toast notification logic is substantial enough to warrant its own component. This would improve reusability and testability:
  ```typescript
  // components/Toast.tsx
  interface ToastProps {
    show: boolean;
    type: "success" | "error";
    message: string;
    onClose: () => void;
    onRetry?: () => void;
  }
  ```

- **Add Loading State Debouncing**: For very fast operations, the loading spinner might flash briefly. Consider a minimum display time:
  ```typescript
  const MIN_LOADING_TIME = 300; // ms
  const startTime = Date.now();
  // ... after operation completes
  const elapsed = Date.now() - startTime;
  const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsed);
  setTimeout(() => setIsAddingToChat(false), remainingTime);
  ```

- **Improve Error Messages**: Add more specific error handling for common failure scenarios:
  ```typescript
  catch (error) {
    let errorMessage = "Failed to add document to chat";
    if (error instanceof Error) {
      if (error.message.includes("network")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message.includes("permission")) {
        errorMessage = "You don't have permission to add this document.";
      } else {
        errorMessage = error.message;
      }
    }
    // ... rest of error handling
  }
  ```

- **Add Analytics/Telemetry**: Consider tracking button usage for product insights:
  ```typescript
  const handleAddToChat = useCallback(async () => {
    analytics.track('document_added_to_chat', {
      documentType: file.mime_type,
      documentId: file.id,
    });
    // ... rest of function
  }, [file, onAddToChat]);
  ```

📚 LEARNING POINTS:

- **useCallback vs useMemo**: Use `useCallback` for functions and `useMemo` for computed values. Both prevent unnecessary re-renders, but `useCallback` is specifically for memoizing function references that get passed to child components or used as dependencies in other hooks.

- **Cleanup in useEffect**: Always clean up side effects (timers, subscriptions, event listeners) in the return function of `useEffect`. This prevents memory leaks and ensures your component doesn't try to update state after unmounting.

- **ARIA Best Practices**: While you've done well with ARIA labels, remember that native HTML semantics are always preferred. Buttons automatically handle Enter/Space, so custom keyboard handlers are usually unnecessary and can actually reduce accessibility.

- **Error Boundaries**: Consider wrapping this component in an Error Boundary to catch any unexpected errors gracefully. This is especially important for modals that might fail to render.

- **TypeScript Strict Mode**: You're doing well avoiding `any`, but consider enabling `strictNullChecks` and `noImplicitAny` in tsconfig.json if not already enabled. This catches more potential bugs at compile time.

🧪 TEST REQUIREMENTS:

- **Missing Test: Timeout Cleanup**: Add a test to verify the setTimeout is cleaned up on unmount:
  ```typescript
  it("should clean up timeout when component unmounts", async () => {
    jest.useFakeTimers();
    mockOnAddToChat.mockResolvedValueOnce(undefined);
    
    const { unmount } = render(
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
    
    unmount();
    jest.advanceTimersByTime(3000);
    
    // Should not throw any warnings about updating unmounted component
    expect(console.error).not.toHaveBeenCalled();
    
    jest.useRealTimers();
  });
  ```

- **Missing Test: Rapid Clicks**: Test that multiple rapid clicks don't trigger multiple API calls:
  ```typescript
  it("should prevent multiple simultaneous add to chat operations", async () => {
    const promise = new Promise<void>((resolve) => setTimeout(resolve, 100));
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
    fireEvent.click(addButton);
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(mockOnAddToChat).toHaveBeenCalledTimes(1);
    });
  });
  ```

- **Missing Test: Toast Z-Index**: Verify toast appears above modal:
  ```typescript
  it("should render toast with higher z-index than modal", async () => {
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
      const toast = screen.getByRole("alert");
      expect(toast).toHaveClass("z-[10001]");
    });
  });
  ```

NEXT STEPS:

1. **Add missing imports** (`useCallback`, `useEffect`, `useRef`) to the component
2. **Wrap handleAddToChat in useCallback** with proper dependencies
3. **Implement timeout cleanup** using useRef and useEffect
4. **Remove handleKeyDown function** (rely on native button behavior)
5. **Fix retryAction circular dependency** with separate handleRetry function
6. **Add the three missing test cases** listed above
7. **Run test coverage report** to verify >80% coverage is maintained
8. **Test in browser** with React DevTools Profiler to verify no unnecessary re-renders
9. **Test with screen reader** (NVDA/JAWS) to verify accessibility improvements

Once these changes are made, the implementation will be production-ready! The foundation is solid—these are refinements to make it bulletproof.

---