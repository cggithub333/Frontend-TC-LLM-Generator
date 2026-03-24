import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api/proxy",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => {
    const data = response.data;

    if (data && typeof data === "object" && "success" in data) {
      if (data.success === true && data.data !== undefined) {
        return { ...response, data: data.data };
      }

      if (data.success === false) {
        const message =
          data.errors?.map((e: { message: string }) => e.message).join(", ") ||
          data.message ||
          "Request failed";
        return Promise.reject(new Error(message));
      }
    }

    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
      return Promise.reject(new Error("Session expired"));
    }

    const data = error.response?.data;
    if (data?.success === false) {
      const message =
        data.errors?.map((e: { message: string }) => e.message).join(", ") ||
        data.message ||
        "Request failed";
      return Promise.reject(new Error(message));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
