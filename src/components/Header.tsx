import { Box, Typography, IconButton, Button } from "@mui/material";
import { Settings as SettingsIcon } from "lucide-react";
import { APP_VERSION } from "../constants";

interface HeaderProps {
  view: "main" | "settings";
  onViewChange: (view: "main" | "settings") => void;
}

export function Header({ view, onViewChange }: HeaderProps) {
  return (
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
          {view === "settings" ? "Settings" : "Rewrite your text in one click"}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {view === "main" && (
          <IconButton
            size="small"
            onClick={() => onViewChange("settings")}
            sx={{ color: 'text.secondary', p: 0.5 }}
          >
            <SettingsIcon size={16} />
          </IconButton>
        )}
        {view === "settings" && (
          <Button
            size="small"
            onClick={() => onViewChange("main")}
            sx={{ fontSize: '0.7rem', minWidth: 0, px: 1 }}
          >
            Back
          </Button>
        )}
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
          {APP_VERSION}
        </Box>
      </Box>
    </Box>
  );
}

