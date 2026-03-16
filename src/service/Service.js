import axios from "axios";
import { Initialize } from "./Interceptor";

Initialize();

export const getAuthorization = () => {
  const token = localStorage.getItem("token");
  return token ? `Bearer ${token}` : "";
};

export const getHeader = (type) => {
  const headers = {
    "Content-Type": type || "application/json; charset=utf-8",
    Authorization: getAuthorization(),
  };
  return { headers };
};

export async function post(url, data, headers) {
  try {
    const result = await axios.post(
      url,
      data,
      headers ? { headers } : getHeader(),
    );
    if (result.status === 200) {
      // Backend may return 200 with error payload (e.g. validation failure)
      if (result.data?.error) {
        const err = new Error(
          result.data.error.message || result.data.error.detailsMessage || "Request failed",
        );
        err.response = { data: result.data, status: result.data.error.status || 412 };
        throw err;
      }
      if (result.data.data) return result.data.data;
      if (result.data.list) return result.data.list;
      return result.data;
    }
    return null;
  } catch (error) {
    console.error("POST error:", error);
    throw error;
  }
}

export async function get(url, headers) {
  try {
    const result = await axios.get(url, headers ? { headers } : getHeader());
    if (result.status === 200) {
      if (result.data.data) return result.data.data;
      if (result.data.list) return result.data.list;
      return result.data;
    }
    return null;
  } catch (error) {
    console.error("GET error:", error);
    return null;
  }
}

export async function put(url, data, headers) {
  try {
    const response = await axios.put(
      url,
      data,
      headers ? { headers } : getHeader(),
    );
    if (response && response.data && response.status === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("PUT error:", error);
    return null;
  }
}

export async function Delete(url, headers) {
  try {
    const response = await axios.delete(
      url,
      headers ? { headers } : getHeader(),
    );
    if (response && response.data && response.status === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("DELETE error:", error);
    return null;
  }
}

export async function upload(url, data) {
  try {
    const response = await axios.post(
      url,
      data,
      getHeader("multipart/form-data"),
    );
    if (response && response.data && response.status === 200) {
      return response.data.data;
    } else if (response.status === 201) {
      return true;
    }
  } catch (err) {}
}
