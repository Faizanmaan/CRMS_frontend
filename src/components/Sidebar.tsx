import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Bell,
    Users,
    ShoppingCart,
    BarChart3,
    FileText,
    HelpCircle,
    Settings,
    LogOut,
    Package,
    Plus,
    Minus,
    Menu,
    X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { NavItem } from '../types/components';

const adminNavItems: NavItem[] = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { label: 'Notifications', icon: <Bell size={20} />, path: '/notifications' },
    { label: 'Customers', icon: <Users size={20} />, path: '/customers' },
    {
        label: 'Order Overview',
        icon: <ShoppingCart size={20} />,
        path: '/orders',
        subItems: [
            { label: 'Products', path: '/products' }
        ]
    },
    { label: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
    { label: 'Documents', icon: <FileText size={20} />, path: '/documents' },
];

const customerNavItems: NavItem[] = [
    { label: 'My Dashboard', icon: <LayoutDashboard size={20} />, path: '/customer/dashboard' },
    { label: 'My Products', icon: <Package size={20} />, path: '/customer/products' },
    { label: 'My Documents', icon: <FileText size={20} />, path: '/customer/documents' },
    { label: 'Notifications', icon: <Bell size={20} />, path: '/notifications' },
];

const supportNavItems: NavItem[] = [
    { label: 'Help', icon: <HelpCircle size={20} />, path: '/help' },
    { label: 'Settings', icon: <Settings size={20} />, path: '/settings' },
];

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, isCustomer, user } = useAuth();
    const [openMenus, setOpenMenus] = useState<string[]>([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = (label: string) => {
        setOpenMenus(prev =>
            prev.includes(label)
                ? prev.filter(item => item !== label)
                : [...prev, label]
        );
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prev => !prev);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const isActive = (path: string) => {
        if (path === '/' && !isCustomer()) {
            return location.pathname === '/';
        }
        if (path === '/customer/dashboard' && isCustomer()) {
            return location.pathname === '/customer/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getNavItems = () => {
        if (isCustomer()) {
            return customerNavItems;
        }
        return adminNavItems;
    };

    const navItems = getNavItems();

    const getSupportNavItems = () => {
        if (isCustomer()) {
            return supportNavItems.filter(item => item.label !== 'Help');
        }
        return supportNavItems;
    };

    const currentSupportNavItems = getSupportNavItems();

    const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
        <>
            <div className="p-6 pb-4">
                <Link to={isCustomer() ? '/customer/dashboard' : '/'} className="flex items-center gap-1" onClick={onLinkClick}>
                    <span className="text-xl font-bold text-primary-700">swift</span>
                    <span className="text-xl font-bold text-gray-800">CRM</span>
                </Link>
            </div>

            <div className="px-6 pb-4">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${user?.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                    user?.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                    }`}>
                    {user?.role === 'SUPER_ADMIN' ? 'Super Admin' :
                        user?.role === 'ADMIN' ? 'Admin' : 'Customer'}
                </span>
            </div>

            <nav className="flex-1 px-3 overflow-y-auto">
                <div className="mb-6">
                    <span className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {isCustomer() ? 'My Space' : 'General'}
                    </span>
                    <ul className="mt-3 space-y-1">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <div className="flex flex-col">
                                    <div className="flex items-center justify-between group">
                                        <Link
                                            to={item.path}
                                            onClick={onLinkClick}
                                            className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.path)
                                                ? 'bg-primary-100 text-primary-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            <span className={isActive(item.path) ? 'text-primary-600' : 'text-gray-400'}>
                                                {item.icon}
                                            </span>
                                            {item.label}
                                        </Link>
                                        {item.subItems && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleMenu(item.label);
                                                }}
                                                className="p-1.5 mr-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                                            >
                                                {openMenus.includes(item.label) ? <Minus size={14} /> : <Plus size={14} />}
                                            </button>
                                        )}
                                    </div>

                                    {item.subItems && openMenus.includes(item.label) && (
                                        <ul className="mt-1 ml-9 space-y-1 border-l border-gray-100 pl-3">
                                            {item.subItems.map((subItem) => (
                                                <li key={subItem.path}>
                                                    <Link
                                                        to={subItem.path}
                                                        onClick={onLinkClick}
                                                        className={`block py-2 text-sm font-medium transition-all duration-200 ${isActive(subItem.path)
                                                            ? 'text-primary-700'
                                                            : 'text-gray-500 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        {subItem.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mb-6">
                    <span className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Support
                    </span>
                    <ul className="mt-3 space-y-1">
                        {currentSupportNavItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    onClick={onLinkClick}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.path)
                                        ? 'bg-primary-100 text-primary-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <span className={isActive(item.path) ? 'text-primary-600' : 'text-gray-400'}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    onLinkClick?.();
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            >
                                <span className="text-gray-400">
                                    <LogOut size={20} />
                                </span>
                                Log Out
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    );

    return (
        <>
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link to={isCustomer() ? '/customer/dashboard' : '/'} className="flex items-center gap-1">
                        <span className="text-xl font-bold text-primary-700">swift</span>
                        <span className="text-xl font-bold text-gray-800">CRM</span>
                    </Link>

                    <button
                        onClick={toggleMobileMenu}
                        className={`p-2.5 rounded-lg transition-colors ${isMobileMenuOpen
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/30 z-40"
                    onClick={closeMobileMenu}
                />
            )}

            <aside
                className={`md:hidden fixed top-0 left-0 right-0 bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
                    }`}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <Link to={isCustomer() ? '/customer/dashboard' : '/'} className="flex items-center gap-1" onClick={closeMobileMenu}>
                        <span className="text-xl font-bold text-primary-700">swift</span>
                        <span className="text-xl font-bold text-gray-800">CRM</span>
                    </Link>
                    <button
                        onClick={closeMobileMenu}
                        className="p-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="px-4 py-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <div className="flex flex-col">
                                    <div className="flex items-center justify-between">
                                        <Link
                                            to={item.path}
                                            onClick={closeMobileMenu}
                                            className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${isActive(item.path)
                                                ? 'bg-primary-100 text-primary-700'
                                                : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className={isActive(item.path) ? 'text-primary-600' : 'text-gray-500'}>
                                                {item.icon}
                                            </span>
                                            {item.label}
                                        </Link>
                                        {item.subItems && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleMenu(item.label);
                                                }}
                                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                                            >
                                                {openMenus.includes(item.label) ? <Minus size={16} /> : <Plus size={16} />}
                                            </button>
                                        )}
                                    </div>

                                    {item.subItems && openMenus.includes(item.label) && (
                                        <ul className="mt-1 ml-10 space-y-1 border-l-2 border-gray-100 pl-4">
                                            {item.subItems.map((subItem) => (
                                                <li key={subItem.path}>
                                                    <Link
                                                        to={subItem.path}
                                                        onClick={closeMobileMenu}
                                                        className={`block py-2.5 text-base font-medium transition-all duration-200 ${isActive(subItem.path)
                                                            ? 'text-primary-700'
                                                            : 'text-gray-500 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        {subItem.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </li>
                        ))}

                        <li className="py-2">
                            <div className="border-t border-gray-100"></div>
                        </li>
                        {currentSupportNavItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    onClick={closeMobileMenu}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${isActive(item.path)
                                        ? 'bg-primary-100 text-primary-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className={isActive(item.path) ? 'text-primary-600' : 'text-gray-500'}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </Link>
                            </li>
                        ))}

                        <li>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    closeMobileMenu();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 text-gray-700 hover:bg-gray-50"
                            >
                                <span className="text-gray-500">
                                    <LogOut size={20} />
                                </span>
                                Log Out
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>

            <aside className="hidden md:block w-[220px] h-screen bg-white/80 backdrop-blur-sm border rounded-2xl border-gray-100 shadow-sm">
                <SidebarContent />
            </aside>
        </>
    );
};

export default Sidebar;
