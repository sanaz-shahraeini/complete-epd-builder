import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  username?: string
  first_name: string
  last_name: string
  email: string
  user_type: 'regular' | 'company' | 'admin'
  profile_picture_url?: string
  company_name?: string
  city?: string
  country?: string
}

interface UserStore {
  user: User | null
  showSignInModal: boolean
  isUpdating: boolean
  lastUpdated: number
  setUser: (user: User) => void
  clearUser: () => void
  updateUser: (updates: Partial<User>) => void
  setShowSignInModal: (show: boolean) => void
}

// Utility to check if we're on the profile page - improved to be more reliable
const isProfilePage = () => {
  if (typeof window === 'undefined') return false;
  
  // More comprehensive check for profile paths
  const path = window.location.pathname;
  return path.includes('/dashboard/profile') || 
         path.includes('/epd/en/dashboard/profile') || 
         path.includes('/epd/en/en/dashboard/profile') ||
         path.match(/\/epd\/[a-z]{2}\/dashboard\/profile/);
};

// Debounce helper to prevent multiple rapid updates
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func(...args);
    }, wait);
  };
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      showSignInModal: false,
      isUpdating: false,
      lastUpdated: 0,
      setUser: (user) => {
        // Skip if user is null or undefined
        if (!user) {
          console.log('Skipping update for null/undefined user');
          return;
        }
        
        // Prevent updates on profile page
        if (isProfilePage()) {
          console.log('Skipping user update on profile page');
          return;
        }
        
        // Prevent updates if already updating or updated very recently
        const currentState = get();
        const now = Date.now();
        
        // If the user data is identical, skip update
        if (currentState.user && JSON.stringify(currentState.user) === JSON.stringify(user)) {
          console.log('Skipping identical user update');
          return;
        }
        
        if (currentState.isUpdating || (now - currentState.lastUpdated < 500)) {
          console.log('Skipping rapid consecutive user update');
          return;
        }
        
        // Set updating flag
        set({ isUpdating: true });
        
        // Debounce the actual update
        setTimeout(() => {
          console.log('Setting user in store:', user);
          set({ 
            user, 
            isUpdating: false, 
            lastUpdated: Date.now() 
          });
        }, 50);
      },
      clearUser: () => {
        console.log('Clearing user from store');
        set({ 
          user: null, 
          isUpdating: false,
          lastUpdated: Date.now()
        });
      },
      updateUser: (updates) => {
        // Prevent updates on profile page
        if (isProfilePage()) {
          console.log('Skipping user update on profile page');
          return;
        }
        
        console.log('Updating user in store:', updates);
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
          lastUpdated: Date.now()
        }));
      },
      setShowSignInModal: (show) => {
        console.log('Setting showSignInModal:', show);
        set({ showSignInModal: show });
      },
    }),
    {
      name: 'user-store',
      version: 1,
      onRehydrateStorage: () => (state) => {
        console.log('Hydrated state:', state);
      },
    }
  )
)
