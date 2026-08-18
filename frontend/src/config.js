export const getApiBaseUrl = () => {
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ) {
    return "http://localhost:4000";
  }
  return import.meta.env.VITE_BASE_URL || "https://uber-whlf.onrender.com";
};
