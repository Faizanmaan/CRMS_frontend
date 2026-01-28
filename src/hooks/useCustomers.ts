import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { User } from '../types/auth';

export interface UseCustomersReturn {
    customers: (User & { status?: string })[];
    selectedIds: string[];
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    paginatedCustomers: (User & { status?: string })[];
    totalCustomers: number;
    newCustomers: number;
    totalMembers: number;
    nonMembers: number;
    fetchCustomers: () => Promise<void>;
    handleBulkDelete: () => Promise<void>;
    handleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectOne: (id: string) => void;
}

const ITEMS_PER_PAGE = 10;

export const useCustomers = (): UseCustomersReturn => {
    const [customers, setCustomers] = useState<(User & { status?: string })[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchCustomers = async () => {
        try {
            const res = await api.getAllCustomers();
            const customersWithStatus = res.users.map(user => ({
                ...user,
                status: Math.random() > 0.3 ? 'Online' : 'Offline'
            }));
            setCustomers(customersWithStatus);
        } catch (err) {
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} customers?`)) return;
        try {
            for (const id of selectedIds) {
                await api.deleteCustomer(id);
            }
            fetchCustomers();
            setSelectedIds([]);
        } catch (err) {
            alert('Failed to delete some customers');
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(customers.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const totalPages = Math.ceil(customers.length / ITEMS_PER_PAGE);
    const paginatedCustomers = customers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const totalCustomers = customers.length;
    const newCustomers = customers.filter(c => {
        const date = c.createdAt ? new Date(c.createdAt) : new Date();
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    const totalMembers = Math.floor(totalCustomers * 0.8);
    const nonMembers = totalCustomers - totalMembers;

    return {
        customers,
        selectedIds,
        setSelectedIds,
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedCustomers,
        totalCustomers,
        newCustomers,
        totalMembers,
        nonMembers,
        fetchCustomers,
        handleBulkDelete,
        handleSelectAll,
        handleSelectOne,
    };
};
