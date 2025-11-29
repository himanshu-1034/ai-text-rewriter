import { Box, Button, Typography } from "@mui/material";

interface PageSelectionButtonProps {
  onSelect: () => Promise<void>;
  status: string | null;
  disabled?: boolean;
}

export function PageSelectionButton({ onSelect, status, disabled }: PageSelectionButtonProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0, flexWrap: 'wrap' }}>
      <Button
        variant="outlined"
        size="small"
        onClick={onSelect}
        disabled={disabled}
        sx={{ flexShrink: 0 }}
      >
        Use page selection
      </Button>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', flex: 1, minWidth: 0 }}>
        {status || "Select text in Gmail / any page, then click \"Use page selection\"."}
      </Typography>
    </Box>
  );
}

