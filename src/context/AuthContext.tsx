import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../lib/api';
import type { User, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = api.getToken();
            if (token) {
                try {
                    const response = await api.getCurrentUser();
                    setUser(response.user);
                } catch {
                    api.logout();
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await api.login(email, password);
        setUser(response.user);
    };

    const loginWithGoogle = async (idToken: string) => {
        const response = await api.googleLogin(idToken);
        setUser(response.user);
    };

    const signup = async (email: string, password: string, name?: string) => {
        const response = await api.signup(email, password, name);
        setUser(response.user);
    };

    const logout = () => {
        api.logout();
        setUser(null);
    };

    const updateProfile = async (data: {
        name: string;
        profilePicture?: string;
        phoneNumber: string;
        country: string;
        city: string;
    }) => {
        const response = await api.updateProfile(data);
        setUser(response.user);
    };

    const isSuperAdmin = () => user?.role === 'SUPER_ADMIN';
    const isAdmin = () => user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
    const isCustomer = () => user?.role === 'CUSTOMER';

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                isSuperAdmin,
                isAdmin,
                isCustomer,
                login,
                loginWithGoogle,
                signup,
                updateProfile,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
