import { useState, useEffect } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { validateXML } from "xmllint-wasm";
import xmlFormatter from "xml-formatter";

function humanizeXmlErrors(error: unknown): string {
  if (error instanceof Error) {
    const messages = error.message.split("\n");
    return messages
      .map((msg: string) => {
        if (msg.includes("tag mismatch")) {
          const parts = msg.match(/tag mismatch: (.+) line (\d+)/);
          if (parts) {
            return `Tag mismatch error: The tag '<${
              parts[1].split(" ")[0]
            }>' starts but doesn't close properly. Check your tags near line ${
              parts[2]
            }.`;
          }
        } else if (msg.includes("out of allowed range")) {
          return `Character error: There's an invalid character in your XML that XML standards do not allow.`;
        } else if (msg.includes("Premature end of data")) {
          const parts = msg.match(/tag (.+) line (\d+)/);
          if (parts) {
            return `Unexpected end of data: Your XML ends within '<${parts[1]}>'. Make sure all tags are properly closed.`;
          }
        }
        return msg; // Default to the original message for unrecognized patterns
      })
      .join("\n");
  }
  return "An unknown error occurred.";
}

const XmlValidator = () => {
  const [xmlInput, setXmlInput] = useState("");
  const [xsdInput, setXsdInput] = useState("");
  const [output, setOutput] = useState("");
  const [isError, setIsError] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Simulating an initialization check for xmllint-wasm
  useEffect(() => {
    // Simulate loading and initializing a module, if necessary
    const initialize = async () => {
      // Placeholder for any initialization logic for xmllint-wasm
      try {
        // Assume initialization is synchronous or has been handled
        setInitialized(true);
      } catch (err) {
        console.error("Error initializing xmllint-wasm", err);
        setOutput("Failed to initialize validation module.");
        setIsError(true);
      }
    };
    initialize();
  }, []);

  const handleValidate = async () => {
    if (!initialized) {
      setOutput("WASM module not initialized yet.");
      setIsError(true);
      return;
    }
    if (!xmlInput.trim()) {
      setIsError(true);
      setOutput("XML input is required.");
      return;
    }

    try {
      const options = {
        xml: xmlInput,
        schema: xsdInput.trim() ? xsdInput : ([] as string[]),
      };
      if (xsdInput.trim()) {
        options.schema = xsdInput;
      }

      const result = await validateXML(options);
      if (result.valid) {
        const formatted = xmlFormatter(xmlInput, {
          indentation: "  ",
          collapseContent: true,
        });
        setOutput("XML is valid!\n" + formatted);
        setIsError(false);
      } else {
        setIsError(true);
        console.log("result", result);
        const errorMessages = result.errors
          .map((err) => (typeof err === "string" ? err : err.message))
          .join("\n");
        setOutput("Validation Errors:\n" + errorMessages);
      }
    } catch (err: unknown) {
      console.error("Validation error:", err);
      setIsError(true);
      const friendlyError = humanizeXmlErrors(err);
      setOutput(`Unexpected Error:\n${friendlyError}`);
    }
  };

  return (
    <Box sx={{ maxWidth: "800px", mx: "auto", p: 2 }}>
      <Typography variant="h4" gutterBottom>
        XML Formatter & Validator
      </Typography>
      <TextField
        label="XML Input"
        multiline
        minRows={8}
        fullWidth
        variant="outlined"
        value={xmlInput}
        onChange={(e) => setXmlInput(e.target.value)}
        margin="normal"
        placeholder="Paste your XML here..."
      />
      <TextField
        label="XSD Schema (Optional)"
        multiline
        minRows={6}
        fullWidth
        variant="outlined"
        value={xsdInput}
        onChange={(e) => setXsdInput(e.target.value)}
        margin="normal"
        placeholder="Paste your XSD here..."
      />
      <Button variant="contained" onClick={handleValidate} sx={{ mt: 2 }}>
        Validate & Format
      </Button>
      <Typography
        component="pre"
        sx={{
          mt: 3,
          backgroundColor: isError ? "#ffcccc" : "#ccffcc",
          p: 2,
          whiteSpace: "pre-wrap",
          borderRadius: 1,
        }}
        color={isError ? "error" : "text.primary"}
      >
        {output}
      </Typography>
    </Box>
  );
};

export default XmlValidator;
