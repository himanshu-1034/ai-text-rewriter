import { useState } from "react";

export function usePageSelection() {
  const [selectionStatus, setSelectionStatus] = useState<string | null>(null);

  const getPageSelection = (): Promise<string | null> => {
    return new Promise((resolve) => {
      setSelectionStatus(null);

      if (!chrome?.tabs) {
        setSelectionStatus("Chrome tabs API unavailable.");
        resolve(null);
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (!tab || tab.id === undefined) {
          setSelectionStatus("No active tab found.");
          resolve(null);
          return;
        }

        chrome.tabs.sendMessage(
          tab.id,
          { type: "GET_SELECTION" },
          (response) => {
            const lastError = chrome.runtime.lastError;
            if (lastError) {
              console.warn("sendMessage error:", lastError.message);
              setSelectionStatus("Could not read selection on this page.");
              resolve(null);
              return;
            }

            if (!response || typeof response.text !== "string") {
              setSelectionStatus("No selection detected.");
              resolve(null);
              return;
            }

            if (!response.text.trim()) {
              setSelectionStatus("Please select some text first.");
              resolve(null);
              return;
            }

            setSelectionStatus("Selected text imported from page ✅");
            resolve(response.text);
          }
        );
      });
    });
  };

  return {
    selectionStatus,
    getPageSelection,
    clearSelectionStatus: () => setSelectionStatus(null),
  };
}

