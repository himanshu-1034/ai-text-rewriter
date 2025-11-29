type RewriteMode = "formal" | "friendly" | "shorter" | "longer" | "fix";

type LastSelection =
    | {
        kind: "textarea";
        element: HTMLTextAreaElement | HTMLInputElement;
        start: number;
        end: number;
    }
    | {
        kind: "contenteditable";
        range: Range;
    }
    | null;

let lastSelection: LastSelection = null;
let lastSelectionRect: DOMRect | null = null;

type BubbleState = {
    visible: boolean;
    analyzing: boolean;
    loading: boolean;
    status: string | null;
    error: string | null;
    mode: RewriteMode;
    snippet: string;
    top: number;
    left: number;
};

const bubbleState: BubbleState = {
    visible: false,
    analyzing: false,
    loading: false,
    status: null,
    error: null,
    mode: "formal",
    snippet: "",
    top: 0,
    left: 0,
};

let bubbleHost: HTMLDivElement | null = null;
let bubbleShadow: ShadowRoot | null = null;
let selectionTextForBubble = "";
let hideBubbleTimeout: number | null = null;
let analyzeSelectionTimeout: number | null = null;
let inlineBubbleEnabled = true; // default to enabled
const SELECTION_DEBOUNCE_MS = 300; // Wait 300ms after selection stops before showing popup

function ensureBubbleRoot() {
    if (bubbleHost) return;
    bubbleHost = document.createElement("div");
    bubbleShadow = bubbleHost.attachShadow({ mode: "open" });
    document.documentElement.appendChild(bubbleHost);
    renderBubble();
}

function escapeHTML(input: string) {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
}

function renderBubble() {
    if (!bubbleHost) ensureBubbleRoot();
    if (!bubbleShadow) return;

    const { visible, analyzing, top, left, snippet, mode, status, error, loading } = bubbleState;
    const safeSnippet = escapeHTML(
        snippet.length > 160 ? snippet.slice(0, 157) + "…" : snippet
    );

    const styles = `
      :host {
        position: fixed;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        z-index: 2147483647;
        pointer-events: none;
      }
      .bubble {
        position: fixed;
        min-width: 240px;
        max-width: 280px;
        background: #ffffff;
        color: #111827;
        border-radius: 12px;
        box-shadow: 0 20px 45px rgba(15, 23, 42, 0.2);
        border: 1px solid #e5e7eb;
        padding: 10px 12px;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        transform: translate(-50%, 0);
        pointer-events: auto;
        animation: fadeIn 120ms ease;
      }
      .bubble.hidden {
        display: none;
      }
      .bubble h4 {
        margin: 0;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #6b7280;
      }
      .snippet {
        margin-top: 6px;
        padding: 6px 8px;
        border-radius: 8px;
        background: #f3f4f6;
        font-size: 0.8rem;
        max-height: 60px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      label {
        display: block;
        font-size: 0.7rem;
        margin-top: 8px;
        color: #4b5563;
      }
      select {
        width: 100%;
        margin-top: 4px;
        padding: 6px 8px;
        border-radius: 8px;
        border: 1px solid #d1d5db;
        background: #fff;
        color: #111827;
        font-size: 0.8rem;
        cursor: pointer;
      }
      select option {
        background: #fff;
        color: #111827;
        padding: 4px;
      }
      select:focus {
        outline: 2px solid #4f46e5;
        outline-offset: 2px;
      }
      button.rewrite {
        margin-top: 10px;
        width: 100%;
        padding: 8px 10px;
        border-radius: 999px;
        border: none;
        background: #4f46e5;
        color: white;
        font-weight: 600;
        font-size: 0.8rem;
        cursor: pointer;
      }
      button.rewrite:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .status {
        margin-top: 6px;
        font-size: 0.7rem;
        color: #4b5563;
      }
      .status.error {
        color: #b91c1c;
      }
      .actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 4px;
      }
      .close-btn {
        border: none;
        background: transparent;
        color: #9ca3af;
        cursor: pointer;
        font-size: 0.9rem;
      }
      .analyzing-card {
        position: fixed;
        min-width: 160px;
        background: #ffffff;
        color: #111827;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
        border: 1px solid #e5e7eb;
        padding: 8px 12px;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        transform: translate(-50%, 0);
        pointer-events: auto;
        animation: fadeIn 120ms ease;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.75rem;
        font-weight: 500;
        color: #4b5563;
      }
      .analyzing-spinner {
        width: 14px;
        height: 14px;
        border: 2px solid #e5e7eb;
        border-top-color: #4f46e5;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, 10px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }
    `;

    const analyzingHTML = analyzing
        ? `<div class="analyzing-card" style="top:${top}px; left:${left}px;">
            <div class="analyzing-spinner"></div>
            <span>Analyzing Selection</span>
          </div>`
        : "";

    const bubbleHTML = visible
        ? `<div class="bubble" style="top:${top}px; left:${left}px;">
            <div class="actions">
              <h4>AI rewrite</h4>
              <button class="close-btn" data-action="close" title="Dismiss">×</button>
            </div>
            <div class="snippet">${safeSnippet || "Selection captured"}</div>
            <label>
              Tone / Action
              <select data-role="mode" ${loading ? "disabled" : ""}>
                <option value="formal" ${mode === "formal" ? "selected" : ""}>Formal</option>
                <option value="friendly" ${mode === "friendly" ? "selected" : ""}>Friendly</option>
                <option value="shorter" ${mode === "shorter" ? "selected" : ""}>Shorter</option>
                <option value="longer" ${mode === "longer" ? "selected" : ""}>Longer</option>
                <option value="fix" ${mode === "fix" ? "selected" : ""}>Fix grammar</option>
              </select>
            </label>
            <button class="rewrite" data-action="rewrite" ${loading ? "disabled" : ""}>
              ${loading ? "Rewriting…" : "Rewrite & apply"}
            </button>
            <div class="status ${error ? "error" : ""}">
              ${error ?? status ?? "Ready to apply rewrite"}
            </div>
          </div>`
        : `<div class="bubble hidden"></div>`;

    bubbleShadow.innerHTML = `<style>${styles}</style>${analyzingHTML}${bubbleHTML}`;

    if (!visible) return;

    const modeSelect = bubbleShadow.querySelector<HTMLSelectElement>('select[data-role="mode"]');
    modeSelect?.addEventListener("change", (event) => {
        const target = event.target as HTMLSelectElement;
        bubbleState.mode = target.value as RewriteMode;
    });

    const rewriteButton = bubbleShadow.querySelector<HTMLButtonElement>('button[data-action="rewrite"]');
    rewriteButton?.addEventListener("click", handleBubbleRewrite);

    const closeButton = bubbleShadow.querySelector<HTMLButtonElement>('button[data-action="close"]');
    closeButton?.addEventListener("click", hideInlineBubble);

    positionBubbleElement();
}

function hideInlineBubble() {
    bubbleState.visible = false;
    bubbleState.analyzing = false;
    bubbleState.loading = false;
    bubbleState.status = null;
    bubbleState.error = null;
    
    if (analyzeSelectionTimeout) {
        window.clearTimeout(analyzeSelectionTimeout);
        analyzeSelectionTimeout = null;
    }
    
    renderBubble();
}

function updateBubblePositionFromRect(rect: DOMRect | null) {
    if (!rect) return;
    const top = Math.max(
        12,
        Math.min(window.innerHeight - 12, rect.bottom + 8)
    );
    const left = Math.max(
        12,
        Math.min(window.innerWidth - 12, rect.left + rect.width / 2)
    );
    bubbleState.top = top;
    bubbleState.left = left;
}

function positionBubbleElement() {
    if (!bubbleShadow) return;
    
    if (bubbleState.analyzing) {
        const analyzingCard = bubbleShadow.querySelector<HTMLDivElement>(".analyzing-card");
        if (analyzingCard) {
            analyzingCard.style.top = `${bubbleState.top}px`;
            analyzingCard.style.left = `${bubbleState.left}px`;
        }
        return;
    }
    
    if (!bubbleState.visible) return;
    const bubbleEl = bubbleShadow.querySelector<HTMLDivElement>(".bubble");
    if (!bubbleEl) return;

    const margin = 12;
    const rect = lastSelectionRect;
    const bubbleHeight = bubbleEl.offsetHeight || 0;

    let top = bubbleState.top;
    let left = bubbleState.left;

    if (rect) {
        const preferredTop = rect.bottom + 8;
        const fitsBelow = preferredTop + bubbleHeight + margin <= window.innerHeight;
        top = fitsBelow
            ? preferredTop
            : Math.max(margin, rect.top - bubbleHeight - 8);

        const center = rect.left + rect.width / 2;
        left = center;
    }

    top = Math.min(window.innerHeight - margin, Math.max(margin, top));
    left = Math.min(
        window.innerWidth - margin,
        Math.max(margin, left)
    );

    bubbleState.top = top;
    bubbleState.left = left;
    bubbleEl.style.top = `${top}px`;
    bubbleEl.style.left = `${left}px`;
}

function showAnalyzingCard() {
    if (!inlineBubbleEnabled) return;
    
    ensureBubbleRoot();
    
    bubbleState.analyzing = true;
    bubbleState.visible = false;
    updateBubblePositionFromRect(lastSelectionRect);
    renderBubble();
}

function showInlineBubble(text: string) {
    if (!text.trim()) {
        hideInlineBubble();
        return;
    }

    ensureBubbleRoot();

    if (hideBubbleTimeout) {
        window.clearTimeout(hideBubbleTimeout);
        hideBubbleTimeout = null;
    }

    selectionTextForBubble = text;
    bubbleState.snippet = text;
    bubbleState.status = "Ready to apply rewrite";
    bubbleState.error = null;
    bubbleState.visible = true;
    bubbleState.analyzing = false;
    bubbleState.loading = false;
    updateBubblePositionFromRect(lastSelectionRect);
    renderBubble();
}

function handleBubbleRewrite() {
    if (bubbleState.loading || !selectionTextForBubble.trim()) return;

    bubbleState.loading = true;
    bubbleState.status = "Rewriting…";
    bubbleState.error = null;
    renderBubble();

    chrome.runtime.sendMessage(
        {
            type: "BUBBLE_REWRITE",
            text: selectionTextForBubble,
            mode: bubbleState.mode,
        },
        (response) => {
            bubbleState.loading = false;
            const lastError = chrome.runtime.lastError;
            if (lastError) {
                console.warn("rewrite message error:", lastError.message);
                bubbleState.error = "Unable to contact extension background.";
                renderBubble();
                return;
            }

            if (!response || !response.ok) {
                bubbleState.error = response?.error || "Rewrite failed.";
                renderBubble();
                return;
            }

            const rewritten = response.result as string;
            const replaced = replaceLastSelection(rewritten);

            if (replaced) {
                selectionTextForBubble = rewritten;
                bubbleState.status = "Replaced selection on page ✅";
                bubbleState.snippet = rewritten;

                hideBubbleTimeout = window.setTimeout(() => {
                    hideInlineBubble();
                }, 1500);
            } else {
                bubbleState.status = "Unable to replace selection. Please select text again.";
            }

            renderBubble();
        }
    );
}

function scheduleInlineBubbleUpdate(forceHideWhenEmpty: boolean) {
    if (!inlineBubbleEnabled) {
        if (bubbleState.visible || bubbleState.analyzing) {
            hideInlineBubble();
        }
        return;
    }
    
    // Clear any existing timeout
    if (analyzeSelectionTimeout) {
        window.clearTimeout(analyzeSelectionTimeout);
        analyzeSelectionTimeout = null;
    }
    
    // Check immediately if there's text
    const text = captureSelection();
    
    if (text.trim()) {
        // Show analyzing card immediately
        showAnalyzingCard();
        
        // After delay, show full bubble
        analyzeSelectionTimeout = window.setTimeout(() => {
            analyzeSelectionTimeout = null;
            const currentText = captureSelection();
            if (currentText.trim()) {
                showInlineBubble(currentText);
            } else {
                hideInlineBubble();
            }
        }, SELECTION_DEBOUNCE_MS);
    } else if (
        !bubbleState.loading &&
        (forceHideWhenEmpty || bubbleState.visible || bubbleState.analyzing)
    ) {
        hideInlineBubble();
    }
}

document.addEventListener("mouseup", (event) => {
    if (bubbleHost && event.target && bubbleHost.contains(event.target as Node)) {
        return;
    }
    scheduleInlineBubbleUpdate(true);
});

document.addEventListener("keyup", (event) => {
    if (event.key === "Escape") {
        hideInlineBubble();
        return;
    }
    scheduleInlineBubbleUpdate(false);
});

document.addEventListener("selectionchange", () => {
    if (bubbleState.loading) return;
    scheduleInlineBubbleUpdate(false);
});

window.addEventListener("scroll", () => {
    if (!bubbleState.visible && !bubbleState.analyzing) return;
    updateBubblePositionFromRect(lastSelectionRect);
    positionBubbleElement();
});

window.addEventListener("resize", () => {
    if (!bubbleState.visible && !bubbleState.analyzing) return;
    positionBubbleElement();
});

// Helper: capture current selection and return its text
function captureSelection(): string {
    const active = document.activeElement as HTMLElement | null;

    // Case 1: textarea / input
    if (active && (active.tagName === "TEXTAREA" || active.tagName === "INPUT")) {
        const input = active as HTMLTextAreaElement | HTMLInputElement;
        const start = input.selectionStart ?? 0;
        const end = input.selectionEnd ?? 0;
        const value = input.value ?? "";

        lastSelection = {
            kind: "textarea",
            element: input,
            start,
            end,
        };
        lastSelectionRect = input.getBoundingClientRect();

        return value.slice(start, end);
    }

    // Case 2: contenteditable / general selection
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // Clone the range so it survives later mutations
        lastSelection = {
            kind: "contenteditable",
            range: range.cloneRange(),
        };
        lastSelectionRect = range.getBoundingClientRect();

        return selection.toString();
    }

    lastSelection = null;
    lastSelectionRect = null;
    return "";
}

// Helper: replace previously captured selection with new text
function replaceLastSelection(newText: string): boolean {
    if (!lastSelection) return false;

    if (lastSelection.kind === "textarea") {
        const { element, start, end } = lastSelection;
        const value = element.value ?? "";

        const before = value.slice(0, start);
        const after = value.slice(end);

        element.value = before + newText + after;

        // Place cursor at end of inserted text
        const pos = before.length + newText.length;
        element.selectionStart = element.selectionEnd = pos;

        // Trigger input event so frameworks can react (React, etc.)
        const evt = new Event("input", { bubbles: true });
        element.dispatchEvent(evt);

        return true;
    }

    if (lastSelection.kind === "contenteditable") {
        const { range } = lastSelection;

        // Use the stored Range to replace contents
        range.deleteContents();
        range.insertNode(document.createTextNode(newText));

        // Optionally, move cursor after inserted text
        const selection = window.getSelection();
        if (selection) {
            selection.removeAllRanges();
            const newRange = document.createRange();
            newRange.setStartAfter(range.endContainer);
            newRange.collapse(true);
            selection.addRange(newRange);
        }

        return true;
    }

    return false;
}

// Load inline bubble setting from storage
if (chrome?.storage?.sync) {
    chrome.storage.sync.get(["inlineBubbleEnabled"], (result) => {
        inlineBubbleEnabled = result.inlineBubbleEnabled !== false; // default to true
    });

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === "sync" && changes.inlineBubbleEnabled) {
            inlineBubbleEnabled = changes.inlineBubbleEnabled.newValue !== false;
            if (!inlineBubbleEnabled && (bubbleState.visible || bubbleState.analyzing)) {
                hideInlineBubble();
            }
        }
    });
}

// Message listener
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message !== "object") return;

    if (message.type === "GET_SELECTION") {
        const text = captureSelection();
        sendResponse({ text });
        return; // sync response
    }

    if (message.type === "REPLACE_SELECTION") {
        const { newText } = message as { newText?: string };
        if (typeof newText !== "string") {
            sendResponse({ ok: false, error: "No text provided." });
            return;
        }

        const ok = replaceLastSelection(newText);
        sendResponse({ ok });
        return;
    }

    if (message.type === "INLINE_BUBBLE_SETTING_CHANGED") {
        const { enabled } = message as { enabled?: boolean };
        inlineBubbleEnabled = enabled !== false;
        if (!inlineBubbleEnabled && (bubbleState.visible || bubbleState.analyzing)) {
            hideInlineBubble();
        }
        return;
    }
});
