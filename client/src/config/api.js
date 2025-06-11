// API Configuration
const isDevelopment = import.meta.env.DEV;

export const API_CONFIG = {
  BASE_URL: isDevelopment 
    ? import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    : import.meta.env.VITE_API_BASE_URL || 'http://16.171.134.183:3000',
  
  COMPILER_URL: isDevelopment
    ? import.meta.env.VITE_COMPILER_BASE_URL || 'http://localhost:8000'
    : import.meta.env.VITE_COMPILER_BASE_URL || 'http://16.171.134.183:8000',
};

// Helper function to create full API URL
export const createApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to create compiler URL
export const createCompilerUrl = (endpoint) => {
  return `${API_CONFIG.COMPILER_URL}${endpoint}`;
};