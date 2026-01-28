import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types/auth';

interface RoleProtectedRouteProps {
    allowedRoles: Role[];
    redirectTo?: string;
}

const RoleProtectedRoute = ({ allowedRoles, redirectTo }: RoleProtectedRouteProps) => {
    const { user, isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!user || !allowedRoles.includes(user.role)) {
        const defaultRedirect = redirectTo || getDefaultRedirect(user?.role);
        return <Navigate to={defaultRedirect} replace />;
    }

    return <Outlet />;
};

function getDefaultRedirect(role?: Role): string {
    switch (role) {
        case 'SUPER_ADMIN':
        case 'ADMIN':
            return '/';
        case 'CUSTOMER':
            return '/customer/dashboard';
        default:
            return '/login';
    }
}

export default RoleProtectedRoute;
