import { useState, useContext } from "react";
import {
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
  Button,
} from "@mui/material";
import { AppContext } from "../../context/AppContext";

const ALL_PRODUCTS = [
  // Beverages
  {
    id: 101,
    category: "Beverages",
    name: "Coca Cola 300ml",
    description: "Cold soft drink",
    price: 80,
    icon: "🥤",
  },
  {
    id: 102,
    category: "Beverages",
    name: "Mineral Water 1L",
    description: "Pure drinking water",
    price: 40,
    icon: "💧",
  },
  {
    id: 103,
    category: "Beverages",
    name: "Orange Juice 250ml",
    description: "Fresh orange juice",
    price: 120,
    icon: "🧃",
  },

  // Snack Bars
  {
    id: 104,
    category: "Snack Bars",
    name: "Potato Chips",
    description: "Crispy snack pack",
    price: 60,
    icon: "🥔",
  },
  {
    id: 105,
    category: "Snack Bars",
    name: "Chocolate Bar",
    description: "Delicious chocolate",
    price: 80,
    icon: "🍫",
  },
  {
    id: 106,
    category: "Snack Bars",
    name: "Mixed Nuts",
    description: "Healthy nut mix",
    price: 150,
    icon: "🥜",
  },

  // Room Service (products)
  {
    id: 107,
    category: "Room Service",
    name: "Pillow",
    description: "Extra comfort pillow",
    price: 200,
    icon: "🛏️",
  },
  {
    id: 108,
    category: "Room Service",
    name: "Blanket",
    description: "Warm extra blanket",
    price: 300,
    icon: "🧣",
  },
  {
    id: 109,
    category: "Room Service",
    name: "Toiletries Kit",
    description: "Complete toiletries",
    price: 250,
    icon: "🧴",
  },

  // Housekeeping
  {
    id: 110,
    category: "Housekeeping",
    name: "Room Freshener",
    description: "Air freshener spray",
    price: 150,
    icon: "💨",
  },
  {
    id: 111,
    category: "Housekeeping",
    name: "Cleaning Supplies",
    description: "Basic cleaning items",
    price: 200,
    icon: "🧹",
  },

  // General Products
  {
    id: 112,
    category: "Front Desk",
    name: "Newspaper",
    description: "Daily newspaper",
    price: 30,
    icon: "📰",
  },
];

function Products({ category }) {
  const { addToCart, cartItems, updateCartItemQuantity } =
    useContext(AppContext);

  const filteredProducts = category
    ? ALL_PRODUCTS.filter((p) => p.category === category)
    : ALL_PRODUCTS;

  const getProductQuantity = (productId) => {
    const item = cartItems.find(
      (i) => i.id === productId && i.type === "product",
    );
    return item ? item.quantity : 0;
  };

  const handleAddProduct = (product) => {
    addToCart({
      ...product,
      type: "product",
      quantity: 1,
    });
  };

  const handleIncrement = (productId) => {
    const currentQty = getProductQuantity(productId);
    updateCartItemQuantity(productId, "product", currentQty + 1);
  };

  const handleDecrement = (productId) => {
    const currentQty = getProductQuantity(productId);
    updateCartItemQuantity(productId, "product", currentQty - 1);
  };

  return (
    <Stack spacing={2}>
      {filteredProducts.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography color="textSecondary">
            No products available for this category
          </Typography>
        </Box>
      ) : (
        filteredProducts.map((product) => {
          const quantity = getProductQuantity(product.id);

          return (
            <Card
              key={product.id}
              sx={{
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: 3,
                },
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box sx={{ fontSize: { xs: "2rem", sm: "2.5rem" } }}>
                    {product.icon}
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", mb: 0.5 }}
                    >
                      {product.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ display: "block", mb: 1 }}
                    >
                      {product.description}
                    </Typography>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
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

                      {quantity === 0 ? (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleAddProduct(product)}
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
                            onClick={() => handleIncrement(product.id)}
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
                  </Box>
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
