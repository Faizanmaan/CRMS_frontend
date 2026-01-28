import React, { useState, useEffect } from 'react';
import { Bell, User, Package, FileText, UserPlus, Trash2, Edit, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, type Notification } from '../lib/api';

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20;

    useEffect(() => {
        fetchNotifications();
    }, [currentPage]);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const response = await api.getNotifications(currentPage, limit);
            setNotifications(response.notifications);
            setTotalPages(response.pagination.pages);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    const getIcon = (entityType: string, action: string) => {
        if (action === 'deleted' || action === 'removed') return <Trash2 className="w-5 h-5 text-red-500" />;
        if (action === 'updated' || action === 'edited') return <Edit className="w-5 h-5 text-blue-500" />;
        if (action === 'registered' || action === 'added' || action === 'created') {
            if (entityType === 'Customer' || entityType === 'Admin') return <UserPlus className="w-5 h-5 text-green-500" />;
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        }

        switch (entityType) {
            case 'Product': return <Package className="w-5 h-5 text-purple-500" />;
            case 'Document': return <FileText className="w-5 h-5 text-orange-500" />;
            case 'Customer':
            case 'Admin': return <User className="w-5 h-5 text-blue-500" />;
            default: return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="p-y max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Bell className="w-8 h-8 text-primary-600" />
                        Activity Notifications
                    </h1>
                    <p className="text-gray-500 mt-1">Stay updated with the latest activities across the system</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                        <p className="text-gray-500">Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <div className="bg-gray-50 p-6 rounded-full mb-4">
                            <Bell className="w-12 h-12 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No notifications yet</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mt-2">
                            Activities like new registrations, product updates, and document uploads will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors flex gap-4 items-start">
                                <div className="flex-shrink-0 mt-1">
                                    {notification.actorAvatar ? (
                                        <img
                                            src={notification.actorAvatar}
                                            alt={notification.actorName}
                                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold border border-primary-100">
                                            {notification.actorName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-grow">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-900">{notification.actorName}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${notification.actorRole === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                                            notification.actorRole === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                            {notification.actorRole === 'SUPER_ADMIN' ? 'Super Admin' :
                                                notification.actorRole === 'ADMIN' ? 'Admin' : 'Customer'}
                                        </span>
                                    </div>

                                    <p className="text-gray-700 flex items-center gap-2">
                                        {getIcon(notification.entityType, notification.action)}
                                        <span>
                                            <span className="capitalize">{notification.action}</span> {notification.entityType.toLowerCase()}
                                            {notification.entityName && <span className="font-medium text-gray-900"> "{notification.entityName}"</span>}
                                            {notification.details && <span className="text-gray-500 text-sm ml-1">{notification.details}</span>}
                                        </span>
                                    </p>

                                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                                        <Clock className="w-3 h-3" />
                                        {new Intl.DateTimeFormat('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            hour12: true
                                        }).format(new Date(notification.createdAt))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && notifications.length > 0 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing page <span className="font-medium text-gray-900">{currentPage}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
