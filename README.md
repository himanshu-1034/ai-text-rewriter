## AI Text Rewriter – Chrome Extension

AI-powered Chrome extension that rewrites text using Google Gemini. Features both an inline popup that appears when selecting text on any webpage, and a traditional extension popup for manual text rewriting.

Built with Vite, React 19, MUI, Tailwind, and Google Gemini.

### Features

#### Inline Popup (v1.1.0)
- **Smart inline formatting**: Select text on any webpage and a formatting bubble appears automatically
- **Analyzing selection card**: Shows "Analyzing Selection" while you're selecting text, then displays the full popup after selection is complete
- **Direct page integration**: Rewrite and replace text directly on the page without leaving your context
- **Configurable**: Toggle inline popup on/off from settings

#### Extension Popup
- **Multiple rewrite modes**: formal, friendly, shorter, longer, and grammar fixes
- **Gemini-powered rewriting** using the official `@google/generative-ai` client
- **In-popup workflow**: paste/type text, choose tone, get instant results with live loading indicators
- **Page integration**:
  - `Use page selection` grabs whatever you highlighted in Gmail or any other page
  - `Apply to page` replaces the previously captured selection with the rewritten text

#### Settings Page (v1.1.0)
- **Settings management**: Dedicated settings page accessible from the popup
- **Inline popup toggle**: Enable or disable the inline formatting bubble feature

#### Quality-of-Life Tools
- Copy-to-clipboard functionality
- Error banners and status feedback
- Polished light theme optimized for Chrome extension popups
- Loading indicators and progress feedback

### Prerequisites
- Node.js 18+
- npm (comes with Node)
- A Google AI Studio API key with access to Gemini 1.5+ models.

### Setup
```bash
git clone <repo-url>
cd ai-text-rewriter
npm install
```

Create a `.env` file in the project root:
```
VITE_GEMINI_API_KEY=your_api_key_here
```

### Development
```bash
# Start Vite dev server
npm run dev

# Lint
npm run lint
```

During development, use Vite’s dev server and load the popup via `http://localhost:5173`. Content-script functionality (selection capture / replacement) requires the extension build.

### Build & Load Extension
```bash
npm run build
```

This produces a `dist/` directory containing:
- `index.html` (popup)
- `content-script.js`
- Generated `manifest.json`
- Static assets

Load the extension:
1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dist/` folder

### Usage

#### Using Inline Popup (Recommended)
1. **Enable inline popup** (default: enabled):
   - Click the extension icon to open the popup
   - Click the settings icon (⚙️) in the header
   - Toggle "Enable inline popup" on

2. **Select text on any webpage**:
   - Highlight text you want to rewrite
   - An "Analyzing Selection" card appears immediately
   - After selection completes, the full formatting popup appears

3. **Rewrite and apply**:
   - Choose your desired tone/action (formal, friendly, shorter, etc.)
   - Click **Rewrite & apply**
   - The rewritten text replaces your selection directly on the page

#### Using Extension Popup
1. Click the extension icon to open the popup
2. **Option A**: Click **Use page selection** to import highlighted text from the current page
   **Option B**: Paste or type text directly into the input field
3. Choose a tone/action and click **Rewrite**
4. Copy the result or click **Apply to page** to replace the selection inline

#### Settings
- Click the settings icon (⚙️) in the popup header to access settings
- Toggle inline popup on/off
- Settings are saved automatically and sync across all tabs

### Manifest & Permissions
- **Manifest V3**
- Default popup: `index.html`
- Background service worker: `background.js`
- Content script: `content-script.js` (injected on all URLs)
- Permissions:
  - `activeTab` - Access to current tab
  - `tabs` - Tab management
  - `storage` - Settings persistence
- Host permissions:
  - `https://generativelanguage.googleapis.com/*` - Gemini API access
  - `<all_urls>` - Content script injection for inline popup

### Tech Stack
- React 19 + TypeScript
- Vite + Tailwind CSS + MUI
- `@google/generative-ai` (Gemini)
- Chrome Extensions MV3 APIs

### Version
**Current version: v1.1.1**

#### v1.1.1 Changes
- 🏗️ **Major refactoring**: Extracted common hooks and components for better code organization
  - Created custom hooks: `useSettings`, `useClipboard`, `usePageSelection`, `useTextReplacement`
  - Extracted UI components: `Header`, `ModeSelector`, `InputSection`, `PageSelectionButton`, `RewriteButton`, `LoadingIndicator`, `OutputSection`
  - Added `constants.ts` for centralized configuration
- 🐛 Fixed dropdown text visibility in inline popup (white text now visible on white background)
- 📝 Updated developer documentation with new architecture and file structure

#### v1.1.0 Changes
- ✨ Added inline popup feature that appears when selecting text on any webpage
- ✨ Added "Analyzing Selection" card that shows while text is being selected
- ✨ Added settings page with toggle to enable/disable inline popup
- 🏗️ Refactored Settings component into separate file for better organization
- 🎨 Improved popup positioning logic to prevent overflow
- 🔧 Enhanced content script with debounced selection detection

#### v1.0.0 Features
- Multiple rewrite modes (formal, friendly, shorter, longer, fix grammar)
- Extension popup for manual text rewriting
- Page selection capture and replacement
- Copy-to-clipboard functionality
- Light theme optimized for Chrome extensions

### Project Structure
```
src/
├── App.tsx                    # Main popup orchestrator component
├── main.tsx                   # React entry point
├── constants.ts               # Shared constants (storage keys, version)
├── theme.ts                   # MUI theme configuration
├── background.ts              # Service worker for API calls
├── content-script.ts          # Inline popup logic (injected on all pages)
├── components/                # React UI components
│   ├── Settings.tsx           # Settings page component
│   ├── Header.tsx             # Popup header with navigation
│   ├── ModeSelector.tsx       # Rewrite mode/tone selector
│   ├── InputSection.tsx       # Text input field
│   ├── PageSelectionButton.tsx # Page selection button with status
│   ├── RewriteButton.tsx      # Rewrite action button
│   ├── LoadingIndicator.tsx   # Loading progress indicator
│   └── OutputSection.tsx      # Output display and actions
├── hooks/                     # Custom React hooks
│   ├── useSettings.ts         # Settings management hook
│   ├── useClipboard.ts        # Clipboard copy functionality
│   ├── usePageSelection.ts    # Page selection capture
│   └── useTextReplacement.ts  # Text replacement on page
└── lib/                       # Utility libraries
    └── aiClient.ts            # Gemini API client
```

### Notes
- **Content Script**: The inline popup is injected via a content script that runs on all pages. It uses Shadow DOM to avoid conflicts with page styles.
- **Settings Storage**: Settings are stored in `chrome.storage.sync` and automatically sync across browser instances.
- **Gemini API**: Ensure you have a valid API key from Google AI Studio. The model can be adjusted in `src/lib/aiClient.ts` (default: `gemini-2.5-flash`).
- **Debugging**: If the inline popup doesn't appear, check:
  - Settings → "Enable inline popup" is toggled on
  - Content script is loaded (check `chrome://extensions` → Details → Inspect views: service worker)
  - Console for any errors related to permissions or API keys

### Documentation
- **[DEVELOPER.md](./DEVELOPER.md)**: Comprehensive developer documentation covering architecture, file structure, communication flows, and development guidelines.

### License
MIT
