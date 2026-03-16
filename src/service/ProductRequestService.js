import axios from "axios";
import {
  getSaveProductRequestApiUrl,
  getProductRequestDetailApiUrl,
  getProductRequestsByGroupIdApiUrl,
} from "./ApiUrls";
import { getHeader } from "./Service";

const SUCCESS_CODE = 1000;

function checkResponseError(resData) {
  if (!resData) return;
  const statusCode = resData.status?.code;
  if (statusCode != null && statusCode !== SUCCESS_CODE) {
    const msg =
      resData.status?.message ||
      resData.error?.message ||
      resData.error?.detailsMessage ||
      "Something went wrong.";
    throw new Error(msg);
  }
  if (resData?.error) {
    const msg =
      resData.error.message ||
      resData.error.detailsMessage ||
      "Request failed.";
    throw new Error(msg);
  }
}

export const saveProductRequests = async (tenantId, roomId, payload) => {
  const url = getSaveProductRequestApiUrl(tenantId, roomId);
  const response = await axios.post(url, payload, getHeader());
  const resData = response?.data;
  checkResponseError(resData);
  return Array.isArray(resData) ? resData : resData?.data ?? resData?.list ?? resData;
};

export const getProductRequestDetail = async (tenantId, roomId, id) => {
  const url = getProductRequestDetailApiUrl(tenantId, roomId, id);
  const response = await axios.get(url, getHeader());
  const resData = response?.data;
  checkResponseError(resData);
  const data = resData?.data ?? resData;
  if (data?.requestGroupId) {
    const groupUrl = getProductRequestsByGroupIdApiUrl(tenantId, roomId, data.requestGroupId);
    const groupRes = await axios.get(groupUrl, getHeader());
    const groupData = groupRes?.data;
    const items = Array.isArray(groupData) ? groupData : groupData?.data ?? groupData?.list ?? [];
    return { ...data, groupItems: items };
  }
  return { ...data, groupItems: data ? [data] : [] };
};

export const getProductRequestsByGroupId = async (tenantId, roomId, requestGroupId) => {
  const url = getProductRequestsByGroupIdApiUrl(tenantId, roomId, requestGroupId);
  const response = await axios.get(url, getHeader());
  const resData = response?.data;
  return Array.isArray(resData) ? resData : resData?.data ?? resData?.list ?? [];
};
