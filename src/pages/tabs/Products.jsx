import { useState, useContext } from "react";
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

function Products({ tenantId, locationId, category }) {
  const fetchProducts = async () => {
    const url = category
      ? getProductsByCategoryApiUrl(tenantId, locationId, category)
      : getProductsApiUrl(tenantId, locationId);
    return await get(url);
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

  const productsRawArray = Array.isArray(productsRaw)
    ? productsRaw
    : productsRaw?.list ?? [];
  const products = productsRawArray.filter(
    (p) => p.deleted === false || p.deleted === undefined
  );

  const { addToCart, cartItems, updateCartItemQuantity } =
    useContext(AppContext);

  const getProductQuantity = (productId) => {
    const item = cartItems.find(
      (i) => i.id === productId && i.type === "product",
    );
    return item ? item.quantity : 0;
  };

  const isProductAvailable = (product) => product?.available !== false;

  const getAvailableStock = (product) => {
    if (product?.stockable === false) return null;
    const qty = product?.productQuantity;
    if (qty == null || qty === "") return null;
    const n = Number(qty);
    return Number.isNaN(n) ? null : n;
  };

  const canAddMore = (product, currentQty) => {
    if (!isProductAvailable(product)) return false;
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
          const available = isProductAvailable(product);
          const stock = getAvailableStock(product);
          const canAdd = canAddMore(product, quantity);

          return (
            <Card
              key={product.id}
              sx={{
                opacity: available ? 1 : 0.85,
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
                          color: "error.main",
                          fontWeight: 600,
                        }}
                      >
                        Currently not available
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

                    {!available || (stock !== null && stock <= 0) ? (
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
                    ) : quantity === 0 ? (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleAddProduct(product)}
                        disabled={!canAdd}
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        Add to Cart
                      </Button>
                    ) : (
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
