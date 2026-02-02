import { Routes, Route } from "react-router-dom";
import { Container, Box } from "@mui/material";
import Home from "./pages/Home";
import Requests from "./pages/Requests";
import Explore from "./pages/Explore";
import More from "./pages/More";

function App({ isDarkMode, setIsDarkMode }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          pb: { xs: 10, sm: 8 },
          px: 0,
          py: 0,
        }}
      >
        <Routes>
          <Route path="/t/:tenantId/r/:roomId" element={<Home />} />
          <Route
            path="/t/:tenantId/r/:roomId/requests"
            element={<Requests />}
          />
          <Route path="/t/:tenantId/r/:roomId/explore" element={<Explore />} />
          <Route path="/t/:tenantId/r/:roomId/more" element={<More />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
