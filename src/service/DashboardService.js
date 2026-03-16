import {
  getRoomDetailApiUrl,
  getCategoriesApiUrl,
  getServicesApiUrl,
  getServicesByCategoryApiUrl,
} from "./ApiUrls";
import { get } from "./Service";

// Add dashboard-related API functions here as needed.
const response = await get(getRoomDetailApiUrl(tenantId, roomId));

return response;
