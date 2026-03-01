import { Box, } from "@mui/material";
import TypingAnim from "../components/typer/TypingAnim";
import Footer from "../components/footer/Footer";

const Home = () => {
  return (
    <Box
      width={"100%"}
      sx={{
        height: "calc(100vh - 64px)", // leave space for fixed header
        overflowY: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          mx: "auto",
          mt: 3,
        }}
      >
        <Box>
          <TypingAnim />
        </Box>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: { md: "row", xs: "column", sm: "column" },
            gap: 5,
            my: 10,
          }}
        >
          <img
            className="image-inverted rotate"
            src="openai.png"
            alt="openai"
            style={{ width: "200px", margin: "auto" }}
          />
        </Box>
        {/* interactive pulse animation in place of robot image */}
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", my: 5 }}>
          <Box className="pulse-dot" />
          <Box className="pulse-dot" sx={{ ml: 2 }} />
          <Box className="pulse-dot" sx={{ ml: 2 }} />
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default Home;


