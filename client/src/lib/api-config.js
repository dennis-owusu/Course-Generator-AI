// API configuration for development and production environments

const isDevelopment = process.env.NODE_ENV === 'development';

// Base URL for API requests
// In development, use the proxy configured in vite.config.js
// In production, use the full URL of the deployed backend
// Empty string in development allows the proxy in vite.config.js to handle API requests
// In production, we need the full URL to the backend server
const API_BASE_URL = isDevelopment 
  ? '' 
  : 'https://course-generator-ai.onrender.com';

export const getApiUrl = (endpoint) => {
  // Ensure endpoint starts with '/'
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // In production, make sure we're using the correct base URL
  // This ensures API requests work properly when deployed
  return `${API_BASE_URL}${formattedEndpoint}`;
};

export default {
  getApiUrl,
  baseUrl: API_BASE_URL
};