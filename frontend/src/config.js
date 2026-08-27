export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_BASE_URL;

  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    if (envUrl && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))) {
      return envUrl;
    }
    return "http://localhost:4000";
  }

  if (
    envUrl &&
    !envUrl.includes("localhost") &&
    !envUrl.includes("127.0.0.1")
  ) {
    return envUrl;
  }
  return "https://uber-whlf.onrender.com";
};
