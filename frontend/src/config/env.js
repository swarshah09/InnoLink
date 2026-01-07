/**
 * Environment Configuration
 * In production, these values come from Vercel environment variables
 * In development, they fall back to localhost
 */
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

