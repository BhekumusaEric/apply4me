/**
 * API Configuration
 * Centralized API URL management for development and production
 */

// Get the local IP address from Expo CLI
// This should match the IP shown in the Expo QR code
const LOCAL_IP = '172.16.82.212';
const LOCAL_PORT = '3000';

// API Base URLs
const API_URLS = {
  // Local development server
  local: `http://${LOCAL_IP}:${LOCAL_PORT}`,
  
  // Production Vercel deployment
  production: 'https://apply4me-4j50cov9a-bhekumusa-eric-ntshwenyas-projects.vercel.app',
  
  // Fallback localhost (won't work on mobile device)
  localhost: 'http://localhost:3000'
};

// Environment detection
const isDevelopment = __DEV__;

// Get the appropriate API base URL
export const getApiBaseUrl = (): string => {
  if (isDevelopment) {
    // Use local development server with IP address
    return API_URLS.local;
  } else {
    // Use production server
    return API_URLS.production;
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    signIn: '/api/auth/signin',
    signUp: '/api/auth/signup',
    signOut: '/api/auth/signout',
  },
  
  // Institutions
  institutions: '/api/institutions',
  institutionById: (id: string) => `/api/institutions/${id}`,
  
  // Programs
  programs: '/api/programs',
  programsByInstitution: (institutionId: string) => `/api/institutions/${institutionId}/programs`,
  
  // Applications
  applications: '/api/applications',
  applicationById: (id: string) => `/api/applications/${id}`,
  submitApplication: '/api/applications/submit',
  
  // Bursaries
  bursaries: '/api/bursaries',
  bursaryById: (id: string) => `/api/bursaries/${id}`,
  
  // Documents
  documents: '/api/documents',
  uploadDocument: '/api/documents/upload',
  
  // Notifications
  notifications: '/api/notifications',
  markAsRead: (id: string) => `/api/notifications/${id}/read`,
  
  // Database setup (development only)
  setupBursaries: '/api/database/setup-bursaries',
  setupInstitutions: '/api/database/setup-institutions',
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
};

// Helper function for making API requests with proper error handling
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = buildApiUrl(endpoint);
  
  console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ API Response: ${endpoint}`, { success: data.success, count: data.count });
    
    return data;
  } catch (error) {
    console.error(`❌ API Error for ${endpoint}:`, error);
    throw error;
  }
};

// Export configuration for debugging
export const API_CONFIG = {
  baseUrl: getApiBaseUrl(),
  isDevelopment,
  localIP: LOCAL_IP,
  endpoints: API_ENDPOINTS,
};

console.log('📡 API Configuration:', API_CONFIG);
