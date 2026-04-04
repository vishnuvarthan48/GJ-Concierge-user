const HOST = import.meta.env.VITE_API_HOST;

// Base URLs
export const BASE_AUTH_URL = `${HOST}/`;
const BASE_ATTACHMENT_URL = `${HOST}/v1/user/attachment`;
const BASE_CONCIERGE_URL = `${HOST}/v1/user/tenant/`;

// Auth & Upload
export const LOGIN = `${BASE_AUTH_URL}oauth/token`;
export const UPLOAD_URL = BASE_ATTACHMENT_URL;
export const getUploadApiUrl = () => BASE_ATTACHMENT_URL;

// Category APIs
export const getCategoriesApiUrl = (tenantId, locationId) =>
  `${BASE_CONCIERGE_URL}${tenantId}/location/${locationId}/category`;
export const getCategoryApiUrl = (tenantId, locationId, categoryId) =>
  `${BASE_CONCIERGE_URL}${tenantId}/location/${locationId}/category/${categoryId}`;
export const getCategoriesByTypeApiUrl = (tenantId, locationId, type) =>
  `${BASE_CONCIERGE_URL}${tenantId}/location/${locationId}/category/type/${type}`;

// Service APIs (optional roomId filters to services visible for that room's type)
export const getServicesApiUrl = (tenantId, locationId, roomId) => {
  const base = `${BASE_CONCIERGE_URL}${tenantId}/location/${locationId}/services`;
  return roomId ? `${base}?roomId=${encodeURIComponent(roomId)}` : base;
};
export const getServicesByCategoryApiUrl = (tenantId, locationId, categoryId, roomId) => {
  const base = `${BASE_CONCIERGE_URL}${tenantId}/location/${locationId}/category/${categoryId}/services`;
  return roomId ? `${base}?roomId=${encodeURIComponent(roomId)}` : base;
};
export const getRoomServicesApiUrl = (tenantId, roomId) =>
  `${BASE_CONCIERGE_URL}${tenantId}/room/${roomId}/room-service`;

// Service Request APIs
export const getSaveServiceRequestApiUrl = (tenantId, roomId) =>
  `${BASE_CONCIERGE_URL}${tenantId}/room/${roomId}/service-request`;
export const getServiceRequestApiUrl = (tenantId, roomId) =>
  `${BASE_CONCIERGE_URL}${tenantId}/room/${roomId}/service-request`;
export const getServiceRequestByStatusApiUrl = (tenantId, roomId, id) =>
  `${BASE_CONCIERGE_URL}${tenantId}/room/${roomId}/service-request/status/${id}`;
export const getServiceRequestDetailApiUrl = (tenantId, roomId, id) =>
  `${BASE_CONCIERGE_URL}${tenantId}/room/${roomId}/service-request/${id}`;
export const getServiceRequestStatusesApiUrl = (tenantId, locationId) =>
  `${BASE_CONCIERGE_URL}${tenantId}/location/${locationId}/service-request-status`;
export const getServiceRequestHistoryByPhoneApiUrl = (
  tenantId,
  locationId,
  phoneNumber,
) =>
  `${BASE_CONCIERGE_URL}${tenantId}/location/${locationId}/service-request-history/by-phone/${encodeURIComponent(phoneNumber)}`;

// Product Request APIs
export const getSaveProductRequestApiUrl = (tenantId, roomId) =>
  `${BASE_CONCIERGE_URL}${tenantId}/room/${roomId}/product-request`;
export const getProductRequestDetailApiUrl = (tenantId, roomId, id) =>
  `${BASE_CONCIERGE_URL}${tenantId}/room/${roomId}/product-request/${id}`;
export const getProductRequestsByGroupIdApiUrl = (tenantId, roomId, requestGroupId) =>
  `${BASE_CONCIERGE_URL}${tenantId}/room/${roomId}/product-request/by-group/${requestGroupId}`;
export const getProductRequestHistoryByPhoneApiUrl = (
  tenantId,
  locationId,
  phoneNumber,
) =>
  `${BASE_CONCIERGE_URL}${tenantId}/location/${locationId}/product-request-history/by-phone/${encodeURIComponent(phoneNumber)}`;

// Room APIs
export const getRoomDetailApiUrl = (tenantId, roomId) =>
  `${BASE_CONCIERGE_URL}${tenantId}/room/${roomId}`;

// Product APIs
export const getProductsApiUrl = (tenantId, locationId) =>
  `${BASE_CONCIERGE_URL}${tenantId}/location/${locationId}/product`;
export const getProductsByCategoryApiUrl = (tenantId, locationId, categoryId) =>
  `${BASE_CONCIERGE_URL}${tenantId}/location/${locationId}/product/category/${categoryId}`;

// Cart APIs
export const getCartApiUrl = (tenantId, locationId) =>
  `${BASE_CONCIERGE_URL}${tenantId}/location/${locationId}/cart`;
export const getAddToCartApiUrl = (tenantId) =>
  `${BASE_CONCIERGE_URL}${tenantId}/cart-item`;
export const getUpdateCartItemApiUrl = (tenantId) =>
  `${BASE_CONCIERGE_URL}${tenantId}/cart-item`;
export const getDeleteCartItemApiUrl = (tenantId) =>
  `${BASE_CONCIERGE_URL}${tenantId}/cart-item`;
