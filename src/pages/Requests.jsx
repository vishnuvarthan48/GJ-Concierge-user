import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Tabs,
  Tab,
  Paper,
  Alert,
} from "@mui/material";
import Search from "@mui/icons-material/Search";
import Phone from "@mui/icons-material/Phone";
import Header from "../layout/Header";
import BottomNavBar from "../layout/BottomNavBar";
import { useParams, useNavigate } from "react-router-dom";
import { useContext } from "react";
import {
  getServiceRequestHistoryByPhone,
  getProductRequestHistoryByPhone,
} from "../service/ServiceRequestService";
import { AppContext } from "../context/AppContext";
import {
  getStoredGuestPhone,
  setStoredGuestPhone,
} from "../utils/guestPhoneStorage";

const DEFAULT_STEPS = ["Open", "Assigned", "In Progress", "Completed", "Closed"];

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(typeof value === "number" ? value : value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

function getStatusLabel(item) {
  const sr = item.serviceRequest ?? item;
  const s = sr?.status ?? item?.status;
  if (!s) return "";
  return s.displayName ?? s.name ?? "";
}

/** Deduplicate history list: one row per request, using latest record (current status). */
function deduplicateByRequest(list, isProduct) {
  if (!list || list.length === 0) return list;
  const getRequestId = (r) =>
    isProduct ? r.productRequest?.id ?? r.id : r.serviceRequest?.id ?? r.id;
  const getTimestamp = (r) =>
    r.createdOn ?? r.createdAt ?? r.createdDate ?? r.serviceRequest?.updatedDate ?? r.productRequest?.updatedDate ?? 0;
  const byRequest = new Map();
  for (const r of list) {
    const reqId = getRequestId(r);
    const ts = new Date(getTimestamp(r)).getTime();
    const existing = byRequest.get(reqId);
    if (!existing || ts > new Date(getTimestamp(existing)).getTime()) {
      byRequest.set(reqId, r);
    }
  }
  return [...byRequest.values()].sort(
    (a, b) => new Date(getTimestamp(b)).getTime() - new Date(getTimestamp(a)).getTime()
  );
}

/** Group product requests by requestGroupId for display as single entries. */
function groupProductRequests(list) {
  if (!list || list.length === 0) return list;
  const groups = new Map();
  for (const r of list) {
    const pr = r.productRequest ?? r;
    const groupId = pr?.requestGroupId ?? pr?.id;
    if (!groups.has(groupId)) groups.set(groupId, []);
    groups.get(groupId).push(r);
  }
  return Array.from(groups.values()).map((items) => {
    const primary = items[0];
    const pr = primary?.productRequest ?? primary;
    const productNames = items
      .map((i) => (i?.productRequest ?? i)?.product?.name ?? i?.product?.name)
      .filter(Boolean)
      .join(", ");
    return {
      ...primary,
      _groupItems: items,
      _productNames: productNames || pr?.product?.name || "Product request",
    };
  });
}

function getStatusColor(statusName) {
  const n = String(statusName || "").toUpperCase();
  if (n.includes("NEW") || n.includes("OPEN")) return { bgcolor: "info.light", color: "info.dark" };
  if (n.includes("ASSIGNED")) return { bgcolor: "warning.light", color: "warning.dark" };
  if (n.includes("PROGRESS") || n.includes("IN_PROGRESS")) return { bgcolor: "secondary.light", color: "secondary.dark" };
  if (n.includes("COMPLETED") || n.includes("DONE")) return { bgcolor: "success.light", color: "success.dark" };
  if (n.includes("CLOSED") || n.includes("CANCELLED")) return { bgcolor: "error.light", color: "error.dark" };
  return { bgcolor: "action.hover", color: "text.secondary" };
}

const TAB_SERVICE = 0;
const TAB_PRODUCT = 1;

function Requests() {
  const { tenantId, roomId } = useParams();
  const navigate = useNavigate();
  const { setRequestHistory } = useContext(AppContext);

  const [tabValue, setTabValue] = useState(TAB_SERVICE);
  const [lookupMobile, setLookupMobile] = useState(() =>
    getStoredGuestPhone(tenantId, roomId).trim(),
  );
  const [foundServiceRequests, setFoundServiceRequests] = useState([]);
  const [foundProductRequests, setFoundProductRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [activeRequestType, setActiveRequestType] = useState("service"); // "service" | "product"

  const fetchRequestsByPhone = useCallback(
    async (phoneRaw) => {
      const phone = (phoneRaw || "").trim();
      if (!phone) {
        setError("Enter mobile number to fetch requests.");
        return;
      }
      const locationId = localStorage.getItem("locationId");
      if (!tenantId || !locationId) {
        setError("Location not set. Open Home first.");
        return;
      }
      setHasSearched(true);
      setError("");
      setLoading(true);
      setFoundServiceRequests([]);
      setFoundProductRequests([]);
      try {
        const [serviceList, productList] = await Promise.all([
          getServiceRequestHistoryByPhone(tenantId, locationId, phone),
          getProductRequestHistoryByPhone(tenantId, locationId, phone),
        ]);
        const services = deduplicateByRequest(
          Array.isArray(serviceList) ? serviceList : [],
          false,
        );
        const productsDeduped = deduplicateByRequest(
          Array.isArray(productList) ? productList : [],
          true,
        );
        const products = groupProductRequests(productsDeduped);
        setFoundServiceRequests(services);
        setFoundProductRequests(products);
        setStoredGuestPhone(tenantId, roomId, phone);
        setRequestHistory(phone, services, products);
      } catch (e) {
        setError(e?.message || "Failed to load requests. Try again.");
        setFoundServiceRequests([]);
        setFoundProductRequests([]);
      } finally {
        setLoading(false);
      }
    },
    [tenantId, roomId, setRequestHistory],
  );

  useEffect(() => {
    const stored = getStoredGuestPhone(tenantId, roomId).trim();
    setLookupMobile(stored);
    setFoundServiceRequests([]);
    setFoundProductRequests([]);
    setHasSearched(false);
    setError("");

    if (!stored || !tenantId) return;
    const locationId = localStorage.getItem("locationId");
    if (!locationId) return;
    void fetchRequestsByPhone(stored);
  }, [tenantId, roomId, fetchRequestsByPhone]);

  const handleLookup = () => fetchRequestsByPhone(lookupMobile);

  const openRequestDialog = (request, type) => {
    if (type === "service") {
      const requestId = request.serviceRequest?.id ?? request.id;
      navigate(
        `/t/${tenantId}/r/${roomId}/requests/service-request/${requestId}`,
      );
      return;
    }
    if (type === "product") {
      const pr = request.productRequest ?? request;
      const requestId = pr?.id ?? request.id;
      navigate(
        `/t/${tenantId}/r/${roomId}/requests/product-request/${requestId}`,
      );
      return;
    }
    setActiveRequest(request);
    setActiveRequestType(type);
    setOpenDialog(true);
  };

  const currentList =
    tabValue === TAB_SERVICE ? foundServiceRequests : foundProductRequests;
  const isEmpty = hasSearched && !loading && currentList.length === 0 && !error;

  const sr = activeRequest?.serviceRequest ?? activeRequest;
  const statusSteps =
    activeRequest?.statuses?.map((s) => s.name) ||
    (sr?.status ? [getStatusLabel(activeRequest)] : DEFAULT_STEPS);
  const statusName = sr?.status?.name ?? sr?.status?.displayName;
  const defaultIdx = DEFAULT_STEPS.findIndex(
    (s) => statusName && s.toUpperCase().includes(String(statusName).toUpperCase()),
  );
  const activeStepIndex =
    activeRequest?.currentStatusIndex ??
    (defaultIdx >= 0 ? defaultIdx : 0);

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", pb: 10 }}>
      <Header title="Request History" />

      <Box sx={{ px: 0.5, py: 1.5 }}>
        <Paper sx={{ p: 1.5, mb: 2 }}>
        <Typography
          variant="subtitle1"
          sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}
        >
          Enter mobile number to fetch requests
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <TextField
            fullWidth
            label="Mobile number"
            placeholder="e.g. 777777777"
            value={lookupMobile}
            onChange={(e) => {
              setLookupMobile(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            size="medium"
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
              "aria-label": "Enter mobile number to fetch requests",
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "background.paper",
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleLookup}
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Search />
              )
            }
            sx={{
              minHeight: 56,
              minWidth: { xs: "100%", sm: 120 },
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </Stack>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} role="alert">
            {error}
          </Alert>
        )}

        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          variant="fullWidth"
          sx={{
            mb: 2,
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
            "& .MuiTabs-indicator": { height: 3, borderRadius: 2 },
          }}
        >
          <Tab label="Service requests" />
          <Tab label="Product requests" />
        </Tabs>

        {isEmpty && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
            No {tabValue === TAB_SERVICE ? "service" : "product"} requests found
            for this number.
          </Typography>
        )}

        <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {currentList.map((r) => (
            <ListItem
              key={tabValue === TAB_SERVICE ? (r.serviceRequest?.id ?? r.id) : (r.productRequest ?? r)?.id ?? r.id}
              disablePadding
              sx={{
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: (theme) =>
                  `0 8px 18px ${theme.palette.mode === "dark" ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.07)"}`,
                overflow: "hidden",
              }}
            >
              <ListItemButton
                onClick={() =>
                  openRequestDialog(
                    r,
                    tabValue === TAB_SERVICE ? "service" : "product",
                  )
                }
                sx={{
                  py: 2,
                  px: 2,
                  alignItems: "flex-start",
                  "&:active": { bgcolor: "action.selected" },
                }}
              >
                <ListItemText
                  primary={
                    <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {tabValue === TAB_PRODUCT && r._productNames
                          ? r._productNames
                          : r.service?.name ??
                            r.serviceName ??
                            r.product?.name ??
                            r.productName ??
                            (tabValue === TAB_SERVICE
                              ? "Service request"
                              : "Product request")}
                      </Typography>
                      {getStatusLabel(r) && (
                        <Chip
                          label={getStatusLabel(r)}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            ...getStatusColor(
                              (r.serviceRequest ?? r)?.status?.name ?? (r.serviceRequest ?? r)?.status?.displayName,
                            ),
                          }}
                        />
                      )}
                    </Stack>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {formatDate(r.createdOn ?? r.createdAt ?? r.serviceRequest?.updatedDate)}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            m: 2,
            maxHeight: "calc(100vh - 32px)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {activeRequest?.service?.name ??
            activeRequest?.serviceName ??
            activeRequest?.product?.name ??
            activeRequest?.productName ??
            (activeRequestType === "product"
              ? "Product request"
              : "Request detail")}
        </DialogTitle>
        <DialogContent dividers>
          {activeRequest && (
            <Box sx={{ pt: 1 }}>
              {((sr?.userName ?? activeRequest.userName) || (sr?.phoneNumber ?? activeRequest.phoneNumber)) && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {(sr?.userName ?? activeRequest.userName) &&
                    `${sr?.userName ?? activeRequest.userName} • `}
                  {sr?.phoneNumber ?? activeRequest.phoneNumber}
                </Typography>
              )}
              {(sr?.comment ?? activeRequest.comments) && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {sr?.comment ?? activeRequest.comments}
                </Typography>
              )}
              {statusSteps.length > 0 && (
                <Stepper
                  activeStep={Math.min(activeStepIndex, statusSteps.length - 1)}
                  orientation="vertical"
                  sx={{ mt: 2 }}
                >
                  {statusSteps.map((label, idx) => (
                    <Step key={label || idx}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
                Created{" "}
                {formatDate(
                  sr?.updatedDate ?? activeRequest.createdOn ?? activeRequest.createdAt ?? activeRequest.serviceRequest?.updatedDate,
                )}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <BottomNavBar />
    </Box>
  );
}

export default Requests;
