import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types/auth';

export interface ProfileFormData {
    name: string;
    email: string;
    phoneNumber: string;
    city: string;
    country: string;
}

export interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface UseSettingsReturn {
    profileData: ProfileFormData;
    setProfileData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
    profilePicture: string;
    setProfilePicture: React.Dispatch<React.SetStateAction<string>>;
    isUpdatingProfile: boolean;
    profileError: string;
    profileSuccess: string;
    handleProfileSubmit: (e: React.FormEvent) => Promise<void>;
    handleProfilePictureChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;

    passwordData: PasswordFormData;
    setPasswordData: React.Dispatch<React.SetStateAction<PasswordFormData>>;
    passwordError: string;
    setPasswordError: React.Dispatch<React.SetStateAction<string>>;

    admins: User[];
    customers: User[];
    isLoadingUsers: boolean;
    fetchUsers: () => Promise<void>;
    handleDeleteCustomer: (id: string) => Promise<void>;
}

export const useSettings = (): UseSettingsReturn => {
    const { user, updateProfile } = useAuth();

    const [profileData, setProfileData] = useState<ProfileFormData>({
        name: '',
        email: '',
        phoneNumber: '',
        city: '',
        country: '',
    });
    const [profilePicture, setProfilePicture] = useState('');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');

    const [passwordData, setPasswordData] = useState<PasswordFormData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordError, setPasswordError] = useState('');

    const [admins, setAdmins] = useState<User[]>([]);
    const [customers, setCustomers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                city: user.city || '',
                country: user.country || '',
            });
            setProfilePicture(user.profilePicture || '');
        }
    }, [user]);

    const fetchUsers = async () => {
        if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN') return;
        
        try {
            setIsLoadingUsers(true);
            const [adminsRes, customersRes] = await Promise.all([
                api.getAllAdmins(),
                api.getAllCustomers()
            ]);
            setAdmins(adminsRes.users);
            setCustomers(customersRes.users);
        } catch (err) {
        } finally {
            setIsLoadingUsers(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [user?.role]);

    const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const formData = new FormData();
                formData.append('image', file);
                const response = await api.uploadImage(formData);
                setProfilePicture(response.url);
            } catch (error) {
                setProfileError('Failed to upload image');
            }
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');
        setIsUpdatingProfile(true);

        try {
            await updateProfile({
                name: profileData.name,
                phoneNumber: profileData.phoneNumber,
                city: profileData.city,
                country: profileData.country,
                profilePicture,
            });
            setProfileSuccess('Profile updated successfully');
        } catch (err) {
            setProfileError(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleDeleteCustomer = async (id: string) => {
        if (!confirm('Are you sure you want to delete this customer?')) return;
        try {
            await api.deleteCustomer(id);
            fetchUsers();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete customer');
        }
    };

    return {
        profileData,
        setProfileData,
        profilePicture,
        setProfilePicture,
        isUpdatingProfile,
        profileError,
        profileSuccess,
        handleProfileSubmit,
        handleProfilePictureChange,
        passwordData,
        setPasswordData,
        passwordError,
        setPasswordError,
        admins,
        customers,
        isLoadingUsers,
        fetchUsers,
        handleDeleteCustomer,
    };
};
