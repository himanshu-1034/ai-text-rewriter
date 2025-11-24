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

        return selection.toString();
    }

    lastSelection = null;
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
});
