// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Check if we're running in production (GitHub Pages)
export const isProduction = window.location.hostname === 'onejob.co' || 
                           window.location.hostname === 'www.onejob.co' ||
                           window.location.hostname.includes('github.io');

// Demo mode for when backend is not available
export const isDemoMode = isProduction && !import.meta.env.VITE_API_URL;