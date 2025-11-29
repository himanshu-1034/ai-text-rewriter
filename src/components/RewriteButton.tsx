import { Box, Button, CircularProgress, Typography } from "@mui/material";

interface RewriteButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
}

export function RewriteButton({ onClick, loading, disabled }: RewriteButtonProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexShrink: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', flex: 1 }}>
        Paste or type your text above, then click Rewrite
      </Typography>
      <Button
        variant="contained"
        size="small"
        onClick={onClick}
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
  );
}

