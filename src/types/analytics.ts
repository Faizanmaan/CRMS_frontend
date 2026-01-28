export interface VisitorHistory {
    date: string;
    count: number;
}

export interface VisitorStats {
    currentMonthCount: number;
    previousMonthCount: number;
    history: VisitorHistory[];
}

export interface ComparisonHistory {
    labels: string[];
    currentWeek: number[];
    lastWeek: number[];
    currentWeekTotalRevenue: number;
    lastWeekTotalRevenue: number;
    weeklyRevenueGrowth: number;
}

export interface PurchaseSource {
    source: string;
    count: number;
    percentage: number;
}

export interface ProfitHistoryItem {
    date: string;
    profit: number;
}

export interface ExpensesHistoryItem {
    date: string;
    expenses: number;
}

export interface NewCustomersStats {
    current: number;
    growth: number;
    history: { date: string; count: number }[];
}

export interface MonthlyIncomeStats {
    current: number;
    growth: number;
    history: { month: string; income: number }[];
}

export interface CityOrderStats {
    city: string;
    orders: number;
    date: string;
}

export interface CountryOrderStats {
    country: string;
    orders: number;
    flag: string;
    coordinates: [number, number];
    color: string;
    change: string;
    isPositive: boolean;
}

export interface SalesStatistic {
    totalRevenue: string;
    totalSales: string;
    totalViews: string;
    history: { date: string; revenue: number; sales: number; views: number }[];
}

export interface TargetOrders {
    current: number;
    target: number;
    percentage: number;
}

export interface NewCustomer {
    date: string;
    name: string;
    country: string;
    avatar: string;
    status: string;
    total: string;
}

export interface AnalyticsStats {
    totalOrdersCount: number;
    totalOrdersGrowth: number;
    comparisonHistory: ComparisonHistory;
    visitorStats: VisitorStats;
    purchaseSources: PurchaseSource[];
    totalProfit: string;
    totalProfitValue: number;
    profitHistory: ProfitHistoryItem[];
    totalExpenses: string;
    totalExpensesValue: number;
    expensesHistory: ExpensesHistoryItem[];
    newCustomersStats: NewCustomersStats;
    monthlyIncomeStats: MonthlyIncomeStats;
    cityOrderStats: CityOrderStats[];
    countryOrderStats: CountryOrderStats[];
    salesStatistic: SalesStatistic;
    newCustomersCount: string;
    targetOrders: TargetOrders;
    hourlySales: Record<string, Record<number, number>>;
    newCustomers: NewCustomer[];
}
