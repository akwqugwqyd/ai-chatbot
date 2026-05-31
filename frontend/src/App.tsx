import Header from "./components/Header";
import { Routes, Route } from "react-router-dom";
import Box from "@mui/material/Box";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import NotFound from "./pages/Notfound";

function App() {
  return (
    <main>
      <Header />
      <Box sx={{ pt: { xs: "56px", sm: "64px" } }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </main>
  );
}

export default App;
