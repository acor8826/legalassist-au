// DocumentViewerModal.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDocumentChat } from './useDocumentChat';
import { Document, AddToChatStatus, AddToChatError } from './documentChat.types';
import { LoadingSpinner } from './LoadingSpinner';
import { SuccessToast } from './SuccessToast';
import { ErrorToast } from './ErrorToast';

interface DocumentViewerModalProps {
  document: Document;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  onClose,
}) => {
  const { addDocumentToChat, status, errorMessage } = useDocumentChat();
  const [isFocused, setIsFocused] = useState(false);

  const handleAddToChat = useCallback(() => {
    addDocumentToChat(document);
  }, [addDocumentToChat, document]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'Enter' || event.key === ' ') {
        handleAddToChat();
      }
    },
    [onClose, handleAddToChat]
  );

  const addToChatButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isFocused && addToChatButtonRef.current) {
      addToChatButtonRef.current.focus();
    }
  }, [isFocused]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75"
      onKeyDown={handleKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add Document to Chat</h2>
        <div className="mb-4">
          <p>Document: {document.name}</p>
          <p>Preview: {document.previewUrl}</p>
        </div>
        <button
          ref={addToChatButtonRef}
          className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors ${
            status === 'loading'
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer'
          }`}
          onClick={handleAddToChat}
          disabled={status === 'loading'}
          aria-live={status === 'loading' ? 'assertive' : 'polite'}
          aria-label={
            status === 'idle'
              ? 'Add document to chat'
              : status === 'loading'
              ? 'Adding document to chat'
              : status === 'success'
              ? 'Document added to chat'
              : 'Failed to add document to chat'
          }
        >
          {status === 'loading' ? (
            <span className="flex items-center">
              <LoadingSpinner size={20} color="#FFFFFF" />
              <span className="ml-2">Adding...</span>
            </span>
          ) : (
            'Add to Chat'
          )}
        </button>
        {status === 'success' && (
          <SuccessToast message="Document added to chat" />
        )}
        {status === 'error' && (
          <ErrorToast
            message={errorMessage || 'Failed to add document to chat'}
            onRetry={handleAddToChat}
          />
        )}
      </div>
    </div>
  );
};

// useDocumentChat.ts
import { useState, useCallback } from 'react';
import { Document, AddToChatStatus, AddToChatError } from './documentChat.types';
import { documentChatService } from './documentChatService';

export const useDocumentChat = () => {
  const [status, setStatus] = useState<AddToChatStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const addDocumentToChat = useCallback(async (document: Document) => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      const { success, message } = await documentChatService.addDocumentToChat(
        document
      );

      if (success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(message);
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage((error as AddToChatError).message);
    }
  }, []);

  return { addDocumentToChat, status, errorMessage };
};

// documentChat.types.ts
export interface Document {
  id: string;
  name: string;
  previewUrl: string;
  content: string;
}

export type AddToChatStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AddToChatError extends Error {
  message: string;
}

// documentChatService.ts
import { Document } from './documentChat.types';

export const documentChatService = {
  async addDocumentToChat(document: Document): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await fetch('/api/chat/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ document }),
      });

      const { success, message } = await response.json();

      if (!response.ok) {
        throw new Error(message);
      }

      return { success, message };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Failed to add document to chat',
      };
    }
  },
};