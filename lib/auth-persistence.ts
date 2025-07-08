import { 
  Auth, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence, 
  inMemoryPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  UserCredential
} from 'firebase/auth';

export type PersistenceType = 'local' | 'session' | 'none';

export interface PersistenceConfig {
  type: PersistenceType;
  rememberMe?: boolean;
  description: string;
}

export const PERSISTENCE_OPTIONS: Record<PersistenceType, PersistenceConfig> = {
  local: {
    type: 'local',
    description: 'Stay signed in even after closing browser (recommended for personal devices)',
    rememberMe: true
  },
  session: {
    type: 'session',
    description: 'Stay signed in until browser tab is closed (good for shared computers)',
    rememberMe: false
  },
  none: {
    type: 'none',
    description: 'Sign out when page refreshes (most secure for sensitive data)',
    rememberMe: false
  }
};

export const getPersistenceMethod = (type: PersistenceType) => {
  switch (type) {
    case 'local':
      return browserLocalPersistence;
    case 'session':
      return browserSessionPersistence;
    case 'none':
      return inMemoryPersistence;
    default:
      return browserLocalPersistence;
  }
};

export const setAuthPersistence = async (auth: Auth, type: PersistenceType): Promise<void> => {
  // Only set persistence in browser environment
  if (typeof window === 'undefined') {
    console.log('Skipping auth persistence setup in server environment');
    return;
  }

  try {
    const persistenceMethod = getPersistenceMethod(type);
    await setPersistence(auth, persistenceMethod);
    
    // Store the user's preference
    localStorage.setItem('auth_persistence_preference', type);
    
    console.log(`Auth persistence set to: ${type}`);
  } catch (error) {
    console.error('Error setting auth persistence:', error);
    throw error;
  }
};

export const getStoredPersistencePreference = (): PersistenceType => {
  if (typeof window === 'undefined') return 'local';
  
  const stored = localStorage.getItem('auth_persistence_preference');
  return (stored as PersistenceType) || 'local';
};

export const initializeAuthPersistence = async (auth: Auth): Promise<void> => {
  // Only initialize in browser environment
  if (typeof window === 'undefined') {
    console.log('Skipping auth persistence initialization in server environment');
    return;
  }
  
  // Always default to local persistence to keep users logged in
  await setAuthPersistence(auth, 'local');
};

// Enhanced sign-in functions that always use local persistence by default
export const signInWithPersistence = async (
  auth: Auth,
  email: string,
  password: string,
  persistenceType: PersistenceType = 'local'
): Promise<UserCredential> => {
  await setAuthPersistence(auth, persistenceType);
  return signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGooglePersistence = async (
  auth: Auth,
  persistenceType: PersistenceType = 'local',
  usePopup: boolean = true
): Promise<UserCredential> => {
  await setAuthPersistence(auth, persistenceType);
  
  const provider = new GoogleAuthProvider();
  
  if (usePopup) {
    return signInWithPopup(auth, provider);
  } else {
    await signInWithRedirect(auth, provider);
    throw new Error('Redirect flow initiated - handle result on page load');
  }
};

// Utility function to check if current device is shared/public
export const isSharedDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check for common shared device indicators
  const userAgent = navigator.userAgent.toLowerCase();
  const isPublicComputer = userAgent.includes('kiosk') || 
                          userAgent.includes('public') ||
                          window.location.hostname.includes('library') ||
                          window.location.hostname.includes('public');
  
  return isPublicComputer;
};

// Auto-detect and suggest appropriate persistence
export const getRecommendedPersistence = (): PersistenceType => {
  if (isSharedDevice()) {
    return 'session';
  }
  
  // Check if user has explicitly set a preference
  const stored = getStoredPersistencePreference();
  if (stored !== 'local') {
    return stored;
  }
  
  // Default to local for personal devices
  return 'local';
};

// Function to handle "Remember Me" functionality
export const handleRememberMe = async (
  auth: Auth,
  rememberMe: boolean,
  signInFunction: () => Promise<UserCredential>
): Promise<UserCredential> => {
  const persistenceType = rememberMe ? 'local' : 'session';
  await setAuthPersistence(auth, persistenceType);
  return signInFunction();
}; 