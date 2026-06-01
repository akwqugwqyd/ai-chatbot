import axios from "axios";

const optionalText = (value?: string) => value?.trim() ?? "";

export const loginUser = async (email: string, password: string) => {
  const res = await axios.post("/user/login", { email, password });
  if (res.status !== 200) {
    throw new Error("Unable to login");
  }
  return res.data;
};

export const signupUser = async (
  name: string,
  email: string,
  password: string
) => {
  try {
    const res = await axios.post("/user/signup", { name, email, password });
    if (res.status !== 201) {
      throw new Error("Unable to signup");
    }
    return res.data;
  } catch (err: any) {
    if (err.response && err.response.data) {
      throw err.response.data;
    }
    throw err;
  }
};

export const checkAuthStatus = async () => {
  const res = await axios.get("/user/auth-status");
  if (res.status !== 200) {
    throw new Error("Unable to authenticate");
  }
  return res.data;
};

export const sendCodeReviewRequest = async (
  code: string,
  message?: string,
  fileName?: string,
  language?: string
) => {
  try {
    const res = await axios.post("/chat/review", {
      code,
      message: optionalText(message),
      fileName: optionalText(fileName),
      language: optionalText(language) || "auto",
    });
    if (res.status !== 200) {
      throw new Error("Unable to submit code for review");
    }
    return res.data;
  } catch (err: any) {
    if (err.response && err.response.data) {
      throw err;
    }
    throw err;
  }
};

export const sendGithubPrReviewRequest = async (
  prUrl: string,
  message?: string,
  postToGithub?: boolean,
  githubToken?: string
) => {
  try {
    const res = await axios.post("/chat/review/github-pr", {
      prUrl,
      message: optionalText(message),
      postToGithub: Boolean(postToGithub),
      githubToken: optionalText(githubToken),
    });
    if (res.status !== 200) {
      throw new Error("Unable to submit pull request for review");
    }
    return res.data;
  } catch (err: any) {
    if (err.response && err.response.data) {
      throw err;
    }
    throw err;
  }
};

// Legacy chat endpoint - deprecated
export const sendChatRequest = async (message: string) => {
  console.warn("sendChatRequest is deprecated. Use sendCodeReviewRequest instead.");
  const res = await axios.post("/chat/new", { message });
  if (res.status !== 200) {
    throw new Error("Unable to send chat");
  }
  return res.data;
};

export const getUserChats = async () => {
  const res = await axios.get("/chat/all-chats");
  if (res.status !== 200) {
    throw new Error("Unable to retrieve chats");
  }
  return res.data;
};

export const getUserStats = async () => {
  const res = await axios.get("/chat/stats");
  if (res.status !== 200) {
    throw new Error("Unable to retrieve stats");
  }
  return res.data;
};

export const deleteUserChats = async () => {
  const res = await axios.delete("/chat/delete");
  if (res.status !== 200) {
    throw new Error("Unable to delete chats");
  }
  return res.data;
};

export const logoutUser = async () => {
  const res = await axios.get("/user/logout");
  if (res.status !== 200) {
    throw new Error("Unable to logout");
  }
  return res.data;
};


