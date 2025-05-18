// API configuration for development and production environments

const isDevelopment = process.env.NODE_ENV === 'development';

// Base URL for API requests
// In development, use the proxy configured in vite.config.js
// In production, use relative URLs that will be handled by the same domain
const API_BASE_URL = isDevelopment 
  ? '' 
  : '';

export const getApiUrl = (endpoint) => {
  // Ensure endpoint starts with '/'
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${formattedEndpoint}`;
};

export default {
  getApiUrl,
  baseUrl: API_BASE_URL
};