import { Box, Typography, Paper, Alert, IconButton, Tooltip, Button } from "@mui/material";
import { Copy, Check, RefreshCcw } from "lucide-react";

interface OutputSectionProps {
  output: string;
  error: string | null;
  replaceStatus: string | null;
  copied: boolean;
  loading: boolean;
  onCopy: () => void;
  onReplace: () => void;
}

export function OutputSection({
  output,
  error,
  replaceStatus,
  copied,
  loading,
  onCopy,
  onReplace,
}: OutputSectionProps) {
  return (
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
                onClick={onReplace}
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
                onClick={onCopy}
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
  );
}

