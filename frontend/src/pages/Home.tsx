import { Box, Typography, Button, Container, Chip, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { blue } from "@mui/material/colors";
import {
  MdArrowForward,
  MdBugReport,
  MdHistory,
  MdLanguage,
  MdSecurity,
  MdSpeed,
  MdTaskAlt,
} from "react-icons/md";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MdBugReport />,
      title: "Bug Detection",
      description: "Find runtime risks, edge cases, and logic errors before they reach production.",
    },
    {
      icon: <MdSecurity />,
      title: "Security Review",
      description: "Spot unsafe inputs, auth gaps, exposed secrets, and vulnerable patterns.",
    },
    {
      icon: <MdSpeed />,
      title: "Performance Checks",
      description: "Get focused recommendations for expensive loops, queries, and rendering paths.",
    },
    {
      icon: <MdTaskAlt />,
      title: "Best Practices",
      description: "Improve readability, structure, naming, maintainability, and framework usage.",
    },
    {
      icon: <MdLanguage />,
      title: "Language Aware",
      description: "Review JavaScript, TypeScript, Python, Java, Go, Rust, SQL, HTML, CSS, and more.",
    },
    {
      icon: <MdHistory />,
      title: "History & Metrics",
      description: "Keep previous reviews, issue counts, severity, and reviewed language stats.",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        bgcolor: "#0d1117",
        color: "#f0f6fc",
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        {/* Hero Section Container */}
        <Box
          sx={{
            width: "100%",
            mb: { xs: 4, md: 6 },
          }}
        >
          <Box>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.35rem", md: "4rem" },
                lineHeight: 1.05,
                fontWeight: 800,
                letterSpacing: 0,
                width: "100%",
              }}
            >
              A focused AI code reviewer for everyday engineering work.
            </Typography>
            <Typography
              sx={{
                color: "#8b949e",
                mt: 2.5,
                fontSize: { xs: "1rem", md: "1.12rem" },
                lineHeight: 1.7,
                width: "100%",
              }}
            >
              Paste code once, get a structured review, and keep the history, severity, language,
              and issue metrics attached to your account.
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 3 }}>
              {["3 reviews/day", "Review history", "Severity labels", "Quality metrics"].map((label) => (
                <Chip
                  key={label}
                  label={label}
                  sx={{
                    bgcolor: "#161b22",
                    color: "#c9d1d9",
                    border: "1px solid #30363d",
                  }}
                />
              ))}
            </Box>
            <Button
              onClick={() => navigate("/chat")}
              endIcon={<MdArrowForward />}
              sx={{
                mt: 4,
                py: 1.35,
                px: 3,
                bgcolor: blue[500],
                color: "#07111f",
                fontWeight: 800,
                borderRadius: 2,
                "&:hover": { bgcolor: blue[400] },
              }}
            >
              Start Reviewing
            </Button>
          </Box>
        </Box>

        
        {/* Features Grid Section */}
        <Box sx={{ mt: { xs: 6, md: 8 } }}>
          <Typography variant="h2" sx={{ fontSize: { xs: "1.65rem", md: "2.25rem" }, fontWeight: 800, mb: 3 }}>
            Everything needed for code review
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" },
              gap: 2,
            }}
          >
            {features.map((feature) => (
              <Paper
                key={feature.title}
                sx={{
                  p: 2.5,
                  minHeight: 178,
                  bgcolor: "#161b22",
                  border: "1px solid #30363d",
                  borderRadius: 2,
                }}
              >
                <Box sx={{ color: blue[300], fontSize: 28, mb: 1.5, lineHeight: 0 }}>
                  {feature.icon}
                </Box>
                <Typography sx={{ fontWeight: 800, mb: 1 }}>{feature.title}</Typography>
                <Typography sx={{ color: "#8b949e", lineHeight: 1.6 }}>
                  {feature.description}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
