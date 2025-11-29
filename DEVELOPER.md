# Developer Documentation

This document provides technical details for developers working on the AI Text Rewriter Chrome extension.

## Architecture Overview

The extension follows Chrome Extension Manifest V3 architecture with three main components:

1. **Popup** (React App) - User interface for manual text rewriting
2. **Content Script** - Injected into web pages for inline popup functionality
3. **Background Service Worker** - Handles AI API calls and message routing

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Extension                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │    Popup     │    │   Content    │    │  Background  │  │
│  │  (React)     │    │    Script    │    │   Worker     │  │
│  │              │    │              │    │              │  │
│  │ - UI/UX      │◄──►│ - Inline UI  │◄──►│ - AI API     │  │
│  │ - Settings   │    │ - Selection  │    │ - Messages   │  │
│  │ - Rewrite    │    │ - Replace    │    │ - Storage    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                    │                    │          │
│         └────────────────────┴────────────────────┘          │
│                         chrome.storage.sync                   │
└─────────────────────────────────────────────────────────────┘
```

## File Structure & Responsibilities

### Project Structure
```
src/
├── App.tsx                    # Main popup orchestrator component
├── main.tsx                   # React entry point
├── constants.ts               # Shared constants (storage keys, version)
├── theme.ts                   # MUI theme configuration
├── index.css                  # Global styles
├── envs.ts                    # Environment variable access
├── background.ts              # Background service worker
├── content-script.ts          # Inline popup content script
├── components/                # React UI components
│   ├── Settings.tsx
│   ├── Header.tsx
│   ├── ModeSelector.tsx
│   ├── InputSection.tsx
│   ├── PageSelectionButton.tsx
│   ├── RewriteButton.tsx
│   ├── LoadingIndicator.tsx
│   └── OutputSection.tsx
├── hooks/                     # Custom React hooks
│   ├── useSettings.ts
│   ├── useClipboard.ts
│   ├── usePageSelection.ts
│   └── useTextReplacement.ts
└── lib/                       # Utility libraries
    └── aiClient.ts            # Gemini API client
```

### Core Files

#### `src/main.tsx`
- **Purpose**: React application entry point
- **Responsibilities**:
  - Renders the root React component
  - Sets up MUI ThemeProvider and CssBaseline
  - Loads Roboto font weights

#### `src/App.tsx`
- **Purpose**: Main popup interface component (orchestrator)
- **Responsibilities**:
  - Manages view state (main vs settings)
  - Coordinates UI components and custom hooks
  - Handles rewrite logic (calls AI client directly)
- **Key State**:
  - `view`: "main" | "settings"
  - `input`, `output`: Text state
  - `mode`: Current rewrite mode
  - `loading`, `error`: Async state
- **Key Functions**:
  - `handleRewrite()`: Calls AI client directly (popup has access to modules)
  - Composes custom hooks for settings, clipboard, page selection, and text replacement
- **Note**: Refactored in v1.1.1 to use extracted hooks and components for better maintainability

#### `src/constants.ts`
- **Purpose**: Shared constants and configuration
- **Responsibilities**:
  - Centralizes storage keys (e.g., `STORAGE_KEY_INLINE_ENABLED`)
  - Defines application version (`APP_VERSION`)
- **Benefits**: Single source of truth for constants used across the application

### Custom Hooks

#### `src/hooks/useSettings.ts`
- **Purpose**: Settings management hook
- **Responsibilities**:
  - Loads inline bubble setting from `chrome.storage.sync`
  - Provides `handleToggleInlineBubble` function to update setting
  - Broadcasts setting changes to all content scripts
- **Returns**:
  - `inlineBubbleEnabled`: Current setting value
  - `handleToggleInlineBubble`: Change handler

#### `src/hooks/useClipboard.ts`
- **Purpose**: Clipboard copy functionality hook
- **Responsibilities**:
  - Manages copy-to-clipboard state (`copied` flag)
  - Handles clipboard write operations
  - Auto-resets `copied` flag after 1.5 seconds
- **Returns**:
  - `copied`: Boolean indicating if text was recently copied
  - `copyToClipboard(text)`: Function to copy text to clipboard

#### `src/hooks/usePageSelection.ts`
- **Purpose**: Page selection capture hook
- **Responsibilities**:
  - Communicates with content script to get selected text
  - Manages selection status messages
  - Handles Chrome tabs API communication
- **Returns**:
  - `selectionStatus`: Status message string or null
  - `getPageSelection()`: Async function to fetch selection from active tab
  - `clearSelectionStatus()`: Function to clear status

#### `src/hooks/useTextReplacement.ts`
- **Purpose**: Text replacement on page hook
- **Responsibilities**:
  - Sends replacement messages to content script
  - Manages replacement status feedback
  - Handles Chrome tabs API communication
- **Returns**:
  - `replaceStatus`: Status message string or null
  - `replaceSelection(text)`: Async function to replace selection on page
  - `clearReplaceStatus()`: Function to clear status

### UI Components

#### `src/components/Settings.tsx`
- **Purpose**: Settings page component
- **Responsibilities**:
  - Renders settings UI (currently just inline popup toggle)
  - Receives props for setting values and change handlers
- **Note**: Modular component for easy extension with more settings

#### `src/components/Header.tsx`
- **Purpose**: Popup header component
- **Responsibilities**:
  - Displays application title and subtitle
  - Shows version badge
  - Renders settings icon button (main view) or back button (settings view)
  - Handles view navigation

#### `src/components/ModeSelector.tsx`
- **Purpose**: Rewrite mode/tone selector component
- **Responsibilities**:
  - Renders toggle button group for rewrite modes
  - Displays available modes: formal, friendly, shorter, longer, fix grammar
  - Handles mode selection changes

#### `src/components/InputSection.tsx`
- **Purpose**: Text input field component
- **Responsibilities**:
  - Renders multiline text field for original text
  - Manages input value and onChange events
  - Handles disabled state during loading

#### `src/components/PageSelectionButton.tsx`
- **Purpose**: Page selection button with status display
- **Responsibilities**:
  - Renders "Use page selection" button
  - Displays selection status message or placeholder text
  - Handles button click to fetch selection from page

#### `src/components/RewriteButton.tsx`
- **Purpose**: Rewrite action button component
- **Responsibilities**:
  - Renders primary "Rewrite" button
  - Shows loading state with spinner and "Working…" text
  - Displays helper text above button
  - Handles disabled state

#### `src/components/LoadingIndicator.tsx`
- **Purpose**: Loading progress indicator
- **Responsibilities**:
  - Displays loading spinner with "Transforming your text…" message
  - Fades in/out based on loading state
  - Provides visual feedback during AI processing

#### `src/components/OutputSection.tsx`
- **Purpose**: Output display and action panel
- **Responsibilities**:
  - Displays rewritten text in scrollable paper component
  - Shows error alerts when present
  - Renders copy and replace action buttons
  - Displays replacement status messages
  - Handles empty state placeholder

### Background Service Worker

#### `src/background.ts`
- **Purpose**: Background service worker (runs in extension context)
- **Responsibilities**:
  - Handles AI rewrite requests from content script
  - Acts as intermediary for content scripts (which can't import modules directly)
  - Communicates with Gemini API
- **Key Functions**:
  - Message listener for `BUBBLE_REWRITE` type
  - Calls `rewriteTextWithAI()` from AI client
  - Returns results to content script
- **Why Service Worker?**:
  - Content scripts run in isolated context and can't use ES modules
  - Service worker can import and use the AI client library
  - Provides centralized API handling

### Content Script

#### `src/content-script.ts`
- **Purpose**: Injected into all web pages for inline popup functionality
- **Responsibilities**:
  - Monitors text selections on pages
  - Shows "Analyzing Selection" card during selection
  - Renders inline formatting bubble UI
  - Handles selection capture and text replacement
  - Listens for settings changes
- **Key State**:
  - `bubbleState`: UI state (visible, analyzing, loading, mode, etc.)
  - `lastSelection`: Captured selection metadata
  - `inlineBubbleEnabled`: Setting from storage
- **Key Functions**:
  - `captureSelection()`: Captures current text selection (textarea/input or contenteditable)
  - `replaceLastSelection()`: Replaces captured selection with new text
  - `showAnalyzingCard()`: Shows loading card during selection
  - `showInlineBubble()`: Shows full rewrite popup
  - `scheduleInlineBubbleUpdate()`: Debounced selection handler
- **Important Constraints**:
  - Cannot use ES6 imports (must be bundled standalone)
  - Uses Shadow DOM to avoid CSS conflicts with host page
  - Communicates with background worker via `chrome.runtime.sendMessage`

### AI Client

#### `src/lib/aiClient.ts`
- **Purpose**: Google Gemini API integration
- **Responsibilities**:
  - Wraps `@google/generative-ai` SDK
  - Defines rewrite mode prompts
  - Handles API errors and response parsing
- **Key Functions**:
  - `rewriteTextWithAI(text, mode)`: Main rewrite function
- **Configuration**:
  - Model: `gemini-2.5-flash` (configurable)
  - Temperature: 0.4
  - API key from `VITE_GEMINI_API_KEY` env variable

#### `src/envs.ts`
- **Purpose**: Environment variable access
- **Responsibilities**:
  - Exports environment variables for use in code
  - Provides type-safe access to `VITE_*` variables

### Styling & Theme

#### `src/theme.ts`
- **Purpose**: MUI theme configuration
- **Responsibilities**:
  - Defines color palette (light theme)
  - Configures component overrides
  - Sets typography defaults
- **Colors**:
  - Primary: Indigo (#6366f1)
  - Secondary: Purple (#8b5cf6)
  - Success: Green (#10b981)
  - Background: Light gray (#f9fafb)

#### `src/index.css`
- **Purpose**: Global CSS and extension-specific styles
- **Responsibilities**:
  - Sets up Tailwind CSS
  - Defines extension popup dimensions (380px × 550px)
  - Custom scrollbar styling
  - Base font configuration

### Build Configuration

#### `vite.config.ts`
- **Purpose**: Vite build configuration
- **Responsibilities**:
  - Configures multiple entry points:
    - `main`: Popup HTML
    - `contentScript`: Content script bundle
    - `background`: Service worker bundle
  - Sets base path to `./` for relative asset paths
  - Configures output for Chrome extension structure
- **Key Settings**:
  - `base: './'`: Relative paths for extension protocol
  - `cssCodeSplit: false`: Single CSS bundle
  - Custom file naming with hashes

#### `public/manifest.json`
- **Purpose**: Chrome extension manifest
- **Key Points**:
  - Manifest V3
  - Content script injected on all URLs (`<all_urls>`)
  - Background service worker (type: module)
  - Required permissions: `activeTab`, `tabs`, `storage`
  - Host permissions for Gemini API

## Communication Flow

### Popup ↔ Content Script
```
Popup                    Content Script
  │                            │
  │  chrome.tabs.sendMessage   │
  │───────────────────────────>│
  │  { type: "GET_SELECTION" } │
  │                            │
  │  { text: "..." }           │
  │<───────────────────────────│
  │                            │
  │  { type: "REPLACE_SELECTION", newText }│
  │───────────────────────────>│
  │  { ok: true }              │
  │<───────────────────────────│
```

### Content Script ↔ Background Worker
```
Content Script          Background Worker          Gemini API
      │                         │                      │
      │  BUBBLE_REWRITE         │                      │
      │────────────────────────>│                      │
      │                         │  rewriteTextWithAI() │
      │                         │─────────────────────>│
      │                         │  { result: "..." }   │
      │                         │<─────────────────────│
      │  { ok: true, result }   │                      │
      │<────────────────────────│                      │
```

### Settings Sync
```
Popup                    Storage                     Content Script
  │                         │                              │
  │  chrome.storage.sync.set│                              │
  │────────────────────────>│                              │
  │                         │  chrome.storage.onChanged    │
  │                         │─────────────────────────────>│
  │                         │  Message broadcast           │
  │                         │─────────────────────────────>│
```

## Storage & State Management

### Chrome Storage API
- **Storage Type**: `chrome.storage.sync`
- **Purpose**: Settings persistence that syncs across devices
- **Current Keys**:
  - `inlineBubbleEnabled`: Boolean flag for inline popup

### Local State
- **Popup**: React useState hooks
- **Content Script**: Plain JavaScript objects (no framework)
- **Settings Sync**: Automatic via `chrome.storage.onChanged` listener

## Key Concepts

### Shadow DOM Usage
The content script uses Shadow DOM to:
- Isolate styles from host page
- Prevent CSS conflicts
- Maintain consistent appearance across different websites

```typescript
bubbleHost = document.createElement("div");
bubbleShadow = bubbleHost.attachShadow({ mode: "open" });
```

### Selection Capture Strategy
The extension handles two types of selections:

1. **Textarea/Input Elements**:
   - Uses `selectionStart` and `selectionEnd`
   - Stores element reference for replacement
   - Triggers `input` event after replacement for framework reactivity

2. **Contenteditable/General Selection**:
   - Uses `window.getSelection()` and `Range` API
   - Clones range for persistence
   - Replaces via DOM manipulation

### Debouncing Selection Events
- Selection changes fire rapidly during mouse drag
- 300ms debounce waits for selection to stabilize
- "Analyzing" card shows immediately, full popup after delay

### Message Passing Patterns
- **Synchronous**: Simple request/response (GET_SELECTION)
- **Asynchronous**: Long-running operations (BUBBLE_REWRITE)
- **Broadcast**: Settings changes via storage events

## Build Process

1. **TypeScript Compilation**: `tsc -b`
2. **Vite Build**: Bundles all entry points
3. **Output Structure**:
   ```
   dist/
   ├── index.html              # Popup HTML
   ├── manifest.json           # Copied from public/
   ├── background.js           # Service worker bundle
   ├── content-script.js       # Content script bundle
   ├── assets/
   │   ├── main-[hash].js      # Popup JS bundle
   │   └── style-[hash].css    # Styles
   └── icons/                  # Extension icons
   ```

## Development Workflow

### Local Development
1. Run `npm run dev` for popup development
2. Content script requires build (`npm run build`)
3. Reload extension in `chrome://extensions` after changes

### Debugging

#### Popup
- Right-click extension icon → "Inspect popup"
- React DevTools available

#### Content Script
- `chrome://extensions` → Details → "Inspect views: service worker"
- Check console on target webpage (may need to filter extension context)

#### Background Worker
- `chrome://extensions` → Details → "Inspect views: service worker"
- Console shows service worker logs

### Common Issues

1. **Content Script Not Loading**:
   - Check manifest.json matches
   - Verify build includes content-script.js
   - Reload extension completely

2. **Module Import Errors**:
   - Content scripts can't use ES6 imports (must be bundled)
   - Use message passing to background worker instead

3. **Storage Not Syncing**:
   - Verify `storage` permission in manifest
   - Check `chrome.storage.sync` is used (not `local`)

4. **Selection Not Captured**:
   - Some pages block selection events
   - Content script might not be injected (check CSP)

## Adding New Features

### Adding a New Setting
1. Add key to `STORAGE_KEY_*` constants in `src/constants.ts`
2. Update `useSettings` hook to manage new setting
3. Add UI control in `components/Settings.tsx`
4. Update content script to listen for changes

### Adding a New Rewrite Mode
1. Update `RewriteMode` type in `src/lib/aiClient.ts`
2. Add prompt to `MODE_PROMPTS` object
3. Add toggle button in `components/ModeSelector.tsx` and content script popup

### Modifying Inline Popup
- Edit `src/content-script.ts`
- Update `renderBubble()` for UI changes
- Modify `bubbleState` type for new state
- Ensure dropdown/select elements have proper color styling (fixed in v1.1.1)
- Test across different websites (CSS isolation)

### Code Organization Best Practices
- **Custom Hooks**: Extract reusable stateful logic into hooks (see `src/hooks/`)
- **Components**: Keep components focused and single-purpose (see `src/components/`)
- **Constants**: Centralize shared constants in `src/constants.ts`
- **Separation of Concerns**: 
  - UI components handle presentation
  - Hooks handle business logic and side effects
  - Main App component orchestrates and composes everything

## Dependencies

### Runtime
- `react`, `react-dom`: UI framework
- `@mui/material`, `@emotion/*`: UI component library
- `@google/generative-ai`: Gemini API client
- `lucide-react`: Icons

### Build Time
- `vite`: Build tool
- `@vitejs/plugin-react`: React support
- `@tailwindcss/vite`: Tailwind CSS
- `typescript`: Type checking

## Environment Variables

- `VITE_GEMINI_API_KEY`: Required - Google AI Studio API key
- Add to `.env` file in project root
- Never commit `.env` to version control

## Testing Considerations

- Test inline popup on different websites (Gmail, Google Docs, etc.)
- Verify text replacement works in textareas and contenteditable divs
- Check popup dimensions on different screen sizes
- Test settings persistence after extension reload
- Verify message passing works across different page contexts

