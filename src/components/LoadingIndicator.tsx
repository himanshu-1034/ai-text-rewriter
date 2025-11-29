import { Box, CircularProgress, Fade } from "@mui/material";

interface LoadingIndicatorProps {
  loading: boolean;
}

export function LoadingIndicator({ loading }: LoadingIndicatorProps) {
  return (
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
  );
}

