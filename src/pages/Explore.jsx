import { useState, useContext, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Box,
  Tabs,
  Tab,
  TextField,
  Autocomplete,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { AppContext } from "../context/AppContext";
import Header from "../layout/Header";
import BottomNavBar from "../layout/BottomNavBar";
import Services from "./tabs/Services";
import Products from "./tabs/Products";
import { getCategories } from "../service/RoomService";

const ALL_OPTION = { id: null, name: "All categories" };

function Explore() {
  const { tenantId, roomId } = useParams();
  const location = useLocation();
  const locationId = localStorage.getItem("locationId");
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownCategory, setDropdownCategory] = useState(null);
  const { selectedCategory, setSelectedCategory } = useContext(AppContext);

  const { data: categoriesRaw } = useQuery({
    queryKey: ["categories", tenantId, locationId],
    queryFn: async () => {
      const res = await getCategories(tenantId, locationId);
      return Array.isArray(res) ? res : res?.list ?? [];
    },
    enabled: !!tenantId && !!locationId,
  });
  const categoriesRawArray = Array.isArray(categoriesRaw) ? categoriesRaw : [];
  const categories = categoriesRawArray.filter(
    (c) => c.deleted === false || c.deleted === undefined
  );
  const categoryOptions = [
    ALL_OPTION,
    ...categories.map((c) => ({
      id: c.id,
      name: c.name || c.title || String(c.id),
    })),
  ];

  const categoryFromState = location.state?.category;
  const effectiveCategory = dropdownCategory ?? categoryFromState ?? selectedCategory;
  const effectiveOption =
    effectiveCategory != null && effectiveCategory?.id != null
      ? { id: effectiveCategory.id, name: effectiveCategory?.name ?? effectiveCategory?.title ?? "" }
      : ALL_OPTION;
  const categoryId = effectiveOption?.id ?? undefined;

  useEffect(() => {
    if (categoryFromState) {
      setSelectedCategory(categoryFromState);
      setDropdownCategory(categoryFromState);
    }
  }, [categoryFromState, setSelectedCategory]);

  const handleCategoryChange = (event, newValue) => {
    if (!newValue || newValue.id == null) {
      setDropdownCategory(null);
      setSelectedCategory(null);
      return;
    }
    setDropdownCategory(newValue);
    setSelectedCategory(newValue);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Header />

      <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 }, pb: 12 }}>
        {/* Category Filter */}
        <Box
          sx={{
            mb: 2,
            p: 2,
            bgcolor: "primary.light",
            borderRadius: "8px",
          }}
        >
          <Autocomplete
            size="small"
            options={categoryOptions}
            value={effectiveOption}
            onChange={handleCategoryChange}
            getOptionLabel={(option) => option?.name ?? ""}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            renderInput={(params) => (
              <TextField {...params} placeholder="Filter by category" />
            )}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.paper",
              },
            }}
          />
        </Box>

        {/* Search Input */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ mb: 2 }}
        />

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
        {tabValue === 0 && (
          <Services
            tenantId={tenantId}
            locationId={locationId}
            category={categoryId}
            searchTerm={searchTerm}
          />
        )}
        {tabValue === 1 && (
          <Products
            tenantId={tenantId}
            locationId={locationId}
            category={categoryId}
            searchTerm={searchTerm}
          />
        )}
      </Box>

      <BottomNavBar />
    </Box>
  );
}

export default Explore;
