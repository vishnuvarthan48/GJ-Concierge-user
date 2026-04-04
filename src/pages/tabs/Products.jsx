import { useContext } from "react";
import {
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material";
import { AppContext } from "../../context/AppContext";
import { useQuery } from "@tanstack/react-query";
import {
  getProductsApiUrl,
  getProductsByCategoryApiUrl,
} from "../../service/ApiUrls";
import { get } from "../../service/Service";

const parseTimeToMinutes = (value) => {
  if (!value || typeof value !== "string") return null;
  const token = value.trim().slice(0, 5);
  const [h, m] = token.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const formatHHMMToAmPm = (value) => {
  const mins = parseTimeToMinutes(value);
  if (mins == null) return "";
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Same as admin/backend: 0 = Sunday … 6 = Saturday. Null/empty = all days. */
const normalizeAllowedDaysSet = (product) => {
  const arr = product?.availableDays;
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const s = new Set(
    arr
      .map((n) => Number(n))
      .filter(
        (v) => Number.isFinite(v) && v === Math.floor(v) && v >= 0 && v <= 6,
      ),
  );
  return s.size === 0 ? null : s;
};

const buildSortedSlots = (product) =>
  Array.isArray(product?.availabilitySlots)
    ? product.availabilitySlots
        .map((slot) => ({
          label: slot?.label || "",
          fromTime: slot?.fromTime,
          toTime: slot?.toTime,
          fromMins: parseTimeToMinutes(slot?.fromTime),
          toMins: parseTimeToMinutes(slot?.toTime),
        }))
        .filter(
          (slot) =>
            slot.fromMins != null &&
            slot.toMins != null &&
            slot.fromMins < slot.toMins,
        )
        .sort((a, b) => a.fromMins - b.fromMins)
    : [];

/**
 * Next opening within allowed weekdays + time slots (non-stockable only).
 */
const findNextNonStockableOpening = (slots, allowed, now) => {
  const allDays = !allowed || allowed.size === 0;
  const nowMins = now.getHours() * 60 + now.getMinutes();

  for (let addDays = 0; addDays < 14; addDays += 1) {
    const cal = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + addDays,
    );
    const dow = cal.getDay();
    if (!allDays && !allowed.has(dow)) continue;

    for (const slot of slots) {
      if (addDays === 0) {
        if (nowMins >= slot.fromMins && nowMins < slot.toMins) {
          return { open: true, label: null };
        }
        if (nowMins < slot.fromMins) {
          return {
            open: false,
            label: `Available today at ${formatHHMMToAmPm(slot.fromTime)}`,
          };
        }
      } else {
        return {
          open: false,
          label: `Available ${DAY_LABELS[dow]} at ${formatHHMMToAmPm(slot.fromTime)}`,
        };
      }
    }
  }
  return { open: false, label: "Currently not available" };
};

const getProductAvailabilityMeta = (product) => {
  const stockable = product?.stockable !== false;
  if (stockable) {
    const qty = Number(product?.productQuantity);
    const hasStock = Number.isNaN(qty) ? true : qty > 0;
    return {
      inCurrentSlot: hasStock,
      nextAvailableLabel: hasStock ? null : "Out of stock",
    };
  }

  const slots = buildSortedSlots(product);
  if (!slots.length) {
    return {
      inCurrentSlot: false,
      nextAvailableLabel: "Currently not available",
    };
  }

  const allowed = normalizeAllowedDaysSet(product);
  const { open, label } = findNextNonStockableOpening(slots, allowed, new Date());
  return {
    inCurrentSlot: open,
    nextAvailableLabel: open ? null : label,
  };
};

function Products({ tenantId, locationId, category, searchTerm = "" }) {
  const normalizeProductList = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.list)) return res.list;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.content)) return res.content;
    return [];
  };

  const fetchProducts = async () => {
    if (!category) {
      return await get(getProductsApiUrl(tenantId, locationId));
    }

    const byCategory = await get(
      getProductsByCategoryApiUrl(tenantId, locationId, category),
    );
    const list = normalizeProductList(byCategory);
    if (list.length > 0) return byCategory;

    // Fallback: if category endpoint returns empty unexpectedly, show all products.
    return await get(getProductsApiUrl(tenantId, locationId));
  };

  const {
    data: productsRaw = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", tenantId, locationId, category],
    queryFn: fetchProducts,
    enabled: !!tenantId && !!locationId,
  });

  const productsRawArray = normalizeProductList(productsRaw);
  const normalizedSearch = String(searchTerm || "").trim().toLowerCase();
  const products = productsRawArray.filter((p) => {
    if (!(p.deleted === false || p.deleted === undefined)) return false;
    if (!normalizedSearch) return true;
    const haystack = `${p?.name || ""} ${p?.description || ""}`.toLowerCase();
    return haystack.includes(normalizedSearch);
  });

  const { addToCart, cartItems, updateCartItemQuantity } =
    useContext(AppContext);

  const getProductQuantity = (productId) => {
    const item = cartItems.find(
      (i) => i.id === productId && i.type === "product",
    );
    return item ? item.quantity : 0;
  };

  const getAvailableStock = (product) => {
    if (product?.stockable === false) return null;
    const qty = product?.productQuantity;
    if (qty == null || qty === "") return null;
    const n = Number(qty);
    return Number.isNaN(n) ? null : n;
  };

  const canAddMore = (product, currentQty) => {
    const { inCurrentSlot } = getProductAvailabilityMeta(product);
    if (!inCurrentSlot) return false;
    const stock = getAvailableStock(product);
    if (stock == null) return true;
    return currentQty < stock;
  };

  const handleAddProduct = (product) => {
    if (!canAddMore(product, 0)) return;
    addToCart({
      ...product,
      type: "product",
      quantity: 1,
    });
  };

  const handleIncrement = (productId, product) => {
    const currentQty = getProductQuantity(productId);
    if (!canAddMore(product, currentQty)) return;
    updateCartItemQuantity(productId, "product", currentQty + 1);
  };

  const handleDecrement = (productId) => {
    const currentQty = getProductQuantity(productId);
    updateCartItemQuantity(productId, "product", currentQty - 1);
  };

  if (isLoading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress />
        <Typography>Loading products...</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="error">
          Failed to load products. Please try again.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {!products || products.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography color="text.secondary">
            No products available for this category
          </Typography>
        </Box>
      ) : (
        products.map((product) => {
          const quantity = getProductQuantity(product.id);
          const { inCurrentSlot: available, nextAvailableLabel } =
            getProductAvailabilityMeta(product);
          const stock = getAvailableStock(product);
          const canAdd = canAddMore(product, quantity);

          return (
            <Card
              key={product.id}
              sx={{
                opacity: available ? 1 : 0.8,
                filter: available ? "none" : "grayscale(1)",
                transition: "filter 150ms ease, opacity 150ms ease",
                "&:hover": {
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", mb: 0.5 }}
                    >
                      {product.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 1 }}
                    >
                      {product.description}
                    </Typography>

                    {!available && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          mb: 1,
                          color: "text.secondary",
                          fontWeight: 600,
                        }}
                      >
                        {nextAvailableLabel || "Currently not available"}
                      </Typography>
                    )}

                    {available && stock != null && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mb: 0.5 }}
                      >
                        {stock > 0
                          ? `${stock} in stock`
                          : "Currently not available"}
                      </Typography>
                    )}

                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: "bold",
                        color: "primary.main",
                        fontSize: { xs: "0.95rem", sm: "1rem" },
                      }}
                    >
                      ₹{product.price}
                    </Typography>
                  </Box>

                  <Stack alignItems="center" spacing={1.5} sx={{ flexShrink: 0 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 2,
                        overflow: "hidden",
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        flexShrink: 0,
                      }}
                    >
                      {(() => {
                        const imageUrl =
                          product.coverImage ||
                          product.attachments?.[0]?.attachment?.mediaUrl;
                        if (imageUrl) {
                          return (
                            <Box
                              component="img"
                              src={imageUrl}
                              alt=""
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          );
                        }
                        return (
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "2rem",
                              color: "text.secondary",
                            }}
                          >
                            {product.icon || "📦"}
                          </Box>
                        );
                      })()}
                    </Box>

                    {quantity > 0 ? (
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleDecrement(product.id)}
                          sx={{
                            minWidth: "32px",
                            p: 0.5,
                            fontSize: "0.85rem",
                          }}
                        >
                          −
                        </Button>
                        <Typography
                          variant="body2"
                          sx={{
                            width: "24px",
                            textAlign: "center",
                            fontWeight: "bold",
                          }}
                        >
                          {quantity}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleIncrement(product.id, product)}
                          disabled={!canAdd}
                          sx={{
                            minWidth: "32px",
                            p: 0.5,
                            fontSize: "0.85rem",
                          }}
                        >
                          +
                        </Button>
                      </Stack>
                    ) : !available || (stock !== null && stock <= 0) ? (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: "0.75rem",
                          fontStyle: "italic",
                          textAlign: "center",
                        }}
                      >
                        Not available
                      </Typography>
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleAddProduct(product)}
                        disabled={!canAdd}
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        Add to Cart
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })
      )}
    </Stack>
  );
}

export default Products;
