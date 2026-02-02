import { useState, useContext } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Stack,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { AppContext } from "../context/AppContext";
import Header from "../layout/Header";
import BottomNavBar from "../layout/BottomNavBar";
import Services from "./tabs/Services";
import Products from "./tabs/Products";

function Explore() {
  const [tabValue, setTabValue] = useState(0);
  const { selectedCategory } = useContext(AppContext);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Header />

      <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 }, pb: 12 }}>
        {/* Category Filter Info */}
        {selectedCategory && (
          <Box
            sx={{ mb: 2, p: 2, bgcolor: "primary.light", borderRadius: "8px" }}
          >
            <Typography variant="body2" sx={{ color: "primary.dark" }}>
              Filtered by: <strong>{selectedCategory}</strong>
            </Typography>
          </Box>
        )}

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            mb: 2,
            "& .MuiTabs-indicator": {
              bgcolor: "primary.main",
              height: 3,
            },
          }}
        >
          <Tab
            label="Services"
            sx={{
              fontWeight: tabValue === 0 ? "bold" : "normal",
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          />
          <Tab
            label="Products"
            sx={{
              fontWeight: tabValue === 1 ? "bold" : "normal",
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          />
        </Tabs>

        {/* Tab Content */}
        {tabValue === 0 && <Services category={selectedCategory} />}
        {tabValue === 1 && <Products category={selectedCategory} />}
      </Box>

      <BottomNavBar />
    </Box>
  );
}

export default Explore;
