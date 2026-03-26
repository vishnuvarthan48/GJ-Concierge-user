import { useState, useContext, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  IconButton,
  Alert,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "../layout/Header";
import BottomNavBar from "../layout/BottomNavBar";
import { AppContext } from "../context/AppContext";
import { getRoomDetail, getServices } from "../service/RoomService";
import { saveServiceRequest } from "../service/ServiceRequestService";
import { getUploadApiUrl } from "../service/ApiUrls";
import { upload } from "../service/Service";
import {
  getStoredGuestPhone,
  setStoredGuestPhone,
} from "../utils/guestPhoneStorage";

const extractApiErrorMessage = (source) => {
  if (!source) return "";
  if (typeof source === "string") return source;
  return (
    source?.error?.detailsMessage ||
    source?.error?.message ||
    source?.detailsMessage ||
    source?.message ||
    ""
  );
};

function CreateServiceRequest() {
  const { tenantId, roomId } = useParams();
  const { state: locationState } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackbar } = useContext(AppContext);

  const selectedServiceFromNav = locationState?.selectedService;

  const [phoneNumber, setPhoneNumber] = useState("");
  const [userName, setUserName] = useState("");
  const [comments, setComments] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [photoFiles, setPhotoFiles] = useState([]);
  const [formError, setFormError] = useState("");

  const { data: roomDetails } = useQuery({
    queryKey: ["roomDetails", tenantId, roomId],
    queryFn: () => getRoomDetail(tenantId, roomId),
    enabled: !!tenantId && !!roomId,
  });

  const locId = roomDetails?.location?.id || localStorage.getItem("locationId");
  const { data: servicesList = [] } = useQuery({
    queryKey: ["services", tenantId, locId],
    queryFn: () => getServices(tenantId, locId),
    enabled: !!tenantId && !!locId,
  });

  const services = Array.isArray(servicesList)
    ? servicesList
    : (servicesList?.list ?? []);

  useEffect(() => {
    if (selectedServiceFromNav && selectedServiceFromNav.id) {
      setSelectedServiceId(selectedServiceFromNav.id);
    }
  }, [selectedServiceFromNav]);

  useEffect(() => {
    const stored = getStoredGuestPhone(tenantId, roomId);
    if (stored) setPhoneNumber(stored);
  }, [tenantId, roomId]);

  const selectedService = services.find((s) => s.id === selectedServiceId);

  const saveMutation = useMutation({
    mutationFn: async (payload) =>
      saveServiceRequest(tenantId, roomId, payload),
    onSuccess: (data, variables) => {
      // Backend may return 200 with error in body (e.g. validation, admission required)
      const errorPayload = data?.error;
      if (errorPayload) {
        const msg = extractApiErrorMessage(data) || "Failed to submit service request.";
        setFormError(msg);
        showSnackbar(msg, "error");
        return;
      }
      // Guard against malformed/empty success payloads.
      if (!data?.id) {
        const msg = "Failed to submit service request.";
        setFormError(msg);
        showSnackbar(msg, "error");
        return;
      }
      const savedPhone = variables?.phoneNumber?.trim?.();
      if (savedPhone) {
        setStoredGuestPhone(tenantId, roomId, savedPhone);
      }
      setFormError("");
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      showSnackbar("Service request submitted successfully.", "success");
      navigate(`/t/${tenantId}/r/${roomId}`);
    },
    onError: (err) => {
      const msg =
        extractApiErrorMessage(err?.response?.data) ||
        extractApiErrorMessage(err?.data) ||
        err?.message ||
        "Failed to submit service request.";
      setFormError(msg);
      showSnackbar(msg, "error");
    },
  });

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    setPhotoFiles((prev) => [...prev, ...files]);
  };

  const removePhoto = (index) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadAttachments = async () => {
    const results = [];
    const url = getUploadApiUrl();
    for (const file of photoFiles) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await upload(url, formData);
      if (res) results.push(typeof res === "object" ? res : { id: res });
    }
    return results;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!phoneNumber.trim()) {
      setFormError("Mobile number is required.");
      return;
    }
    if (!selectedService) {
      setFormError("Please select a service.");
      return;
    }

    let attachments = [];
    if (photoFiles.length > 0) {
      try {
        attachments = await uploadAttachments();
      } catch (err) {
        showSnackbar("Failed to upload some photos.", "error");
        return;
      }
    }

    const payload = {
      service: selectedService,
      userName: userName.trim() || "",
      phoneNumber: phoneNumber.trim(),
      comments: comments.trim() || undefined,
      room: { id: roomId },
      locationId: locId || localStorage.getItem("locationId"),
      tenantId,
      histories: [{ attachments, comment: comments.trim() || "" }],
    };

    saveMutation.mutate(payload);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Header title="Create Service Request" />
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 }, pb: 12 }}
      >
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: "bold" }}>
          Service
        </Typography>
        <FormControl fullWidth size="small" sx={{ mb: 2 }} required>
          <InputLabel id="service-select-label">Select service</InputLabel>
          <Select
            labelId="service-select-label"
            value={selectedServiceId || ""}
            label="Select service"
            onChange={(e) => setSelectedServiceId(e.target.value)}
          >
            {services.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
                {s.category?.name ? ` (${s.category.name})` : ""}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          required
          label="Mobile number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          size="small"
          sx={{ mb: 2 }}
          placeholder="e.g. 9876543210"
          error={!!formError && !phoneNumber.trim()}
          helperText={formError && !phoneNumber.trim() ? formError : null}
        />

        <TextField
          fullWidth
          label="Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          size="small"
          sx={{ mb: 2 }}
          placeholder="Your name"
        />

        <TextField
          fullWidth
          label="Comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          size="small"
          multiline
          rows={3}
          sx={{ mb: 2 }}
          placeholder="Additional details..."
        />

        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
          Upload photos
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<PhotoCamera />}
            size="small"
          >
            Add photos
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handlePhotoChange}
            />
          </Button>
          {photoFiles.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {photoFiles.length} file(s) selected
            </Typography>
          )}
        </Stack>
        {photoFiles.length > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
            {photoFiles.map((file, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  bgcolor: "action.hover",
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" noWrap sx={{ maxWidth: 120 }}>
                  {file.name}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => removePhoto(index)}
                  sx={{ p: 0.25 }}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}

        {formError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError("")}>
            {formError}
          </Alert>
        )}

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={() => navigate(-1)}
            disabled={saveMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saveMutation.isPending}
            startIcon={
              saveMutation.isPending ? (
                <CircularProgress size={18} color="inherit" />
              ) : null
            }
          >
            {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </Stack>
      </Box>
      <BottomNavBar />
    </Box>
  );
}

export default CreateServiceRequest;
