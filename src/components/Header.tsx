// src/components/Header.tsx
import React from "react";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useThemeContext } from "./ThemeContext";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  onBackClick,
}) => {
  const { toggleTheme, isDark } = useThemeContext();
  //   const { i18n } = useTranslation();

  //   const changeLanguage = (lang: string) => {
  //     i18n.changeLanguage(lang);
  //   };

  return (
    <AppBar position="static">
      <Toolbar>
        {showBackButton && (
          <IconButton
            color="inherit"
            onClick={onBackClick}
            aria-label="go back"
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        {/* <Button color="inherit" onClick={() => changeLanguage("en")}>
          EN
        </Button>
        <Button color="inherit" onClick={() => changeLanguage("es")}>
          ES
        </Button> */}
        <IconButton
          sx={{ ml: 1 }}
          onClick={toggleTheme}
          color="inherit"
          aria-label="toggle dark mode"
        >
          {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
