# Mobile Navigation System - Implementation Guide

## Overview

This document describes the new mobile-first navigation system implemented for LegalAssist AU. The system replaces the previous hamburger menu approach with a modern, native mobile app experience inspired by Material Design 3 and iOS tab bar patterns.

## Architecture

### Component Structure

```
src/components/mobile/
├── TopBar.tsx                 # Top navigation bar with logo, search, and profile
├── BottomNavigation.tsx       # Bottom tab bar with 5 main navigation items
├── FloatingActionButton.tsx   # FAB for quick actions
├── SearchOverlay.tsx          # Full-screen search experience
└── index.ts                   # Barrel export file
```

## Components

### 1. TopBar Component

**Location:** `src/components/mobile/TopBar.tsx`

**Features:**
- Fixed to top of screen (56px height)
- LegalAssist AU logo that acts as home button
- Search icon triggering full-screen search overlay
- User profile avatar
- All touch targets minimum 44x44px
- Only visible on mobile (hidden on md+ breakpoints)

**Props:**
```typescript
interface TopBarProps {
  onSearchClick: () => void;
}
```

**Usage:**
```tsx
<TopBar onSearchClick={() => setIsSearchOverlayOpen(true)} />
```

### 2. BottomNavigation Component

**Location:** `src/components/mobile/BottomNavigation.tsx`

**Features:**
- Fixed to bottom of screen (56px height)
- 5 navigation tabs:
  - Home (house icon) - path: `/`
  - Documents (folder icon) - path: `/documents`
  - Chat (message icon) - path: `/chat`
  - Analytics (chart icon) - path: `/analytics`
  - Settings (gear icon) - path: `/settings`
- Active state highlighting with color and scale animation
- Haptic feedback on tab selection (10ms vibration)
- Responsive to current route
- Only visible on mobile (hidden on md+ breakpoints)

**No props required** - uses React Router's `useNavigate` and `useLocation` hooks internally.

**Usage:**
```tsx
<BottomNavigation />
```

### 3. FloatingActionButton (FAB)

**Location:** `src/components/mobile/FloatingActionButton.tsx`

**Features:**
- Size: 56x56px
- Position: Fixed bottom-right, 16px from right edge, 80px from bottom (above bottom nav)
- Primary blue color (#2563eb)
- Plus icon for creating new items
- Shadow effect with hover enhancement
- Scale animation on hover/active
- Haptic feedback (15ms vibration)
- Only visible on mobile (hidden on md+ breakpoints)

**Props:**
```typescript
interface FloatingActionButtonProps {
  onClick: () => void;
  ariaLabel?: string; // Default: 'Create new'
}
```

**Usage:**
```tsx
<FloatingActionButton
  onClick={handleFABClick}
  ariaLabel="Create new chat or document"
/>
```

### 4. SearchOverlay Component

**Location:** `src/components/mobile/SearchOverlay.tsx`

**Features:**
- Full-screen overlay (z-index: 60)
- Fade-in/fade-out transition (300ms)
- Large, touch-friendly search input
- Recent searches section with clock icon
- Suggested topics section with trending icon
- Close button (X icon)
- Auto-focus on input when opened
- Prevents body scroll when open
- Only visible on mobile (hidden on md+ breakpoints)

**Props:**
```typescript
interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Usage:**
```tsx
<SearchOverlay
  isOpen={isSearchOverlayOpen}
  onClose={() => setIsSearchOverlayOpen(false)}
/>
```

## Integration in App.tsx

### Key Changes

1. **Imports Added:**
```typescript
import TopBar from "./components/mobile/TopBar";
import BottomNavigation from "./components/mobile/BottomNavigation";
import FloatingActionButton from "./components/mobile/FloatingActionButton";
import SearchOverlay from "./components/mobile/SearchOverlay";
```

2. **New State Variables:**
```typescript
const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
const [showCreateModal, setShowCreateModal] = useState(false);
```

3. **Layout Structure:**
```tsx
<div className="h-screen flex flex-col">
  {/* Mobile: TopBar, Desktop: Header */}
  <TopBar onSearchClick={() => setIsSearchOverlayOpen(true)} />
  <div className="hidden md:block">
    <Header ... />
  </div>

  {/* Main content area with padding for mobile bars */}
  <main className="... pt-14 md:pt-0 pb-14 md:pb-0">
    {/* Desktop sidebars (hidden on mobile) */}
    {/* Content */}
  </main>

  {/* Mobile: Bottom Nav + FAB + Search, Desktop: Footer */}
  <BottomNavigation />
  <FloatingActionButton ... />
  <SearchOverlay ... />
  <div className="hidden md:block">
    <Footer />
  </div>
</div>
```

4. **Removed:**
- Hamburger menu buttons for left/right sidebars on mobile
- Mobile search functionality from Navbar.tsx
- "Senior Counsel" disconnected text

## Styling Guidelines

### Colors
- Primary: `sky-600` (#0284c7), `sky-700` (#0369a1)
- Active state: `sky-600` (#0284c7)
- Inactive state: `slate-600` (#475569)
- Background: `white` (#ffffff)
- Border: `slate-200` (#e2e8f0)

### Touch Targets
- Minimum: 44x44px
- Preferred: 48x48px or larger for primary actions

### Spacing
- TopBar height: 56px (h-14)
- BottomNavigation height: 56px (h-14)
- FAB size: 56x56px (w-14 h-14)
- FAB position: 16px from right, 80px from bottom

### Animations
- Fade transitions: 300ms
- Scale animations: 200ms
- Active tab scale: 1.1x
- FAB hover scale: 1.05x
- FAB active scale: 0.95x

### Breakpoints
- Mobile: `< 768px` (default)
- Desktop: `>= 768px` (md breakpoint)

## Accessibility Features

1. **ARIA Labels:** All interactive elements have appropriate aria-labels
2. **Keyboard Navigation:** Focus states implemented with ring utilities
3. **Screen Reader Support:** aria-current="page" on active navigation items
4. **Touch Targets:** All touch targets meet WCAG 2.1 Level AAA (44x44px minimum)
5. **Focus Management:** Search input auto-focuses when overlay opens
6. **Body Scroll Lock:** Prevents background scrolling when overlay is open

## Haptic Feedback

Haptic feedback is implemented using the Web Vibration API:
- Bottom navigation tabs: 10ms vibration
- Floating action button: 15ms vibration
- Falls back gracefully if device doesn't support vibration

## Routing

The bottom navigation uses React Router's navigation system:
- Home: `/`
- Documents: `/documents`
- Chat: `/chat`
- Analytics: `/analytics`
- Settings: `/settings`

Active state detection:
- Home: Exact match on `/`
- Others: Prefix match (e.g., `/documents` matches `/documents/123`)

## Browser Support

- Modern browsers with ES6+ support
- Fallback for vibration API (optional enhancement)
- Supports both iOS and Android touch patterns

## Performance Considerations

1. **Fixed Positioning:** TopBar and BottomNavigation use fixed positioning for smooth scrolling
2. **CSS Transitions:** Hardware-accelerated transitions for smooth animations
3. **Conditional Rendering:** Mobile components only render on mobile viewports
4. **Z-index Management:** Proper layering to prevent overlap issues

## Future Enhancements

1. **Swipe Gestures:** Add swipe-to-navigate between tabs
2. **Push Notifications:** Badge indicators on navigation items
3. **Offline Mode:** PWA capabilities with service workers
4. **Theme Support:** Dark mode toggle
5. **Customization:** User-configurable tab order
6. **Analytics:** Track navigation patterns and user flows

## Testing Checklist

- [ ] TopBar logo navigates to home
- [ ] Search icon opens SearchOverlay
- [ ] SearchOverlay closes with X button or backdrop
- [ ] Bottom navigation highlights active tab
- [ ] Bottom navigation navigates correctly
- [ ] FAB triggers create modal
- [ ] All touch targets are 44x44px minimum
- [ ] Haptic feedback works on supported devices
- [ ] No horizontal scroll on mobile
- [ ] Components hidden on desktop
- [ ] Smooth transitions and animations
- [ ] No layout shift when navigating
- [ ] Proper z-index layering

## Troubleshooting

### Issue: Components not showing on mobile
**Solution:** Check that viewport width is < 768px and `md:hidden` class is applied

### Issue: Bottom navigation not highlighting active tab
**Solution:** Verify route paths match the paths defined in the tabs array

### Issue: Search overlay not opening
**Solution:** Check that `isSearchOverlayOpen` state is being updated correctly

### Issue: Haptic feedback not working
**Solution:** Vibration API is optional - check browser support with `'vibrate' in navigator`

### Issue: Layout shift when navigating
**Solution:** Ensure main content has `pt-14 pb-14` on mobile for fixed bars

## Contact & Support

For questions or issues related to the mobile navigation system, please refer to the main project documentation or contact the development team.