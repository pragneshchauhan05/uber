export const getApiBaseUrl = () => {
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return import.meta.env.VITE_BASE_URL || "http://localhost:4000";
  }

  const envUrl = import.meta.env.VITE_BASE_URL;
  if (
    envUrl &&
    !envUrl.includes("localhost") &&
    !envUrl.includes("127.0.0.1")
  ) {
    return envUrl;
  }
  return "https://uber-whlf.onrender.com";
};
