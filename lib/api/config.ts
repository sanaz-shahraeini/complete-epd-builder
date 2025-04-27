export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://epd-fullstack-project.vercel.app'

// WebSocket configuration
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || (
  typeof window !== 'undefined' 
    ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8000`
    : 'ws://127.0.0.1:8000'
)

export const WS_ROUTES = {
  NOTIFICATIONS: '/ws/notifications/',
} as const;

export const API_ROUTES = {
  AUTH: {
    SIGNIN: '/users/signin/',
    SIGNUP: '/users/signup',
    PROFILE: '/users/profile',
    FORGOT_PASSWORD: '/users/forgot-password',
    VERIFY_CODE: '/users/verify-code',
    RESET_PASSWORD: '/users/reset-password',
    RESEND_CODE: '/users/resend-code',
    LOG: '/users/_log',
    ERROR: '/users/error',
    SESSION: '/users/session',
    CALLBACK: '/users/callback',
    SIGNOUT: '/users/signout',
  },
  PRODUCTS: {
    LIST: '/api/products/',
    IBU_DATA: '/api/ibudata-full',
    ROOT: '/',
  },
} as const;

// Helper function to build full API URLs when needed
export const buildApiUrl = (path: string) => {
  // Ensure path starts with a slash if not empty
  const formattedPath = path && !path.startsWith('/') ? `/${path}` : path;
  return `${API_BASE_URL}${formattedPath}`;
};

// Helper function to build full WebSocket URLs
export const buildWsUrl = (path: string) => {
  // Ensure path starts with a slash if not empty
  const formattedPath = path && !path.startsWith('/') ? `/${path}` : path;
  return `${WS_BASE_URL}${formattedPath}`;
};
