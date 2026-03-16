import {
  Box,
  TextField,
  Avatar,
  Typography,
  Stack,
  IconButton,
  Drawer,
  Divider,
  Button,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import {
  ShoppingCart as CartIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from "@mui/icons-material";
import { AppContext } from "../context/AppContext";
import { saveProductRequests } from "../service/ProductRequestService";

function Header() {
  const { tenantId, roomId } = useParams();
  const [cartOpen, setCartOpen] = useState(false);
  const {
    searchQuery,
    setSearchQuery,
    cartItems,
    removeFromCart,
    updateCartItemQuantity,
    getTotalPrice,
    clearCart,
    createRequest,
    showSnackbar,
    isDarkMode,
    setIsDarkMode,
  } = useContext(AppContext);

  // Mock room name - in real app, fetch from API
  const roomName = "Room 1";

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [custName, setCustName] = useState("");
  const [custMobile, setCustMobile] = useState("");
  const [custDescription, setCustDescription] = useState("");
  const [checkoutErrors, setCheckoutErrors] = useState({});
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const validateCheckout = () => {
    const errs = {};
    if (!custName.trim()) errs.name = "Name is required";
    if (!custMobile.trim()) errs.mobile = "Mobile number is required";
    return errs;
  };

  const handleConfirmOrder = () => {
    setCheckoutOpen(true);
  };

  const CartDrawer = (
    <Drawer
      anchor="right"
      open={cartOpen}
      onClose={() => setCartOpen(false)}
      PaperProps={{
        sx: { maxWidth: "100%", width: { xs: "100%", sm: 400 } },
      }}
    >
      <Box
        sx={{
          p: 2,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Cart ({cartItems.length})
          </Typography>
          <IconButton onClick={() => setCartOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Cart Items */}
        <Box sx={{ flex: 1, overflowY: "auto", mb: 2 }}>
          {cartItems.length === 0 ? (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              Your cart is empty
            </Typography>
          ) : (
            <Stack spacing={2}>
              {cartItems.map((item) => (
                <Box
                  key={`${item.id}-${item.type}`}
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "8px",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{ mb: 1 }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "bold" }}
                      >
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {typeof item.category === "object"
                          ? item.category?.name ?? item.category?.displayName
                          : item.category}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => removeFromCart(item.id, item.type)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Stack>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mt: 1 }}
                  >
                    {item.type === "product" ? (
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Service
                      </Typography>
                    )}

                    {item.type === "product" && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            updateCartItemQuantity(
                              item.id,
                              item.type,
                              item.quantity - 1,
                            )
                          }
                          sx={{ minWidth: "32px", p: 0.5 }}
                        >
                          −
                        </Button>
                        <Typography
                          variant="body2"
                          sx={{ width: "20px", textAlign: "center" }}
                        >
                          {item.quantity}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            updateCartItemQuantity(
                              item.id,
                              item.type,
                              item.quantity + 1,
                            )
                          }
                          sx={{ minWidth: "32px", p: 0.5 }}
                        >
                          +
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        {/* Footer */}
        {cartItems.length > 0 && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  Total:
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", color: "primary.main" }}
                >
                  ₹{getTotalPrice().toFixed(2)}
                </Typography>
              </Stack>
              <Button
                variant="contained"
                fullWidth
                onClick={handleConfirmOrder}
                sx={{ py: 1.5 }}
              >
                Confirm Order
              </Button>
            </Stack>
          </>
        )}
      </Box>
    </Drawer>
  );

  const handleSubmitCheckout = async () => {
    const errs = validateCheckout();
    setCheckoutErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const productItems = cartItems.filter((i) => i.type === "product");
    const serviceItems = cartItems.filter((i) => i.type === "service");

    if (productItems.length > 0) {
      setCheckoutLoading(true);
      const locationId = localStorage.getItem("locationId");
      try {
        const payload = productItems.map((item) => ({
          product: {
            id: item.id,
            productQuantity: item.quantity || 1,
          },
          room: { id: roomId },
          tenantId,
          locationId,
          userName: custName.trim() || "",
          phoneNumber: custMobile.trim(),
          comment: custDescription.trim() || "",
          quantity: item.quantity || 1,
          amount: (item.price || 0) * (item.quantity || 1),
          histories: [{ comment: "" }],
        }));
        await saveProductRequests(tenantId, roomId, payload);
        clearCart();
        setCheckoutOpen(false);
        setCartOpen(false);
        setCustName("");
        setCustMobile("");
        setCustDescription("");
        setCheckoutErrors({});
        showSnackbar("Product order placed successfully.", "success");
      } catch (err) {
        showSnackbar(
          err?.response?.data?.error?.message ||
            err?.message ||
            "Failed to place order.",
          "error"
        );
      } finally {
        setCheckoutLoading(false);
      }
    } else {
      serviceItems.forEach((item) => {
        createRequest({
          name: custName,
          mobile: custMobile,
          description: custDescription,
          category: item.category,
          tenantId,
          roomId,
        });
      });
      clearCart();
      setCheckoutOpen(false);
      setCartOpen(false);
      setCustName("");
      setCustMobile("");
      setCustDescription("");
      setCheckoutErrors({});
      showSnackbar(
        serviceItems.length > 0
          ? "Service requests added. Submit from Services page."
          : "Cart is empty.",
        "info"
      );
    }
  };

  const CheckoutDialog = (
    <Dialog
      open={checkoutOpen}
      onClose={() => setCheckoutOpen(false)}
      fullWidth
    >
      <DialogTitle>Checkout</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Name"
            size="small"
            fullWidth
            value={custName}
            onChange={(e) => setCustName(e.target.value)}
            error={!!checkoutErrors.name}
            helperText={checkoutErrors.name}
          />
          <TextField
            label="Mobile"
            size="small"
            fullWidth
            value={custMobile}
            onChange={(e) => setCustMobile(e.target.value)}
            error={!!checkoutErrors.mobile}
            helperText={checkoutErrors.mobile}
          />
          <TextField
            label="Description (optional)"
            size="small"
            fullWidth
            multiline
            minRows={3}
            value={custDescription}
            onChange={(e) => setCustDescription(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCheckoutOpen(false)} disabled={checkoutLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmitCheckout}
          disabled={checkoutLoading}
        >
          {checkoutLoading ? "Placing..." : "Place Order"}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          p: { xs: 1.5, sm: 2 },
          borderRadius: "0 0 12px 12px",
        }}
      >
        {/* Avatar, Welcome Section, and Cart Icon */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ mb: 2 }}
          justifyContent="space-between"
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ flex: 1 }}
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: "rgba(255, 255, 255, 0.3)",
                fontSize: "1.5rem",
              }}
            >
              U
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Welcome to
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                }}
              >
                {roomName}
              </Typography>
            </Box>
          </Stack>

          {/* Theme toggle + Cart Icon */}
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              onClick={() => setIsDarkMode && setIsDarkMode(!isDarkMode)}
              sx={{ color: "inherit" }}
              aria-label="Toggle theme"
              size="small"
            >
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <IconButton
              onClick={() => setCartOpen(true)}
              sx={{ color: "inherit" }}
            >
              <Badge badgeContent={cartItems.length} color="error">
                <CartIcon />
              </Badge>
            </IconButton>
          </Stack>
        </Stack>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search services..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "rgba(255, 255, 255, 0.95)",
              color: "#333",
              borderRadius: "8px",
              "& fieldset": {
                borderColor: "transparent",
              },
              "&:hover fieldset": {
                borderColor: "transparent",
              },
              "&.Mui-focused fieldset": {
                borderColor: "transparent",
              },
            },
            "& .MuiOutlinedInput-input::placeholder": {
              color: "#999",
              opacity: 1,
            },
          }}
        />
      </Box>

      {CartDrawer}
      {CheckoutDialog}
    </>
  );
}

export default Header;
