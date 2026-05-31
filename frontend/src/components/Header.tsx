import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Logo from "./shared/Logo";
import { useAuth } from "../context/AuthContext";
import NavigationLink from "./shared/NavigationLink";

const Header = () => {
  const auth = useAuth();
  return (
    <AppBar
      sx={{
        bgcolor: "rgba(13, 17, 23, 0.92)",
        position: "fixed",
        boxShadow: "0 1px 0 rgba(148, 163, 184, 0.14)",
        backdropFilter: "blur(14px)",
        width: "100%",
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar sx={{ display: "flex", width: "100%", px: { xs: 1.5, sm: 2.5 } }}>
        <Logo />
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}>
          {auth?.isLoggedIn ? (
            <>
              <NavigationLink
                bg="#58a6ff"
                to="/chat"
                text="Review"
                textColor="#07111f"
              />
              <NavigationLink
                bg="#21262d"
                textColor="white"
                to="/"
                text="Logout"
                onClick={auth.logout}
              />
            </>
          ) : (
            <>
              <NavigationLink
                bg="#58a6ff"
                to="/login"
                text="Login"
                textColor="#07111f"
              />
              <NavigationLink
                bg="#21262d"
                textColor="white"
                to="/signup"
                text="Signup"
              />
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
