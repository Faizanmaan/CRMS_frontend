import { useState, useEffect } from 'react';
import { api, type Notification } from '../lib/api';

export interface UseNotificationsReturn {
    notifications: Notification[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export const useNotifications = (): UseNotificationsReturn => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setIsLoading(true);
                const res = await api.getNotifications(currentPage, 20);
                setNotifications(res.notifications);
                setTotalPages(res.pagination.pages);
            } catch (err) {
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotifications();
    }, [currentPage]);

    return {
        notifications,
        isLoading,
        currentPage,
        totalPages,
        setCurrentPage,
    };
};
