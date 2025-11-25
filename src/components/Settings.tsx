import { Box, Typography, Divider, Switch, FormControlLabel } from "@mui/material";

interface SettingsProps {
  inlineBubbleEnabled: boolean;
  onToggleInlineBubble: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Settings({ inlineBubbleEnabled, onToggleInlineBubble }: SettingsProps) {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto' }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', mb: 0.5 }}>
        Configure extension behavior
      </Typography>
      
      <Divider sx={{ my: 0.5 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={inlineBubbleEnabled}
              onChange={onToggleInlineBubble}
              size="small"
            />
          }
          label={
            <Box>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                Enable inline popup
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', display: 'block' }}>
                Show formatting bubble when you select text on any webpage
              </Typography>
            </Box>
          }
          sx={{ alignItems: 'flex-start', m: 0 }}
        />
      </Box>
    </Box>
  );
}

