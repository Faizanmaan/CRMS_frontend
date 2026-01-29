import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types/auth';
import { ChevronLeft, ChevronRight, Trash2, Users, UserPlus, UserCheck, UserX } from 'lucide-react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";
import { geoCentroid, geoAlbersUsa } from "d3-geo";
import { Tooltip } from 'react-tooltip';

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

interface CustomerWithStatus extends User {
    status: 'Online' | 'Offline';
}

const Customers = () => {
    const { user } = useAuth();
    const [customers, setCustomers] = useState<CustomerWithStatus[]>([]);
    const [deviceStats, setDeviceStats] = useState<{ type: string; count: number }[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchCustomers = async () => {
        try {
            const [res, deviceRes] = await Promise.all([
                api.getAllCustomers(),
                api.getDeviceStats().catch(() => [])
            ]);

            const customersWithStatus = res.users.map(user => ({
                ...user,
                status: Math.random() > 0.3 ? 'Online' : 'Offline'
            }));
            setCustomers(customersWithStatus as CustomerWithStatus[]);

            if (!deviceRes || deviceRes.length === 0) {
                setDeviceStats([
                    { type: 'Desktop', count: Math.floor(Math.random() * 1000) + 500 },
                    { type: 'Mobile', count: Math.floor(Math.random() * 800) + 200 }
                ]);
            } else {
                setDeviceStats(deviceRes);
            }
        } catch (err) {
            console.error('Error fetching customers:', err);
            alert('Failed to fetch customers');
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

    const totalPages = Math.ceil(customers.length / itemsPerPage);
    const paginatedCustomers = customers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalCustomers = customers.length;
    const newCustomers = customers.filter(c => {
        const date = c.createdAt ? new Date(c.createdAt) : new Date();
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    const totalMembers = Math.floor(totalCustomers * 0.8);
    const nonMembers = totalCustomers - totalMembers;

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Customers</h1>
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-primary-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium">
                        {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                            <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} alt="Profile" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user?.name || 'User'}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-linear-to-br from-primary-500 to-primary-600 rounded-2xl p-6 sm:p-8 lg:p-12 shadow-lg text-white flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary-600 shrink-0">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-primary-100 font-medium">Total Customers</p>
                        <p className="text-xl font-bold text-white">{totalCustomers.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">New Customers</p>
                        <p className="text-xl font-bold text-gray-900">{newCustomers.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white shrink-0">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Total Members</p>
                        <p className="text-xl font-bold text-gray-900">{totalMembers.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0">
                        <UserX size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Non-Members</p>
                        <p className="text-xl font-bold text-gray-900">{nonMembers.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 lg:col-span-3">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-500">Desktop Users</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-800">
                                {(() => {
                                    const desktop = deviceStats.find(s => s.type === 'Desktop')?.count || 0;
                                    const total = deviceStats.reduce((acc, s) => acc + s.count, 0);
                                    return total > 0 ? `${Math.round((desktop / total) * 100)}%` : '0%';
                                })()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs sm:text-sm font-medium text-gray-500">Mobile Users</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-800">
                                {(() => {
                                    const mobile = deviceStats.find(s => s.type === 'Mobile')?.count || 0;
                                    const total = deviceStats.reduce((acc, s) => acc + s.count, 0);
                                    return total > 0 ? `${Math.round((mobile / total) * 100)}%` : '0%';
                                })()}
                            </p>
                        </div>
                    </div>
                    <div className="w-full h-3 sm:h-5 bg-gray-100 rounded gap-1 sm:gap-2 overflow-hidden flex">
                        <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{
                                width: (() => {
                                    const desktop = deviceStats.find(s => s.type === 'Desktop')?.count || 0;
                                    const total = deviceStats.reduce((acc, s) => acc + s.count, 0);
                                    return total > 0 ? `${(desktop / total) * 100}%` : '0%';
                                })()
                            }}
                        ></div>
                        <div
                            className="h-full bg-green-600 transition-all duration-500"
                            style={{
                                width: (() => {
                                    const mobile = deviceStats.find(s => s.type === 'Mobile')?.count || 0;
                                    const total = deviceStats.reduce((acc, s) => acc + s.count, 0);
                                    return total > 0 ? `${(mobile / total) * 100}%` : '0%';
                                })()
                            }}
                        ></div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 lg:col-span-3">
                    <div className="flex mb-6">
                        <h3 className="font-semibold text-gray-800">Customer Demographic</h3>
                    </div>
                    <div className="w-full h-[300px] sm:h-[400px] bg-gray-50 rounded-xl overflow-hidden relative flex items-center justify-center">
                        <ComposableMap projection="geoAlbersUsa">
                            <ZoomableGroup>
                                <Geographies geography={geoUrl}>
                                    {({ geographies }: { geographies: any[] }) =>
                                        geographies.map((geo: any) => {
                                            const geoId = geo.rsmKey || geo.properties.name || 'default';
                                            const hash = geoId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                                            const fillColor = hash % 2 === 0 ? "#47178E" : "#CFAFFF";
                                            const centroid = geoCentroid(geo);
                                            const projection = geoAlbersUsa();
                                            const isVisible = projection(centroid);
                                            const memberCount = Math.floor((hash / 100) * 50) + 10;

                                            return (
                                                <g key={geo.rsmKey}>
                                                    <Geography
                                                        geography={geo}
                                                        fill={fillColor}
                                                        stroke="#FFFFFF"
                                                        strokeWidth={0.5}
                                                        style={{
                                                            default: { outline: "none" },
                                                            hover: { fill: "#312E81", outline: "none" },
                                                            pressed: { outline: "none" },
                                                        }}
                                                        data-tooltip-id="map-tooltip"
                                                        data-tooltip-content={`${geo.properties.name} \n Members: ${memberCount}`}
                                                    />
                                                    {isVisible && (
                                                        <Marker coordinates={centroid}>
                                                            <text y="2" fontSize={6} fontWeight={600} fontFamily="Albert Sans, sans-serif" textAnchor="middle" fill="#fff" style={{ pointerEvents: "none" }}>
                                                                {geo.properties.name}
                                                            </text>
                                                        </Marker>
                                                    )}
                                                </g>
                                            );
                                        })
                                    }
                                </Geographies>
                            </ZoomableGroup>
                        </ComposableMap>
                        <Tooltip id="map-tooltip" />

                        <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                            <button className="w-8 h-8 bg-white text-gray-600 shadow-md rounded-lg flex items-center justify-center hover:bg-gray-50 font-bold text-lg">+</button>
                            <button className="w-8 h-8 bg-white text-gray-600 shadow-md rounded-lg flex items-center justify-center hover:bg-gray-50 font-bold text-lg">-</button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-6">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-indigo-900"></span>
                            <span className="text-xs text-gray-500">Majority Members</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-purple-200"></span>
                            <span className="text-xs text-gray-500">Majority Non-Members</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="">
                <div className="mb-4">
                    <div className="flex items-center gap-4">
                        {selectedIds.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                            >
                                <Trash2 size={16} />
                                Delete Selected ({selectedIds.length})
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto md:overflow-visible -mx-4 md:mx-0 pb-4">
                    <table className="w-full border-separate border-spacing-y-3 min-w-[900px] md:min-w-0">
                        <thead>
                            <tr className="">
                                <th className="py-4 px-6 text-left w-12">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        checked={selectedIds.length === customers.length && customers.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                                <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedCustomers.map((customer: CustomerWithStatus) => (
                                <tr key={customer.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                                    <td className="py-2 px-6 border-y border-gray-100 rounded-l-xl group-hover:border-primary-100">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            checked={selectedIds.includes(customer.id)}
                                            onChange={() => handleSelectOne(customer.id)}
                                        />
                                    </td>
                                    <td className="py-2 px-6 border-y border-gray-100 group-hover:border-primary-100">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={customer.profilePicture || `https://ui-avatars.com/api/?name=${customer.name || 'User'}&background=random`}
                                                alt={customer.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                            <span className="text-sm font-medium text-gray-900">{customer.name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="py-2 px-6 text-sm text-gray-500 border-y border-gray-100 group-hover:border-primary-100">{customer.email}</td>
                                    <td className="py-2 px-6 text-sm text-gray-500 border-y border-gray-100 group-hover:border-primary-100">{customer.phoneNumber || 'N/A'}</td>
                                    <td className="py-2 px-6 text-sm text-gray-500 border-y border-gray-100 group-hover:border-primary-100">{customer.city ? `${customer.city}${customer.country ? `, ${customer.country}` : ''}` : 'N/A'}</td>
                                    <td className="py-2 px-6 border-y border-r border-gray-100 rounded-r-xl group-hover:border-primary-100">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${customer.status === 'Online'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {customer.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6">
                    <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, customers.length)}</span> of <span className="font-medium">{customers.length}</span> entries
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => {
                                // Show only a few pages on mobile
                                if (totalPages > 5 && (i + 1 !== 1 && i + 1 !== totalPages && Math.abs(i + 1 - currentPage) > 1)) {
                                    if (i + 1 === 2 || i + 1 === totalPages - 1) return <span key={i + 1} className="px-1 text-gray-400">...</span>;
                                    return null;
                                }
                                return (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-colors ${currentPage === i + 1
                                            ? 'bg-primary-600 text-white'
                                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Customers;