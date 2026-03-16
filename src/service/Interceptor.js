import axios from "axios";

export async function Initialize() {
  axios.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.clear();
          if (
            error.request &&
            error.request.responseURL &&
            error.request.responseURL.indexOf("/oauth/token") < 0
          ) {
            setTimeout(() => {
              window.location.href = "/";
            }, 2000);
          }
        } else {
          console.error("API Error:", error.response.data);
        }
      } else if (error.request) {
        console.error("Network error:", error.message);
      } else {
        console.error("Error:", error.message);
      }
      return error;
    },
  );
}
