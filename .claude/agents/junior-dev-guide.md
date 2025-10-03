# Junior Developer - Onboarding & Development Guide

## 📋 Table of Contents
1. [Welcome & Getting Started](#welcome--getting-started)
2. [Development Environment Setup](#development-environment-setup)
3. [Codebase Overview](#codebase-overview)
4. [Your First Week](#your-first-week)
5. [Coding Standards & Best Practices](#coding-standards--best-practices)
6. [Common Tasks & How-To Guides](#common-tasks--how-to-guides)
7. [Testing Guide](#testing-guide)
8. [Git Workflow](#git-workflow)
9. [Code Review Process](#code-review-process)
10. [Learning Resources](#learning-resources)
11. [Getting Help](#getting-help)

---

## 👋 Welcome & Getting Started

### About This Project
You're joining a legal document management platform that helps users upload, search, and analyze legal documents using AI. The platform integrates with Google Drive for storage and uses vector databases for intelligent search.

### Your Role
As a Junior Developer, you'll be:
- Building UI components from designs
- Implementing form validation and user interactions
- Writing unit tests for your code
- Fixing bugs and improving existing features
- Learning best practices from code reviews
- Growing your skills through pair programming

### Success Indicators
By the end of your first month, you should be able to:
- [ ] Set up the development environment independently
- [ ] Create React components following our standards
- [ ] Write basic unit tests
- [ ] Submit pull requests with minimal revisions needed
- [ ] Understand the codebase architecture
- [ ] Debug common issues independently

### Team Structure
- **Senior Developer**: Technical lead, architecture decisions, code reviews
- **You (Junior Developer)**: Feature implementation, bug fixes, testing
- **Security Specialist**: Security reviews, compliance
- **UI/UX Designer**: Design specifications, user experience

---

## 💻 Development Environment Setup

### Prerequisites Checklist
- [ ] **Node.js** v18+ installed ([Download](https://nodejs.org))
- [ ] **Python** 3.10+ installed ([Download](https://python.org))
- [ ] **Git** installed and configured
- [ ] **VS Code** or your preferred IDE
- [ ] **Docker Desktop** installed ([Download](https://docker.com))
- [ ] GitHub account with repository access

### Step 1: Clone the Repository
```bash
# Clone the project
git clone https://github.com/your-org/legal-assist-platform.git
cd legal-assist-platform

# Create your feature branch
git checkout -b feature/your-name-setup
```

### Step 2: Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

**Expected Output:**
```
VITE v5.0.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 3: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload

# Open http://localhost:8000/docs for API documentation
```

**Expected Output:**
```
INFO:     Will watch for changes in these directories: ['/app']
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### Step 4: Install VS Code Extensions
```json
// Recommended extensions
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-python.python",
    "ms-python.vscode-pylance",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

### Step 5: Verify Setup
```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
pytest

# All tests should pass ✓
```

### Troubleshooting Common Issues

#### Issue: `npm install` fails
```bash
# Clear npm cache
npm cache clean --force
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json
# Reinstall
npm install
```

#### Issue: Python packages fail to install
```bash
# Upgrade pip
python -m pip install --upgrade pip
# Install with verbose output
pip install -r requirements.txt -v
```

#### Issue: Database connection error
```bash
# Check if Docker is running
docker ps
# Restart database container
docker-compose restart db
```

---

## 📚 Codebase Overview

### Project Structure

```
legal-assist-platform/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API calls
│   │   ├── utils/           # Helper functions
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx          # Root component
│   ├── tests/               # Test files
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/             # API endpoints
│   │   ├── models/          # Database models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   └── main.py          # FastAPI app
│   ├── tests/               # Test files
│   └── requirements.txt
│
├── docker-compose.yml       # Local development setup
└── README.md
```

### Key Technologies

#### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling framework
- **shadcn/ui**: Component library
- **React Query**: Server state management
- **React Router**: Navigation
- **Zod**: Schema validation

#### Backend
- **FastAPI**: Web framework
- **SQLAlchemy**: Database ORM
- **Pydantic**: Data validation
- **Alembic**: Database migrations
- **pytest**: Testing framework

### Architecture Diagram

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ↓
┌─────────────────────┐
│  React Frontend     │
│  (Port 5173)        │
└──────────┬──────────┘
           │
           ↓
    ┌──────────────────┐
    │  FastAPI Backend │
    │  (Port 8000)     │
    └────┬─────────┬───┘
         │         │
         ↓         ↓
   ┌─────────┐  ┌──────────────┐
   │Database │  │ Google Drive │
   └─────────┘  └──────────────┘
```

---

## 📅 Your First Week

### Day 1: Setup & Orientation
**Morning:**
- [ ] Complete environment setup
- [ ] Run the application locally
- [ ] Meet the team (15min standup)
- [ ] Review this guide thoroughly

**Afternoon:**
- [ ] Explore the codebase
- [ ] Read existing component code
- [ ] Watch: "Project Architecture Overview" video
- [ ] Set up communication tools (Slack, Jira)

**End of Day Task:**
Submit a PR to add your name to the team page in the README.

### Day 2: First Component
**Morning:**
- [ ] Pair programming session with Senior Dev (1 hour)
- [ ] Learn component structure and naming conventions
- [ ] Review design system (Figma)

**Afternoon:**
- [ ] **TASK**: Create a simple `LoadingSpinner` component
  - Location: `src/components/ui/LoadingSpinner.tsx`
  - Use Tailwind CSS for styling
  - Add TypeScript props interface
  - Make it reusable with size variants

**Guidance:**
```typescript
// Expected component structure
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  color = 'blue'
}) => {
  // Implementation here
  return (
    <div className={/* Tailwind classes */}>
      {/* SVG spinner */}
    </div>
  );
};
```

### Day 3: Testing Basics
**Morning:**
- [ ] Learn testing framework (Jest + React Testing Library)
- [ ] Study existing test examples
- [ ] Pair programming: Writing tests

**Afternoon:**
- [ ] **TASK**: Write tests for your LoadingSpinner
  - Test different size variants
  - Test custom color props
  - Test component renders correctly

**Test Example:**
```typescript
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    // Add your assertions
  });
});
```

### Day 4: Form Components
**Morning:**
- [ ] Learn form handling with React Hook Form
- [ ] Study validation with Zod
- [ ] Review existing form components

**Afternoon:**
- [ ] **TASK**: Create a `TextInput` component
  - Support label, placeholder, error message
  - Add proper accessibility (ARIA labels)
  - Include focus states

### Day 5: Code Review & Feedback
**Morning:**
- [ ] Submit all PRs from the week
- [ ] Respond to code review feedback
- [ ] Refactor based on suggestions

**Afternoon:**
- [ ] Weekly retrospective with Senior Dev
- [ ] Plan next week's tasks
- [ ] Review learning progress

---

## 📝 Coding Standards & Best Practices

### React Component Guidelines

#### 1. File Naming Convention
```
ComponentName.tsx        # Component file
ComponentName.test.tsx   # Test file
ComponentName.stories.tsx # Storybook (if applicable)
```

#### 2. Component Template
```typescript
import React from 'react';

// 1. Define props interface
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

// 2. Component with proper typing
export const Button: React.FC<ButtonProps> = ({ 
  label,
  onClick,
  variant = 'primary',
  disabled = false
}) => {
  // 3. Hooks at the top
  const [isLoading, setIsLoading] = React.useState(false);

  // 4. Event handlers
  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  // 5. Render logic
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
      aria-label={label}
    >
      {isLoading ? <LoadingSpinner /> : label}
    </button>
  );
};

// 6. Default export
export default Button;
```

#### 3. Styling with Tailwind CSS
```typescript
// ✅ Good: Use Tailwind utility classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-900">Title</h2>
</div>

// ❌ Avoid: Inline styles
<div style={{ display: 'flex', padding: '16px' }}>
```

#### 4. State Management Rules
```typescript
// ✅ Local state for UI-only data
const [isOpen, setIsOpen] = useState(false);

// ✅ React Query for server data
const { data, isLoading } = useQuery({
  queryKey: ['documents'],
  queryFn: fetchDocuments
});

// ❌ Don't use local state for server data
const [documents, setDocuments] = useState([]);
```

### TypeScript Best Practices

#### 1. No `any` Type
```typescript
// ❌ Bad
const handleData = (data: any) => {
  console.log(data);
};

// ✅ Good
interface UserData {
  id: string;
  name: string;
}

const handleData = (data: UserData) => {
  console.log(data.name);
};
```

#### 2. Proper Type Definitions
```typescript
// Define types in separate files
// types/document.ts
export interface Document {
  id: string;
  title: string;
  mimeType: string;
  createdAt: Date;
}

// Use in components
import { Document } from '@/types/document';
```

#### 3. Optional vs Required Props
```typescript
interface FormProps {
  onSubmit: (data: FormData) => void;  // Required
  initialValues?: FormData;             // Optional
  disabled?: boolean;                   // Optional with default
}
```

### Code Formatting

#### ESLint & Prettier Configuration
```bash
# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format all files
npm run format
```

#### Pre-commit Hooks
All code is automatically formatted before commit. If you see errors:
```bash
# Fix formatting issues
npm run format
# Stage changes
git add .
# Commit again
git commit -m "Your message"
```

---

## 🛠️ Common Tasks & How-To Guides

### Task 1: Creating a New Component

#### Step-by-Step Guide
```bash
# 1. Create component file
touch src/components/DocumentCard.tsx

# 2. Create test file
touch src/components/DocumentCard.test.tsx

# 3. Add to index for easy imports
echo "export { DocumentCard } from './DocumentCard';" >> src/components/index.ts
```

#### Component Checklist
- [ ] TypeScript interface for props
- [ ] Proper imports (React, types, etc.)
- [ ] Accessible markup (ARIA labels)
- [ ] Responsive design (mobile-first)
- [ ] Error states handled
- [ ] Loading states included
- [ ] Unit tests written

### Task 2: Making API Calls

#### Using React Query
```typescript
// src/services/documentService.ts
export const fetchDocuments = async (): Promise<Document[]> => {
  const response = await fetch('/api/v1/documents');
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
};

// In your component
import { useQuery } from '@tanstack/react-query';
import { fetchDocuments } from '@/services/documentService';

export const DocumentList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: fetchDocuments
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div>
      {data?.map(doc => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
};
```

### Task 3: Form Handling

#### React Hook Form + Zod Validation
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema
const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  email: z.string().email('Invalid email address'),
  file: z.instanceof(File).optional()
});

type FormData = z.infer<typeof formSchema>;

export const DocumentForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
    // Submit to API
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
};
```

### Task 4: Routing with React Router

#### Adding a New Route
```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/documents" element={<DocumentList />} />
        <Route path="/documents/:id" element={<DocumentDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
```

#### Navigating Programmatically
```typescript
import { useNavigate } from 'react-router-dom';

export const LoginForm = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (/* form */);
};
```

### Task 5: Working with shadcn/ui

#### Installing a New Component
```bash
# Install button component
npx shadcn-ui@latest add button

# Install dialog component
npx shadcn-ui@latest add dialog
```

#### Using shadcn Components
```typescript
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';

export const Example = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
```

---

## 🧪 Testing Guide

### Testing Philosophy
- **Write tests first** (or immediately after implementation)
- **Test behavior, not implementation**
- **Keep tests simple and readable**
- **One assertion per test (generally)**

### Testing Checklist
Before submitting a PR, ensure:
- [ ] All new components have tests
- [ ] Edge cases are covered
- [ ] Error states are tested
- [ ] Loading states are tested
- [ ] All tests pass locally
- [ ] No console errors or warnings

### Component Testing Pattern

#### Basic Rendering Test
```typescript
import { render, screen } from '@testing-library/react';
import { DocumentCard } from './DocumentCard';

describe('DocumentCard', () => {
  const mockDocument = {
    id: '1',
    title: 'Test Document',
    createdAt: new Date()
  };

  it('renders document title', () => {
    render(<DocumentCard document={mockDocument} />);
    expect(screen.getByText('Test Document')).toBeInTheDocument();
  });
});
```

#### User Interaction Test
```typescript
import { render, screen, fireEvent } from '@testing-library/react';

it('calls onClick when button clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick} label="Click me" />);
  
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

#### Async Testing
```typescript
import { render, screen, waitFor } from '@testing-library/react';

it('loads and displays data', async () => {
  render(<DocumentList />);
  
  await waitFor(() => {
    expect(screen.getByText('Document 1')).toBeInTheDocument();
  });
});
```

### Running Tests

#### Run All Tests
```bash
npm run test
```

#### Run Tests in Watch Mode
```bash
npm run test:watch
```

#### Run Tests with Coverage
```bash
npm run test:coverage
```

#### Run Specific Test File
```bash
npm test -- DocumentCard.test.tsx
```

### Common Testing Mistakes to Avoid

#### ❌ Testing Implementation Details
```typescript
// Bad: Testing internal state
expect(component.state.count).toBe(1);

// Good: Testing user-visible behavior
expect(screen.getByText('Count: 1')).toBeInTheDocument();
```

#### ❌ Not Cleaning Up
```typescript
// Bad: No cleanup
afterEach(() => {
  // nothing
});

// Good: Clean up mocks
afterEach(() => {
  jest.clearAllMocks();
});
```

---

## 🔄 Git Workflow

### Branch Naming Convention
```bash
feature/add-document-upload    # New features
fix/login-validation-error     # Bug fixes
docs/update-readme            # Documentation
refactor/optimize-search      # Code improvements
test/add-component-tests      # Adding tests
```

### Commit Message Format
```bash
# Format: <type>: <description>

# Examples:
git commit -m "feat: add document upload component"
git commit -m "fix: resolve login validation error"
git commit -m "test: add DocumentCard component tests"
git commit -m "docs: update API documentation"
git commit -m "refactor: extract reusable hook from DocumentList"
```

### Daily Workflow

#### 1. Start of Day
```bash
# Update your local main branch
git checkout main
git pull origin main

# Create/switch to your feature branch
git checkout -b feature/your-task-name

# Or switch to existing branch
git checkout feature/your-task-name
git rebase main  # Stay updated with main
```

#### 2. During Development
```bash
# Check what files changed
git status

# Stage specific files
git add src/components/NewComponent.tsx
git add src/components/NewComponent.test.tsx

# Commit with clear message
git commit -m "feat: add NewComponent with tests"

# Push to remote
git push origin feature/your-task-name
```

#### 3. Before Creating PR
```bash
# Ensure all tests pass
npm run test
npm run lint

# Update from main
git checkout main
git pull
git checkout feature/your-task-name
git rebase main

# Resolve any conflicts, then:
git push origin feature/your-task-name --force
```

### Pull Request Process

#### Creating a PR
1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Fill out PR template:

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [x] New feature
- [ ] Documentation update

## Testing
- [x] Unit tests added
- [x] Manual testing completed
- [ ] E2E tests updated

## Checklist
- [x] Code follows style guidelines
- [x] Self-review completed
- [x] No console warnings
- [x] Tests pass locally

## Screenshots
[Add if UI changes]
```

#### After PR Submitted
1. Wait for automated checks to pass
2. Senior developer will review (usually within 24 hours)
3. Address feedback by making new commits
4. Once approved, Senior dev will merge

### Handling Code Review Feedback

#### Responding to Comments
```markdown
# Senior Dev Comment:
"Can you add error handling here?"

# Your Response:
✅ "Done! Added try-catch block and error toast notification in commit abc123"
```

#### Making Changes
```bash
# Make the requested changes
# Commit with descriptive message
git add .
git commit -m "fix: add error handling to document upload"

# Push to same branch (PR auto-updates)
git push origin feature/your-task-name
```

---

## 📖 Code Review Process

### What to Expect

#### Review Timeline
- **Initial Review**: Within 24 hours
- **Follow-up Reviews**: Within 4-8 hours
- **Approval & Merge**: Same day or next day

#### Types of Feedback

**1. Required Changes (Must Fix)**
```markdown
🔴 REQUIRED: This function needs error handling
```

**2. Suggestions (Nice to Have)**
```markdown
💡 SUGGESTION: Consider extracting this into a separate hook
```

**3. Learning Opportunities**
```markdown
📚 FYI: Here's a more efficient way to do this...
```

### Responding to Reviews

#### Good Response Example
```markdown
✅ Fixed in commit abc123
✅ Added tests for edge case
✅ Extracted into useFetchDocuments hook as suggested
❓ Question: Should we also handle the timeout scenario?
```

#### What NOT to Do
```markdown
❌ "ok"
❌ "done"
❌ [No response, just pushing commits]
❌ Arguing without understanding the concern
```

### Self-Review Checklist

Before requesting review:
- [ ] Read your own code line by line
- [ ] Check for console.logs or debug code
- [ ] Verify all tests pass
- [ ] Test the feature manually
- [ ] Check for typos in comments/docs
- [ ] Ensure code follows style guide
- [ ] Add screenshots if UI changed

---

## 📚 Learning Resources

### Required Learning (First Month)

#### Week 1: Fundamentals
- [ ] [React Official Tutorial](https://react.dev/learn)
- [ ] [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [ ] [Tailwind CSS Documentation](https://tailwindcss.com/docs)

#### Week 2: Testing
- [ ] [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [ ] [Jest Documentation](https://jestjs.io/docs/getting-started)
- [ ] Testing Best Practices (internal doc)

#### Week 3: State Management
- [ ] [React Query Tutorial](https://tanstack.com/query/latest/docs/react/overview)
- [ ] [React Hook Form](https://react-hook-form.com/get-started)
- [ ] [Zod Validation](https://zod.dev/)

#### Week 4: Advanced Topics
- [ ] [React Performance](https://react.dev/learn/render-and-commit)
- [ ] Accessibility (WCAG 2.1 basics)
- [ ] Git best practices

### Recommended Reading

#### Books
- "Learning React" by Alex Banks & Eve Porcello
- "Effective TypeScript" by Dan Vanderkam
- "Clean Code" by Robert Martin

#### Articles
- [React Best Practices 2024](https://react.dev)
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Internal Resources

#### Documentation
- Architecture Overview (Confluence)
- API Documentation (Swagger/Postman)
- Design System (Figma)
- Component Library (Storybook)

#### Video Tutorials
- "Project Setup Walkthrough" (15 min)
- "Component Development Best Practices" (20 min)
- "Testing Strategies" (30 min)
- "Git Workflow Demo" (10 min)

### Practice Exercises

#### Week 1 Exercises
1. Create a Card component with variants
2. Build a simple form with validation
3. Implement error boundary
4. Add loading states to existing component

#### Week 2 Exercises
1. Write tests for all Week 1 components
2. Add accessibility to existing components
3. Optimize a slow-rendering component
4. Create custom hook for API calls

---

## 🆘 Getting Help

### When You're Stuck

#### Step 1: Try to Debug (15-30 min)
```bash
# Check console for errors
# Read error messages carefully
# Google the error message
# Check documentation
# Review similar code in codebase
```

#### Step 2: Ask Your Peer (Junior Developers)
- Slack: #junior-dev-help channel
- Quick questions, share struggles
- Learn together

#### Step 3: Ask Senior Developer
Use this template in Slack:

```markdown
**What I'm trying to do:**
Create a document upload component

**What I expected:**
File should upload and show progress bar

**What actually happened:**
Getting CORS error in console

**What I've tried:**
1. Checked API endpoint - it's correct
2. Verified file size is under limit
3. Tried different file types

**Code snippet:**
```typescript
// Your relevant code here
```

**Error message:**
```
Access to fetch at 'http://api...' has been blocked by CORS policy
```

**Question:**
How do I configure CORS for file uploads?
```

### Communication Channels

#### Daily Standup (10am)
- What you did yesterday
- What you're doing today
- Any blockers

#### Slack Channels
- `#engineering`: General tech discussions
- `#junior-dev-help`: Questions for peers
- `#code-review`: PR notifications
- `#random`: Team bonding

#### Office Hours
- **Senior Dev**: Tuesdays & Thursdays 2-4pm
- **Open Q&A**: Fridays 3-4pm

#### Pair Programming
- Schedule with Senior Dev (2-3x per week)
- Best for: Learning new concepts, debugging hard issues

### Common Questions & Answers

#### Q: How long should I try to solve a problem alone?
**A:** 30 minutes for small issues, 1 hour for complex problems. Then ask for help!

#### Q: What if I break something in production?
**A:** Don't panic! Immediately notify the team. We have rollback procedures. Everyone makes mistakes - it's how we learn.

#### Q: How do I know if my code is good enough?
**A:** If it:
- Works correctly
- Has tests
- Follows our style guide
- Has clear variable names
Then submit the PR! Code review will help you improve.

#### Q: Can I refactor code I see that could be better?
**A:** Ask first! There might be reasons for the current implementation. Create a separate ticket for refactoring.

#### Q: What if I disagree with code review feedback?
**A:** It's okay to ask questions! Say: "I understand your concern. Can you help me understand why this approach is better?" Learn from the discussion.

---

## 🎯 Monthly Goals & Progress Tracking

### Month 1 Goals
- [ ] Complete 10 component implementations
- [ ] Achieve 80%+ test coverage on your code
- [ ] Submit 15+ PRs
- [ ] Learn React Query and form handling
- [ ] Zero critical bugs in production

### Month 2 Goals
- [ ] Lead a small feature end-to-end
- [ ] Help onboard next junior developer
- [ ] Improve existing component performance
- [ ] Write technical documentation
- [ ] Present in team tech talk

### Month 3 Goals
- [ ] Take on more complex features
- [ ] Reduce PR revision cycles
- [ ] Contribute to architecture discussions
- [ ] Mentor newest team member
- [ ] Propose process improvements

### Weekly Self-Assessment

Rate yourself 1-5 on:
- Code quality
- Testing coverage
- Communication
- Problem-solving
- Time management

Discuss with Senior Dev in 1-on-1s.

---

## ✅ Quick Reference Checklists

### Before Starting a Task
- [ ] Understand the requirement fully
- [ ] Review design (if UI work)
- [ ] Check if similar code exists
- [ ] Plan your approach
- [ ] Create feature branch

### Before Committing Code
- [ ] Code works as expected
- [ ] Tests written and passing
- [ ] No console errors/warnings
- [ ] Code is formatted (Prettier)
- [ ] No commented-out code
- [ ] Meaningful commit message

### Before Creating PR
- [ ] All tests pass locally
- [ ] Linting passes
- [ ] Self-review completed
- [ ] Screenshots added (if UI)
- [ ] PR description filled out
- [ ] Related ticket linked

### Daily Checklist
- [ ] Pull latest changes from main
- [ ] Attend standup meeting
- [ ] Work on assigned tasks
- [ ] Commit code at least once
- [ ] Ask questions when stuck
- [ ] Update task status in Jira
- [ ] Review at least one PR (optional but encouraged)

---

## 🚀 Progressive Task List

### Beginner Tasks (Week 1-2)

#### Task 1: Loading Spinner Component
**Complexity:** ⭐ Easy  
**Time Estimate:** 1-2 hours

Create a reusable loading spinner component with size variants.

```typescript
// Requirements:
- Support sizes: 'sm', 'md', 'lg'
- Support custom colors
- Smooth animation
- Accessible (aria-label)
- Unit tests included
```

**Success Criteria:**
- [ ] Component renders correctly
- [ ] All size variants work
- [ ] Tests cover all props
- [ ] Used in at least one place in the app

---

#### Task 2: Empty State Component
**Complexity:** ⭐ Easy  
**Time Estimate:** 2-3 hours

Create a component to show when there's no data.

```typescript
// Requirements:
- Display icon (from lucide-react)
- Custom title and description
- Optional action button
- Responsive design
```

**Files to Create:**
- `src/components/EmptyState.tsx`
- `src/components/EmptyState.test.tsx`

---

#### Task 3: Error Message Component
**Complexity:** ⭐ Easy  
**Time Estimate:** 2 hours

Display error messages with retry functionality.

```typescript
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}
```

---

### Intermediate Tasks (Week 3-4)

#### Task 4: Document Card Component
**Complexity:** ⭐⭐ Medium  
**Time Estimate:** 4-6 hours

Create a card to display document information.

```typescript
// Requirements:
- Show document title, date, file type
- Display file icon based on mime type
- Hover effects
- Click to open document
- Right-click context menu
- Delete confirmation
```

**Design Reference:** See Figma link in Slack

---

#### Task 5: Search Input with Debounce
**Complexity:** ⭐⭐ Medium  
**Time Estimate:** 3-4 hours

Implement search input with debounced API calls.

```typescript
// Requirements:
- Debounce search by 300ms
- Show loading indicator
- Clear button
- Keyboard shortcuts (Cmd+K to focus)
- Accessible
```

**Learning Focus:** Custom hooks, debouncing, useEffect

---

#### Task 6: File Upload Component
**Complexity:** ⭐⭐⭐ Hard  
**Time Estimate:** 6-8 hours

Create drag-and-drop file upload component.

```typescript
// Requirements:
- Drag and drop support
- File type validation
- File size validation (max 50MB)
- Upload progress bar
- Multiple file support
- Error handling
```

**API Integration:** Use `/api/v1/documents/upload`

---

### Advanced Tasks (Week 5-8)

#### Task 7: Document Viewer Modal
**Complexity:** ⭐⭐⭐ Hard  
**Time Estimate:** 8-12 hours

Build modal to preview documents with Google Drive embed.

```typescript
// Requirements:
- Resizable and draggable (react-rnd)
- Support Google Docs, Sheets, Slides
- PDF viewer integration
- Fullscreen mode
- Keyboard navigation (ESC to close)
- Loading states
```

**Learning Focus:** Third-party library integration, complex state management

---

#### Task 8: Infinite Scroll Document List
**Complexity:** ⭐⭐⭐ Hard  
**Time Estimate:** 6-8 hours

Implement infinite scrolling for document list.

```typescript
// Requirements:
- Load 20 documents initially
- Fetch next page on scroll
- Virtual scrolling for performance
- Loading skeleton
- Error boundary
```

**Learning Focus:** React Query pagination, Intersection Observer

---

## 🎨 Design System Guide

### Color Palette

```typescript
// Tailwind config colors
const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',  // Main brand color
    600: '#2563eb',
    900: '#1e3a8a'
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    500: '#6b7280',
    900: '#111827'
  },
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b'
}
```

### Typography

```typescript
// Heading sizes
<h1 className="text-3xl font-bold">Page Title</h1>
<h2 className="text-2xl font-semibold">Section</h2>
<h3 className="text-xl font-medium">Subsection</h3>

// Body text
<p className="text-base text-gray-700">Body text</p>
<p className="text-sm text-gray-600">Small text</p>
<p className="text-xs text-gray-500">Tiny text</p>
```

### Spacing Scale

```typescript
// Use consistent spacing
className="p-4"   // 16px padding
className="m-8"   // 32px margin
className="gap-2" // 8px gap

// Common patterns
className="px-4 py-2"     // Button padding
className="p-6"           // Card padding
className="space-y-4"     // Vertical spacing
```

### Component Variants

```typescript
// Button variants
<Button variant="primary">Submit</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="outline">Edit</Button>
<Button variant="ghost">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

---

## 🐛 Debugging Guide

### Common Errors & Solutions

#### Error 1: "Cannot read property 'map' of undefined"
```typescript
// ❌ Problem
{data.map(item => <div>{item.name}</div>)}

// ✅ Solution: Use optional chaining
{data?.map(item => <div>{item.name}</div>)}

// ✅ Better: Check before mapping
{data && data.length > 0 ? (
  data.map(item => <div key={item.id}>{item.name}</div>)
) : (
  <EmptyState />
)}
```

#### Error 2: "Too many re-renders"
```typescript
// ❌ Problem: Function called in render
<Button onClick={handleClick()}>

// ✅ Solution: Pass function reference
<Button onClick={handleClick}>

// ✅ Or use arrow function
<Button onClick={() => handleClick(id)}>
```

#### Error 3: "Hook called outside of component"
```typescript
// ❌ Problem: Hook in condition
if (condition) {
  const [state, setState] = useState();
}

// ✅ Solution: Hooks at top level
const [state, setState] = useState();
if (condition) {
  // use state here
}
```

#### Error 4: "CORS policy blocked"
```typescript
// ❌ Problem: Wrong API URL
fetch('http://localhost:8000/api/documents')

// ✅ Solution: Use proxy or env variable
fetch('/api/v1/documents') // Proxied in vite.config.ts

// Or use environment variable
fetch(`${import.meta.env.VITE_API_URL}/documents`)
```

### Debugging Tools

#### React DevTools
```bash
# Install Chrome extension
# Then inspect components in browser

# Useful features:
- View component props
- See state values
- Profile performance
- Track re-renders
```

#### Console Debugging
```typescript
// Temporary debugging (remove before commit!)
console.log('Value:', value);
console.table(arrayData);
console.group('API Call');
console.log('Request:', request);
console.log('Response:', response);
console.groupEnd();

// Better: Use debugger
debugger; // Pauses execution in dev tools
```

#### Network Tab
```bash
# In Chrome DevTools:
1. Open Network tab
2. Filter by XHR/Fetch
3. Check request/response
4. Verify status codes
5. Inspect headers
```

---

## 📊 Performance Optimization

### Common Performance Issues

#### Issue 1: Unnecessary Re-renders
```typescript
// ❌ Problem: New object created on every render
<Component config={{ option: 'value' }} />

// ✅ Solution: Move outside or useMemo
const config = { option: 'value' };
<Component config={config} />

// Or
const config = useMemo(() => ({ option: 'value' }), []);
```

#### Issue 2: Heavy Computations
```typescript
// ❌ Problem: Runs on every render
const expensiveValue = heavyComputation(data);

// ✅ Solution: Use useMemo
const expensiveValue = useMemo(() => {
  return heavyComputation(data);
}, [data]);
```

#### Issue 3: Callback Functions
```typescript
// ❌ Problem: New function on every render
<Child onClick={() => handleClick(id)} />

// ✅ Solution: Use useCallback
const handleClickCallback = useCallback(() => {
  handleClick(id);
}, [id]);

<Child onClick={handleClickCallback} />
```

### Performance Checklist
- [ ] Use React.memo for expensive components
- [ ] Implement virtual scrolling for long lists
- [ ] Lazy load images with loading="lazy"
- [ ] Code split routes with React.lazy
- [ ] Debounce search inputs
- [ ] Use optimistic updates for better UX

---

## 🔒 Security Best Practices

### Input Validation

```typescript
// Always validate user input
import { z } from 'zod';

const userInputSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18).max(120),
  name: z.string().min(1).max(100)
});

const result = userInputSchema.safeParse(input);
if (!result.success) {
  // Handle validation errors
}
```

### XSS Prevention

```typescript
// ❌ Dangerous: Direct HTML injection
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Safe: Use text content
<div>{userInput}</div>

// ✅ If HTML needed, sanitize first
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userInput);
<div dangerouslySetInnerHTML={{ __html: clean }} />
```

### Authentication

```typescript
// ✅ Always check auth before API calls
const token = localStorage.getItem('auth_token');

const response = await fetch('/api/documents', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// ✅ Handle 401 responses
if (response.status === 401) {
  // Redirect to login
  navigate('/login');
}
```

### Secrets Management

```typescript
// ❌ Never commit secrets
const apiKey = 'sk-1234567890abcdef';

// ✅ Use environment variables
const apiKey = import.meta.env.VITE_API_KEY;

// ❌ Never expose in client-side code
// API keys should only be in backend
```

---

## 📝 Documentation Standards

### Component Documentation

```typescript
/**
 * Button component with multiple variants and sizes.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 */
interface ButtonProps {
  /** Button text or content */
  children: React.ReactNode;
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Click handler */
  onClick?: () => void;
  /** Disable the button */
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false
}) => {
  // Implementation
};
```

### Function Documentation

```typescript
/**
 * Fetches documents from the API with pagination.
 * 
 * @param page - Page number (1-based)
 * @param limit - Items per page
 * @returns Promise with paginated documents
 * @throws {Error} When API request fails
 */
export async function fetchDocuments(
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Document>> {
  // Implementation
}
```

---

## 🎓 Graduation Criteria

### Ready to Level Up When You Can:

#### Technical Skills ✅
- [ ] Build complex components independently
- [ ] Write comprehensive tests without guidance