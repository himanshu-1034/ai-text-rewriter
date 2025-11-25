import { rewriteTextWithAI, type RewriteMode } from "./lib/aiClient";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message !== "object") return;

  if (message.type === "BUBBLE_REWRITE") {
    const { text, mode } = message as { text?: string; mode?: RewriteMode };
    if (!text || typeof text !== "string" || !mode) {
      sendResponse({ ok: false, error: "Invalid rewrite payload." });
      return true;
    }

    rewriteTextWithAI(text, mode)
      .then((result) => {
        sendResponse({ ok: true, result });
      })
      .catch((error: unknown) => {
        const msg = error instanceof Error ? error.message : "Rewrite failed.";
        sendResponse({ ok: false, error: msg });
      });

    return true; // keep channel open for async response
  }
});

