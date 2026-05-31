import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { blue, red } from "@mui/material/colors";
import { IoMdSend } from "react-icons/io";
import {
  MdAttachFile,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdCode,
  MdLink,
  MdOutlineDelete,
  MdOutlineReviews,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CodeReviewItem from "../components/chat/CodeReviewItem";
import { useAuth } from "../context/AuthContext";
import {
  deleteUserChats,
  getUserChats,
  getUserStats,
  sendCodeReviewRequest,
  sendGithubPrReviewRequest,
} from "../helpers/api-communicator";

interface CodeReview {
  role: "user" | "assistant";
  content: string;
  code?: string | null;
  language?: string | null;
  fileName?: string | null;
  severity?: "critical" | "high" | "medium" | "low" | "info" | null;
  issuesCount?: number;
  timestamp?: string;
}

interface Stats {
  totalReviews: number;
  totalChats: number;
  criticalIssues: number;
  averageIssuesPerReview: number;
  languagesReviewed: string[];
  dailyLimit?: number;
  dailyUsed?: number;
  dailyRemaining?: number;
}


const Chat = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);
  const auth = useAuth();
  const [reviews, setReviews] = useState<CodeReview[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [fileName, setFileName] = useState("");
 // const [language, setLanguage] = useState("auto");
  const [code, setCode] = useState("");
  const [reviewSource, setReviewSource] = useState<"code" | "github">("code");
  const [prUrl, setPrUrl] = useState("");
  const [postToGithub, setPostToGithub] = useState(false);
  const [githubToken, setGithubToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dailyRemaining = stats?.dailyRemaining ?? 5;

  const initials =
    auth?.user?.name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 100 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 100KB");
      return;
    }

    try {
      setCode(await file.text());
      setFileName(file.name);
      toast.success(`Loaded ${file.name}`);
    } catch {
      toast.error("Failed to read file");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    const trimmedCode = code.trim();

    if (reviewSource === "code" && !trimmedCode) {
      toast.error("Paste or upload code to review");
      return;
    }

    if (reviewSource === "code" && trimmedCode.length < 5) {
      toast.error("Code must be at least 5 characters");
      return;
    }

    if (reviewSource === "github" && !prUrl.trim()) {
      toast.error("Paste a GitHub pull request URL");
      return;
    }

    setLoading(true);
    try {
      const reviewData =
        reviewSource === "github"
          ? await sendGithubPrReviewRequest(
              prUrl.trim(),
              trimmedCode,
              postToGithub,
              githubToken.trim()
            )
          : await sendCodeReviewRequest(trimmedCode, "", fileName);
      const statsData = await getUserStats();

      setReviews(reviewData.chats);
      setStats(statsData.stats);
      setCode("");
      setFileName("");
      if (reviewSource === "github") {
        setPrUrl("");
        setGithubToken("");
      }
      toast.success(
        reviewSource === "github" && reviewData.githubCommentUrl
          ? "PR review posted to GitHub"
          : "Code review completed",
        { id: "review" }
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit code for review", {
        id: "review",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearCode = () => {
    setCode("");
    setFileName("");
    if (reviewSource === "github") {
      setPrUrl("");
      setGithubToken("");
      setPostToGithub(false);
    }
  };

  const handleDeleteAllReviews = async () => {
    if (!window.confirm("Delete all saved reviews?")) return;

    try {
      toast.loading("Deleting reviews...", { id: "delete" });
      await deleteUserChats();
      setReviews([]);
      setStats(null);
      toast.success("Reviews deleted", { id: "delete" });
    } catch {
      toast.error("Failed to delete reviews", { id: "delete" });
    }
  };

  useLayoutEffect(() => {
    if (auth?.isCheckingAuth) return;
    if (auth?.isLoggedIn && auth.user) {
      Promise.all([getUserChats(), getUserStats()])
        .then(([chatData, statsData]) => {
          setReviews(chatData.chats);
          setStats(statsData.stats);
        })
        .catch(() => {
          toast.error("Failed to load reviews");
        });
    }
  }, [auth?.isCheckingAuth, auth?.isLoggedIn, auth?.user]);

  useEffect(() => {
    if (!auth?.isCheckingAuth && !auth?.user) {
      navigate("/login");
    }
  }, [auth?.isCheckingAuth, auth?.user, navigate]);

  useEffect(() => {
    if (!scrollRef) return;
    window.setTimeout(() => {
      scrollRef.scrollTop = scrollRef.scrollHeight;
    }, 100);
  }, [reviews, scrollRef]);

  return (
    <Box sx={{ height: "calc(100vh - 64px)", bgcolor: "#0d1117", color: "#e6edf3" }}>
      <Box
        component="main"
        sx={{
          height: "100%",
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: sidebarOpen ? "280px minmax(0, 1fr)" : "0 minmax(0, 1fr)",
          },
          width: "100%",
          transition: "grid-template-columns 180ms ease",
        }}
      >
        <Box
          component="aside"
          sx={{
            display: { xs: "none", lg: "flex" },
            flexDirection: "column",
            bgcolor: "#111820",
            borderRight: "1px solid #21262d",
            p: 2,
            gap: 2,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1 }}>
            <Avatar sx={{ bgcolor: blue[700], width: 42, height: 42, fontWeight: 800 }}>
              {initials}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, lineHeight: 1.2 }}>Code Review</Typography>
              <Typography sx={{ color: "#8b949e", fontSize: "0.82rem" }}>
                Review history and quality signals
              </Typography>
            </Box>
          </Box>

          <Paper sx={{ p: 2, bgcolor: "#0d1117", border: "1px solid #30363d", borderRadius: 2 }}>
            <Typography sx={{ fontWeight: 800, mb: 1.5, fontSize: "0.88rem" }}>
              Metrics
            </Typography>
            {[
              ["Today", `${stats?.dailyUsed ?? 0}/${stats?.dailyLimit ?? 5}`, blue[200]],
              ["Reviews", stats?.totalReviews ?? 0, blue[300]],
              ["Critical issues", stats?.criticalIssues ?? 0, red[300]],
              ["Avg issues", stats?.averageIssuesPerReview ?? 0, "#e6edf3"],
            ].map(([label, value, color]) => (
              <Box
                key={label}
                sx={{ display: "flex", justifyContent: "space-between", py: 0.85 }}
              >
                <Typography sx={{ color: "#8b949e", fontSize: "0.9rem" }}>{label}</Typography>
                <Typography sx={{ color, fontWeight: 800 }}>{value}</Typography>
              </Box>
            ))}
          </Paper>

          <Paper sx={{ p: 2, bgcolor: "#0d1117", border: "1px solid #30363d", borderRadius: 2 }}>
            <Typography sx={{ fontWeight: 800, mb: 1.5, fontSize: "0.88rem" }}>
              Languages
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {(stats?.languagesReviewed?.length ? stats.languagesReviewed : ["No reviews yet"]).map(
                (lang) => (
                  <Chip
                    key={lang}
                    label={lang}
                    size="small"
                    sx={{ bgcolor: "#21262d", color: "#c9d1d9", maxWidth: "100%" }}
                  />
                )
              )}
            </Box>
          </Paper>

          <Button
            onClick={handleDeleteAllReviews}
            disabled={reviews.length === 0}
            startIcon={<MdOutlineDelete />}
            sx={{
              mt: "auto",
              bgcolor: "rgba(248,81,73,0.12)",
              color: red[200],
              border: "1px solid rgba(248,81,73,0.35)",
              borderRadius: 2,
              fontWeight: 800,
              "&:hover": { bgcolor: "rgba(248,81,73,0.18)" },
              "&:disabled": { bgcolor: "#161b22", color: "#6e7681", borderColor: "#30363d" },
            }}
          >
            Clear Reviews
          </Button>
        </Box>

        <Box
          sx={{
            minWidth: 0,
            display: "grid",
            gridTemplateRows: "auto minmax(0, 1fr)",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              py: 2,
              borderBottom: "1px solid #21262d",
              bgcolor: "#0d1117",
              position: "sticky",
              top: 0,
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
              <Tooltip title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}>
                <IconButton
                  onClick={() => setSidebarOpen((value) => !value)}
                  sx={{
                    display: { xs: "none", lg: "inline-flex" },
                    color: "#8b949e",
                    border: "1px solid #30363d",
                    bgcolor: "#111820",
                    "&:hover": { color: "#e6edf3", borderColor: "#58a6ff" },
                  }}
                >
                  {sidebarOpen ? <MdChevronLeft /> : <MdChevronRight />}
                </IconButton>
              </Tooltip>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: { xs: "1.1rem", md: "1.35rem" }, fontWeight: 900 }}>
                  Review Workspace
                </Typography>
                <Typography sx={{ color: "#8b949e", fontSize: "0.9rem" }}>
                  Paste code, upload a file, or review a GitHub pull request.
                </Typography>
              </Box>
            </Box>
            <Chip
              icon={<MdOutlineReviews />}
              label={`${reviews.filter((review) => review.role === "assistant").length} reviews`}
              sx={{ display: { xs: "none", sm: "inline-flex" }, bgcolor: "#161b22", color: "#c9d1d9" }}
            />
          </Box>

          <Box sx={{ minHeight: 0, display: "grid", gridTemplateRows: "minmax(0, 1fr) auto", overflow: "hidden" }}>
            <Box
              ref={setScrollRef}
              sx={{
                minHeight: 0,
                overflowY: "auto",
                px: { xs: 2, md: 3 },
                py: 2.5,
                pb: 3,
                bgcolor: "#0d1117",
              }}
            >
              {reviews.length === 0 ? (
                <Paper
                  sx={{
                    minHeight: 320,
                    display: "grid",
                    placeItems: "center",
                    textAlign: "center",
                    bgcolor: "#111820",
                    border: "1px dashed #30363d",
                    borderRadius: 2,
                    p: 4,
                    maxWidth: 760,
                    mx: "auto",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: "1.25rem", fontWeight: 900, mb: 1 }}>
                      Drop code into the composer
                    </Typography>
                    <Typography sx={{ color: "#8b949e", maxWidth: 520 }}>
                      Add instructions in the same box, for example: "Focus on security and race
                      conditions," then paste the code below it.
                    </Typography>
                  </Box>
                </Paper>
              ) : (
                <Box sx={{ display: "grid", gap: 2.25, maxWidth: 920, mx: "auto" }}>
                  {reviews.map((review, index) => (
                    <CodeReviewItem key={`${review.role}-${index}`} review={review} />
                  ))}
                </Box>
              )}
            </Box>

            <Box
              component="section"
              sx={{
                px: { xs: 1.5, md: 3 },
                pb: { xs: 1.5, md: 2.5 },
                pt: 1.5,
                bgcolor: "#0d1117",
                zIndex: 2,
              }}
            >
              <Paper
                sx={{
                  maxWidth: 920,
                  mx: "auto",
                  bgcolor: "#111820",
                  border: "1px solid #30363d",
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 18px 70px rgba(0,0,0,0.32)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1,
                    py: 1,
                    borderBottom: "1px solid #21262d",
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    ["code", "Code", <MdCode key="code-icon" />],
                    ["github", "GitHub PR", <MdLink key="github-icon" />],
                  ].map(([value, label, icon]) => (
                    <Button
                      key={String(value)}
                      size="small"
                      startIcon={icon}
                      onClick={() => setReviewSource(value as "code" | "github")}
                      sx={{
                        minHeight: 34,
                        borderRadius: 2,
                        px: 1.25,
                        color: reviewSource === value ? "#07111f" : "#c9d1d9",
                        bgcolor: reviewSource === value ? blue[400] : "#161b22",
                        border: "1px solid #30363d",
                        fontWeight: 800,
                        "&:hover": {
                          bgcolor: reviewSource === value ? blue[300] : "#21262d",
                        },
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </Box>

                {reviewSource === "github" && (
                  <Box sx={{ px: 1.5, pt: 1.25, display: "grid", gap: 1.25 }}>
                    <TextField
                      value={prUrl}
                      onChange={(event) => setPrUrl(event.target.value)}
                      placeholder="https://github.com/owner/repo/pull/123"
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: <MdLink style={{ marginRight: 8, color: "#8b949e" }} />,
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "#e6edf3",
                          bgcolor: "#0d1117",
                          "& fieldset": { borderColor: "#30363d" },
                          "&:hover fieldset": { borderColor: "#58a6ff" },
                        },
                        "& input::placeholder": { color: "#6e7681", opacity: 1 },
                      }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        flexWrap: "wrap",
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={postToGithub}
                            onChange={(event) => setPostToGithub(event.target.checked)}
                            sx={{
                              color: "#8b949e",
                              "&.Mui-checked": { color: blue[400] },
                            }}
                          />
                        }
                        label="Post review to PR"
                        sx={{
                          color: "#c9d1d9",
                          m: 0,
                          "& .MuiFormControlLabel-label": { fontSize: "0.88rem" },
                        }}
                      />
                      {postToGithub && (
                        <TextField
                          value={githubToken}
                          onChange={(event) => setGithubToken(event.target.value)}
                          placeholder="GitHub token, optional if backend has GITHUB_TOKEN"
                          type="password"
                          variant="outlined"
                          size="small"
                          sx={{
                            flex: "1 1 280px",
                            "& .MuiOutlinedInput-root": {
                              color: "#e6edf3",
                              bgcolor: "#0d1117",
                              "& fieldset": { borderColor: "#30363d" },
                              "&:hover fieldset": { borderColor: "#58a6ff" },
                            },
                            "& input::placeholder": { color: "#6e7681", opacity: 1 },
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                )}

                {fileName && reviewSource === "code" && (
                  <Box sx={{ px: 1.5, pt: 1.25 }}>
                    <Chip
                      label={fileName}
                      onDelete={() => setFileName("")}
                      sx={{ bgcolor: "#0f2747", color: "#e6edf3", maxWidth: "100%" }}
                    />
                  </Box>
                )}

                <TextField
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  multiline
                  minRows={2}
                  maxRows={10}
                  placeholder={
                    reviewSource === "github"
                      ? "Optional review focus...\nExample: Focus on auth bypasses and migration risk."
                      : "Paste code and review instructions here...\nExample: Focus on auth bypasses, then paste the code below."
                  }
                  variant="standard"
                  InputProps={{ disableUnderline: true }}
                  sx={{
                    width: "100%",
                    px: 1.5,
                    pt: 1.25,
                    "& .MuiInputBase-root": {
                      color: "#e6edf3",
                      fontFamily: "Consolas, 'SFMono-Regular', monospace",
                      fontSize: "0.92rem",
                      lineHeight: 1.55,
                    },
                    "& textarea::placeholder": {
                      color: "#6e7681",
                      opacity: 1,
                    },
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1,
                    py: 1,
                    borderTop: "1px solid #21262d",
                  }}
                >
                  <Tooltip title="Attach file">
                    <span>
                    <IconButton
                      component="label"
                      size="small"
                      disabled={reviewSource === "github"}
                      sx={{ color: "#8b949e", "&:hover": { color: "#e6edf3" }, "&:disabled": { color: "#484f58" } }}
                    >
                      <MdAttachFile />
                      <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        onChange={handleFileUpload}
                        accept=".js,.ts,.jsx,.tsx,.py,.java,.cpp,.cs,.go,.rs,.php,.swift,.kt,.sql,.html,.css,.scss,.json,.xml,.yaml,.yml,.sh"
                      />
                    </IconButton>
                    </span>
                  </Tooltip>

                  <Box sx={{ flex: 1 }} />

                  {code && (
                    <Tooltip title="Clear input">
                      <IconButton
                        size="small"
                        onClick={handleClearCode}
                        sx={{ color: "#8b949e", "&:hover": { color: "#e6edf3" } }}
                      >
                        <MdClose />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Tooltip title="Submit review">
                    <span>
                      <IconButton
                        onClick={handleSubmit}
                        disabled={
                          loading ||
                          dailyRemaining <= 0 ||
                          (reviewSource === "code" && !code.trim()) ||
                          (reviewSource === "github" && !prUrl.trim())
                        }
                        sx={{
                          width: 38,
                          height: 38,
                          bgcolor: blue[500],
                          color: "#07111f",
                          "&:hover": { bgcolor: blue[400] },
                          "&:disabled": { bgcolor: "#21262d", color: "#6e7681" },
                        }}
                      >
                        {loading ? <CircularProgress size={18} /> : <IoMdSend />}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
