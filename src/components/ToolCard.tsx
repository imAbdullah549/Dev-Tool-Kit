import React from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  useTheme,
} from "@mui/material";

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({
  icon,
  title,
  description,
  onClick,
}) => {
  const theme = useTheme();

  const cardStyles = {
    maxWidth: 360,
    borderRadius: 3,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 2px 8px rgba(0, 0, 0, 0.5)"
        : "0 2px 8px rgba(0, 0, 0, 0.1)",
    background:
      theme.palette.mode === "dark"
        ? theme.palette.grey[900]
        : "linear-gradient(to bottom, #fff, #f8fafc)",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255, 255, 255, 0.12)"
        : "none",
  };

  return (
    <Card sx={cardStyles}>
      <CardActionArea onClick={onClick}>
        <CardContent sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "35%",
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? theme.palette.primary.dark
                    : "#EAF2FE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 2,
                mb: 1,
              }}
            >
              {icon}
            </Box>
            <Typography variant="h6" fontWeight="bold">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ToolCard;
