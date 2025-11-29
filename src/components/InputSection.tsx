import { Box, Typography, TextField } from "@mui/material";

interface InputSectionProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function InputSection({ value, onChange, disabled }: InputSectionProps) {
  return (
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="small"
        fullWidth
        disabled={disabled}
        InputProps={{
          style: {
            fontSize: 13,
          },
        }}
      />
    </Box>
  );
}

