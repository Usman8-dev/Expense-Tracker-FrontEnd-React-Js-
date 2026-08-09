import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000, // 30 second timeout to allow for cold start
});

// const api = axios.create({
//   baseURL: "http://localhost:3000",
// });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Retry logic for cold start - retry once if the first request fails
// due to server being asleep (Render free tier cold start)
let retryCount = 0;

api.interceptors.response.use(
  (response) => {
    // Reset retry count on successful response
    retryCount = 0;
    return response;
  },
  (error) => {
    // Retry on network errors or 5xx errors (server still starting up)
    // Only retry once to avoid infinite loops
    const shouldRetry =
      retryCount < 1 &&
      (!error.response || error.response.status >= 500) &&
      error.config &&
      !error.config._retried;

    if (shouldRetry) {
      retryCount++;
      error.config._retried = true;

      // Wait 2 seconds before retrying to give the server time to boot
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(api(error.config));
        }, 2000);
      });
    }

    retryCount = 0;

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;