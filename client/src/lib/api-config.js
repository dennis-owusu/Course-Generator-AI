// API configuration for development and production environments

const isDevelopment = process.env.NODE_ENV === 'development';

// Base URL for API requests
// In development, use the proxy configured in vite.config.js
// In production, use the full URL of the deployed backend
const API_BASE_URL = isDevelopment 
  ? '' 
  : 'https://course-generator-ai.onrender.com';

export const getApiUrl = (endpoint) => {
  // Ensure endpoint starts with '/'
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${formattedEndpoint}`;
};

export default {
  getApiUrl,
  baseUrl: API_BASE_URL
};