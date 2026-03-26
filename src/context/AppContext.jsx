import React, { createContext, useState, useCallback } from "react";
import { Snackbar, Alert } from "@mui/material";

export const AppContext = createContext();

export function AppProvider({ children, isDarkMode, setIsDarkMode }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [requestHistoryCache, setRequestHistoryCache] = useState({
    phone: "",
    serviceList: [],
    productList: [],
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const addToCart = (item) => {
    setCartItems((prev) => {
      const existingItem = prev.find(
        (i) => i.id === item.id && i.type === item.type,
      );
      if (existingItem) {
        // Prevent duplicate services from being added multiple times
        if (item.type === "service") {
          setSnackbar({
            open: true,
            message: `${item.name} is already in cart`,
            severity: "info",
          });
          return prev;
        }
        return prev.map((i) =>
          i.id === item.id && i.type === item.type
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i,
        );
      }

      // For services, set quantity to 1 (no quantity increments)
      const initialQty = item.type === "product" ? item.quantity || 1 : 1;
      return [...prev, { ...item, quantity: initialQty }];
    });
  };

  const removeFromCart = (itemId, itemType) => {
    setCartItems((prev) =>
      prev.filter((i) => !(i.id === itemId && i.type === itemType)),
    );
  };

  const updateCartItemQuantity = (itemId, itemType, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId, itemType);
    } else {
      setCartItems((prev) =>
        prev.map((i) =>
          i.id === itemId && i.type === itemType ? { ...i, quantity } : i,
        ),
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const createRequest = ({
    name,
    email,
    mobile,
    description,
    category,
    tenantId,
    roomId,
  }) => {
    const id = `req_${Date.now()}`;
    const newRequest = {
      id,
      name,
      email: email || "",
      mobile,
      description: description || "",
      category: category || null,
      tenantId: tenantId || null,
      roomId: roomId || null,
      createdAt: new Date().toISOString(),
      // status history for stepper
      statusHistory: [{ status: "Open", timestamp: new Date().toISOString() }],
      currentStatusIndex: 0,
    };
    setRequests((prev) => [newRequest, ...prev]);
    return newRequest;
  };

  const getRequestsByMobile = (mobile) => {
    if (!mobile) return [];
    return requests.filter((r) => r.mobile === mobile);
  };

  const advanceRequestStatus = (requestId) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const steps = [
          "Open",
          "Assigned",
          "In Progress",
          "Completed",
          "Closed",
        ];
        const nextIndex = Math.min(r.currentStatusIndex + 1, steps.length - 1);
        if (nextIndex === r.currentStatusIndex) return r;
        return {
          ...r,
          currentStatusIndex: nextIndex,
          statusHistory: [
            ...r.statusHistory,
            { status: steps[nextIndex], timestamp: new Date().toISOString() },
          ],
        };
      }),
    );
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  const setRequestHistory = useCallback((phone, serviceList, productList) => {
    setRequestHistoryCache({
      phone: phone || "",
      serviceList: Array.isArray(serviceList) ? serviceList : [],
      productList: Array.isArray(productList) ? productList : [],
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        isDarkMode,
        setIsDarkMode,
        requestHistoryCache,
        setRequestHistory,
        requests,
        createRequest,
        getRequestsByMobile,
        advanceRequestStatus,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        getTotalPrice,
        showSnackbar,
      }}
    >
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppContext.Provider>
  );
}
