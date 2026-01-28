import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { api, type Product, type ProductSelection, type Document } from '../lib/api';
import { Package, FileText, TrendingUp, Clock } from 'lucide-react';

const CustomerDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        products: 0,
        documents: 0,
    });
    const [recentProducts, setRecentProducts] = useState<(Product | ProductSelection)[]>([]);
    const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, documentsRes] = await Promise.all([
                    api.getProducts(),
                    api.getDocuments(),
                ]);
                setStats({
                    products: productsRes.products.length,
                    documents: documentsRes.documents.length,
                });
                setRecentProducts(productsRes.products.slice(0, 5));
                setRecentDocuments(documentsRes.documents.slice(0, 5));
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <Header title={`Welcome, ${user?.name || user?.email?.split('@')[0] || 'Customer'}!`} hideSearch hideDate />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Products</p>
                            <p className="text-3xl font-bold mt-1">{stats.products}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Package size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Total Documents</p>
                            <p className="text-3xl font-bold mt-1">{stats.documents}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <FileText size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-linear-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Activity Score</p>
                            <p className="text-3xl font-bold mt-1">{stats.products + stats.documents}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Member Since</p>
                            <p className="text-xl font-bold mt-1">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Clock size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Package size={20} className="text-primary-600" />
                        Recent Products
                    </h3>
                    {recentProducts.length === 0 ? (
                        <p className="text-gray-500 text-sm py-4">No products yet. Add your first product!</p>
                    ) : (
                        <div className="space-y-3">
                            {recentProducts.map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{product.name}</p>
                                        <p className="text-xs text-gray-500">${(product.sellPrice || 0).toFixed(2)}</p>
                                    </div>
                                    <span className="text-xs text-gray-400">Qty: {product.quantity}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-primary-600" />
                        Recent Documents
                    </h3>
                    {recentDocuments.length === 0 ? (
                        <p className="text-gray-500 text-sm py-4">No documents yet. Add your first document!</p>
                    ) : (
                        <div className="space-y-3">
                            {recentDocuments.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                                        <p className="text-xs text-gray-500">{doc.type}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${doc.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {doc.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
