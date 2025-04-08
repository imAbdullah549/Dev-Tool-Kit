// Base64EncoderDecoder.tsx
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Paper,
} from "@mui/material";

const Base64EncoderDecoder: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputText, setOutputText] = useState<string>("");
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [mode, setMode] = useState<"encode" | "decode" | null>(null);

  /**
   * If the input is a Data URL (e.g. data:<mime>;base64,...),
   * extract the portion after the comma.
   */
  const extractBase64FromDataUrl = (str: string): string => {
    const trimmed = str.trim();
    if (trimmed.startsWith("data:") && trimmed.includes(";base64,")) {
      return trimmed.substring(trimmed.indexOf(";base64,") + 8);
    }
    return trimmed;
  };

  /**
   * Round-trip check for Base64 validity.
   * Ensures the trimmed input length is a multiple of 4,
   * decodes and re-encodes it, and compares the result.
   */
  const isProbablyBase64 = (str: string): boolean => {
    const trimmed = str.trim();
    if (trimmed.length < 8) return false; // avoid false positives on very short strings
    if (trimmed.length % 4 !== 0) return false;
    try {
      const decoded = atob(trimmed);
      const reencoded = btoa(decoded);
      return reencoded === trimmed;
    } catch {
      return false;
    }
  };

  /**
   * Checks whether a string is likely human-readable text.
   * This function considers printable ASCII (32–126) plus common whitespace.
   */
  const isLikelyText = (str: string): boolean => {
    if (!str.length) return false;
    let nonPrintable = 0;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (
        !(
          code === 9 ||
          code === 10 ||
          code === 13 ||
          (code >= 32 && code <= 126)
        )
      ) {
        nonPrintable++;
      }
    }
    return nonPrintable / str.length < 0.1;
  };

  // Handler for file input.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setInputText("");
      // For text files, read as text; for others, use Data URL.
      if (file.type.startsWith("text/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const fileContent = reader.result as string;
          setInputText(fileContent);
          // Trigger conversion shortly after state update.
          setTimeout(() => {
            handleConvert();
          }, 0);
        };
        reader.readAsText(file);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const base64Data = dataUrl.split(",")[1];
          setOutputText(base64Data);
          setMode("encode");
          setOutputBlob(null);
        };
        reader.readAsDataURL(file);
      }
      setSelectedFile(null);
    }
  };

  // Handler to perform conversion (for text input).
  const handleConvert = () => {
    if (selectedFile) return; // already processed
    if (!inputText) {
      setOutputText("");
      setOutputBlob(null);
      setMode(null);
      return;
    }
    const possiblyBase64 = extractBase64FromDataUrl(inputText);
    if (isProbablyBase64(possiblyBase64)) {
      try {
        const binaryStr = atob(possiblyBase64);
        const bytes = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0));
        const decodedText = new TextDecoder().decode(bytes);
        if (isLikelyText(decodedText)) {
          setOutputText(decodedText);
          setMode("decode");
          setOutputBlob(null);
        } else {
          setOutputText("");
          setMode("decode");
          setOutputBlob(
            new Blob([bytes], { type: "application/octet-stream" })
          );
        }
      } catch (e) {
        setOutputText("Error decoding Base64 input.");
        setMode("decode");
      }
    } else {
      try {
        const encoded = btoa(unescape(encodeURIComponent(inputText)));
        setOutputText(encoded);
        setMode("encode");
        setOutputBlob(null);
      } catch (e) {
        setOutputText("Error encoding text.");
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(outputText)
      .then(() => alert("Copied to clipboard!"))
      .catch(() => alert("Copy failed."));
  };

  const handleEncodedDownload = () => {
    if (outputText) {
      const blob = new Blob([outputText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "encoded_output.txt";
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDecodedDownload = () => {
    try {
      let blob: Blob;
      if (outputBlob) {
        blob = outputBlob;
      } else if (outputText && isProbablyBase64(outputText)) {
        const binaryStr = atob(outputText);
        const bytes = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0));
        blob = new Blob([bytes], { type: "application/octet-stream" });
      } else if (mode === "decode" && outputText) {
        blob = new Blob([outputText], { type: "text/plain" });
      } else {
        alert("No valid decoded output available.");
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Use appropriate file extension based on MIME type (here using .bin for binary, .txt for text)
      link.download =
        mode === "decode" && outputBlob
          ? "decoded_output.bin"
          : "decoded_output.txt";
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Error decoding for download.");
    }
  };

  return (
    <Box sx={{ maxWidth: "800px", mx: "auto", p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Base64 Encoder/Decoder
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Input Text or Base64 String"
          multiline
          rows={4}
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            setSelectedFile(null);
          }}
          placeholder="Enter text to encode or a Base64 string to decode (Data URL also supported)"
          fullWidth
          slotProps={{
            input: {
              sx: {
                maxHeight: "150px",
                overflowY: "auto",
              },
            },
          }}
        />

        <Button variant="contained" component="label">
          Upload File
          <input type="file" hidden onChange={handleFileChange} />
        </Button>
        <Button variant="contained" onClick={handleConvert}>
          Convert
        </Button>
      </Stack>

      {mode && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">
            {mode === "encode" ? "Encoded Base64 Output:" : "Decoded Output:"}
          </Typography>
          {mode === "encode" || (mode === "decode" && !outputBlob) ? (
            <TextField
              value={outputText}
              fullWidth
              multiline
              rows={4}
              InputProps={{ readOnly: true }}
              slotProps={{
                input: {
                  sx: {
                    maxHeight: "150px",
                    overflowY: "auto",
                  },
                },
              }}
              sx={{ mt: 2 }}
            />
          ) : (
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography>Binary data ready for download.</Typography>
            </Paper>
          )}
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            {mode === "encode" && outputText && (
              <Button variant="outlined" onClick={handleEncodedDownload}>
                Download Encoded File
              </Button>
            )}
            {mode === "decode" && (
              <Button variant="outlined" onClick={handleDecodedDownload}>
                Download Decoded File
              </Button>
            )}
            {(mode === "encode" ||
              (mode === "decode" && (!outputBlob || outputText))) && (
              <Button variant="outlined" onClick={handleCopy}>
                Copy to Clipboard
              </Button>
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default Base64EncoderDecoder;
