import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import type { AnalyticsStats, NewCustomer } from '../types/analytics';
import type { BestSellingProduct, MapPosition } from '../types/dashboard';

export interface UseDashboardReturn {
    stats: AnalyticsStats | null;
    newCustomers: NewCustomer[];
    bestSellingProducts: BestSellingProduct[];
    isLoading: boolean;
    isTableLoading: boolean;
    
    currentPage: number;
    totalPages: number;
    handlePageChange: (page: number) => void;
    
    position: MapPosition;
    isMapFullScreen: boolean;
    setIsMapFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
    handleZoomIn: () => void;
    handleZoomOut: () => void;
    handleMoveEnd: (position: MapPosition) => void;
}

const LIMIT = 6;

export const useDashboard = (): UseDashboardReturn => {
    const [newCustomers, setNewCustomers] = useState<NewCustomer[]>([]);
    const [bestSellingProducts, setBestSellingProducts] = useState<BestSellingProduct[]>([]);
    const [stats, setStats] = useState<AnalyticsStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [position, setPosition] = useState<MapPosition>({ coordinates: [-96, 38], zoom: 1 });
    const [isMapFullScreen, setIsMapFullScreen] = useState(false);
    const isFirstLoad = useRef(true);

    const handleZoomIn = () => {
        if (position.zoom >= 4) return;
        setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
    };

    const handleZoomOut = () => {
        if (position.zoom <= 1) return;
        setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
    };

    const handleMoveEnd = (newPosition: MapPosition) => {
        setPosition(newPosition);
    };

    const fetchStats = async (page: number, isPagination: boolean = false) => {
        try {
            if (isPagination) {
                setIsTableLoading(true);
                const data = await api.getDashboardStats(page, LIMIT, undefined, undefined, undefined, true);
                setNewCustomers(data.stats?.newCustomers || []);
                setTotalPages(data.pagination.totalPages);
                setCurrentPage(data.pagination.currentPage);
            } else {
                setIsLoading(true);
                const data = await api.getDashboardStats(page, LIMIT);
                setNewCustomers(data.stats?.newCustomers || []);
                setBestSellingProducts(data.bestSellingProducts);
                setStats(data.stats);
                setTotalPages(data.pagination.totalPages);
                setCurrentPage(data.pagination.currentPage);
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
            setIsTableLoading(false);
        }
    };

    useEffect(() => {
        if (isFirstLoad.current) {
            fetchStats(currentPage);
            isFirstLoad.current = false;
        } else {
            fetchStats(currentPage, true);
        }
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return {
        stats,
        newCustomers,
        bestSellingProducts,
        isLoading,
        isTableLoading,
        currentPage,
        totalPages,
        handlePageChange,
        position,
        isMapFullScreen,
        setIsMapFullScreen,
        handleZoomIn,
        handleZoomOut,
        handleMoveEnd,
    };
};
