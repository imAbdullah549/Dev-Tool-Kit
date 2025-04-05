import React from "react";
import Grid from "@mui/material/Grid";
import { Container, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useTranslation } from "react-i18next";
import DataObjectIcon from "@mui/icons-material/DataObject";
import CodeIcon from "@mui/icons-material/Code";
import ToolCard from "../components/ToolCard";

/**
 * LandingPage displays the main page with a header and cards for each tool.
 */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();

  // Navigate to the JSON Formatter tool page
  const handleJsonCardClick = (): void => {
    navigate("/json-formatter");
  };

  // Navigate to the XML Formatter tool page
  const handleXmlCardClick = (): void => {
    navigate("/xml-formatter");
  };

  return (
    <>
      <Header title={t("Developer Toolkit Platform")} />
      <main>
        <Container sx={{ mt: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            {t("Tools")}
          </Typography>
          <Grid container spacing={2}>
            {/* JSON Formatter Card */}
            <Grid size={{ xs: 12, sm: 5, md: 4 }}>
              <ToolCard
                icon={
                  <DataObjectIcon
                    sx={{
                      color:
                        theme.palette.mode === "dark"
                          ? theme.palette.primary.light
                          : "#007FFF",
                    }}
                  />
                }
                title={t("JSON Formatter and Validator")}
                description={t(
                  "Format and validate your JSON data quickly and easily."
                )}
                onClick={handleJsonCardClick}
              />
            </Grid>
            {/* XML Formatter Card */}
            <Grid size={{ xs: 12, sm: 5, md: 4 }}>
              <ToolCard
                icon={
                  <CodeIcon
                    sx={{
                      color:
                        theme.palette.mode === "dark"
                          ? theme.palette.primary.light
                          : "#007FFF",
                    }}
                  />
                }
                title={t("XML Formatter and Validator")}
                description={t(
                  "Format and validate your XML data quickly and easily."
                )}
                onClick={handleXmlCardClick}
              />
            </Grid>
          </Grid>
        </Container>
      </main>
    </>
  );
};

export default LandingPage;
