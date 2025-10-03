Here are the comprehensive tests for the `DocumentViewerModal` feature:

1. **Unit Tests (Jest + RTL)**

```tsx
// DocumentViewerModal.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentViewerModal } from './DocumentViewerModal';
import { useDocumentChat } from './useDocumentChat';

jest.mock('./useDocumentChat');

const mockDocument = {
  id: '1',
  name: 'Test Document',
  previewUrl: 'https://example.com/preview.pdf',
  content: 'Document content',
};

const mockUseDocumentChat = useDocumentChat as jest.MockedFunction<typeof useDocumentChat>;

describe('DocumentViewerModal', () => {
  beforeEach(() => {
    mockUseDocumentChat.mockReturnValue({
      addDocumentToChat: jest.fn(),
      status: 'idle',
      errorMessage: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the document information correctly', () => {
    render(<DocumentViewerModal document={mockDocument} onClose={jest.fn()} />);
    expect(screen.getByText('Test Document')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/preview.pdf')).toBeInTheDocument();
  });

  it('calls the addDocumentToChat function when the "Add to Chat" button is clicked', () => {
    const addDocumentToChat = jest.fn();
    mockUseDocumentChat.mockReturnValue({
      addDocumentToChat,
      status: 'idle',
      errorMessage: null,
    });

    render(<DocumentViewerModal document={mockDocument} onClose={jest.fn()} />);
    fireEvent.click(screen.getByText('Add to Chat'));
    expect(addDocumentToChat).toHaveBeenCalledWith(mockDocument);
  });

  it('displays a loading spinner when the status is "loading"', () => {
    mockUseDocumentChat.mockReturnValue({
      addDocumentToChat: jest.fn(),
      status: 'loading',
      errorMessage: null,
    });

    render(<DocumentViewerModal document={mockDocument} onClose={jest.fn()} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays a success toast when the status is "success"', async () => {
    mockUseDocumentChat.mockReturnValue({
      addDocumentToChat: jest.fn(),
      status: 'success',
      errorMessage: null,
    });

    render(<DocumentViewerModal document={mockDocument} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByText('Document added to chat')).toBeInTheDocument());
  });

  it('displays an error toast when the status is "error"', async () => {
    mockUseDocumentChat.mockReturnValue({
      addDocumentToChat: jest.fn(),
      status: 'error',
      errorMessage: 'Failed to add document to chat',
    });

    render(<DocumentViewerModal document={mockDocument} onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByText('Failed to add document to chat')).toBeInTheDocument());
  });

  it('focuses the "Add to Chat" button when the modal is focused', () => {
    const onClose = jest.fn();
    render(<DocumentViewerModal document={mockDocument} onClose={onClose} />);
    fireEvent.focus(screen.getByRole('dialog'));
    expect(screen.getByRole('button', { name: 'Add document to chat' })).toHaveFocus();
  });

  it('closes the modal when the Esc key is pressed', () => {
    const onClose = jest.fn();
    render(<DocumentViewerModal document={mockDocument} onClose={onClose} />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('adds the document to the chat when the Enter key is pressed', () => {
    const addDocumentToChat = jest.fn();
    mockUseDocumentChat.mockReturnValue({
      addDocumentToChat,
      status: 'idle',
      errorMessage: null,
    });

    render(<DocumentViewerModal document={mockDocument} onClose={jest.fn()} />);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Add document to chat' }), { key: 'Enter' });
    expect(addDocumentToChat).toHaveBeenCalledWith(mockDocument);
  });
});
```

2. **Integration Tests**

```tsx
// useDocumentChat.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useDocumentChat } from './useDocumentChat';
import { documentChatService } from './documentChatService';

jest.mock('./documentChatService');

const mockDocument = {
  id: '1',
  name: 'Test Document',
  previewUrl: 'https://example.com/preview.pdf',
  content: 'Document content',
};

const mockAddDocumentToChat = jest.fn();
(documentChatService.addDocumentToChat as jest.MockedFunction<typeof documentChatService.addDocumentToChat>).mockImplementation(mockAddDocumentToChat);

describe('useDocumentChat', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('updates the state correctly when adding a document to the chat', async () => {
    const { result } = renderHook(() => useDocumentChat());

    mockAddDocumentToChat.mockResolvedValueOnce({ success: true, message: 'Document added to chat' });

    await act(async () => {
      await result.current.addDocumentToChat(mockDocument);
    });

    expect(result.current.status).toBe('success');
    expect(result.current.errorMessage).toBeNull();
  });

  it('updates the state correctly when there is an error adding a document to the chat', async () => {
    const { result } = renderHook(() => useDocumentChat());

    mockAddDocumentToChat.mockRejectedValueOnce(new Error('Failed to add document to chat'));

    await act(async () => {
      await result.current.addDocumentToChat(mockDocument);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.errorMessage).toBe('Failed to add document to chat');
  });
});
```

3. **E2E Tests (Cypress)**

```typescript
// DocumentViewerModal.cy.ts
describe('DocumentViewerModal', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/chat/documents', {
      success: true,
      message: 'Document added to chat',
    }).as('addDocumentToChat');

    cy.visit('/');
    cy.get('[data-cy="document-preview"]').first().click();
  });

  it('adds a document to the chat', () => {
    cy.get('[data-cy="add-to-chat-button"]').click();
    cy.wait('@addDocumentToChat');
    cy.get('[data-cy="success-toast"]').should('be.visible');
  });

  it('displays an error toast when adding a document fails', () => {
    cy.intercept('POST', '/api/chat/documents', {
      statusCode: 500,
      body: {
        success: false,
        message: 'Failed to add document to chat',
      },
    }).as('addDocumentToChat');

    cy.get('[data-cy="add-to-chat-button"]').click();
    cy.wait('@addDocumentToChat');
    cy.get('[data-cy="error-toast"]').should('be.visible');
  });

  it('closes the modal when the Esc key is pressed', () => {
    cy.get('[data-cy="document-viewer-modal"]').should('be.visible');
    cy.get('body').type('{esc}');
    cy.get('[data-cy="document-viewer-modal"]').should('not.exist');
  });

  it('adds the document to the chat when the Enter key is pressed', () => {
    cy.get('[data-cy="add-to-chat-button"]').focus();
    cy.get('body').type('{enter}');
    cy.wait('@addDocumentToChat');
    cy.get('[data-cy="success-toast"]').should('be.visible');
  });
});
```

4. **Performance Tests**

```typescript
// DocumentViewerModal.performance.test.ts
import { loadTest } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% of requests should be under 5 seconds
    http_req_failed: ['rate<0.01'], // 1% max failed requests
  },
};

const mockDocument = {
  id: '1',
  name: 'Test Document',
  previewUrl: 'https://example.com/preview.pdf',
  content: 'Document content',
};

export default function () {
  const response = http.post('/api/chat/documents', JSON.stringify({ document: mockDocument }), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.status !== 200) {
    throw new Error(`Failed to add document to chat: ${response.body}`);
  }
}
```

These tests cover the key functionality of the `DocumentViewerModal` component, including:

1. **Unit Tests (Jest + RTL)**:
   - Rendering the document information correctly
   - Calling the `addDocumentToChat` function when the "Add to Chat" button is clicked
   - Displaying the loading spinner, success toast, and error toast based on the `status` state
   - Focusing the "Add to Chat" button when the modal is focused
   - Closing the modal when the Esc key is pressed
   - Adding the document to the chat when the Enter key is pressed

2. **Integration Tests**:
   - Verifying the `useDocumentChat` hook updates the state correctly when adding a document to the chat, both in the success and error cases

3. **E2E Tests (Cypress)**:
   - Verifying the "Add to Chat" button functionality, including the success and error cases
   - Verifying the modal can be closed using the Esc key
   - Verifying the document can be added to the chat using the Enter key

4. **Performance Tests**:
   - Simulating a load test with increasing number of concurrent users
   - Ensuring the document addition process completes within 5 seconds for 95% of the requests
   - Ensuring the failure rate is less than 1%

These tests provide comprehensive coverage for the `DocumentViewerModal` feature, ensuring its functionality, reliability, and performance.