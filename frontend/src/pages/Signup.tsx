import React, { useEffect } from "react";
import { IoIosLogIn } from "react-icons/io";
import { Box, Typography, Button } from "@mui/material";
import CustomizedInput from "../components/shared/CustomizedInput";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
const Signup = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string || "").trim();
    const email = (formData.get("email") as string || "").trim();
    const password = (formData.get("password") as string || "").trim();

    // simple client validation
    if (!name || !email || !password) {
      toast.error("All fields are required", { id: "signup" });
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters", { id: "signup" });
      return;
    }

    try {
      toast.loading("Signing Up", { id: "signup" });
      await auth?.signup(name, email, password);
      toast.success("Signed Up Successfully", { id: "signup" });
    } catch (error: any) {
      console.log(error);
      if (error.errors && Array.isArray(error.errors)) {
        // show first validation error from server
        toast.error(error.errors[0].msg, { id: "signup" });
      } else if (error.message) {
        toast.error(error.message, { id: "signup" });
      } else {
        toast.error("Signing Up Failed", { id: "signup" });
      }
    }
  };
  useEffect(() => {
    if (auth?.user) {
      navigate("/chat");
    }
  }, [auth?.user]);
  return (
    <Box
      width={"100%"}
      height={"100%"}
      display="flex"
      flexDirection={{ xs: "column", md: "row" }}
      justifyContent="center"
      alignItems="center"
    >
      <Box
        padding={8}
        display={{ md: "flex", sm: "none", xs: "none" }}
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Typography variant="h3" fontWeight={600} color="#00fffc">
          Join Us!
        </Typography>
        <Typography variant="subtitle1" mt={2} color="gray">
          Create an account and talk with AI.
        </Typography>
      </Box>
      <Box
        display={"flex"}
        flex={{ xs: 1, md: 0.5 }}
        justifyContent={"center"}
        alignItems={"center"}
        padding={2}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            margin: "auto",
            padding: "30px",
            boxShadow: "10px 10px 20px #000",
            borderRadius: "10px",
            border: "none",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h4"
              textAlign="center"
              padding={2}
              fontWeight={600}
            >
              Signup
            </Typography>
            <CustomizedInput type="text" name="name" label="Name" />
            <CustomizedInput type="email" name="email" label="Email" />
            <CustomizedInput type="password" name="password" label="Password" />
            <Button
              type="submit"
              sx={{
                px: 2,
                py: 1,
                mt: 2,
                width: "400px",
                borderRadius: 2,
                bgcolor: "#00fffc",
                ":hover": {
                  bgcolor: "white",
                  color: "black",
                },
              }}
              endIcon={<IoIosLogIn />}
            >
              Signup
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default Signup;