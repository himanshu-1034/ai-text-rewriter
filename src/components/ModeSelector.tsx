import { Box, Typography, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { type RewriteMode } from "../lib/aiClient";

interface ModeSelectorProps {
  mode: RewriteMode;
  onModeChange: (mode: RewriteMode) => void;
  disabled?: boolean;
}

export function ModeSelector({ mode, onModeChange, disabled }: ModeSelectorProps) {
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: RewriteMode | null
  ) => {
    if (newMode !== null) {
      onModeChange(newMode);
    }
  };

  return (
    <Box sx={{ flexShrink: 0 }}>
      <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'text.secondary', fontSize: '0.7rem' }}>
        Tone / Action
      </Typography>
      <ToggleButtonGroup
        size="small"
        value={mode}
        exclusive
        onChange={handleChange}
        fullWidth
        disabled={disabled}
        sx={{ '& .MuiToggleButton-root': { fontSize: '0.7rem', py: 0.5 } }}
      >
        <ToggleButton value="formal">Formal</ToggleButton>
        <ToggleButton value="friendly">Friendly</ToggleButton>
        <ToggleButton value="shorter">Shorter</ToggleButton>
        <ToggleButton value="longer">Longer</ToggleButton>
        <ToggleButton value="fix">Fix grammar</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}

