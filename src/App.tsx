// src/App.tsx
import { useState } from "react";
import { Box } from "@mui/material";
import { rewriteTextWithAI, type RewriteMode } from "./lib/aiClient";
import { Settings } from "./components/Settings";
import { Header } from "./components/Header";
import { ModeSelector } from "./components/ModeSelector";
import { InputSection } from "./components/InputSection";
import { PageSelectionButton } from "./components/PageSelectionButton";
import { RewriteButton } from "./components/RewriteButton";
import { LoadingIndicator } from "./components/LoadingIndicator";
import { OutputSection } from "./components/OutputSection";
import { useSettings } from "./hooks/useSettings";
import { useClipboard } from "./hooks/useClipboard";
import { usePageSelection } from "./hooks/usePageSelection";
import { useTextReplacement } from "./hooks/useTextReplacement";

type View = "main" | "settings";

function App() {
  const [view, setView] = useState<View>("main");
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<RewriteMode>("formal");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { inlineBubbleEnabled, handleToggleInlineBubble } = useSettings();
  const { copied, copyToClipboard } = useClipboard();
  const { selectionStatus, getPageSelection, clearSelectionStatus } = usePageSelection();
  const { replaceStatus, replaceSelection, clearReplaceStatus } = useTextReplacement();

  const handleUsePageSelection = async () => {
    clearSelectionStatus();
    clearReplaceStatus();
    const text = await getPageSelection();
    if (text) {
      setInput(text);
    }
  };

  const handleRewrite = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setOutput("");
    setError(null);
    clearReplaceStatus();

    try {
      const result = await rewriteTextWithAI(input.trim(), mode);
      setOutput(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to rewrite text. Please try again.";
      setError(errorMessage);
      setOutput("");
      console.error("Error rewriting text:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    copyToClipboard(output);
  };

  const handleReplaceSelection = async () => {
    await replaceSelection(output);
  };

  const disabled = !input.trim() || loading;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: 'background.default',
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 1.5,
        gap: 1,
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        <Header view={view} onViewChange={setView} />

        {view === "settings" ? (
          <Settings
            inlineBubbleEnabled={inlineBubbleEnabled}
            onToggleInlineBubble={handleToggleInlineBubble}
          />
        ) : (
          <>
            <ModeSelector mode={mode} onModeChange={setMode} disabled={loading} />

            <InputSection value={input} onChange={setInput} disabled={loading} />

            <PageSelectionButton
              onSelect={handleUsePageSelection}
              status={selectionStatus}
              disabled={loading}
            />

            <RewriteButton
              onClick={handleRewrite}
              loading={loading}
              disabled={disabled}
            />

            <LoadingIndicator loading={loading} />

            <OutputSection
              output={output}
              error={error}
              replaceStatus={replaceStatus}
              copied={copied}
              loading={loading}
              onCopy={handleCopy}
              onReplace={handleReplaceSelection}
            />
          </>
        )}
      </Box>
    </Box>
  );
}

export default App;
