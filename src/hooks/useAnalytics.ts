import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import type { AnalyticsStats } from '../types/analytics';

export interface UseAnalyticsReturn {
    analyticsData: AnalyticsStats | null;
    isLoading: boolean;
    isSalesLoading: boolean;
    salesPage: number;
    totalPages: number;
    setSalesPage: React.Dispatch<React.SetStateAction<number>>;
    comparisonData: {
        labels: string[];
        currentWeek: number[];
        lastWeek: number[];
        currentWeekTotalRevenue: number;
        lastWeekTotalRevenue: number;
        weeklyRevenueGrowth: number;
    };
    totalSales: number;
    growth: number;
}

export const useAnalytics = (): UseAnalyticsReturn => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSalesLoading, setIsSalesLoading] = useState(false);
    const [salesPage, setSalesPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const isFirstLoad = useRef(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (isFirstLoad.current) {
                    setIsLoading(true);
                    const data = await api.getDashboardStats(salesPage, 4);
                    setAnalyticsData(data.stats);
                    setTotalPages(data.pagination.totalPages);
                    isFirstLoad.current = false;
                } else {
                    setIsSalesLoading(true);
                    const data = await api.getDashboardStats(salesPage, 4, undefined, undefined, undefined, true);
                    setAnalyticsData(prev => prev ? {
                        ...prev,
                        newCustomers: data.stats.newCustomers,
                        newCustomersCount: data.stats.newCustomersCount
                    } : null);
                    setTotalPages(data.pagination.totalPages);
                }
            } catch (error) {
            } finally {
                setIsLoading(false);
                setIsSalesLoading(false);
            }
        };
        fetchData();
    }, [salesPage]);

    const comparisonData = analyticsData?.comparisonHistory || {
        labels: ['1 Jul', '2 Jul', '3 Jul', '4 Jul', '5 Jul', '6 Jul', '7 Jul'],
        currentWeek: [0, 3000, 6000, 9000, 15000, 18000, 22000],
        lastWeek: [0, 2000, 4000, 7000, 10000, 13000, 16000],
        currentWeekTotalRevenue: 73000,
        lastWeekTotalRevenue: 52000,
        weeklyRevenueGrowth: 40.4
    };

    const totalSales = analyticsData?.comparisonHistory?.currentWeekTotalRevenue || 0;
    const growth = analyticsData?.comparisonHistory?.weeklyRevenueGrowth || 0;

    return {
        analyticsData,
        isLoading,
        isSalesLoading,
        salesPage,
        totalPages,
        setSalesPage,
        comparisonData,
        totalSales,
        growth,
    };
};
