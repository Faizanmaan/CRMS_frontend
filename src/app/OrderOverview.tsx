import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Header from '../components/Header';
import { TrendingUp, TrendingDown, Maximize2, Plus, Minus, X } from 'lucide-react';
import { api } from '../lib/api';
import type { BestSellingProduct } from '../types/dashboard';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface CountryStat {
    country: string;
    orders: number;
    flag: string;
    coordinates: [number, number];
    color: string;
    change: string;
    isPositive: boolean;
}

// Country name to ISO 3166-1 alpha-2 code mapping
const countryCodeMap: Record<string, string> = {
    'United States': 'us',
    'USA': 'us',
    'United Kingdom': 'gb',
    'UK': 'gb',
    'Germany': 'de',
    'France': 'fr',
    'Italy': 'it',
    'Spain': 'es',
    'Canada': 'ca',
    'Australia': 'au',
    'Japan': 'jp',
    'China': 'cn',
    'India': 'in',
    'Brazil': 'br',
    'Mexico': 'mx',
    'Russia': 'ru',
    'South Korea': 'kr',
    'Netherlands': 'nl',
    'Switzerland': 'ch',
    'Sweden': 'se',
    'Norway': 'no',
    'Denmark': 'dk',
    'Finland': 'fi',
    'Poland': 'pl',
    'Belgium': 'be',
    'Austria': 'at',
    'Portugal': 'pt',
    'Ireland': 'ie',
    'New Zealand': 'nz',
    'Singapore': 'sg',
    'UAE': 'ae',
    'United Arab Emirates': 'ae',
    'Saudi Arabia': 'sa',
    'Turkey': 'tr',
    'Indonesia': 'id',
    'Thailand': 'th',
    'Malaysia': 'my',
    'Philippines': 'ph',
    'Vietnam': 'vn',
    'Pakistan': 'pk',
    'Bangladesh': 'bd',
    'Egypt': 'eg',
    'South Africa': 'za',
    'Nigeria': 'ng',
    'Kenya': 'ke',
    'Argentina': 'ar',
    'Chile': 'cl',
    'Colombia': 'co',
    'Peru': 'pe',
    'Venezuela': 've',
    'Greece': 'gr',
    'Czech Republic': 'cz',
    'Romania': 'ro',
    'Hungary': 'hu',
    'Ukraine': 'ua',
    'Israel': 'il',
    'Taiwan': 'tw',
    'Hong Kong': 'hk',
};

// Helper function to get flag image URL
const getFlagImageUrl = (countryName: string): string => {
    const code = countryCodeMap[countryName] || 'un'; // 'un' for unknown/United Nations flag
    return `https://flagcdn.com/w40/${code}.png`;
};


interface SalesHistory {
    date: string;
    revenue: number;
    sales: number;
    views: number;
}

interface SalesStatistic {
    totalRevenue: string;
    totalSales: string;
    totalViews: string;
    history: SalesHistory[];
}

interface MapPosition {
    coordinates: [number, number];
    zoom: number;
}

interface WorldMapProps {
    stats: CountryStat[];
    position: MapPosition;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onMoveEnd: (position: MapPosition) => void;
    onToggleFullScreen: () => void;
    isFullScreen?: boolean;
}

interface GeographyObject {
    rsmKey: string;
    [key: string]: unknown;
}

const WorldMap = ({ stats, position, onZoomIn, onZoomOut, onMoveEnd, onToggleFullScreen, isFullScreen }: WorldMapProps) => {
    return (
        <div className="relative w-full h-full bg-white overflow-hidden">
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 100 }}
                style={{ width: "100%", height: "100%" }}
            >
                <ZoomableGroup
                    zoom={position.zoom}
                    center={position.coordinates}
                    onMoveEnd={onMoveEnd}
                    maxZoom={8}
                    minZoom={1}
                >
                    <Geographies geography={geoUrl}>
                        {({ geographies }: { geographies: GeographyObject[] }) =>
                            geographies
                                .filter((geo) => (geo.properties as { name: string }).name !== "Antarctica")
                                .map((geo) => (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill="#ADB5BD"
                                        stroke="#FFFFFF"
                                        strokeWidth={0.5}
                                        style={{
                                            default: { outline: "none" },
                                            hover: { fill: "#D1D5DB", outline: "none" },
                                            pressed: { outline: "none" },
                                        }}
                                    />
                                ))
                        }
                    </Geographies>
                    {stats.map((stat: CountryStat, i: number) => (
                        <Marker key={i} coordinates={stat.coordinates}>
                            <circle r={20} fill={stat.color} fillOpacity={0.2} />
                            <circle r={12} fill={stat.color} fillOpacity={0.4} />

                            <g transform="translate(-10, -10)">
                                <circle cx="10" cy="10" r="10" fill="white" stroke={stat.color} strokeWidth={2} />
                                <text
                                    x="10"
                                    y="14"
                                    textAnchor="middle"
                                    fontSize="12"
                                    style={{ pointerEvents: "none" }}
                                >
                                    {stat.flag}
                                </text>
                            </g>

                            <g transform="translate(12, -10)">
                                <rect
                                    x="0"
                                    y="0"
                                    width={stat.orders.toLocaleString().length * 8 + 10}
                                    height="20"
                                    rx="10"
                                    fill={stat.color}
                                />
                                <text
                                    x={(stat.orders.toLocaleString().length * 8 + 10) / 2}
                                    y="14"
                                    textAnchor="middle"
                                    fill="white"
                                    fontSize="10"
                                    fontWeight="bold"
                                >
                                    {stat.orders.toLocaleString()}
                                </text>
                            </g>
                        </Marker>
                    ))}
                </ZoomableGroup>
            </ComposableMap>

            <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                <button
                    onClick={onZoomIn}
                    className="w-8 h-8 bg-primary-500 text-white rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors shadow-lg"
                >
                    <Plus size={18} />
                </button>
                <button
                    onClick={onZoomOut}
                    className="w-8 h-8 bg-primary-500 text-white rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors shadow-lg"
                >
                    <Minus size={18} />
                </button>
            </div>
            <button
                onClick={onToggleFullScreen}
                className="absolute bottom-4 right-4 w-8 h-8 bg-primary-500 text-white rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors shadow-lg"
            >
                {isFullScreen ? <X size={18} /> : <Maximize2 size={18} />}
            </button>
        </div>
    );
};

const OrderOverview = () => {
    const [bestSellingProducts, setBestSellingProducts] = useState<BestSellingProduct[]>([]);
    const [countryOrderStats, setCountryOrderStats] = useState<CountryStat[]>([]);
    const [salesStatistic, setSalesStatistic] = useState<SalesStatistic | null>(null);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalOrdersGrowth, setTotalOrdersGrowth] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [mapPosition, setMapPosition] = useState({ coordinates: [0, 20] as [number, number], zoom: 1 });

    const [startDate, setStartDate] = useState<string | undefined>(undefined);
    const [endDate, setEndDate] = useState<string | undefined>(undefined);
    const [dateRangeLabel, setDateRangeLabel] = useState('');
    const [rangeType, setRangeType] = useState('7days');

    const calculateDates = (type: string) => {
        const end = new Date();
        let start = new Date();
        let label = '';

        switch (type) {
            case '7days':
                start.setDate(end.getDate() - 7);
                label = `${start.getDate()} - ${end.getDate()} ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
                break;
            case '30days':
                start.setDate(end.getDate() - 30);
                label = `${start.getDate()} ${start.toLocaleDateString('en-US', { month: 'short' })} - ${end.getDate()} ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
                break;
            case 'thisMonth':
                start = new Date(end.getFullYear(), end.getMonth(), 1);
                label = `1 - ${end.getDate()} ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
                break;
            case 'allTime':
                return { start: undefined, end: undefined, label: 'All Time' };
            default:
                start.setDate(end.getDate() - 7);
                label = `${start.getDate()} - ${end.getDate()} ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
        }

        return {
            start: start.toISOString(),
            end: end.toISOString(),
            label
        };
    };

    const handleDateChange = (type: string) => {
        const { start, end, label } = calculateDates(type);
        setStartDate(start);
        setEndDate(end);
        setDateRangeLabel(label);
        setRangeType(type);
    };

    useEffect(() => {
        const { start, end, label } = calculateDates('7days');
        setStartDate(start);
        setEndDate(end);
        setDateRangeLabel(label);
    }, []);

    const handleZoomIn = () => {
        if (mapPosition.zoom >= 8) return;
        setMapPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const handleZoomOut = () => {
        if (mapPosition.zoom <= 1) return;
        setMapPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
    };

    const handleMoveEnd = (position: MapPosition) => {
        setMapPosition(position);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const data = await api.getDashboardStats(1, 10, startDate, endDate, rangeType);
                setBestSellingProducts(data.bestSellingProducts || []);
                setCountryOrderStats(data.stats?.countryOrderStats || []);
                setSalesStatistic(data.stats?.salesStatistic || null);
                setTotalOrders(data.stats?.totalOrdersCount || 0);
                setTotalOrdersGrowth(data.stats?.totalOrdersGrowth || 0);
            } catch (error) {
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [startDate, endDate, rangeType]);

    return (
        <div className="min-h-screen">
            <Header
                title="Order Overview"
                hideSearch={true}
                dateRange={dateRangeLabel}
                onDateChange={handleDateChange}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-6">Sales Statistic</h2>
                        <div className="overflow-x-auto md:overflow-visible -mx-4 md:mx-0">
                            <div className="grid grid-cols-3 gap-4 min-w-[600px] md:min-w-0 mb-8 border-b border-gray-100 pb-6">
                                <div className="relative pr-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="md:w-6 md:h-6 h-4 w-4 rounded-full bg-blue-500 shrink-0"></div>
                                        <span className="md:text-sm text-xs font-medium text-gray-500">Total Revenue</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="md:text-2xl text-lg font-bold text-gray-900">{salesStatistic?.totalRevenue || '$ 0.00'}</span>
                                        <span className="text-xs text-gray-400">Orders</span>
                                    </div>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 bg-gray-100"></div>
                                </div>
                                <div className="relative px-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="md:w-6 md:h-6 h-4 w-4 rounded-full bg-green-600 shrink-0"></div>
                                        <span className="md:text-sm text-xs font-medium text-gray-500">Total Sales</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="md:text-2xl text-lg font-bold text-gray-900">{salesStatistic?.totalSales || '0'}</span>
                                        <span className="text-xs text-gray-400">Products</span>
                                    </div>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 bg-gray-100"></div>
                                </div>
                                <div className="pl-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="md:w-6 md:h-6 h-4 w-4 rounded-full bg-purple-500 shrink-0"></div>
                                        <span className="md:text-sm text-xs font-medium text-gray-500">Total Views</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="md:text-2xl text-lg font-bold text-gray-900">{salesStatistic?.totalViews || '0'}</span>
                                        <span className="text-xs text-gray-400">Views</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            {salesStatistic ? (
                                <Line
                                    data={{
                                        labels: salesStatistic.history.map(h => h.date),
                                        datasets: [
                                            {
                                                label: 'Total Revenue',
                                                data: salesStatistic.history.map(h => h.revenue),
                                                borderColor: '#3b82f6',
                                                backgroundColor: 'transparent',
                                                borderWidth: 3,
                                                pointBackgroundColor: '#3b82f6',
                                                pointBorderColor: '#fff',
                                                pointBorderWidth: 2,
                                                pointRadius: 4,
                                                pointHoverRadius: 6,
                                                tension: 0.4,
                                            },
                                            {
                                                label: 'Total Sales',
                                                data: salesStatistic.history.map(h => h.sales * 100), // Scaled for visibility
                                                borderColor: '#16a34a',
                                                backgroundColor: 'transparent',
                                                borderWidth: 3,
                                                pointBackgroundColor: '#16a34a',
                                                pointBorderColor: '#fff',
                                                pointBorderWidth: 2,
                                                pointRadius: 4,
                                                pointHoverRadius: 6,
                                                tension: 0.4,
                                            },
                                            {
                                                label: 'Total Views',
                                                data: salesStatistic.history.map(h => h.views * 50), // Scaled for visibility
                                                borderColor: '#a855f7',
                                                backgroundColor: 'transparent',
                                                borderWidth: 3,
                                                pointBackgroundColor: '#a855f7',
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
                                                        if (context.datasetIndex === 0) {
                                                            label += `$ ${val.toLocaleString()}`;
                                                        } else if (context.datasetIndex === 1) {
                                                            label += (val / 100).toLocaleString();
                                                        } else {
                                                            label += (val / 50).toLocaleString();
                                                        }
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
                            ) : (
                                <div className="w-full h-full flex items-center justify-center animate-pulse bg-gray-50 rounded-xl">
                                    <p className="text-gray-400 text-sm">Loading Chart...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="md:text-lg text-base font-semibold text-gray-800 mb-2">Best Selling Products</h2>
                        <div className='border-b border-gray-300 mb-4'></div>
                        <div className="overflow-x-auto md:overflow-visible">
                            <table className="w-full min-w-[640px] md:min-w-0">
                                <thead>
                                    <tr className="bg-primary-100 text-black">
                                        <th className="text-left py-3 px-4 md:text-sm text-xs font-medium rounded-l">Product Name</th>
                                        <th className="text-left py-3 px-4 md:text-sm text-xs font-medium">Total Order</th>
                                        <th className="text-left py-3 px-4 md:text-sm text-xs font-medium">Status</th>
                                        <th className="text-left py-3 px-4 md:text-sm text-xs font-medium rounded-r">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        Array.from({ length: 4 }).map((_, i) => (
                                            <tr key={i} className="border-b border-gray-50 animate-pulse">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
                                                        <div>
                                                            <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
                                                            <div className="h-3 w-16 bg-gray-200 rounded"></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="h-4 w-12 bg-gray-200 rounded"></div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : bestSellingProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-500">
                                                No sales data available yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        bestSellingProducts.map((product, index) => (
                                            <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="md:w-10 md:h-10 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                                            {product.image ? (
                                                                <img
                                                                    src={product.image}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-xl">📦</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="md:text-sm text-xs font-medium text-primary-600">{product.name}</p>
                                                            <p className="md:text-xs text-[10px] text-gray-400">{product.brand}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <p className="md:text-sm text-xs font-medium text-gray-700">{product.totalSold} pcs</p>
                                                        <p className="md:text-xs text-[10px] text-gray-400">Sold</p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`inline-flex px-2.5 py-1 rounded-full md:text-xs text-[10px] font-medium ${product.status === 'Available'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                            }`}
                                                    >
                                                        {product.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 md:text-sm text-xs text-gray-700">{product.price}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="md:text-lg text-base font-semibold text-gray-800 mb-4">Country Sales Statistics</h2>

                        <div
                            className="bg-gray-50 rounded-xl overflow-hidden relative mb-6 border border-gray-100"
                            style={{ height: '381px' }}
                        >
                            {isLoading ? (
                                <div className="w-full h-full flex items-center justify-center animate-pulse bg-gray-100">
                                    <p className="text-gray-400 text-sm">Loading Map...</p>
                                </div>
                            ) : (
                                <WorldMap
                                    stats={countryOrderStats}
                                    position={mapPosition}
                                    onZoomIn={handleZoomIn}
                                    onZoomOut={handleZoomOut}
                                    onMoveEnd={handleMoveEnd}
                                    onToggleFullScreen={toggleFullScreen}
                                />
                            )}
                        </div>

                        {isFullScreen && createPortal(
                            <div className="fixed inset-0 z-9999 bg-white w-screen h-screen">
                                <WorldMap
                                    stats={countryOrderStats}
                                    position={mapPosition}
                                    onZoomIn={handleZoomIn}
                                    onZoomOut={handleZoomOut}
                                    onMoveEnd={handleMoveEnd}
                                    onToggleFullScreen={toggleFullScreen}
                                    isFullScreen={true}
                                />
                            </div>,
                            document.body
                        )}

                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="md:text-2xl text-xl font-bold text-gray-800">
                                    {totalOrders.toLocaleString()} <span className="text-sm font-normal text-gray-500">Orders</span>
                                </p>
                                <p className="text-xs text-gray-400">Sales from {dateRangeLabel}</p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${totalOrdersGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {totalOrdersGrowth >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                                {Math.abs(totalOrdersGrowth)}%
                            </span>
                        </div>

                        <div className="space-y-4">
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex items-center justify-between animate-pulse">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-4 w-12 bg-gray-200 rounded"></div>
                                            <div className="h-4 w-10 bg-gray-200 rounded"></div>
                                        </div>
                                    </div>
                                ))
                            ) : countryOrderStats.length === 0 ? (
                                <p className="text-center text-gray-500 text-sm py-4">No country data available.</p>
                            ) : (
                                countryOrderStats.map((stat, index) => (
                                    <div key={index} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm border border-gray-100 flex items-center justify-center bg-gray-50">
                                                <img
                                                    src={getFlagImageUrl(stat.country)}
                                                    alt={`${stat.country} flag`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        // Fallback to emoji if image fails to load
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-lg">${stat.flag}</span>`;
                                                    }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{stat.country}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-semibold text-gray-800">{stat.orders.toLocaleString()}</span>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${stat.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {stat.isPositive ? <TrendingUp size={10} className="mr-0.5" /> : null}
                                                {stat.change}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderOverview;
