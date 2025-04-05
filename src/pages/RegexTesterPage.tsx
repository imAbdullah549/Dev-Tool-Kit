// RegexTesterPage.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { parse } from "regexp-tree";
import safeRegex from "safe-regex";

const DEBOUNCE_DELAY = 500; // ms

const RegexTesterPage: React.FC = () => {
  const [regexPattern, setRegexPattern] = useState<string>("");
  const [testText, setTestText] = useState<string>("");
  const [flags, setFlags] = useState({
    global: false,
    ignoreCase: false,
    multiline: false,
  });
  const [livePreview, setLivePreview] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [matches, setMatches] = useState<RegExpMatchArray[]>([]);
  const [regexExplanation, setRegexExplanation] = useState<string>("");

  // Use a ref for the debounce timer
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Wrap runTest in useCallback for stable identity
  const runTest = useCallback(() => {
    setError("");
    setMatches([]);
    setRegexExplanation("");

    try {
      // Check for potential catastrophic backtracking
      if (!safeRegex(regexPattern)) {
        setError("Warning: This regex might cause catastrophic backtracking.");
        // Optionally, you can abort here.
      }

      // Build the flags string
      const flagStr = `${flags.global ? "g" : ""}${
        flags.ignoreCase ? "i" : ""
      }${flags.multiline ? "m" : ""}`;

      // Create the RegExp object
      const regex = new RegExp(regexPattern, flagStr);
      console.log("Compiled Regex:", regex);
      console.log("Test Text:", testText);

      let matchResults: RegExpMatchArray[] = [];
      if (flags.global) {
        // Using matchAll for global regex.
        matchResults = Array.from(testText.matchAll(regex));
      } else {
        // Using match() for a single match.
        const single = testText.match(regex);
        matchResults = single ? [single] : [];
      }
      console.log("Match Results:", matchResults);
      setMatches(matchResults);

      // Generate a simple AST explanation using regexp-tree
      try {
        const ast = parse(regexPattern);
        setRegexExplanation(JSON.stringify(ast, null, 2));
      } catch {
        setRegexExplanation("Unable to generate explanation.");
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Unknown error occurred while testing the regex.");
      }
    }
  }, [regexPattern, flags, testText]);

  // Handler for manual "Test Regex" button.
  const handleTest = () => {
    runTest();
  };

  // Debounced live preview effect.
  useEffect(() => {
    if (livePreview) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        runTest();
      }, DEBOUNCE_DELAY);
      return () => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
      };
    }
  }, [regexPattern, testText, flags, livePreview, runTest]);

  // Renders highlighted matches in the test text.
  const renderHighlightedText = () => {
    if (!matches.length) {
      return <Typography>{testText}</Typography>;
    }
    const elements = [];
    let lastIndex = 0;
    for (const match of matches) {
      const startIndex = match.index as number;
      const fullMatch = match[0];
      if (lastIndex < startIndex) {
        elements.push(
          <span key={lastIndex}>{testText.slice(lastIndex, startIndex)}</span>
        );
      }
      elements.push(
        <span key={startIndex} style={{ backgroundColor: "#FFFF00" }}>
          {fullMatch}
        </span>
      );
      lastIndex = startIndex + fullMatch.length;
    }
    if (lastIndex < testText.length) {
      elements.push(<span key={lastIndex}>{testText.slice(lastIndex)}</span>);
    }
    return <Typography>{elements}</Typography>;
  };

  // Renders match details (groups and indices).
  const renderMatchDetails = () => {
    if (!matches.length) {
      return <Typography>No matches found.</Typography>;
    }
    return (
      <Box>
        {matches.map((match, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              Match {index + 1}: "{match[0]}" (Index: {match.index})
            </Typography>
            {match.length > 1 && (
              <Box sx={{ ml: 2 }}>
                {match.slice(1).map((group: string, idx: number) => (
                  <Typography key={idx} variant="body2">
                    Group {idx + 1}:{" "}
                    {group !== undefined && group !== ""
                      ? `"${group}"`
                      : "No match"}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    );
  };

  // Handles changes to the flag checkboxes.
  const handleFlagChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFlags((prev) => ({
      ...prev,
      [event.target.name]: event.target.checked,
    }));
  };

  return (
    <Box sx={{ maxWidth: "800px", mx: "auto", p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Regex Tester
      </Typography>
      <Stack spacing={2}>
        {/* Regex Pattern Input (CodeMirror) */}
        <Typography variant="subtitle1">Regex Pattern</Typography>
        <CodeMirror
          value={regexPattern}
          height="80px"
          extensions={[javascript()]}
          onChange={(value) => setRegexPattern(value)}
          placeholder="e.g. ([A-Za-z]+)\s+(\d+)"
        />

        {/* Flag Checkboxes with Tooltips */}
        <FormGroup row>
          <Tooltip title="Find all occurrences of the pattern, not just the first.">
            <FormControlLabel
              control={
                <Checkbox
                  checked={flags.global}
                  onChange={handleFlagChange}
                  name="global"
                />
              }
              label="Global (g)"
            />
          </Tooltip>
          <Tooltip title="Ignore letter case (e.g., 'A' matches 'a').">
            <FormControlLabel
              control={
                <Checkbox
                  checked={flags.ignoreCase}
                  onChange={handleFlagChange}
                  name="ignoreCase"
                />
              }
              label="Ignore Case (i)"
            />
          </Tooltip>
          <Tooltip title="^ and $ match start/end of every line instead of entire text.">
            <FormControlLabel
              control={
                <Checkbox
                  checked={flags.multiline}
                  onChange={handleFlagChange}
                  name="multiline"
                />
              }
              label="Multiline (m)"
            />
          </Tooltip>
          <Tooltip title="Automatically re-run the regex as you type (with a slight delay).">
            <FormControlLabel
              control={
                <Checkbox
                  checked={livePreview}
                  onChange={(e) => setLivePreview(e.target.checked)}
                  name="livePreview"
                />
              }
              label="Live Preview"
            />
          </Tooltip>
        </FormGroup>

        <TextField
          label="Test Text"
          variant="outlined"
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          fullWidth
          multiline
          minRows={4}
          placeholder='e.g. "Name 123\nAnotherName 456\nSomethingElse 789"'
        />

        {/* Hide the button if livePreview is enabled */}
        {!livePreview && (
          <Button variant="contained" onClick={handleTest}>
            Test Regex
          </Button>
        )}
      </Stack>

      {/* Error Display */}
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {/* Highlighted Matches */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Highlighted Matches:</Typography>
        <Paper elevation={3} sx={{ p: 2, mt: 1 }}>
          <Typography sx={{ whiteSpace: "pre-wrap" }}>
            {renderHighlightedText()}
          </Typography>
        </Paper>
      </Box>

      {/* Match Details */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Match Details:</Typography>
        <Paper elevation={3} sx={{ p: 2, mt: 1 }}>
          {renderMatchDetails()}
        </Paper>
      </Box>

      {/* Collapsible Panel for Regex Explanation */}
      <Accordion sx={{ mt: 4 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Regex Explanation</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {regexExplanation ? (
            <pre style={{ whiteSpace: "pre-wrap" }}>{regexExplanation}</pre>
          ) : (
            <Typography>No explanation available.</Typography>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default RegexTesterPage;
