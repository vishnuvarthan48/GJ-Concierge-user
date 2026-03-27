import { Box, Typography, Paper } from "@mui/material";
import Header from "../layout/Header";
import BottomNavBar from "../layout/BottomNavBar";

function More() {
  return (
    <Box sx={{ width: "100%" }}>
      <Header />
      <Box sx={{ px: { xs: 0.5, sm: 1 }, py: { xs: 1.5, sm: 2 } }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h5" sx={{ mb: 0.5 }}>
            More
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Coming soon...
          </Typography>
        </Paper>
      </Box>
      <BottomNavBar />
    </Box>
  );
}

export default More;
