import { Box, Chip, Collapse, IconButton, Paper, Typography } from "@mui/material";
import { blue, orange, red, yellow } from "@mui/material/colors";
import { useState } from "react";
import { MdExpandMore } from "react-icons/md";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeReviewItemProps {
  review: {
    role: "user" | "assistant";
    content: string;
    code?: string | null;
    language?: string | null;
    fileName?: string | null;
    severity?: "critical" | "high" | "medium" | "low" | "info" | null;
    issuesCount?: number;
  };
}

const severityColors: Record<string, { bg: string; color: string; label: string }> = {
  critical: { bg: "rgba(248,81,73,0.16)", color: red[200], label: "Critical" },
  high: { bg: "rgba(248,81,73,0.12)", color: red[100], label: "High" },
  medium: { bg: "rgba(251,133,0,0.14)", color: orange[200], label: "Medium" },
  low: { bg: "rgba(251,191,36,0.12)", color: yellow[200], label: "Low" },
  info: { bg: "rgba(88,166,255,0.14)", color: blue[200], label: "Info" },
};

const CodeReviewItem = ({ review }: CodeReviewItemProps) => {
  const isUser = review.role === "user";
  const [expanded, setExpanded] = useState(false);
  const severityInfo = review.severity ? severityColors[review.severity] : null;
  const codeLanguage = review.language || "plaintext";
  const postedToGithub = review.content.includes("Posted to GitHub:");
  const operationSummary = postedToGithub
    ? "Reviewed the pull request diff, generated findings, and posted the review back to GitHub."
    : review.fileName
    ? `Reviewed ${review.fileName} and generated actionable findings.`
    : "Reviewed the submitted code and generated actionable findings.";

  if (isUser) {
    return (
      <Paper
        sx={{
          bgcolor: "#111820",
          border: "1px solid #263241",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            p: 1.75,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: "#8b949e", fontSize: "0.78rem", fontWeight: 800 }}>
              Submitted Code
            </Typography>
            <Typography sx={{ fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis" }}>
              {review.fileName || "Pasted snippet"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Chip
              label={codeLanguage}
              size="small"
              sx={{ bgcolor: "#0f2747", color: blue[100], fontWeight: 800 }}
            />
            <IconButton
              size="small"
              aria-label={expanded ? "Collapse code" : "Expand code"}
              onClick={() => setExpanded(!expanded)}
              sx={{
                color: "#c9d1d9",
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <MdExpandMore size={22} />
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded} timeout="auto">
          <Box sx={{ borderTop: "1px solid #263241", bgcolor: "#0d1117" }}>
            <SyntaxHighlighter
              language={codeLanguage}
              style={atomDark}
              customStyle={{
                margin: 0,
                padding: "16px",
                fontSize: "0.84rem",
                lineHeight: "1.55",
                maxHeight: "260px",
                overflowY: "auto",
                background: "transparent",
              }}
            >
              {review.code || review.content}
            </SyntaxHighlighter>
          </Box>
        </Collapse>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        bgcolor: "#161b22",
        border: "1px solid #30363d",
        borderRadius: 2,
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <Typography sx={{ fontSize: "1rem", fontWeight: 900 }}>Code Review</Typography>
        {severityInfo && (
          <Chip
            label={severityInfo.label}
            size="small"
            sx={{
              bgcolor: severityInfo.bg,
              color: severityInfo.color,
              border: "1px solid rgba(255,255,255,0.08)",
              fontWeight: 800,
            }}
          />
        )}
        {review.issuesCount !== undefined && review.issuesCount > 0 && (
          <Chip
            label={`${review.issuesCount} findings`}
            size="small"
            sx={{ bgcolor: "#21262d", color: "#c9d1d9", fontWeight: 800 }}
          />
        )}
      </Box>

      <Typography
        component="div"
        sx={{
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          fontSize: "0.96rem",
          lineHeight: 1.72,
          color: "#d0d7de",
        }}
      >
        {review.content}
      </Typography>

      <Box
        sx={{
          mt: 2,
          p: 1.25,
          border: "1px solid #30363d",
          borderRadius: 1.5,
          bgcolor: "#0d1117",
          display: "grid",
          gap: 0.5,
        }}
      >
        <Typography sx={{ color: "#8b949e", fontSize: "0.76rem", fontWeight: 900 }}>
          Operation Summary
        </Typography>
        <Typography sx={{ color: "#c9d1d9", fontSize: "0.86rem", lineHeight: 1.45 }}>
          {operationSummary}
          {review.issuesCount !== undefined && review.issuesCount > 0
            ? ` ${review.issuesCount} finding${review.issuesCount === 1 ? "" : "s"} detected.`
            : " No numbered findings detected."}
        </Typography>
      </Box>
    </Paper>
  );
};

export default CodeReviewItem;
