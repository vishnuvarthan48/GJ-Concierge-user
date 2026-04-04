import {
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  Paper,
} from "@mui/material";
import { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppContext } from "../context/AppContext";
import Header from "../layout/Header";
import BottomNavBar from "../layout/BottomNavBar";
import { getRoomDetail, getCategories, getServices } from "../service/RoomService";

function Home() {
  const [roomName, setRoomName] = useState("");
  const [headerTitle, setHeaderTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [roomError, setRoomError] = useState(false);
  const [categoriesError, setCategoriesError] = useState(false);
  const [categories, setCategories] = useState([]);
  const [locationId, setLocationId] = useState(
    () => localStorage.getItem("locationId"),
  );
  const navigate = useNavigate();
  const { tenantId, roomId } = useParams();
  const { setSelectedCategory, searchQuery } = useContext(AppContext);

  // When app is opened: fetch room details, then categories
  useEffect(() => {
    if (!tenantId || !roomId) return;

    const fetchRoomDetails = async () => {
      setLoading(true);
      setRoomError(false);
      setCategoriesError(false);
      let locId = null;
      try {
        const response = await getRoomDetail(tenantId, roomId);
        if (response) {
          if (response.location) {
            locId = response.location.id;
            localStorage.setItem("locationId", locId);
            localStorage.setItem("locationName", response.location.name);
            setLocationId(locId);
          } else {
            alert("Location not found.");
          }
          setRoomName(response.name);
          localStorage.setItem("roomName", response.name);
          localStorage.setItem("location", response.id);
          setHeaderTitle("Hello!. You are in " + response?.name);
        } else {
          setRoomError(true);
        }
      } catch {
        setRoomError(true);
      }

      const idToUse = locId || localStorage.getItem("locationId");
      if (tenantId && idToUse) {
        try {
          const categoriesData = await getCategories(tenantId, idToUse);
          const raw = Array.isArray(categoriesData)
            ? categoriesData
            : categoriesData?.list ?? [];
          const list = raw.filter(
            (c) => c.deleted === false || c.deleted === undefined
          );
          setCategories(list);
        } catch {
          setCategoriesError(true);
          setCategories([]);
        }
      }
      setLoading(false);
    };

    fetchRoomDetails();
  }, [tenantId, roomId]);

  // Keep locationId in sync from localStorage (e.g. after first load)
  const effectiveLocationId =
    locationId || localStorage.getItem("locationId");

  const {
    data: servicesList = [],
    isLoading: isServicesLoading,
    isError: isServicesError,
  } = useQuery({
    queryKey: ["services", tenantId, effectiveLocationId, roomId],
    queryFn: () => getServices(tenantId, effectiveLocationId, roomId),
    enabled: !!tenantId && !!effectiveLocationId && !!roomId && !loading,
  });

  const servicesRaw = Array.isArray(servicesList)
    ? servicesList
    : servicesList?.list ?? [];
  const services = servicesRaw.filter(
    (s) => s.deleted === false || s.deleted === undefined
  );

  const q = (searchQuery || "").trim().toLowerCase();
  const filteredCategories = q
    ? (categories || []).filter(
        (c) =>
          (c.name || "").toLowerCase().includes(q) ||
          (c.title || "").toLowerCase().includes(q)
      )
    : categories || [];
  const filteredServices = q
    ? services.filter(
        (s) =>
          (s.name || "").toLowerCase().includes(q) ||
          (s.description || "").toLowerCase().includes(q) ||
          (s.category?.name || "").toLowerCase().includes(q)
      )
    : services;

  return (
    <Box sx={{ width: "100%" }}>
      <Header title={headerTitle} />
      <Box sx={{ px: { xs: 0.5, sm: 1 }, py: { xs: 1.5, sm: 2 } }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {roomError && (
          <Typography color="error" sx={{ mb: 2 }}>
            Failed to load room details.
          </Typography>
        )}
        {categoriesError && (
          <Typography color="error" sx={{ mb: 2 }}>
            Failed to load categories.
          </Typography>
        )}

        {!loading && (
          <>
            <Paper sx={{ p: 1.5, mb: 2.5 }}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1.25, fontWeight: "bold", color: "text.primary" }}
              >
                Categories
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 1,
                  overflowX: "auto",
                  pb: 0.5,
                  "&::-webkit-scrollbar": { height: 4 },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: "action.hover",
                    borderRadius: 3,
                  },
                }}
              >
                {filteredCategories.map((category) => (
                  <Chip
                    key={category.id}
                    label={category.name || category.title || category.id}
                    onClick={() => {
                      const categoryPayload = {
                        id: category.id,
                        name: category.name || category.title || String(category.id),
                      };
                      setSelectedCategory(categoryPayload);
                      navigate(`/t/${tenantId}/r/${roomId}/explore`, {
                        state: { category: categoryPayload },
                      });
                    }}
                    sx={{
                      flexShrink: 0,
                      cursor: "pointer",
                      bgcolor: "background.default",
                      "&:hover": { bgcolor: "primary.light", color: "primary.contrastText" },
                    }}
                  />
                ))}
              </Box>
            </Paper>

            <Typography
              variant="subtitle2"
              sx={{ mb: 2, fontWeight: "bold", color: "text.primary" }}
            >
              All Services
            </Typography>
            {isServicesLoading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            )}
            {isServicesError && (
              <Typography color="error" sx={{ mb: 2 }}>
                Failed to load services.
              </Typography>
            )}
            {!isServicesLoading && !isServicesError && (
              <Stack spacing={2}>
                {filteredServices.length === 0 ? (
                  <Typography color="text.secondary">
                    {q ? "No services match your search." : "No services available."}
                  </Typography>
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
                      onClick={() => {
                        navigate(
                          `/t/${tenantId}/r/${roomId}/service-request`,
                          { state: { selectedService: service } },
                        );
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
                          {service.imageUrl ? (
                            <Box
                              component="img"
                              src={service.imageUrl}
                              alt=""
                              sx={{
                                width: 40,
                                height: 40,
                                objectFit: "cover",
                                borderRadius: 1,
                              }}
                            />
                          ) : (
                            "🔧"
                          )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 500,
                              fontSize: { xs: "0.95rem", sm: "1rem" },
                            }}
                          >
                            {service.name}
                          </Typography>
                          {service.description && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mt: 0.5 }}
                            >
                              {service.description}
                            </Typography>
                          )}
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ mt: 1 }}
                            flexWrap="wrap"
                          >
                            {service.category?.name && (
                              <Chip
                                size="small"
                                label={service.category.name}
                                sx={{ height: 22, fontSize: "0.75rem" }}
                              />
                            )}
                            {service.tat && (
                              <Chip
                                size="small"
                                label={`TAT: ${service.tat}`}
                                variant="outlined"
                                sx={{ height: 22, fontSize: "0.75rem" }}
                              />
                            )}
                          </Stack>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                          }}
                        >
                          →
                        </Typography>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Stack>
            )}
          </>
        )}
      </Box>
      <BottomNavBar />
    </Box>
  );
}

export default Home;
