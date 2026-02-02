import { useState, useContext } from "react";
import {
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { AppContext } from "../../context/AppContext";

const ALL_SERVICES = [
  // Room Service
  {
    id: 1,
    category: "Room Service",
    name: "Hot Water Not Coming",
    description: "Request for hot water issue",
    priority: "Medium",
    icon: "🚿",
  },
  {
    id: 2,
    category: "Room Service",
    name: "AC Temperature Issue",
    description: "AC not cooling properly",
    priority: "High",
    icon: "❄️",
  },
  {
    id: 3,
    category: "Room Service",
    name: "Room Key Issue",
    description: "Key card not working",
    priority: "High",
    icon: "🔑",
  },

  // Housekeeping
  {
    id: 4,
    category: "Housekeeping",
    name: "Room Cleaning",
    description: "Request for room cleaning",
    priority: "Low",
    icon: "🧹",
  },
  {
    id: 5,
    category: "Housekeeping",
    name: "Towel Replacement",
    description: "Need fresh towels",
    priority: "Low",
    icon: "🛁",
  },
  {
    id: 6,
    category: "Housekeeping",
    name: "Bed Sheet Change",
    description: "Change bed sheets",
    priority: "Low",
    icon: "🛏️",
  },

  // Maintenance
  {
    id: 7,
    category: "Maintenance",
    name: "Light Bulb Issue",
    description: "Light not working",
    priority: "Medium",
    icon: "💡",
  },
  {
    id: 8,
    category: "Maintenance",
    name: "Fan Not Working",
    description: "Ceiling fan malfunction",
    priority: "Medium",
    icon: "🌀",
  },
  {
    id: 9,
    category: "Maintenance",
    name: "Door Lock Issue",
    description: "Door lock not functioning",
    priority: "High",
    icon: "🔐",
  },

  // Front Desk
  {
    id: 10,
    category: "Front Desk",
    name: "Wake Up Call",
    description: "Request a wake up call",
    priority: "Low",
    icon: "⏰",
  },
  {
    id: 11,
    category: "Front Desk",
    name: "Restaurant Reservation",
    description: "Book table at restaurant",
    priority: "Low",
    icon: "🍽️",
  },

  // Snack Bars (if applicable)
  {
    id: 12,
    category: "Snack Bars",
    name: "Vending Machine Issue",
    description: "Snack machine not working",
    priority: "Low",
    icon: "🍿",
  },
];

function Services({ category }) {
  const [selectedService, setSelectedService] = useState(null);
  const { addToCart, showSnackbar } = useContext(AppContext);

  const filteredServices = category
    ? ALL_SERVICES.filter((s) => s.category === category)
    : ALL_SERVICES;

  const handleAddService = (service) => {
    addToCart({
      ...service,
      type: "service",
      price: 0, // Services might be free
    });
    showSnackbar(`${service.name} added to cart!`, "success");
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "#d32f2f";
      case "Medium":
        return "#f57c00";
      case "Low":
        return "#388e3c";
      default:
        return "#666";
    }
  };

  return (
    <Stack spacing={2}>
      {filteredServices.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography color="textSecondary">
            No services available for this category
          </Typography>
        </Box>
      ) : (
        filteredServices.map((service) => (
          <Card
            key={service.id}
            sx={{
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: 3,
                transform: "translateY(-2px)",
              },
            }}
            onClick={() => setSelectedService(service)}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box sx={{ fontSize: { xs: "2rem", sm: "2.5rem" } }}>
                  {service.icon}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "bold", mb: 0.5 }}
                  >
                    {service.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ display: "block", mb: 1 }}
                  >
                    {service.description}
                  </Typography>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        bgcolor: getPriorityColor(service.priority),
                        color: "#fff",
                        px: 1,
                        py: 0.5,
                        borderRadius: "4px",
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                        {service.priority} Priority
                      </Typography>
                    </Box>

                    <Button
                      size="small"
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddService(service);
                      }}
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Add
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))
      )}
    </Stack>
  );
}

export default Services;
