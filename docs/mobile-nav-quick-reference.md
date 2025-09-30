# Mobile Navigation Quick Reference Card

## Component Locations

```
src/components/mobile/
├── TopBar.tsx                 # Top navigation bar
├── BottomNavigation.tsx       # Bottom tab bar
├── FloatingActionButton.tsx   # FAB button
├── SearchOverlay.tsx          # Full-screen search
└── index.ts                   # Exports
```

## Usage Examples

### TopBar
```tsx
<TopBar onSearchClick={() => setIsSearchOverlayOpen(true)} />
```

### BottomNavigation
```tsx
<BottomNavigation />
// No props needed - handles navigation internally
```

### FloatingActionButton
```tsx
<FloatingActionButton
  onClick={handleFABClick}
  ariaLabel="Create new"
/>
```

### SearchOverlay
```tsx
<SearchOverlay
  isOpen={isSearchOverlayOpen}
  onClose={() => setIsSearchOverlayOpen(false)}
/>
```

## Sizing Reference

| Component | Dimensions | Position |
|-----------|-----------|----------|
| TopBar | Full width × 56px | Fixed top |
| BottomNav | Full width × 56px | Fixed bottom |
| FAB | 56px × 56px | Fixed bottom-right (16px right, 80px bottom) |
| SearchOverlay | Full screen | Fixed (z-index: 60) |

## Color Palette

| Element | Color | Tailwind Class |
|---------|-------|----------------|
| Primary | #0284c7 | sky-600 |
| Primary Dark | #0369a1 | sky-700 |
| Inactive | #475569 | slate-600 |
| Background | #ffffff | white |
| Border | #e2e8f0 | slate-200 |

## Breakpoints

```
Mobile:  < 768px  (show mobile components)
Desktop: ≥ 768px  (hide mobile components, show desktop layout)
```

## Touch Targets

Minimum: **44px × 44px** (WCAG AAA compliant)

## Navigation Routes

| Icon | Label | Route | Component |
|------|-------|-------|-----------|
| 🏠 | Home | `/` | AIChat |
| 📁 | Documents | `/documents` | TBD |
| 💬 | Chat | `/chat` | TBD |
| 📊 | Analytics | `/analytics` | TBD |
| ⚙️ | Settings | `/settings` | TBD |

## Haptic Feedback

- Bottom Nav Tabs: **10ms**
- FAB Button: **15ms**
- Falls back gracefully if unsupported

## Z-Index Layers

```
60 - SearchOverlay
50 - TopBar, BottomNavigation
40 - FAB, Backdrop
30 - Sidebars (desktop)
10 - Content
```

## Animations

| Element | Duration | Type |
|---------|----------|------|
| Overlay fade | 300ms | opacity |
| Tab highlight | 200ms | scale/color |
| FAB hover | 200ms | scale |
| Active tab | 1.1× scale | transform |

## Accessibility

- ✓ All touch targets ≥ 44px
- ✓ ARIA labels on all buttons
- ✓ Focus indicators (ring)
- ✓ Screen reader support
- ✓ Keyboard navigation

## Common Tasks

### Add Navigation Tab
Edit `BottomNavigation.tsx`:
```tsx
const tabs: NavTab[] = [
  // Add new tab here
  {
    id: 'new-tab',
    label: 'New',
    icon: IconName,
    path: '/new-path',
  },
];
```

### Change Primary Color
Replace `sky-600` and `sky-700` classes with your color palette.

### Adjust Bar Heights
Search and replace `h-14` (56px) with desired height class.

### Modify FAB Position
Edit `FloatingActionButton.tsx`:
```tsx
className="... bottom-20 right-4 ..." // Adjust these values
```

## Testing Checklist

- [ ] Mobile viewport (< 768px) shows mobile components
- [ ] Desktop viewport (≥ 768px) hides mobile components
- [ ] Navigation tabs highlight correctly
- [ ] FAB triggers action
- [ ] Search overlay opens/closes
- [ ] All touch targets ≥ 44px
- [ ] No horizontal scroll
- [ ] Smooth animations

## Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Files Modified

1. `src/App.tsx` - Integration
2. `src/components/Navbar.tsx` - Desktop only

## Dependencies Used

- `react-router-dom` - Navigation
- `lucide-react` - Icons
- `tailwindcss` - Styling

## Browser Support

✓ Chrome/Edge ✓ Firefox ✓ Safari ✓ Mobile browsers

## Documentation

- Full guide: `docs/mobile-navigation-guide.md`
- Layout diagrams: `docs/mobile-layout-structure.txt`
- Implementation notes: `docs/implementation-notes.md`

---

**Quick Help:** Check console for navigation events and search queries