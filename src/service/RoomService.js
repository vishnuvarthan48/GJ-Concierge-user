import {
  getRoomServicesApiUrl,
  getRoomDetailApiUrl,
  getCategoriesApiUrl,
  getServicesApiUrl,
  getServicesByCategoryApiUrl,
} from "./ApiUrls";
import { get } from "./Service";

export const getRoomServices = async (tenantId, roomId) => {
  try {
    return (await get(getRoomServicesApiUrl(tenantId, roomId))) || [];
  } catch (error) {
    console.error("Error fetching room services:", error);
    return [];
  }
};

export const getRoomDetail = async (tenantId, roomId) => {
  try {
    return await get(getRoomDetailApiUrl(tenantId, roomId));
  } catch (error) {
    console.error("Error fetching room detail:", error);
    return null;
  }
};

export const getCategories = async (tenantId, locationId) => {
  try {
    return await get(getCategoriesApiUrl(tenantId, locationId));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const getServices = async (tenantId, locationId, roomId) => {
  try {
    return await get(getServicesApiUrl(tenantId, locationId, roomId));
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
};

export const getServicesByCategory = async (
  tenantId,
  locationId,
  categoryId,
  roomId,
) => {
  try {
    return await get(
      getServicesByCategoryApiUrl(tenantId, locationId, categoryId, roomId),
    );
  } catch (error) {
    console.error("Error fetching services by category:", error);
    return [];
  }
};
