import {
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getServicesApiUrl,
  getServicesByCategoryApiUrl,
} from "../../service/ApiUrls";
import { get } from "../../service/Service";

function Services({ tenantId, locationId, category }) {
  const navigate = useNavigate();
  const { roomId } = useParams();

  const fetchServices = async () => {
    const url = category
      ? getServicesByCategoryApiUrl(tenantId, locationId, category)
      : getServicesApiUrl(tenantId, locationId);
    return await get(url);
  };

  const {
    data: servicesRaw = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["services", tenantId, locationId, category],
    queryFn: fetchServices,
    enabled: !!tenantId && !!locationId,
  });

  const services = (Array.isArray(servicesRaw) ? servicesRaw : []).filter(
    (s) => s.deleted === false || s.deleted === undefined
  );

  const handleServiceClick = (service) => {
    if (!tenantId || !roomId) return;
    navigate(`/t/${tenantId}/r/${roomId}/service-request`, {
      state: { selectedService: service },
    });
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

  if (isLoading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress />
        <Typography>Loading services...</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="error">
          Failed to load services. Please try again.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {!services || services.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography color="textSecondary">
            No services available for this category
          </Typography>
        </Box>
      ) : (
        services.map((service) => (
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
            onClick={() => handleServiceClick(service)}
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
                        handleServiceClick(service);
                      }}
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Request
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
