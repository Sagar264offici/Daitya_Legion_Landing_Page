const isProduction = window.location.hostname === "daitya-legion.vercel.app";
export const API_BASE_URL = import.meta.env.VITE_API_URL || (isProduction ? "" : "https://daitya-legion-api-264.onrender.com");
