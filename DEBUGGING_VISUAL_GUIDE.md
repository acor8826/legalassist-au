# Visual Debugging Guide - Document Viewer Modal

## Color-Coded Debug Borders

When you open the modal, you will see three colored borders that help identify layout issues:

```
┌─────────────────────────────────────────────┐
│ VIEWPORT                                    │
│  ┌─────────────────────────────────────┐   │
│  │ 🟢 GREEN = Rnd Container (Modal)   │   │
│  │                                     │   │
│  │  ┌───────────────────────────────┐ │   │
│  │  │ 🔴 RED = Header Section      │ │   │
│  │  │                               │ │   │
│  │  │  📄 Document Title            │ │   │
│  │  │  [Navigation] [Maximize] [X]  │ │   │
│  │  └───────────────────────────────┘ │   │
│  │                                     │   │
│  │  ┌───────────────────────────────┐ │   │
│  │  │ 🔵 BLUE = Content Container  │ │   │
│  │  │                               │ │   │
│  │  │       ┌─────────────┐         │ │   │
│  │  │       │             │         │ │   │
│  │  │       │  PDF PAGE   │         │ │   │
│  │  │       │             │         │ │   │
│  │  │       └─────────────┘         │ │   │
│  │  │                               │ │   │
│  │  │       ⬇️ White space here?    │ │   │
│  │  │                               │ │   │
│  │  └───────────────────────────────┘ │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## What to Look For

### 1. Green Border (Rnd Container)
- This is the outermost boundary of your modal
- Should be resizable by dragging corners
- Should maximize to 95% of viewport
- **Check:** Is there extra space around the green border?

### 2. Red Border (Header)
- Contains title and controls
- Should be relatively small (60-80px height)
- **Check:** Is the red section too tall?

### 3. Blue Border (Content Area)
- This is where the PDF renders
- Should fill most of the modal
- **Check:** Is there large blue space below the PDF?

## Console Log Flow Diagram

```
User clicks file
       ↓
┌──────────────────────────────────────────┐
│ [DocumentCard] Setting previewFile       │
│ {                                        │
│   id: "...",                            │
│   name: "...",                          │
│   drive_file_id: "..." OR               │
│   drive_web_view_link: "..."           │
│ }                                        │
└──────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────┐
│ [Modal] Component mounted                │
└──────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────┐
│ [Modal] Received file: {...}             │
└──────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────┐
│ [Modal] Using drive_file_id URL:         │
│ https://drive.google.com/uc?id=...      │
│          OR                              │
│ [Modal] Using drive_web_view_link URL:   │
│ https://docs.google.com/.../export...   │
└──────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────┐
│ [Modal] PDF loaded successfully.         │
│ Pages: 5                                 │
└──────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────┐
│ [Modal] Page rendered:                   │
│ {                                        │
│   pageNumber: 1,                        │
│   width: 612,                           │
│   height: 792,                          │
│   originalWidth: 612,                   │
│   originalHeight: 792                   │
│ }                                        │
└──────────────────────────────────────────┘

User resizes modal
       ↓
┌──────────────────────────────────────────┐
│ [Modal] Resizing:                        │
│ {                                        │
│   width: 1000,                          │
│   height: 800,                          │
│   direction: "right"                    │
│ }                                        │
└──────────────────────────────────────────┘

User clicks maximize
       ↓
┌──────────────────────────────────────────┐
│ [Modal] Toggle maximize: true            │
└──────────────────────────────────────────┘

User presses Escape
       ↓
┌──────────────────────────────────────────┐
│ [Modal] Escape key pressed - closing    │
└──────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────┐
│ [Modal] Component unmounted              │
└──────────────────────────────────────────┘
```

## Interactive Testing Checklist

### Test 1: File Object Structure
```
□ Open DevTools Console (F12)
□ Click on a PDF file
□ Find log: [DocumentCard] Setting previewFile
□ Verify object has these properties:
  □ id (string)
  □ name (string)
  □ mime_type (string)
  □ drive_file_id (string) OR drive_web_view_link (string)
```

### Test 2: URL Construction
```
□ After clicking file, find log: [Modal] Using...
□ Copy the URL from the log
□ Paste into browser address bar
□ Verify it downloads/displays a PDF
□ Check for CORS errors in console
```

### Test 3: Visual Layout
```
□ Modal opens with colored borders
□ Take screenshot showing all three borders
□ Measure approximate heights:
  □ Red (header): ___ px
  □ Blue (content): ___ px
  □ PDF page: ___ px
  □ White space below PDF: ___ px
□ Identify which border shows extra space
```

### Test 4: PDF Rendering
```
□ Find log: [Modal] PDF loaded successfully. Pages: X
□ Find log: [Modal] Page rendered: {...}
□ Note dimensions:
  □ width: ___ px
  □ height: ___ px
  □ originalWidth: ___ px
  □ originalHeight: ___ px
□ Does PDF look correctly sized? Yes/No
```

### Test 5: Resize Behavior
```
□ Drag modal corner to resize
□ Find log: [Modal] Resizing: {...}
□ Does PDF resize with modal? Yes/No (Expected: No)
□ Is there more/less white space after resize?
```

### Test 6: Maximize
```
□ Click maximize button (⬜ icon)
□ Find log: [Modal] Toggle maximize: true
□ Modal should be 95% of viewport
□ Click again to restore
□ Find log: [Modal] Toggle maximize: false
```

### Test 7: Close Behavior
```
□ Click inside modal content
  □ Find log: [Modal] Content clicked - preventing close
  □ Modal stays open? Yes/No
□ Click outside modal (dark backdrop)
  □ Find log: [Modal] Backdrop clicked - closing modal
  □ Modal closes? Yes/No
□ Open modal again, press Escape
  □ Find log: [Modal] Escape key pressed - closing modal
  □ Modal closes? Yes/No
□ After closing
  □ Find log: [Modal] Component unmounted
```

## Common Issues & Diagnosis

### Issue: Large White Space Below PDF

**Diagnosis Steps:**
1. Look at blue border - is it much larger than the PDF?
2. Check console for PDF dimensions
3. Compare PDF height to container height

**Possible Causes:**

**A) Fixed Height Too Small**
```
PDF height: window.innerHeight * 0.65
Container height: Larger than PDF

Solution: Use container height instead of viewport height
```

**B) Alignment Issue**
```
CSS: items-start (content aligned to top)
Result: White space accumulates at bottom

Solution: Change to items-center for vertical centering
```

**C) PDF Aspect Ratio**
```
PDF is narrow/short
Container is large
Result: Extra space around PDF

Solution: Normal behavior, or implement zoom to fill
```

### Issue: PDF Doesn't Resize with Modal

**Diagnosis:**
```
1. Resize modal
2. Check console for: [Modal] Resizing: {...}
3. PDF stays same size? → Confirmed issue
```

**Root Cause:**
```typescript
// Current: Fixed viewport height
height={window.innerHeight * 0.65}

// Doesn't use dimensions state or container size
```

**Solution:** See FIXES_SUMMARY.md "Fix 2: Make PDF Responsive to Modal Resize"

### Issue: PDF Not Loading

**Diagnosis Steps:**
```
1. Check for: [Modal] Using drive_file_id URL: ...
2. Copy URL and test in browser
3. Check console for errors
```

**Possible Errors:**

**A) CORS Error**
```
Access to fetch at 'https://drive.google.com/...' has been blocked by CORS policy
```
**Solution:** Need backend proxy

**B) 404 Error**
```
[Modal] PDF load error: Error: ...404...
```
**Solution:** Invalid file ID or wrong URL format

**C) Authentication Error**
```
Error: Missing credentials or unauthorized
```
**Solution:** File not publicly accessible, need authentication

## Screenshot Locations

When reporting issues, capture these screenshots:

1. **Full Modal View**
   - Shows all three colored borders
   - Entire modal visible
   - Any white space clearly visible

2. **Browser Console**
   - All logs starting with [DocumentCard] and [Modal]
   - Any errors in red
   - Network tab showing PDF request

3. **Resized Modal**
   - After manually resizing
   - Shows console logs of resize event
   - Shows whether PDF resized

4. **Maximized Modal**
   - After clicking maximize
   - Should fill 95% of viewport
   - Shows console log of maximize event

## Expected vs Actual Behavior Table

| Action | Expected Log | Expected Visual |
|--------|--------------|-----------------|
| Click file | `[DocumentCard] Setting previewFile` | Modal opens |
| Modal opens | `[Modal] Component mounted` | Borders visible |
| PDF loads | `[Modal] PDF loaded successfully` | PDF appears |
| Resize | `[Modal] Resizing: {...}` | Border adjusts |
| Maximize | `[Modal] Toggle maximize: true` | Modal fills 95% |
| Escape | `[Modal] Escape key pressed` | Modal closes |
| Click backdrop | `[Modal] Backdrop clicked` | Modal closes |
| Click content | `[Modal] Content clicked` | Modal stays open |

## Measurement Guide

Use browser DevTools to measure elements:

1. **Right-click on colored border**
2. **Select "Inspect"**
3. **Hover over element in Elements panel**
4. **Note dimensions shown in overlay**

Example measurements to record:
```
Green (Rnd) container:
  Width: ___ px
  Height: ___ px

Red (Header):
  Width: ___ px
  Height: ___ px

Blue (Content):
  Width: ___ px
  Height: ___ px

PDF canvas:
  Width: ___ px
  Height: ___ px

Gap between PDF and bottom of blue area: ___ px
```

## Next Steps After Testing

1. **Fill out all test checklists above**
2. **Take required screenshots**
3. **Record all measurements**
4. **Identify specific issues from visual debugging**
5. **Apply fixes from FIXES_SUMMARY.md**
6. **Re-test after applying fixes**
7. **Remove debug borders when satisfied**

---

**Debug borders can be removed by deleting these lines:**
- `DocumentViewerModal.tsx` line 140: `style={{ border: "2px solid green" }}`
- `DocumentViewerModal.tsx` line 146: `style={{ border: "2px solid red", backgroundColor: "rgba(255,0,0,0.1)" }}`
- `DocumentViewerModal.tsx` line 203: `style={{ border: "2px solid blue", backgroundColor: "rgba(0,0,255,0.1)" }}`

---

**Happy Debugging!**
