const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://document-forgery-backend.onrender.com";

export const getApiUrl = (path) => `${API_BASE_URL}${path}`;

export default API_BASE_URL;
