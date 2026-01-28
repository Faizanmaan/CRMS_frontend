import { useState, useEffect } from 'react';
import { api, type Product, type ProductSelection, type Document } from '../lib/api';

export interface CustomerDashboardProduct {
    id: string;
    name: string;
    status: 'Pending' | 'Success';
    price: number;
    quantity: number;
}

export interface CustomerDashboardStats {
    totalProducts: number;
    totalSpent: number;
    pendingProducts: number;
    completedProducts: number;
    recentProducts: CustomerDashboardProduct[];
}

export interface DocumentStats {
    total: number;
    active: number;
    archived: number;
}

export interface UseCustomerDashboardReturn {
    stats: CustomerDashboardStats | null;
    documentStats: DocumentStats;
    isLoading: boolean;
}

export const useCustomerDashboard = (): UseCustomerDashboardReturn => {
    const [stats, setStats] = useState<CustomerDashboardStats | null>(null);
    const [documentStats, setDocumentStats] = useState<DocumentStats>({ total: 0, active: 0, archived: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const [productsRes, documentsRes] = await Promise.all([
                    api.getProducts(),
                    api.getDocuments()
                ]);

                const products = productsRes.products;
                const documents = documentsRes.documents;

                const totalSpent = products.reduce((acc: number, p: Product | ProductSelection) => acc + (p.price * p.quantity), 0);
                const pendingProducts = products.filter((p: Product | ProductSelection) => p.status === 'Pending' || !p.status).length;
                const completedProducts = products.filter((p: Product | ProductSelection) => p.status === 'Success').length;

                setStats({
                    totalProducts: products.length,
                    totalSpent,
                    pendingProducts,
                    completedProducts,
                    recentProducts: products.slice(0, 5).map((p: Product | ProductSelection) => ({
                        id: p.id,
                        name: p.name,
                        status: (p.status || 'Pending') as 'Pending' | 'Success',
                        price: p.price,
                        quantity: p.quantity,
                    })),
                });

                setDocumentStats({
                    total: documents.length,
                    active: documents.filter((d: Document) => d.status === 'Active').length,
                    archived: documents.filter((d: Document) => d.status === 'Archive').length,
                });
            } catch (err) {
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return {
        stats,
        documentStats,
        isLoading,
    };
};
