import axios from "axios";
import {
  getServiceRequestApiUrl,
  getSaveServiceRequestApiUrl,
  getServiceRequestDetailApiUrl,
  getServiceRequestStatusesApiUrl,
  getServiceRequestByStatusApiUrl,
  getServiceRequestHistoryByPhoneApiUrl,
  getProductRequestHistoryByPhoneApiUrl,
} from "./ApiUrls";
import { get, getHeader } from "./Service";

export const getServiceRequests = async (tenantId, roomId) => {
  try {
    return (await get(getServiceRequestApiUrl(tenantId, roomId))) || [];
  } catch (error) {
    console.error("Error fetching service requests:", error);
    return [];
  }
};

export const getServiceRequestByStatus = async (tenantId, roomId, id) => {
  try {
    return (
      (await get(getServiceRequestByStatusApiUrl(tenantId, roomId, id))) || []
    );
  } catch (error) {
    console.error("Error fetching service request by status:", error);
    return [];
  }
};

export const saveServiceRequest = async (tenantId, roomId, data) => {
  const url = getSaveServiceRequestApiUrl(tenantId, roomId);
  try {
    const response = await axios.post(url, data, getHeader());
    const resData = response?.data;
    // Backend may return 200 with error in body
    if (resData?.error) {
      const msg =
        resData.error.message ||
        resData.error.detailsMessage ||
        "Request failed.";
      const err = new Error(msg);
      throw err;
    }
    return resData?.data ?? resData?.list ?? resData;
  } catch (error) {
    console.error("Error saving service request:", error);
    // 412 or other non-2xx: axios throws, error.response is set
    const body = error.response?.data;
    const msg =
      body?.error?.message ||
      body?.error?.detailsMessage ||
      error.message ||
      "Failed to submit service request.";
    const errToThrow = new Error(msg);
    errToThrow.response = error.response;
    throw errToThrow;
  }
};

export const getServiceRequestDetail = async (tenantId, roomId, id) => {
  try {
    return await get(getServiceRequestDetailApiUrl(tenantId, roomId, id));
  } catch (error) {
    console.error("Error fetching service request detail:", error);
    return null;
  }
};

export const getServiceRequestStatuses = async (tenantId, locationId) => {
  try {
    return (
      (await get(getServiceRequestStatusesApiUrl(tenantId, locationId))) || []
    );
  } catch (error) {
    console.error("Error fetching service request statuses:", error);
    return [];
  }
};

export const getServiceRequestHistoryByPhone = async (
  tenantId,
  locationId,
  phoneNumber,
) => {
  try {
    const response = await axios.get(
      getServiceRequestHistoryByPhoneApiUrl(tenantId, locationId, phoneNumber),
      getHeader(),
    );
    const res = response?.data?.data ?? response?.data?.list ?? response?.data;
    return Array.isArray(res) ? res : res?.list ?? [];
  } catch (error) {
    console.error("Error fetching service request history by phone:", error);
    const msg =
      error.response?.data?.error?.message ??
      error.response?.data?.error?.detailsMessage ??
      error.message ??
      "Failed to fetch requests.";
    throw new Error(msg);
  }
};

export const getProductRequestHistoryByPhone = async (
  tenantId,
  locationId,
  phoneNumber,
) => {
  try {
    const response = await axios.get(
      getProductRequestHistoryByPhoneApiUrl(tenantId, locationId, phoneNumber),
      getHeader(),
    );
    const res = response?.data?.data ?? response?.data?.list ?? response?.data;
    return Array.isArray(res) ? res : res?.list ?? [];
  } catch (error) {
    console.error("Error fetching product request history by phone:", error);
    const msg =
      error.response?.data?.error?.message ??
      error.response?.data?.error?.detailsMessage ??
      error.message ??
      "Failed to fetch requests.";
    throw new Error(msg);
  }
};
