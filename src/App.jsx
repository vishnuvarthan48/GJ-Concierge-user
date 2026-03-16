import { Routes, Route } from "react-router-dom";
import { Container, Box } from "@mui/material";
import Home from "./pages/Home";
import Requests from "./pages/Requests";
import Explore from "./pages/Explore";
import More from "./pages/More";
import CreateServiceRequest from "./pages/CreateServiceRequest";
import ServiceRequestTracker from "./pages/ServiceRequestTracker";
import ProductRequestTracker from "./pages/ProductRequestTracker";

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
          <Route
            path="/t/:tenantId/r/:roomId/requests/service-request/:requestId"
            element={<ServiceRequestTracker />}
          />
          <Route
            path="/t/:tenantId/r/:roomId/requests/product-request/:requestId"
            element={<ProductRequestTracker />}
          />
          <Route
            path="/t/:tenantId/r/:roomId/service-request"
            element={<CreateServiceRequest />}
          />
          <Route path="/t/:tenantId/r/:roomId/explore" element={<Explore />} />
          <Route path="/t/:tenantId/r/:roomId/more" element={<More />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
