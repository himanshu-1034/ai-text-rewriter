import { useEffect, useState } from "react";
import { STORAGE_KEY_INLINE_ENABLED } from "../constants";

export function useSettings() {
  const [inlineBubbleEnabled, setInlineBubbleEnabled] = useState(true);

  useEffect(() => {
    if (chrome?.storage?.sync) {
      chrome.storage.sync.get([STORAGE_KEY_INLINE_ENABLED], (result) => {
        const enabled = result[STORAGE_KEY_INLINE_ENABLED] !== false; // default to true
        setInlineBubbleEnabled(enabled);
      });
    }
  }, []);

  const handleToggleInlineBubble = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setInlineBubbleEnabled(enabled);

    if (chrome?.storage?.sync) {
      chrome.storage.sync.set({ [STORAGE_KEY_INLINE_ENABLED]: enabled }, () => {
        // Notify content scripts of the change
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, {
                type: "INLINE_BUBBLE_SETTING_CHANGED",
                enabled,
              }).catch(() => {
                // Ignore errors for tabs that don't have content script
              });
            }
          });
        });
      });
    }
  };

  return {
    inlineBubbleEnabled,
    handleToggleInlineBubble,
  };
}

