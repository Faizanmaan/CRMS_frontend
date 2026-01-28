import type {
    AnalyticsStats,
    NewCustomer,
    TargetOrders,
    MonthlyIncomeStats,
    NewCustomersStats,
    ProfitHistoryItem,
    ExpensesHistoryItem,
    CityOrderStats,
} from './analytics';

export type {
    AnalyticsStats,
    NewCustomer,
    TargetOrders,
    MonthlyIncomeStats,
    NewCustomersStats,
    ProfitHistoryItem,
    ExpensesHistoryItem,
    CityOrderStats,
};

export interface BestSellingProduct {
    name: string;
    brand: string;
    price: string;
    image: string;
    totalSold: number;
    stockQuantity: number;
    availableStock: number;
    status: 'Available' | 'Out of Stock';
}

export interface DashboardStats extends AnalyticsStats {
}

export interface MapPosition {
    coordinates: [number, number];
    zoom: number;
}

export interface PaginationState {
    currentPage: number;
    totalPages: number;
    limit: number;
}
