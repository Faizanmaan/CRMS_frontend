import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { TrendingDown, TrendingUp, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { api, type DashboardStats } from '../lib/api';
import type { BestSellingProduct } from '../types/dashboard';
import type { NewCustomer } from '../types/analytics';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { geoCentroid, geoAlbersUsa } from "d3-geo";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface CityMapProps {
    stats: DashboardStats | null;
    position: { coordinates: [number, number]; zoom: number };
    onZoomIn: () => void;
    onZoomOut: () => void;
    onMoveEnd: (position: { coordinates: [number, number]; zoom: number }) => void;
    onToggleFullScreen: () => void;
    isFullScreen?: boolean;
}

const CityMap = ({ stats, position, onZoomIn, onZoomOut, onMoveEnd, onToggleFullScreen, isFullScreen = false }: CityMapProps) => {
    return (
        <div className={`relative flex-1 bg-gray-50 overflow-hidden ${isFullScreen ? 'h-full w-full' : 'min-h-[350px]'}`}>
            <ComposableMap projection="geoAlbersUsa" style={{ width: "100%", height: "100%" }}>
                <ZoomableGroup
                    zoom={position.zoom}
                    center={position.coordinates}
                    onMoveEnd={onMoveEnd}
                >
                    <Geographies geography={geoUrl}>
                        {({ geographies }: { geographies: Array<{ rsmKey: string; properties: { name: string } }> }) =>
                            geographies.map((geo: any) => {
                                const stateName = geo.properties.name;
                                const cityData = stats?.cityOrderStats?.find((c) => c.city.toLowerCase() === stateName.toLowerCase());
                                const hasOrders = !!cityData;
                                const centroid = geoCentroid(geo);
                                const projection = geoAlbersUsa();
                                const isVisible = projection(centroid);

                                return (
                                    <g key={geo.rsmKey}>
                                        <Geography
                                            geography={geo}
                                            fill={hasOrders ? "#a855f7" : "#cbd5e1"}
                                            stroke="#FFFFFF"
                                            strokeWidth={0.5}
                                            style={{
                                                default: { outline: "none" },
                                                hover: { fill: "#9333ea", outline: "none", cursor: "pointer" },
                                                pressed: { outline: "none" },
                                            }}
                                            data-tooltip-id="city-map-tooltip"
                                            data-tooltip-html={`
                                                <div class="p-4 min-w-[180px]">
                                                    <p class="text-gray-500 text-sm font-medium mb-1">${stateName}</p>
                                                    <div class="flex items-baseline gap-2 mb-3">
                                                        <span class="text-2xl font-bold text-gray-900">${cityData?.orders || 0}</span>
                                                        <span class="text-gray-500 text-sm">orders</span>
                                                    </div>
                                                    <div class="border-t border-gray-100 pt-3">
                                                        <p class="text-gray-400 text-xs">${cityData?.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                            `}
                                        />
                                        {isVisible && (
                                            <Marker coordinates={centroid}>
                                                <text
                                                    y="2"
                                                    fontSize={6}
                                                    fontWeight={600}
                                                    fontFamily="Inter, sans-serif"
                                                    textAnchor="middle"
                                                    fill="#fff"
                                                    style={{ pointerEvents: "none", textTransform: "uppercase" }}
                                                >
                                                    {stateName}
                                                </text>
                                            </Marker>
                                        )}
                                        {hasOrders && (
                                            <Marker coordinates={centroid}>
                                                <circle r={4} fill="#a855f7" stroke="#fff" strokeWidth={1} />
                                                <circle r={8} fill="none" stroke="#a855f7" strokeWidth={0.5} className="animate-ping" />
                                            </Marker>
                                        )}
                                    </g>
                                );
                            })
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>

            <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                <button
                    onClick={onZoomIn}
                    className="w-8 h-8 bg-primary-600 text-white shadow-md rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors font-bold text-lg"
                >
                    +
                </button>
                <button
                    onClick={onZoomOut}
                    className="w-8 h-8 bg-primary-600 text-white shadow-md rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors font-bold text-lg"
                >
                    -
                </button>
            </div>

            <div className="absolute bottom-4 right-4">
                <button
                    onClick={onToggleFullScreen}
                    className={`w-8 h-8 bg-white border border-gray-200 text-primary-600 shadow-sm rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors ${isFullScreen ? 'rotate-180' : ''}`}
                >
                    {isFullScreen ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                        </svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};



const Dashboard = () => {
    const [newCustomers, setNewCustomers] = useState<NewCustomer[]>([]);
    const [bestSellingProducts, setBestSellingProducts] = useState<BestSellingProduct[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [position, setPosition] = useState({ coordinates: [-96, 38] as [number, number], zoom: 1 });
    const [isMapFullScreen, setIsMapFullScreen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const isFirstLoad = useRef(true);
    const LIMIT = 6;

    const handleZoomIn = () => {
        if (position.zoom >= 4) return;
        setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
    };

    const handleZoomOut = () => {
        if (position.zoom <= 1) return;
        setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
    };

    const handleMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
        setPosition(position);
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

    return (
        <>
            <Header
                title="Dashboard"
                showWelcome={true}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />
            <div className="grid grid-cols-1 md:grid-cols-14 gap-6">
                <div className="col-span-4 md:col-span-10 space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="bg-linear-to-b from-primary-600 to-pipple rounded-lg p-4 text-white flex flex-col items-center justify-between w-[160px] h-[240px] shrink-0">
                            <div className="relative w-[100px] h-[100px] mt-7">
                                <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.15)"
                                        strokeWidth="20"
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="20"
                                        strokeDasharray={`${(stats?.targetOrders?.percentage || 0) * 2.51} 251.3`}
                                        className="drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[24px] font-bold">{stats?.targetOrders?.percentage || 0}%</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-baseline justify-center gap-0.5">
                                    <span className="text-[20px] font-bold leading-none">{stats?.targetOrders?.current?.toLocaleString() || 0}</span>
                                    <span className="text-[18px] font-light italic text-white/60">/</span>
                                    <span className="text-[16px] font-semibold text-white/80">{stats?.targetOrders?.target?.toLocaleString() || 0}</span>
                                </div>
                                <p className="text-xs font-medium text-white/90 mt-1">Target Orders</p>
                            </div>
                        </div>

                        <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="xl:text-base text-sm font-bold text-gray-800">Monthly Income</h3>
                                    <div className="flex items-enter gap-3 mt-2">
                                        <p className="xl:text-[24px] text-[19px] font-bold text-gray-900">
                                            $ {(stats?.monthlyIncomeStats?.current || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${(stats?.monthlyIncomeStats?.growth || 0) >= 0
                                            ? 'bg-[#e6f4ea] text-lime'
                                            : 'bg-[#fef2f2] text-maron'
                                            }`}>
                                            {(stats?.monthlyIncomeStats?.growth || 0) >= 0 ? '↑' : '↓'} {Math.abs(stats?.monthlyIncomeStats?.growth || 0)}%
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">Compared to the previous month</p>
                                </div>

                                <div className="border-t border-gray-100 pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center text-white">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">Accounting</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center items-center">
                                <div className="flex-1 w-full max-w-[292px] h-[192px] relative">
                                    <Bar
                                        data={{
                                            labels: (stats?.monthlyIncomeStats?.history?.map((h) => h.month) || []).reverse(),
                                            datasets: [{
                                                data: (stats?.monthlyIncomeStats?.history?.map((h) => h.income) || []).reverse(),
                                                backgroundColor: ['#a855f7', '#3b82f6', '#ef4444'], // Purple, Blue, Red
                                                barThickness: 25,
                                            }]
                                        }}
                                        options={{
                                            indexAxis: 'y',
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: false },
                                                tooltip: { enabled: true }
                                            },
                                            scales: {
                                                x: {
                                                    grid: {
                                                        color: '#f3f4f6',
                                                    },
                                                    border: {
                                                        display: true,
                                                    },
                                                    ticks: {
                                                        color: '#9ca3af',
                                                        font: { size: 10 },
                                                        callback: (value) => {
                                                            if (typeof value === 'number') {
                                                                return value >= 1000 ? `${value / 1000}k` : value;
                                                            }
                                                            return value;
                                                        }
                                                    }
                                                },
                                                y: {
                                                    grid: { display: false },
                                                    border: { display: true },
                                                    ticks: {
                                                        color: '#6b7280',
                                                        font: {
                                                            size: 12,
                                                            weight: 500,
                                                        },
                                                    },
                                                },
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white">
                                    <TrendingUp size={14} />
                                </div>
                            </div>

                            <h3 className="text-[15px] font-semibold text-gray-500 mb-3">Total Profit</h3>

                            <div className="flex items-center justify-between mb-4">
                                <p className="text-2xl font-bold text-[#1f2937]">
                                    {stats?.totalProfit || "$ 0.00"}
                                </p>
                                <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-bold bg-[#e6f4ea] text-[#1e8e3e]">
                                    ↑ 3.4%
                                </span>
                            </div>

                            <div className="flex-1 max-h-[77px] mt-auto">
                                <Line
                                    data={{
                                        labels: stats?.profitHistory?.map((h) => h.date) || ['', '', '', '', '', '', ''],
                                        datasets: [{
                                            data: stats?.profitHistory?.map((h) => h.profit) || [0, 0, 0, 0, 0, 0, 0],
                                            borderColor: '#65a30d',
                                            backgroundColor: '#65a30d',
                                            borderWidth: 2,
                                            pointRadius: 4,
                                            pointBackgroundColor: '#65a30d',
                                            pointBorderColor: '#fff',
                                            pointBorderWidth: 2,
                                            tension: 0.4,
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: { enabled: true }
                                        },
                                        scales: {
                                            x: {
                                                grid: { color: '#f1f5f9' },
                                                ticks: { display: false }
                                            },
                                            y: {
                                                grid: { color: '#f1f5f9' },
                                                ticks: { display: false }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white">
                                    <TrendingDown size={14} />
                                </div>
                            </div>

                            <h3 className="text-[15px] font-bold text-gray-500 mb-3">Total Expenses</h3>

                            <div className="flex items-center justify-between mb-4">
                                <p className="text-2xl font-bold text-[#1f2937]">
                                    {stats?.totalExpenses || "$ 0.00"}
                                </p>
                                <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-bold bg-[#fef2f2] text-maron">
                                    ↓ 2.6%
                                </span>
                            </div>

                            <div className="flex-1 max-h-[77px] mt-auto">
                                <Line
                                    data={{
                                        labels: stats?.expensesHistory?.map((h) => h.date) || ['', '', '', '', '', '', ''],
                                        datasets: [{
                                            data: stats?.expensesHistory?.map((h) => h.expenses) || [0, 0, 0, 0, 0, 0, 0],
                                            borderColor: '#ef4444',
                                            backgroundColor: '#ef4444',
                                            borderWidth: 2,
                                            pointRadius: 4,
                                            pointBackgroundColor: '#ef4444',
                                            pointBorderColor: '#fff',
                                            pointBorderWidth: 2,
                                            tension: 0.4,
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: { enabled: true }
                                        },
                                        scales: {
                                            x: {
                                                grid: { color: '#f1f5f9' },
                                                ticks: { display: false }
                                            },
                                            y: {
                                                grid: { color: '#f1f5f9' },
                                                ticks: { display: false }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white">
                                    <span className="text-xl font-bold">👥</span>
                                </div>
                            </div>

                            <h3 className="text-[15px] font-bold text-gray-500 mb-3">New Customers</h3>

                            <div className="flex items-center justify-between mb-4">
                                <p className="text-2xl font-bold text-[#1f2937]">
                                    {stats?.newCustomersStats?.current?.toLocaleString() || "0"}
                                </p>
                                <span className={`inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-bold ${(stats?.newCustomersStats?.growth || 0) >= 0
                                    ? 'bg-[#e0f2fe] text-ocean'
                                    : 'bg-[#fef2f2] text-maron'
                                    }`}>
                                    {(stats?.newCustomersStats?.growth || 0) >= 0 ? '↑' : '↓'} {Math.abs(stats?.newCustomersStats?.growth || 0)}%
                                </span>
                            </div>

                            <div className="flex-1 max-h-[77px] mt-auto">
                                <Line
                                    data={{
                                        labels: stats?.newCustomersStats?.history?.map((h) => h.date) || ['', '', '', '', '', '', ''],
                                        datasets: [{
                                            data: stats?.newCustomersStats?.history?.map((h) => h.count) || [0, 0, 0, 0, 0, 0, 0],
                                            borderColor: '#3b82f6',
                                            backgroundColor: '#3b82f6',
                                            borderWidth: 2,
                                            pointRadius: 4,
                                            pointBackgroundColor: '#3b82f6',
                                            pointBorderColor: '#fff',
                                            pointBorderWidth: 2,
                                            tension: 0.4,
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: { enabled: true }
                                        },
                                        scales: {
                                            x: {
                                                grid: { color: '#f1f5f9' },
                                                ticks: { display: false }
                                            },
                                            y: {
                                                grid: { color: '#f1f5f9' },
                                                ticks: { display: false }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>


                </div>

                <div className="col-span-1 md:col-span-4 flex flex-col">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1">
                        <h2 className="text-md font-semibold text-gray-800 mb-4">Best Selling Products</h2>
                        <div className="border-b border-gray-400 mb-3" />
                        <div className="space-y-4">
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="bg-gray-50 rounded-2xl p-2 flex items-center justify-between animate-pulse">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white rounded-xl w-16 h-16" />
                                            <div className="flex flex-col gap-2">
                                                <div className="h-4 w-32 bg-gray-200 rounded" />
                                                <div className="h-3 w-24 bg-gray-200 rounded" />
                                            </div>
                                        </div>
                                        <div className="h-6 w-12 bg-gray-200 rounded" />
                                    </div>
                                ))
                            ) : bestSellingProducts.length === 0 ? (
                                <p className="text-gray-500 text-sm py-4 text-center">No sales data available yet.</p>
                            ) : (
                                bestSellingProducts
                                    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .slice(0, 4)
                                    .map((product, index) => (
                                        <div key={index} className="bg-gray-50 rounded-2xl p-2 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-white rounded-xl w-16 h-16 flex items-center justify-center p-2 shadow-sm">
                                                    {product.image ? (
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <span className="text-2xl">📦</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="text-base font-bold text-[#4c1d95]">{product.name}</p>
                                                    <p className="text-sm text-gray-500">{product.brand}</p>
                                                </div>
                                            </div>
                                            <span className="text-base font-bold text-[#4c1d95]">{product.price}</span>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-14 gap-6 mt-6">
                <div className="col-span-1 md:col-span-10 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-800">New Customers</h2>
                            <div className="flex items-center">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`w-8 h-8 border rounded-bl-sm rounded-tl-sm text-primary-600 border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`w-7 h-8 flex items-center justify-center text-sm font-normal ${page === currentPage
                                            ? 'bg-primary-600 text-white'
                                            : 'text-primary-600 hover:bg-gray-50 border border-gray-200'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`w-8 h-8 border rounded-br-sm rounded-tr-sm border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <ChevronRight size={16} className="text-primary-600" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto relative">
                            {isTableLoading && !isLoading && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-xl">
                                    <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                            <table className={`w-full transition-opacity duration-200 ${isTableLoading ? 'opacity-50' : 'opacity-100'}`}>
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center">
                                                <div className="flex items-center justify-center">
                                                    <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            </td>
                                        </tr>
                                    ) : newCustomers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-gray-500">
                                                No new customers found.
                                            </td>
                                        </tr>
                                    ) : (
                                        newCustomers
                                            .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map((customer, index) => (
                                                <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-sm text-gray-600">{customer.date}</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={customer.avatar}
                                                                alt={customer.name}
                                                                className="w-8 h-8 rounded-full object-cover"
                                                            />
                                                            <span className="text-sm font-medium text-gray-700">{customer.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span
                                                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${customer.status === 'Success'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-[#FFE3E6] text-[#ED4D5C]'
                                                                }`}
                                                        >
                                                            {customer.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-700">{customer.total}</td>
                                                </tr>
                                            ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="col-span-1 md:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl px-4 py-6 shadow-sm border border-gray-100 flex flex-col h-full">
                        <h2 className="text-base font-semibold text-gray-800 mb-4">City Order Statistics</h2>
                        <div className="border-b border-gray-400 mb-3" />
                        <CityMap
                            stats={stats}
                            position={position}
                            onZoomIn={handleZoomIn}
                            onZoomOut={handleZoomOut}
                            onMoveEnd={handleMoveEnd}
                            onToggleFullScreen={() => setIsMapFullScreen(true)}
                        />
                    </div>
                </div>
            </div>
            {isMapFullScreen && (
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-10">
                    <div className="bg-white rounded-3xl w-full h-full shadow-2xl overflow-hidden flex flex-col relative">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                            <h2 className="text-2xl font-bold text-gray-800">City Order Statistics - Full View</h2>
                            <button
                                onClick={() => setIsMapFullScreen(false)}
                                className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-white hover:bg-gray-100 hover:text-gray-600 transition-all"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 p-4 bg-gray-50">
                            <CityMap
                                stats={stats}
                                position={position}
                                onZoomIn={handleZoomIn}
                                onZoomOut={handleZoomOut}
                                onMoveEnd={handleMoveEnd}
                                onToggleFullScreen={() => setIsMapFullScreen(false)}
                                isFullScreen={true}
                            />
                        </div>
                    </div>
                </div>
            )}
            <ReactTooltip
                id="city-map-tooltip"
                place="top"
                variant="light"
                className="!p-0 !rounded-2xl !shadow-2xl !border-none !opacity-100 !z-[10001]"
            />
        </>
    );
};

export default Dashboard;
