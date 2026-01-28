import React, { useState, useEffect } from 'react';
import {
    User,
    Lock,
    Mail,
    Phone,
    Globe,
    MapPin,
    Camera,
    Save,
    CheckCircle,
    AlertCircle,
    Loader2,
    Shield,
    Users,
    UserPlus,
    Plus,
    Trash2,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, type User as UserType } from '../lib/api';

const Settings: React.FC = () => {
    const { user, updateProfile, isSuperAdmin } = useAuth();

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        country: user?.country || '',
        city: user?.city || '',
        profilePicture: user?.profilePicture || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [admins, setAdmins] = useState<UserType[]>([]);
    const [customers, setCustomers] = useState<UserType[]>([]);
    const [activeTab, setActiveTab] = useState<'admins' | 'customers'>('admins');
    const [isUsersLoading, setIsUsersLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'admin' | 'customer'>('admin');
    const [userFormData, setUserFormData] = useState({ email: '', password: '', name: '' });
    const [userFormError, setUserFormError] = useState('');
    const [isUserCreating, setIsUserCreating] = useState(false);

    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                country: user.country || '',
                city: user.city || '',
                profilePicture: user.profilePicture || '',
            });
        }
    }, [user]);

    const fetchUsers = async () => {
        if (!isSuperAdmin()) return;
        try {
            setIsUsersLoading(true);
            const [adminsRes, customersRes] = await Promise.all([
                api.getAllAdmins(),
                api.getAllCustomers(),
            ]);
            setAdmins(adminsRes.users);
            setCustomers(customersRes.users);
        } catch (err) {
        } finally {
            setIsUsersLoading(false);
        }
    };

    useEffect(() => {
        if (isSuperAdmin()) {
            fetchUsers();
        }
    }, [isSuperAdmin()]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setProfileMessage({ type: 'error', text: 'Please select an image file' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setProfileMessage({ type: 'error', text: 'Image size should be less than 5MB' });
            return;
        }

        setIsUploading(true);
        setProfileMessage(null);

        try {
            const uploadFormData = new FormData();
            uploadFormData.append('image', file);
            const response = await api.uploadImage(uploadFormData);
            setProfileData(prev => ({ ...prev, profilePicture: response.url }));
            setProfileMessage({ type: 'success', text: 'Image uploaded successfully!' });
        } catch (err) {
            setProfileMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to upload image' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProfileLoading(true);
        setProfileMessage(null);

        try {
            await updateProfile({
                name: profileData.name,
                phoneNumber: profileData.phoneNumber,
                country: profileData.country,
                city: profileData.city,
                profilePicture: profileData.profilePicture,
            });
            setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error: unknown) {
            setProfileMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update profile' });
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setIsPasswordLoading(true);
        setPasswordMessage(null);

        try {
            await api.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: unknown) {
            setPasswordMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to change password' });
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setUserFormError('');
        setIsUserCreating(true);
        try {
            if (modalType === 'admin') {
                await api.createAdmin(userFormData.email, userFormData.password, userFormData.name);
            } else {
                await api.createCustomer(userFormData.email, userFormData.password, userFormData.name);
            }
            setShowModal(false);
            setUserFormData({ email: '', password: '', name: '' });
            fetchUsers();
        } catch (err) {
            setUserFormError(err instanceof Error ? err.message : 'Failed to create user');
        } finally {
            setIsUserCreating(false);
        }
    };

    const handleDeleteUser = async (id: string, type: 'admin' | 'customer') => {
        if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
        try {
            if (type === 'admin') {
                await api.deleteAdmin(id);
            } else {
                await api.deleteCustomer(id);
            }
            fetchUsers();
        } catch (err) {
        }
    };

    const openCreateModal = (type: 'admin' | 'customer') => {
        setModalType(type);
        setShowModal(true);
        setUserFormError('');
        setUserFormData({ email: '', password: '', name: '' });
    };

    const usersList = activeTab === 'admins' ? admins : customers;
    const totalPages = Math.ceil(usersList.length / ITEMS_PER_PAGE);
    const paginatedUsers = usersList.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
            </div>

            <div className="space-y-8">
                {isSuperAdmin() && (
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary-100 rounded-lg">
                                        <UserPlus className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openCreateModal('admin')}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-all shadow-sm"
                                    >
                                        <UserPlus size={16} />
                                        Add Admin
                                    </button>
                                    <button
                                        onClick={() => openCreateModal('customer')}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-all shadow-sm"
                                    >
                                        <Plus size={16} />
                                        Add Customer
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center gap-6 mb-6 border-b border-gray-100">
                                <button
                                    onClick={() => setActiveTab('admins')}
                                    className={`flex items-center gap-2 pb-3 text-sm font-medium transition-all relative ${activeTab === 'admins' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Shield size={16} />
                                    Admins ({admins.length})
                                    {activeTab === 'admins' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />}
                                </button>
                                <button
                                    onClick={() => setActiveTab('customers')}
                                    className={`flex items-center gap-2 pb-3 text-sm font-medium transition-all relative ${activeTab === 'customers' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Users size={16} />
                                    Customers ({customers.length})
                                    {activeTab === 'customers' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />}
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                {isUsersLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50/50">
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {paginatedUsers.map((u) => (
                                                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                                {(u.name || u.email)[0].toUpperCase()}
                                                            </div>
                                                            <span className="text-sm font-semibold text-gray-900">{u.name || 'N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 text-sm text-gray-600">{u.email}</td>
                                                    <td className="py-4 px-4">
                                                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${u.role === 'ADMIN' ? 'bg-primary-100 text-primary-700' : 'bg-primary-100 text-primary-700'
                                                            }`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-sm text-gray-500">
                                                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        <button
                                                            onClick={() => handleDeleteUser(u.id, activeTab === 'admins' ? 'admin' : 'customer')}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {usersList.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="py-12 text-center text-gray-400 text-sm italic">
                                                        No {activeTab} found in the system
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-6">
                                    <p className="text-sm text-gray-500">
                                        Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, usersList.length)}</span> of <span className="font-medium">{usersList.length}</span> {activeTab}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            Previous
                                        </button>
                                        <div className="flex items-center gap-1 px-2">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-lg transition-all ${currentPage === page
                                                        ? 'bg-indigo-600 text-white shadow-sm'
                                                        : 'text-gray-500 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-100 rounded-lg">
                                <User className="w-5 h-5 text-primary-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                        </div>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
                        {profileMessage && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                }`}>
                                {profileMessage.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                <p className="text-sm font-medium">{profileMessage.text}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed outline-none"
                                        disabled
                                    />
                                </div>
                                <p className="text-xs text-gray-400">Email cannot be changed</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={profileData.phoneNumber}
                                        onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                        placeholder="+1 234 567 890"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Country</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={profileData.country}
                                        onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                        placeholder="United States"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">City</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={profileData.city}
                                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                        placeholder="New York"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Profile Picture</label>
                                <div className="flex items-center gap-4">
                                    <div className="relative group">
                                        <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                                            {profileData.profilePicture ? (
                                                <img
                                                    src={profileData.profilePicture}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-10 h-10 text-gray-400" />
                                            )}
                                            {isUploading && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <label
                                            htmlFor="profile-upload"
                                            className="absolute bottom-0 right-0 p-1.5 bg-primary-600 rounded-full text-white cursor-pointer hover:bg-primary-700 transition-colors shadow-sm"
                                        >
                                            <Camera className="w-4 h-4" />
                                            <input
                                                type="file"
                                                id="profile-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={isUploading}
                                            />
                                        </label>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">
                                            Upload a profile picture. JPG, PNG or GIF. Max 5MB.
                                        </p>
                                        {isUploading && (
                                            <p className="text-xs text-primary-600 font-medium mt-1">
                                                Uploading image...
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isProfileLoading}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                            >
                                {isProfileLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </section>

                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Lock className="w-5 h-5 text-purple-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Security & Password</h2>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
                        {passwordMessage && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                }`}>
                                {passwordMessage.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                <p className="text-sm font-medium">{passwordMessage.text}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Current Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="hidden md:block"></div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isPasswordLoading}
                                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                            >
                                {isPasswordLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                                Update Password
                            </button>
                        </div>
                    </form>
                </section>


            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">
                                Create New {modalType === 'admin' ? 'Admin' : 'Customer'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            {userFormError && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {userFormError}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    value={userFormData.name}
                                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Email Address *</label>
                                <input
                                    type="email"
                                    value={userFormData.email}
                                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Password *</label>
                                <input
                                    type="password"
                                    value={userFormData.password}
                                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUserCreating}
                                    className="flex-1 px-4 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                                >
                                    {isUserCreating && <Loader2 size={18} className="animate-spin" />}
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
