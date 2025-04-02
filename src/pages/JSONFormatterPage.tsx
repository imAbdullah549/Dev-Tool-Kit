// // // src/pages/JSONFormatterPage.tsx

import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Button,
  Paper,
  Typography,
  Link as MuiLink,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useTranslation } from "react-i18next";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import jsonlint from "jsonlint";
import { EditorView, Decoration, DecorationSet } from "@codemirror/view";
import { StateEffect, StateField } from "@codemirror/state";

// =====================
// Decoration Extension for error highlighting
// =====================

const setErrorLine = StateEffect.define<number | null>();

const errorLineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(deco, tr) {
    for (let e of tr.effects) {
      if (e.is(setErrorLine)) {
        const errorLine = e.value;
        if (errorLine !== null) {
          const line = tr.state.doc.line(errorLine);
          return Decoration.set([
            Decoration.line({ class: "cm-errorLine" }).range(line.from),
          ]);
        } else {
          return Decoration.none;
        }
      }
    }
    return deco.map(tr.changes);
  },
  provide: (field) => EditorView.decorations.from(field),
});

// =====================
// Helper Functions
// =====================

/**
 * Extracts line and column from a jsonlint error message, if available.
 */
interface ErrorDetails {
  line: number | null;
  column: number | null;
  message: string;
}

const extractErrorDetails = (errorMsg: string): ErrorDetails => {
  let line: number | null = null;
  let column: number | null = null;
  const lineMatch = errorMsg.match(/line\s+(\d+)/i);

  if (lineMatch) {
    // Add 1 to align the error line with the editor's line numbering.
    line = Number(lineMatch[1]);
  }

  const lines = errorMsg.split("\n");
  const caretLineIndex = lines.findIndex((l) => l.trim().includes("^"));

  if (caretLineIndex >= 0) {
    const caretPos = lines[caretLineIndex].indexOf("^");
    if (caretPos >= 0) {
      column = caretPos;
    }
  }

  return { line, column, message: errorMsg };
};

/**
 * Quick fix function to remove trailing commas from objects and arrays.
 * Note: This is a simple regex-based approach and may not cover all edge cases.
 */
const fixTrailingCommas = (input: string): string => {
  // Remove trailing commas before } or ]
  return input.replace(/,\s*([}\]])/g, "$1");
};

// =====================
// Component
// =====================

const JSONFormatterPage: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>(
    localStorage.getItem("jsonInput") || ""
  );
  const [formattedJson, setFormattedJson] = useState<string>("");
  const [errorDetails, setErrorDetails] = useState<{
    line: number | null;
    column: number | null;
    snippet?: string;
  } | null>(null);

  const [showAutoFix, setShowAutoFix] = useState<boolean>(false);

  // Use EditorView type for ref to access CodeMirror 6 view.
  const editorRef = useRef<EditorView | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Save input to local storage whenever it changes.
  useEffect(() => {
    localStorage.setItem("jsonInput", jsonInput);
  }, [jsonInput]);

  /**
   * Handles JSON formatting and error detection.
   */
  const handleFormat = (): void => {
    try {
      // First, try validating with jsonlint.
      jsonlint.parse(jsonInput);
      // If valid, parse and pretty-print.
      const parsed = JSON.parse(jsonInput);
      const prettyJson = JSON.stringify(parsed, null, 2);
      setFormattedJson(prettyJson);
      setErrorDetails(null);
      setShowAutoFix(false);
      // Clear previous error decoration.
      editorRef.current?.dispatch({ effects: setErrorLine.of(null) });
      // Update the URL with the encoded JSON.
      const encoded = encodeURIComponent(jsonInput);
      window.history.replaceState(null, "", `?json=${encoded}`);
    } catch (error: any) {
      const rawErrorMessage = error.message;
      console.log("rawErrorMessage", rawErrorMessage);
      const details = extractErrorDetails(rawErrorMessage);
      let snippet: string | undefined;
      if (details.line) {
        snippet = rawErrorMessage;
      }
      console.log("details", details);
      setErrorDetails({
        line: details.line,
        column: details.column,
        snippet,
      });
      setFormattedJson("");
      // Show auto-fix option if the error is related to trailing commas.
      if (rawErrorMessage.toLowerCase().includes("unexpected token ,")) {
        setShowAutoFix(true);
      } else {
        setShowAutoFix(false);
      }
      // Dispatch decoration effect with error line if available.
      editorRef.current?.dispatch({ effects: setErrorLine.of(details.line) });
    }
  };

  /**
   * Handles auto-fixing of trailing commas.
   */
  const handleAutoFix = () => {
    const fixed = fixTrailingCommas(jsonInput);
    setJsonInput(fixed);
    // Re-run the format process.
    handleFormat();
  };

  /**
   * Handles copying the formatted JSON to clipboard.
   */
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formattedJson);
      alert("Formatted JSON copied to clipboard!");
    } catch (err) {
      alert("Failed to copy to clipboard.");
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <>
      <Header
        title={t("JSON Formatter and Validator")}
        showBackButton
        onBackClick={handleBack}
      />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5" component="h1" sx={{ mt: 2, mb: 2 }}>
          {t("JSON Formatter and Validator")}:
        </Typography>
        <CodeMirror
          value={jsonInput}
          height="200px"
          extensions={[json(), errorLineField]}
          onChange={(value) => setJsonInput(value)}
          basicSetup={{
            lineNumbers: true,
          }}
          onCreateEditor={(editor) => {
            editorRef.current = editor;
          }}
        />
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleFormat}>
            {t("Format JSON")}
          </Button>
          {showAutoFix && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleAutoFix}
            >
              {t("Auto-fix Trailing Commas")}
            </Button>
          )}
          {formattedJson && (
            <Button variant="outlined" onClick={handleCopyToClipboard}>
              {t("Copy to Clipboard")}
            </Button>
          )}
        </Stack>
        <Typography variant="h6" component="h2" sx={{ mt: 2 }}>
          {t("Result")}:
        </Typography>
        {errorDetails && (
          <Paper
            elevation={3}
            sx={{ p: 2, bgcolor: "#ffe6e6", mt: 2 }}
            aria-live="polite"
          >
            {errorDetails.line !== null && (
              <Typography sx={{ color: "red", fontWeight: "bold" }}>
                Error on line {errorDetails.line}
                {errorDetails.column !== null
                  ? `, column ${errorDetails.column}`
                  : ""}
                :
              </Typography>
            )}
            {errorDetails.snippet && (
              <Paper
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: "#fff",
                  whiteSpace: "pre",
                  overflowX: "auto",
                  fontFamily: "monospace",
                  color: "#333",
                  border: "1px solid #ccc",
                }}
              >
                {errorDetails.snippet}
              </Paper>
            )}
            <Typography variant="body2" sx={{ mt: 2 }}>
              Need help with JSON syntax?{" "}
              <MuiLink
                href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/JSON"
                target="_blank"
                rel="noopener"
              >
                Learn more
              </MuiLink>
            </Typography>
          </Paper>
        )}
        {formattedJson && (
          <Paper
            elevation={3}
            sx={{ p: 2, bgcolor: "#f5f5f5", overflowX: "auto", mt: 2 }}
            aria-live="polite"
          >
            <pre style={{ margin: 0 }}>{formattedJson}</pre>
          </Paper>
        )}
      </Container>
    </>
  );
};

export default JSONFormatterPage;
