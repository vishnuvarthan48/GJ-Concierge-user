import {
  getCartApiUrl,
  getAddToCartApiUrl,
  getUpdateCartItemApiUrl,
  getDeleteCartItemApiUrl,
} from "./ApiUrls";
import { post, put, Delete as deleteRequest } from "./Service";

export const getCart = async (tenantId, locationId, data) => {
  try {
    return await post(getCartApiUrl(tenantId, locationId), data);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return null;
  }
};

export const addToCart = async (tenantId, data) => {
  try {
    return await post(getAddToCartApiUrl(tenantId), data);
  } catch (error) {
    console.error("Error adding to cart:", error);
    return null;
  }
};

export const updateCartItem = async (tenantId, data) => {
  try {
    return await put(getUpdateCartItemApiUrl(tenantId), data);
  } catch (error) {
    console.error("Error updating cart item:", error);
    return null;
  }
};

export const deleteCartItem = async (tenantId, data) => {
  try {
    return await deleteRequest(getDeleteCartItemApiUrl(tenantId), data);
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return null;
  }
};
