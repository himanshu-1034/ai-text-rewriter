import { useState } from "react";

export function useTextReplacement() {
  const [replaceStatus, setReplaceStatus] = useState<string | null>(null);

  const replaceSelection = (text: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!text.trim()) {
        setReplaceStatus("Rewrite something first.");
        resolve(false);
        return;
      }

      setReplaceStatus("Applying rewrite to page…");

      if (!chrome?.tabs) {
        setReplaceStatus("Chrome tabs API unavailable.");
        resolve(false);
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (!tab || tab.id === undefined) {
          setReplaceStatus("No active tab found.");
          resolve(false);
          return;
        }

        chrome.tabs.sendMessage(
          tab.id,
          { type: "REPLACE_SELECTION", newText: text },
          (response) => {
            const lastError = chrome.runtime.lastError;
            if (lastError) {
              console.warn("sendMessage error:", lastError.message);
              setReplaceStatus("Could not replace text on this page.");
              resolve(false);
              return;
            }

            if (!response?.ok) {
              setReplaceStatus(
                response?.error || "No selection to replace. Use \"Use page selection\" first."
              );
              resolve(false);
              return;
            }

            setReplaceStatus("Replaced selection on page ✅");
            resolve(true);
          }
        );
      });
    });
  };

  return {
    replaceStatus,
    replaceSelection,
    clearReplaceStatus: () => setReplaceStatus(null),
  };
}

