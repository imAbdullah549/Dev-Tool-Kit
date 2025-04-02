// src/pages/LandingPage.tsx
import React from "react";
import {
  Container,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useTranslation } from "react-i18next";

/**
 * LandingPage displays the main page with a header and cards for each tool.
 */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Navigate to the JSON Formatter tool page
  const handleCardClick = (): void => {
    navigate("/json-formatter");
  };

  return (
    <>
      <Header title={t("Developer Toolkit Platform")} />
      <main>
        <Container sx={{ mt: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            {t("Tools")}
          </Typography>
          <Card sx={{ maxWidth: 345 }}>
            <CardActionArea onClick={handleCardClick}>
              <CardContent>
                <Typography variant="h5" component="h3">
                  {t("JSON Formatter and Validator")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("Format and validate your JSON data quickly and easily.")}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Container>
      </main>
    </>
  );
};

export default LandingPage;
