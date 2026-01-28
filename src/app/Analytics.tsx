import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { TrendingUp, TrendingDown, ArrowRight, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { api } from '../lib/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface VisitorHistory {
    date: string;
    count: number;
}

interface VisitorStats {
    currentMonthCount: number;
    previousMonthCount: number;
    history: VisitorHistory[];
}

interface ComparisonHistory {
    labels: string[];
    currentWeek: number[];
    lastWeek: number[];
    currentWeekTotalRevenue: number;
    lastWeekTotalRevenue: number;
    weeklyRevenueGrowth: number;
}

interface PurchaseSource {
    source: string;
    count: number;
    percentage: number;
}

interface AnalyticsStats {
    totalOrdersCount: number;
    totalOrdersGrowth: number;
    comparisonHistory: ComparisonHistory;
    visitorStats: VisitorStats;
    purchaseSources: PurchaseSource[];
    totalProfit: string;
    totalProfitValue: number;
    profitHistory: { date?: string; profit?: number }[];
    totalExpenses: string;
    totalExpensesValue: number;
    expensesHistory: { date?: string; expenses?: number }[];
    newCustomersStats: {
        current: number;
        growth: number;
        history: { date?: string; count?: number }[];
    };
    monthlyIncomeStats: {
        current: number;
        growth: number;
        history: { month?: string; income?: number }[];
    };
    cityOrderStats: { city: string; orders: number; date: string }[];
    countryOrderStats: { country: string; orders: number; flag: string; coordinates: [number, number]; color: string; change: string; isPositive: boolean }[];
    salesStatistic: {
        totalRevenue: string;
        totalSales: string;
        totalViews: string;
        history: { date: string; revenue: number; sales: number; views: number }[];
    };
    newCustomersCount: string;
    targetOrders: {
        current: number;
        target: number;
        percentage: number;
    };
    hourlySales: Record<string, Record<number, number>>;
    newCustomers: {
        date: string;
        name: string;
        country: string;
        avatar: string;
        status: string;
        total: string;
    }[];
}



const Analytics = () => {
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
    return (
        <div>
            <Header title="Analytics" />

            <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="w-full md:w-4/6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-sm text-gray-500">Overall Sales</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-2xl font-bold text-gray-800">$ {totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${growth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {growth >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                                        {growth >= 0 ? '' : '-'}{Math.abs(growth)}%
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                                    <span className="text-sm text-gray-500">Current Week</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                                    <span className="text-sm text-gray-500">Last Week</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-64 relative">
                            {isLoading ? (
                                <div className="w-full h-full flex items-center justify-center animate-pulse bg-gray-50 rounded-xl">
                                    <p className="text-gray-400 text-sm">Loading Chart...</p>
                                </div>
                            ) : (
                                <Line
                                    data={{
                                        labels: comparisonData.labels,
                                        datasets: [
                                            {
                                                label: 'Current Week',
                                                data: comparisonData.currentWeek,
                                                borderColor: '#a855f7',
                                                backgroundColor: 'transparent',
                                                borderWidth: 3,
                                                pointBackgroundColor: '#a855f7',
                                                pointBorderColor: '#fff',
                                                pointBorderWidth: 2,
                                                pointRadius: 4,
                                                pointHoverRadius: 6,
                                                tension: 0.4,
                                            },
                                            {
                                                label: 'Last Week',
                                                data: comparisonData.lastWeek,
                                                borderColor: '#60a5fa',
                                                backgroundColor: 'transparent',
                                                borderWidth: 3,
                                                pointBackgroundColor: '#60a5fa',
                                                pointBorderColor: '#fff',
                                                pointBorderWidth: 2,
                                                pointRadius: 4,
                                                pointHoverRadius: 6,
                                                tension: 0.4,
                                            }
                                        ]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: {
                                                backgroundColor: '#fff',
                                                titleColor: '#1f2937',
                                                bodyColor: '#4b5563',
                                                borderColor: '#e5e7eb',
                                                borderWidth: 1,
                                                padding: 12,
                                                displayColors: true,
                                                boxPadding: 6,
                                                usePointStyle: true,
                                                callbacks: {
                                                    label: (context) => {
                                                        let label = context.dataset.label || '';
                                                        if (label) label += ': ';
                                                        const val = context.parsed.y ?? 0;
                                                        label += `$ ${val.toLocaleString()}`;
                                                        return label;
                                                    }
                                                }
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                grid: {
                                                    color: '#f3f4f6',
                                                },
                                                ticks: {
                                                    color: '#9ca3af',
                                                    font: { size: 11 },
                                                    callback: (value) => {
                                                        if (Number(value) >= 1000) return (Number(value) / 1000) + 'k';
                                                        return value;
                                                    }
                                                },
                                                border: { display: false }
                                            },
                                            x: {
                                                grid: { display: false },
                                                ticks: {
                                                    color: '#9ca3af',
                                                    font: { size: 11 }
                                                },
                                                border: { display: false }
                                            }
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-2/6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Visitors</h2>

                        <div className="h-48 relative mb-4">
                            {isLoading ? (
                                <div className="w-full h-full flex items-center justify-center animate-pulse bg-gray-50 rounded-xl">
                                    <p className="text-gray-400 text-sm">Loading Chart...</p>
                                </div>
                            ) : (
                                <Bar
                                    data={{
                                        labels: analyticsData?.visitorStats?.history.map((h: VisitorHistory) => h.date) || ['1 Jul', '2 Jul', '3 Jul', '4 Jul', '5 Jul', '6 Jul', '7 Jul'],
                                        datasets: [
                                            {
                                                label: 'Visitors',
                                                data: analyticsData?.visitorStats?.history.map((h: VisitorHistory) => h.count) || [5000, 7000, 4000, 8000, 3000, 17467, 15000],
                                                backgroundColor: (context) => {
                                                    const chart = context.chart;
                                                    const { chartArea } = chart;
                                                    if (!chartArea) return '#C1E1C1';

                                                    const data = context.dataset.data;
                                                    const max = Math.max(...data as number[]);
                                                    return context.raw === max ? '#556B2F' : '#C1E1C1';
                                                },
                                                borderRadius: 4,
                                                barThickness: 20,
                                            }
                                        ]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: {
                                                enabled: true,
                                                backgroundColor: '#556B2F',
                                                titleColor: '#fff',
                                                bodyColor: '#fff',
                                                padding: 8,
                                                displayColors: false,
                                                callbacks: {
                                                    label: (context) => context.raw?.toLocaleString() || ''
                                                }
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                grid: { color: '#f3f4f6' },
                                                ticks: {
                                                    color: '#9ca3af',
                                                    font: { size: 10 },
                                                    callback: (value) => {
                                                        if (Number(value) >= 1000) return (Number(value) / 1000) + 'k';
                                                        return value;
                                                    }
                                                },
                                                border: { display: false }
                                            },
                                            x: {
                                                grid: { display: false },
                                                ticks: {
                                                    color: '#9ca3af',
                                                    font: { size: 10 }
                                                },
                                                border: { display: false }
                                            }
                                        }
                                    }}
                                />
                            )}

                            <button className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg border border-purple-200 bg-white shadow-sm flex items-center justify-center text-purple-500 hover:bg-purple-50 transition-colors">
                                <ArrowRight size={16} />
                            </button>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100">
                            {(analyticsData?.visitorStats?.currentMonthCount ?? 0) > (analyticsData?.visitorStats?.previousMonthCount ?? 0) ? (
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                                        <Award className="w-6 h-6 text-purple-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Awesome!</p>
                                        <p className="text-xs text-gray-400">You just hit a new record!</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3 opacity-50">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                                        <Award className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-500">Keep going!</p>
                                        <p className="text-xs text-gray-400">Reach more visitors this month.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="w-full md:w-1/4">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Source of Purchases</h2>

                        <div className="flex items-center justify-center mb-6 relative">
                            <div className="w-48 h-48">
                                {isLoading ? (
                                    <div className="w-full h-full rounded-full border-8 border-gray-50 animate-pulse flex items-center justify-center">
                                        <span className="text-gray-300 text-xs">Loading...</span>
                                    </div>
                                ) : (
                                    <Doughnut
                                        data={{
                                            labels: analyticsData?.purchaseSources?.map(s => s.source) || ['Social Media', 'Direct Search', 'Others'],
                                            datasets: [
                                                {
                                                    data: analyticsData?.purchaseSources?.map(s => s.count) || [0, 0, 0],
                                                    backgroundColor: ['#3B82F6', '#65A30D', '#EF4444'],
                                                    borderWidth: 0,
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            cutout: '65%',
                                            plugins: {
                                                legend: { display: false },
                                                tooltip: {
                                                    enabled: true,
                                                    callbacks: {
                                                        label: (context) => {
                                                            const label = context.label || '';
                                                            const value = context.raw as number;
                                                            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                                                            const percentage = Math.round((value / total) * 100);
                                                            return `${label}: ${percentage}%`;
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                )}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold text-gray-800">100%</span>
                            </div>
                        </div>

                        <div className="space-y-4 mt-auto">
                            {(analyticsData?.purchaseSources || [
                                { source: 'Social Media', percentage: 49 },
                                { source: 'Direct Search', percentage: 35 },
                                { source: 'Others', percentage: 16 }
                            ]).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: ['#3B82F6', '#65A30D', '#EF4444'][idx % 3] }}
                                        ></div>
                                        <span className="text-sm font-medium text-gray-400">{item.source}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-800">{item.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-3/4">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-800">Sales per Week</h2>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 overflow-x-auto">
                                <div className="grid grid-cols-8 gap-x-4 gap-y-3 text-xs min-w-[600px]">
                                    <div className="flex flex-col justify-between py-1 text-gray-400 font-medium h-[240px]">
                                        {['5PM', '4PM', '3PM', '2PM', '1PM', '12PM'].map((time) => (
                                            <div key={time} className="h-8 flex items-center justify-end pr-2">{time}</div>
                                        ))}
                                        <div className="h-4"></div>
                                    </div>

                                    {Object.keys(analyticsData?.hourlySales || {}).map((dateStr) => (
                                        <div key={dateStr} className="flex flex-col gap-3">
                                            {[17, 16, 15, 14, 13, 12].map((hour) => {
                                                const count = analyticsData?.hourlySales?.[dateStr]?.[hour] || 0;
                                                let bgColor = 'bg-purple-50';
                                                if (count > 5000) bgColor = 'bg-purple-900';
                                                else if (count > 1000) bgColor = 'bg-purple-500';
                                                else if (count > 500) bgColor = 'bg-purple-300';
                                                else if (count > 0) bgColor = 'bg-purple-100';

                                                return (
                                                    <div
                                                        key={`${dateStr}-${hour}`}
                                                        className={`h-8 w-full rounded-lg ${bgColor} transition-colors duration-200`}
                                                        title={`${dateStr} ${hour}:00 - ${count} orders`}
                                                    />
                                                );
                                            })}
                                            <div className="text-center text-gray-400 font-medium mt-1">{dateStr}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center">
                                <button className="w-10 h-10 rounded-lg border border-purple-200 flex items-center justify-center text-purple-500 hover:bg-purple-50 transition-colors shadow-sm">
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 mt-8 pt-6 border-t border-gray-50">
                            <span className="text-sm font-bold text-gray-900">Orders:</span>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-purple-50"></div>
                                    <span className="text-xs font-medium text-gray-500">0-500</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-purple-300"></div>
                                    <span className="text-xs font-medium text-gray-500">501-1,000</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-purple-500"></div>
                                    <span className="text-xs font-medium text-gray-500">1,001-5,000</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-purple-900"></div>
                                    <span className="text-xs font-medium text-gray-500">5,001-10,000</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="w-full md:w-4/6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Sales per Country <span className="text-sm font-normal text-gray-400">({analyticsData?.totalOrdersCount?.toLocaleString() || '0'} Sales)</span>
                            </h2>
                        </div>

                        <div className="relative h-[300px] mt-4">
                            <div className="absolute inset-0 flex ml-[120px] mb-8">
                                {[0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500].map((val, i) => (
                                    <div key={i} className="flex-1 border-l border-gray-100 h-full relative">
                                        <span className="absolute -bottom-6 left-0 -translate-x-1/2 text-[10px] text-gray-400 font-medium">
                                            {val > 0 ? val.toLocaleString() : ''}
                                        </span>
                                    </div>
                                ))}
                                <div className="border-l border-gray-100 h-full"></div>
                            </div>

                            <div className="absolute inset-0 flex flex-col justify-between pb-8">
                                {(analyticsData?.countryOrderStats || []).slice(0, 5).map((item, index) => {
                                    const maxVal = 4500;
                                    const widthPercent = Math.min((item.orders / maxVal) * 100, 100);

                                    return (
                                        <div key={index} className="flex items-center h-8">
                                            <div className="w-[120px] pr-4 text-right text-sm text-gray-600 font-medium truncate">
                                                {item.country}
                                            </div>
                                            <div className="flex-1 h-full relative">
                                                <div
                                                    className={`h-full rounded-r-md transition-all duration-500 ease-out ${index === 0 ? 'bg-blue-500' : 'bg-blue-200'
                                                        }`}
                                                    style={{ width: `${widthPercent}%` }}
                                                    title={`${item.country}: ${item.orders} sales`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-2/6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-800">Sales History</h2>
                            <div className="flex items-center border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setSalesPage(prev => Math.max(prev - 1, 1))}
                                    disabled={salesPage === 1}
                                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 border-r border-gray-100"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setSalesPage(page)}
                                        className={`w-10 h-10 flex items-center justify-center text-sm font-medium transition-colors ${page === salesPage
                                            ? 'bg-purple-500 text-white'
                                            : 'text-purple-400 hover:bg-purple-50'
                                            } ${page !== Math.min(totalPages, 5) ? 'border-r border-gray-100' : ''}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setSalesPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={salesPage === totalPages}
                                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 border-l border-gray-100"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>

                        <div className={`border-t border-gray-50 pt-6 transition-opacity duration-200 ${isSalesLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                            <p className="text-xs font-bold text-gray-400 tracking-wider mb-6">RECENT</p>

                            <div className="space-y-6">
                                {(analyticsData?.newCustomers || []).map((sale, index: number) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img
                                                    src={sale.avatar}
                                                    alt={sale.name}
                                                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-[15px] font-bold text-gray-900 leading-tight">{sale.name}</p>
                                                <p className="text-sm text-gray-400 font-medium mt-0.5">{sale.country}</p>
                                            </div>
                                        </div>
                                        <span className="text-[15px] font-bold text-gray-700">{sale.total}</span>
                                    </div>
                                ))}
                                {(!analyticsData?.newCustomers || analyticsData.newCustomers.length === 0) && !isLoading && !isSalesLoading && (
                                    <div className="text-center py-10">
                                        <p className="text-gray-400 text-sm">No recent sales found</p>
                                    </div>
                                )}
                                {isSalesLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[1px] rounded-2xl">
                                        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default Analytics;
