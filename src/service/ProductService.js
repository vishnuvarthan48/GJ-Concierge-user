import {
  getProductsApiUrl,
  getCategoriesByTypeApiUrl,
  getProductsByCategoryApiUrl,
} from "./ApiUrls";
import { get } from "./Service";

export const getProducts = async (tenantId, locationId) => {
  try {
    return (await get(getProductsApiUrl(tenantId, locationId))) || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const getProductsByCategory = async (
  tenantId,
  locationId,
  categoryId,
) => {
  try {
    return (
      (await get(
        getProductsByCategoryApiUrl(tenantId, locationId, categoryId),
      )) || []
    );
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
};

export const getCategories = async (tenantId, locationId, type) => {
  try {
    return (
      (await get(getCategoriesByTypeApiUrl(tenantId, locationId, type))) || []
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};
