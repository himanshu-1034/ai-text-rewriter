// src/App.tsx
import { useEffect, useRef, useState } from "react";
import {
  TextField,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Paper,
  Box,
  Alert,
  CircularProgress,
  Fade,
  IconButton,
  Tooltip,
} from "@mui/material";
import { rewriteTextWithAI, type RewriteMode } from "./lib/aiClient";
import { Copy, Check, RefreshCcw } from "lucide-react";

function App() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<RewriteMode>("formal");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);
  const [selectionStatus, setSelectionStatus] = useState<string | null>(null);
  const [replaceStatus, setReplaceStatus] = useState<string | null>(null);


  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleUsePageSelection = () => {
    setSelectionStatus(null);
    setReplaceStatus(null);

    if (!chrome?.tabs) {
      setSelectionStatus("Chrome tabs API unavailable.");
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || tab.id === undefined) {
        setSelectionStatus("No active tab found.");
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
            return;
          }

          if (!response || typeof response.text !== "string") {
            setSelectionStatus("No selection detected.");
            return;
          }

          if (!response.text.trim()) {
            setSelectionStatus("Please select some text first.");
            return;
          }

          setInput(response.text);
          setSelectionStatus("Selected text imported from page ✅");
        }
      );
    });
  };

  const handleModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: RewriteMode | null
  ) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  const handleRewrite = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setOutput("");
    setError(null);
    setReplaceStatus(null);

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

  const handleCopy = async () => {
    if (!output.trim()) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => setCopied(false), 1500);
    } catch (copyError) {
      console.error("Failed to copy rewritten text:", copyError);
    }
  };

  const handleReplaceSelection = () => {
    if (!output.trim()) {
      setReplaceStatus("Rewrite something first.");
      return;
    }

    setReplaceStatus("Applying rewrite to page…");

    if (!chrome?.tabs) {
      setReplaceStatus("Chrome tabs API unavailable.");
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || tab.id === undefined) {
        setReplaceStatus("No active tab found.");
        return;
      }

      chrome.tabs.sendMessage(
        tab.id,
        { type: "REPLACE_SELECTION", newText: output },
        (response) => {
          const lastError = chrome.runtime.lastError;
          if (lastError) {
            console.warn("sendMessage error:", lastError.message);
            setReplaceStatus("Could not replace text on this page.");
            return;
          }

          if (!response?.ok) {
            setReplaceStatus(response?.error || "No selection to replace. Use “Use page selection” first.");
            return;
          }

          setReplaceStatus("Replaced selection on page ✅");
        }
      );
    });
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
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0, mb: 0.5 }}>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'text.secondary',
                mb: 0.25,
                fontSize: '0.7rem',
              }}
            >
              AI Text Rewriter
            </Typography>
            <Typography variant="h6" sx={{ lineHeight: 1.2, fontWeight: 600, fontSize: '1rem' }}>
              Rewrite your text in one click
            </Typography>
          </Box>
          <Box
            component="span"
            sx={{
              fontSize: '0.7rem',
              px: 0.75,
              py: 0.25,
              borderRadius: '10px',
              backgroundColor: 'success.main',
              color: 'white',
              fontWeight: 600,
              alignSelf: 'flex-start',
            }}
          >
            v1.0.0
          </Box>
        </Box>

        {/* Mode selector */}
        <Box sx={{ flexShrink: 0 }}>
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'text.secondary', fontSize: '0.7rem' }}>
            Tone / Action
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={mode}
            exclusive
            onChange={handleModeChange}
            fullWidth
            sx={{ '& .MuiToggleButton-root': { fontSize: '0.7rem', py: 0.5 } }}
          >
            <ToggleButton value="formal">Formal</ToggleButton>
            <ToggleButton value="friendly">Friendly</ToggleButton>
            <ToggleButton value="shorter">Shorter</ToggleButton>
            <ToggleButton value="longer">Longer</ToggleButton>
            <ToggleButton value="fix">Fix grammar</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Input */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            Original text
          </Typography>
          <TextField
            multiline
            minRows={3}
            maxRows={4}
            variant="outlined"
            placeholder="Paste or type your text here…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              style: {
                fontSize: 13,
              },
            }}
          />
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleUsePageSelection}
            disabled={loading}
            sx={{ flexShrink: 0 }}
          >
            Use page selection
          </Button>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', flex: 1, minWidth: 0 }}>
            {selectionStatus || "Select text in Gmail / any page, then click \"Use page selection\"."}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexShrink: 0 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', flex: 1 }}>
            Paste or type your text above, then click Rewrite
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={handleRewrite}
            disabled={disabled}
            sx={{ flexShrink: 0, minWidth: 92 }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <CircularProgress size={14} color="inherit" thickness={6} />
                Working…
              </Box>
            ) : (
              "Rewrite"
            )}
          </Button>
        </Box>

        <Fade in={loading} unmountOnExit>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              fontSize: '0.7rem',
              color: 'text.secondary',
              flexShrink: 0,
            }}
          >
            <CircularProgress size={12} thickness={8} />
            Transforming your text…
          </Box>
        </Fade>

        {/* Output */}
        <Box sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          gap: 0.5
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', flex: 1, minWidth: 120 }}>
              Rewritten text
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <Tooltip title="Replace highlighted text on the page">
                <span>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    startIcon={<RefreshCcw size={14} />}
                    onClick={handleReplaceSelection}
                    disabled={!output.trim() || loading}
                    sx={{
                      textTransform: 'none',
                      minWidth: 0,
                      px: 1.25,
                      py: 0.3,
                      fontSize: '0.7rem',
                      borderRadius: 999,
                    }}
                  >
                    Apply to page
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                <span>
                  <IconButton
                    size="small"
                    onClick={handleCopy}
                    disabled={!output.trim()}
                    sx={{ color: copied ? 'success.main' : 'text.secondary', p: 0.5 }}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
          {error && (
            <Alert severity="error" sx={{ fontSize: '0.75rem', py: 0.5, flexShrink: 0 }}>
              {error}
            </Alert>
          )}
          <Paper
            variant="outlined"
            sx={{
              flex: 1,
              overflow: 'auto',
              backgroundColor: 'background.paper',
              minHeight: 0,
              maxHeight: '100%',
              '& pre': {
                margin: 0,
                padding: 1,
                fontSize: '0.75rem',
                lineHeight: 1.4,
                whiteSpace: 'pre-wrap',
                color: 'text.primary',
                fontFamily: 'inherit',
              },
            }}
          >
            <pre>{output || "Your rewritten text will appear here."}</pre>
          </Paper>
          {replaceStatus && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', flexShrink: 0 }}>
              {replaceStatus}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default App;
