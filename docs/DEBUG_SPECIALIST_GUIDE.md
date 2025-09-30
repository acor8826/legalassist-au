# Debug Specialist Guide for LegalAssist AU

## 🐛 Debug Specialist Agent Configuration

**Agent Name**: `debug-specialist`  
**Purpose**: Identify and fix bugs in the React TypeScript mobile-responsive application  
**Expertise**: TypeScript, React, Tailwind CSS, Mobile Debugging, Cross-browser Compatibility

---

## 🚀 Quick Start Setup

### Create the Debug Specialist Agent

```powershell
claude agent create debug-specialist --instructions "You are a senior React TypeScript debugging expert for the LegalAssist AU application. Focus on fixing runtime errors, TypeScript type issues, component rendering problems, responsive layout bugs, state management issues, and mobile navigation problems. Use strategic console.log placement, implement error boundaries, ensure cross-browser compatibility, and maintain existing functionality while fixing bugs. Always test fixes on both mobile and desktop views."
```

---

## 🔍 Common Bug Categories & Solutions

### 1. TypeScript Type Errors

#### Diagnostic Command:
```powershell
claude task "Scan all TypeScript files for type errors. Fix: missing type definitions, implicit 'any' types, prop type mismatches, undefined variables, and incorrect import statements. Add proper interfaces and type definitions." --agent debug-specialist --context "src/**/*.tsx,src/**/*.ts"
```

#### Common Issues & Fixes:
```typescript
// ❌ Problem: Missing prop types
const Component = ({title, onClick}) => { }

// ✅ Fix: Add proper typing
interface ComponentProps {
  title: string;
  onClick: () => void;
}
const Component: React.FC<ComponentProps> = ({title, onClick}) => { }

// ❌ Problem: Implicit any
const handleData = (data) => { }

// ✅ Fix: Explicit typing
const handleData = (data: DataType) => { }
```

### 2. Mobile Navigation Bugs

#### Diagnostic Command:
```powershell
claude task "Debug mobile navigation issues including: BottomNavigation not responding to clicks, TopBar search not opening, FloatingActionButton not positioned correctly, navigation state not updating, and route changes not working. Fix all navigation-related bugs." --agent debug-specialist --context "src/components/BottomNavigation.tsx,src/components/TopBar.tsx,src/components/FloatingActionButton.tsx,src/App.tsx"
```

#### Common Issues & Fixes:
```typescript
// ❌ Problem: Navigation not working
<button onClick={"/home"}>Home</button>

// ✅ Fix: Use proper navigation
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
<button onClick={() => navigate('/home')}>Home</button>

// ❌ Problem: Z-index conflicts
className="z-10"  // Different components with conflicting z-index

// ✅ Fix: Z-index hierarchy
// TopBar: z-50
// FAB: z-40  
// BottomNav: z-30
// Overlays: z-[60]
// Modals: z-[70]
```

### 3. Responsive Layout Issues

#### Diagnostic Command:
```powershell
claude task "Fix responsive layout bugs: components not hiding/showing at correct breakpoints, overlapping elements on mobile, incorrect spacing on small screens, horizontal scroll issues. Ensure mobile-first responsive design works correctly." --agent debug-specialist --context "src/**/*.tsx,src/styles/*.css"
```

#### Common Issues & Fixes:
```typescript
// ❌ Problem: Component visible on both mobile and desktop
<div className="hidden">

// ✅ Fix: Proper responsive utilities
<div className="block md:hidden">  // Mobile only
<div className="hidden md:block">  // Desktop only

// ❌ Problem: Horizontal scroll on mobile
<div className="w-[500px]">

// ✅ Fix: Responsive widths
<div className="w-full max-w-[500px]">
```

### 4. State Management Bugs

#### Diagnostic Command:
```powershell
claude task "Debug state management issues: useState not updating, useEffect infinite loops, stale closures, context not providing values, and Redux/Zustand state not syncing. Fix all state-related bugs and add proper cleanup." --agent debug-specialist
```

#### Common Issues & Fixes:
```typescript
// ❌ Problem: State not updating
const [items, setItems] = useState([]);
items.push(newItem);  // Direct mutation

// ✅ Fix: Immutable updates
setItems([...items, newItem]);

// ❌ Problem: useEffect infinite loop
useEffect(() => {
  setData(processData());
});

// ✅ Fix: Add dependencies
useEffect(() => {
  setData(processData());
}, []); // Or specific dependencies
```

### 5. Component Rendering Issues

#### Diagnostic Command:
```powershell
claude task "Fix rendering bugs: components not appearing, conditional rendering failures, map key warnings, fragments issues, and portal rendering problems. Ensure all components render correctly on mount and update." --agent debug-specialist
```

#### Common Issues & Fixes:
```typescript
// ❌ Problem: Component not rendering
{isVisible && <Component />}  // isVisible might be undefined

// ✅ Fix: Explicit boolean check
{!!isVisible && <Component />}

// ❌ Problem: Missing keys in lists
{items.map(item => <Item {...item} />)}

// ✅ Fix: Add unique keys
{items.map(item => <Item key={item.id} {...item} />)}
```

---

## 🔧 Debugging Workflows

### Workflow 1: Complete App Diagnostic

```powershell
# Step 1: Full diagnostic scan
claude task "Run comprehensive diagnostic: 1) List all TypeScript errors, 2) Find all console errors/warnings, 3) Identify broken imports, 4) Check for React violations, 5) Find accessibility issues, 6) List mobile-specific bugs. Output structured report." --agent debug-specialist

# Step 2: Fix critical errors first
claude task "Fix all critical errors preventing app from running: TypeScript compilation errors, missing imports, undefined variables." --agent debug-specialist

# Step 3: Fix functional bugs
claude task "Fix all functional bugs: navigation not working, buttons not clickable, forms not submitting, state not updating." --agent debug-specialist

# Step 4: Fix visual/layout bugs  
claude task "Fix all visual bugs: responsive breakpoints, overlapping elements, incorrect spacing, z-index issues." --agent debug-specialist
```

### Workflow 2: Mobile-Specific Debugging

```powershell
# Step 1: Mobile audit
claude task "Audit mobile experience at 375px width. List all issues: touch targets too small, text unreadable, horizontal scrolling, navigation problems." --agent debug-specialist

# Step 2: Fix mobile interactions
claude task "Fix mobile interaction bugs: touch events not firing, swipe gestures not working, tap delays, double-tap zoom issues." --agent debug-specialist

# Step 3: Fix mobile performance
claude task "Optimize mobile performance: reduce bundle size, lazy load images, implement code splitting, add loading states." --agent debug-specialist
```

### Workflow 3: Post-Implementation Debug

```powershell
# After adding new features
claude task "Debug recent changes: 1) Check for new TypeScript errors, 2) Verify no existing functionality broken, 3) Test on mobile and desktop, 4) Check console for warnings, 5) Verify accessibility maintained." --agent debug-specialist --context "git diff HEAD~1"
```

---

## 🛠️ Debug Tools Integration

### 1. Error Boundary Implementation

```powershell
claude task "Implement error boundaries around all major components to catch and display errors gracefully. Create ErrorBoundary component with fallback UI and error logging." --agent debug-specialist
```

```typescript
// ErrorBoundary.tsx template
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <h2>Something went wrong</h2>
          <details className="mt-2 text-sm">
            <summary>Error details</summary>
            <pre>{this.state.error?.toString()}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 2. Debug Logger Implementation

```powershell
claude task "Create a debug logger utility that can be toggled on/off via environment variable. Should log component renders, state changes, and navigation events." --agent debug-specialist
```

```typescript
// debugLogger.ts template
const DEBUG = process.env.NODE_ENV === 'development';

export const debugLog = {
  component: (name: string, props?: any) => {
    if (DEBUG) console.log(`🔧 Component: ${name}`, props);
  },
  state: (name: string, oldState: any, newState: any) => {
    if (DEBUG) console.log(`📊 State Change: ${name}`, { old: oldState, new: newState });
  },
  navigation: (from: string, to: string) => {
    if (DEBUG) console.log(`🔄 Navigation: ${from} → ${to}`);
  },
  error: (location: string, error: any) => {
    console.error(`❌ Error in ${location}:`, error);
  },
  api: (endpoint: string, response: any) => {
    if (DEBUG) console.log(`🌐 API Call: ${endpoint}`, response);
  }
};
```

### 3. Performance Monitor

```powershell
claude task "Add React DevTools Profiler integration and performance monitoring. Log slow renders and identify performance bottlenecks." --agent debug-specialist
```

---

## 📊 Testing & Validation

### Browser Testing Checklist

```powershell
claude task "Test app across browsers and fix compatibility issues: Chrome (latest), Safari iOS (latest), Firefox (latest), Edge (latest). Focus on: CSS differences, JavaScript API support, touch events, viewport handling." --agent debug-specialist
```

- [ ] Chrome Desktop
- [ ] Chrome Mobile
- [ ] Safari Desktop  
- [ ] Safari iOS
- [ ] Firefox Desktop
- [ ] Firefox Mobile
- [ ] Edge Desktop
- [ ] Samsung Internet

### Mobile Device Testing

```powershell
claude task "Test and fix issues on different mobile viewport sizes: iPhone SE (375px), iPhone 12/13 (390px), iPhone Plus (414px), iPad (768px), Android phones (360px). Ensure responsive design works on all." --agent debug-specialist
```

### Accessibility Testing

```powershell
claude task "Run accessibility audit and fix issues: missing ARIA labels, poor color contrast, keyboard navigation problems, screen reader issues. Ensure WCAG 2.1 AA compliance." --agent debug-specialist
```

---

## 🚨 Emergency Debug Commands

### App Won't Start
```powershell
claude task "EMERGENCY: App won't start. Check: package.json for missing dependencies, tsconfig.json for configuration issues, missing environment variables, syntax errors in App.tsx. Fix immediately to get app running." --agent debug-specialist
```

### White Screen of Death
```powershell
claude task "EMERGENCY: App shows white screen. Check: root element mounting, React Router configuration, major JavaScript errors in console, error boundaries catching silently. Fix to restore app visibility." --agent debug-specialist
```

### Mobile Completely Broken
```powershell
claude task "EMERGENCY: Mobile view completely broken. Check: viewport meta tag, CSS framework loading, media query syntax, JavaScript errors on mobile only. Restore mobile functionality immediately." --agent debug-specialist
```

---

## 📝 Debug Reporting Template

When reporting bugs, use this template:

```markdown
### Bug Report

**Environment:**
- Browser: [e.g., Chrome 119]
- Device: [e.g., iPhone 12]
- Screen Size: [e.g., 375px]
- OS: [e.g., iOS 17]

**Bug Description:**
[Clear description of the issue]

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [etc.]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Console Errors:**
```
[Paste any console errors]
```

**Screenshots:**
[Attach if applicable]

**Additional Context:**
[Any other relevant information]
```

---

## 🔄 Continuous Debugging Strategy

### Pre-commit Checks
```powershell
# Add to package.json scripts
"pre-commit": "npm run type-check && npm run lint && npm run test"
```

### Post-deployment Monitoring
```powershell
claude task "Set up error tracking with console.error interceptor. Log errors to a service or local storage for debugging production issues." --agent debug-specialist
```

### Regular Maintenance
```powershell
# Weekly bug sweep
claude task "Perform weekly bug sweep: check for console warnings, deprecated API usage, performance regressions, and accessibility issues. Fix all non-critical issues found." --agent debug-specialist
```

---

## 🆘 Getting Help

### When to Call Debug Specialist:
- TypeScript won't compile
- Components not rendering
- Navigation broken
- Mobile layout issues
- State management problems
- Performance degradation
- Cross-browser incompatibilities

### Debug Command Generator:
```powershell
# General format
claude task "Debug [SPECIFIC ISSUE]: [SYMPTOMS]. Check [SUSPECTED AREAS]. Fix [DESIRED OUTCOME]." --agent debug-specialist --context "[RELEVANT FILES]"

# Example
claude task "Debug navigation not working: clicking bottom nav items doesn't change route. Check React Router setup and onClick handlers. Fix so navigation works properly." --agent debug-specialist --context "src/components/BottomNavigation.tsx,src/App.tsx"
```

---

## 📚 Resources

### Debugging Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

### Error References
- [React Error Decoder](https://reactjs.org/docs/error-decoder.html)
- [TypeScript Error Messages](https://typescript.tv/errors/)
- [MDN JavaScript Errors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors)

### Performance Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)

---

*This debug guide is maintained alongside the project. Update with new bug patterns and solutions as discovered.