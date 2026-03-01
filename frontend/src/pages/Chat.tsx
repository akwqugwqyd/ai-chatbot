import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import ChatItem from "../components/chat/ChatItem";
import { IoMdSend } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import {
  deleteUserChats,
  getUserChats,
  sendChatRequest,
} from "../helpers/api-communicator";
import toast from "react-hot-toast";
import { red } from "@mui/material/colors";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const Chat = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const auth = useAuth();
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = async () => {
    const content = inputRef.current?.value.trim() as string;
    if (!content) return;
    if (inputRef && inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
    const newMessage: Message = { role: "user", content };
    setChatMessages((prev) => [...prev, newMessage]);

    try {
      const chatData = await sendChatRequest(content);
      setChatMessages((prev) => [...prev, ...chatData.chats]);
    } catch (err) {
      toast.error("Failed to send message", { id: "sendmsg" });
    }
  };

  const handleDeleteChats = async () => {
    try {
      toast.loading("Deleting Chats", { id: "deletechats" });
      await deleteUserChats();
      setChatMessages([]);
      toast.success("Deleted Chats Successfully", { id: "deletechats" });
    } catch (error) {
      console.log(error);
      toast.error("Deleting chats failed", { id: "deletechats" });
    }
  };

  useLayoutEffect(() => {
    if (auth?.isLoggedIn && auth.user) {
      toast.loading("Loading Chats", { id: "loadchats" });
      getUserChats()
        .then((data) => {
          setChatMessages([...data.chats]);
          toast.success("Successfully loaded chats", { id: "loadchats" });
        })
        .catch((err) => {
          console.log(err);
          toast.error("Loading Failed", { id: "loadchats" });
        });
    }
  }, [auth]);

  useEffect(() => {
    if (!auth?.user) {
      navigate("/login");
    }
  }, [auth]);

  // auto scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <Box
      sx={{
        height: "calc(100vh - 64px)", // leave room for fixed navbar
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      <Box
        component="main"
        sx={{
          display: "flex",
          flex: 1,
          overflow: "hidden", // left/right panels don't scroll
        }}
      >
        {/* left sidebar */}
        <Box
          sx={{
            display: { md: "flex", xs: "none", sm: "none" },
            flex: "0 0 25%",
            flexDirection: "column",
            bgcolor: "background.paper",
            p: 3,
            borderRight: "1px solid #333",
          }}
        >
          <Avatar
            sx={{
              mx: "auto",
              my: 2,
              bgcolor: "primary.main",
              color: "white",
              fontWeight: 700,
              width: 56,
              height: 56,
            }}
          >
            {auth?.user?.name
              ?.split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase()}
          </Avatar>
          <Typography sx={{ mx: "auto", fontFamily: "work sans", fontWeight: 600 }}>
            You are talking to a ChatBOT
          </Typography>
          <Typography
            sx={{
              mx: "auto",
              fontFamily: "work sans",
              my: 2,
              px: 2,
              fontSize: "0.85rem",
              color: "text.secondary",
              textAlign: "center",
            }}
          >
            Ask questions on Knowledge, Business, Advice, Education, etc. Avoid personal info.
          </Typography>
          <Button
            onClick={handleDeleteChats}
            sx={{
              width: "100%",
              mt: "auto",
              color: "white",
              fontWeight: "700",
              borderRadius: 3,
              bgcolor: red[300],
              ":hover": {
                bgcolor: red.A400,
              },
            }}
          >
            Clear Conversation
          </Button>
        </Box>

        {/* chat panel */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            px: 2,
            py: 3,
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 600 }}>
              Aether Chat
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
              GPT‑3.5 Turbo
            </Typography>
          </Box>
          <Box
            ref={scrollRef}
            sx={{
              flex: 1,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              overflowY: "auto", // only the chat list scrolls
              scrollBehavior: "smooth",
              p: 2,
              bgcolor: "background.paper",
              border: "1px solid #292929",
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-thumb": { backgroundColor: "#333", borderRadius: 3 },
            }}
          >
            {chatMessages.length === 0 && (
              <Typography sx={{ color: "#888", textAlign: "center", mt: 4 }}>
                No messages yet. Say hello 👋
              </Typography>
            )}
            {chatMessages.map((chat, index) => (
              // @ts-ignore
              <ChatItem content={chat.content} role={chat.role} key={index} />
            ))}
          </Box>
          <div
            style={{
              width: "100%",
              borderRadius: 8,
              backgroundColor: "#2c2c2c",
              display: "flex",
              margin: "auto",
              alignItems: "center",
              padding: "0 8px",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message and press Enter..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              style={{
                width: "100%",
                backgroundColor: "transparent",
                padding: "20px",
                border: "none",
                outline: "none",
                color: "white",
                fontSize: "18px",
              }}
            />
            <IconButton onClick={handleSubmit} sx={{ color: "white", mx: 1 }}>
              <IoMdSend />
            </IconButton>
          </div>
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
