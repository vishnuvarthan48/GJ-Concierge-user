import {
  Box,
  Stack,
  TextField,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Header from "../layout/Header";
import BottomNavBar from "../layout/BottomNavBar";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { tenantId, roomId } = useParams();
  const { setSelectedCategory } = useContext(AppContext);

  // Mock categories
  const categories = [
    { id: 1, name: "Snack Bars", icon: "🍿" },
    { id: 2, name: "Beverages", icon: "🥤" },
    { id: 3, name: "Room Service", icon: "🛎️" },
    { id: 4, name: "Housekeeping", icon: "🧹" },
    { id: 5, name: "Maintenance", icon: "🔧" },
    { id: 6, name: "Front Desk", icon: "📋" },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 } }}>
        {/* Search Bar in Content (optional secondary search) */}
        <TextField
          fullWidth
          placeholder="Search categories..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />

        {/* Categories Section */}
        <Typography
          variant="subtitle2"
          sx={{ mb: 2, fontWeight: "bold", color: "text.primary" }}
        >
          Categories
        </Typography>

        <Stack spacing={2}>
          {categories.map((category) => (
            <Card
              key={category.id}
              sx={{
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: 3,
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => {
                setSelectedCategory(category.name);
                navigate(`/t/${tenantId}/r/${roomId}/explore`);
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: { xs: 1.5, sm: 2 },
                }}
              >
                <Box sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
                  {category.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 500,
                      fontSize: { xs: "0.95rem", sm: "1rem" },
                    }}
                  >
                    {category.name}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    px: 1,
                    py: 0.5,
                    borderRadius: "4px",
                  }}
                >
                  →
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>

      {/* Bottom Navbar */}
      <BottomNavBar />
    </Box>
  );
}

export default Home;
