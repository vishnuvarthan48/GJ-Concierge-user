import axios from "axios";
import { LOGIN } from "./ApiUrls";

export async function Login(formData) {
  try {
    const headers = {
      Authorization: "Basic YXBpOkRKQ29ubmVjdGFwaSEh",
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    };
    const response = await axios.post(LOGIN, formData, { headers });
    if (response && response.data && response.status === 200) {
      return response.data;
    }
    if (response.status === 201) {
      return true;
    }
    return null;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
}
