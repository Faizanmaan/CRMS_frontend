export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  name?: string;
  profilePicture?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  isProfileComplete: boolean;
  role: Role;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface AuthResponse {
  message?: string;
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
}

export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isSuperAdmin: () => boolean;
    isAdmin: () => boolean;
    isCustomer: () => boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: (idToken: string) => Promise<void>;
    signup: (email: string, password: string, name?: string) => Promise<void>;
    updateProfile: (data: {
        name: string;
        profilePicture?: string;
        phoneNumber: string;
        country: string;
        city: string;
    }) => Promise<void>;
    logout: () => void;
}
