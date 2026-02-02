import { Box, Typography } from "@mui/material";
import Header from "../layout/Header";
import BottomNavBar from "../layout/BottomNavBar";

function More() {
  return (
    <Box sx={{ width: "100%" }}>
      <Header />
      <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 } }}>
        <Typography variant="h5">More</Typography>
        <Typography variant="body2" color="textSecondary">
          Coming soon...
        </Typography>
      </Box>
      <BottomNavBar />
    </Box>
  );
}

export default More;
