import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { api, type Product, type AdminProduct } from '../lib/api';
import { Plus, Pencil, Trash2, Package, X, Upload, Image as ImageIcon, Tag, DollarSign } from 'lucide-react';

const PRODUCT_CATEGORIES = [
    'Electronics',
    'Clothing',
    'Food & Beverages',
    'Home & Garden',
    'Sports & Outdoors',
    'Books & Media',
    'Health & Beauty',
    'Toys & Games',
    'Automotive',
    'Office Supplies',
    'Other'
];

const Products = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        category: '',
        costPrice: '',
        sellPrice: '',
        quantity: '',
    });
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [fetchError, setFetchError] = useState('');
    const [monthlySellTarget, setMonthlySellTarget] = useState<string>('3000');
    const [isSavingTarget, setIsSavingTarget] = useState(false);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            setFetchError('');
            const [productsRes, settingsRes] = await Promise.all([
                api.getAllProductsAdmin(),
                api.getSettings()
            ]);
            setProducts(productsRes.products);
            setMonthlySellTarget(settingsRes.monthlySellTarget.toString());
        } catch (err) {
            setFetchError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateTarget = async () => {
        try {
            setIsSavingTarget(true);
            await api.updateSettings({ monthlySellTarget: parseInt(monthlySellTarget) || 0 });
        } catch (err) {
            alert('Failed to update monthly sell target');
        } finally {
            setIsSavingTarget(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const openCreateModal = () => {
        setEditingProduct(null);
        setFormData({ name: '', description: '', image: '', category: '', costPrice: '', sellPrice: '', quantity: '' });
        setImagePreview('');
        setCustomCategory('');
        setError('');
        setShowModal(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        const isCustomCategory = product.category && !PRODUCT_CATEGORIES.includes(product.category);
        setFormData({
            name: product.name,
            description: product.description || '',
            image: product.image || '',
            category: isCustomCategory ? 'Other' : (product.category || ''),
            costPrice: product.costPrice?.toString() || '0',
            sellPrice: product.sellPrice?.toString() || product.price?.toString() || '0',
            quantity: product.quantity.toString(),
        });
        setCustomCategory(isCustomCategory ? (product.category || '') : '');
        setImagePreview(product.image || '');
        setError('');
        setShowModal(true);
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result as string);
                };
                reader.readAsDataURL(file);

                const formData = new FormData();
                formData.append('image', file);

                const response = await api.uploadImage(formData);
                setFormData(prev => ({ ...prev, image: response.url }));
            } catch (error) {
                setError('Failed to upload image. Please try again.');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.image) {
            setError('Product image is required');
            return;
        }
        if (!formData.category && formData.category !== 'Other') {
            setError('Category is required');
            return;
        }
        if (formData.category === 'Other' && !customCategory.trim()) {
            setError('Please enter a custom category');
            return;
        }
        if (!formData.costPrice || parseFloat(formData.costPrice) < 0) {
            setError('Cost price is required and must be a positive number');
            return;
        }
        if (!formData.sellPrice || parseFloat(formData.sellPrice) < 0) {
            setError('Sell price is required and must be a positive number');
            return;
        }
        if (parseFloat(formData.sellPrice) < parseFloat(formData.costPrice)) {
            setError('Sell price must be greater than or equal to cost price');
            return;
        }
        if (!formData.quantity || parseInt(formData.quantity) < 0) {
            setError('Stock quantity is required and must be a positive number');
            return;
        }

        const finalCategory = formData.category === 'Other' ? customCategory : formData.category;

        try {
            if (editingProduct) {
                await api.updateProduct(editingProduct.id, {
                    name: formData.name,
                    description: formData.description,
                    image: formData.image,
                    category: finalCategory,
                    costPrice: parseFloat(formData.costPrice),
                    sellPrice: parseFloat(formData.sellPrice),
                    quantity: parseInt(formData.quantity),
                });
            } else {
                await api.createProduct({
                    name: formData.name,
                    description: formData.description,
                    image: formData.image,
                    category: finalCategory,
                    costPrice: parseFloat(formData.costPrice),
                    sellPrice: parseFloat(formData.sellPrice),
                    quantity: parseInt(formData.quantity) || 0,
                });
            }
            setShowModal(false);
            fetchProducts();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Operation failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.deleteProduct(id);
            fetchProducts();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete product');
        }
    };

    const calculateProfit = (costPrice: number, sellPrice: number) => {
        const profit = sellPrice - costPrice;
        const margin = costPrice > 0 ? ((profit / costPrice) * 100).toFixed(1) : '0';
        return { profit, margin };
    };

    return (
        <div>
            <Header title="Products Management" />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-gray-100 gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Package size={20} className="text-primary-600" />
                            <span className="text-sm text-gray-500">{products.length} products total</span>
                        </div>

                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Monthly Sell Target</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={monthlySellTarget}
                                        onChange={(e) => setMonthlySellTarget(e.target.value)}
                                        onBlur={handleUpdateTarget}
                                        className="bg-transparent border-none p-0 text-sm font-bold text-gray-700 focus:ring-0 w-20"
                                    />
                                    {isSavingTarget && (
                                        <div className="w-3 h-3 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <Plus size={16} />
                        Add Product
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : fetchError ? (
                        <div className="py-12 text-center">
                            <div className="text-red-500 mb-2">⚠️ Error Loading Products</div>
                            <p className="text-gray-600 text-sm">{fetchError}</p>
                            <button
                                onClick={fetchProducts}
                                className="mt-4 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                            >
                                Retry
                            </button>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="py-12 text-center">
                            <Package size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No products found.</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Product</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Category</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Cost Price</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Sell Price</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Profit</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total Stock</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Available Stock</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product: AdminProduct) => {
                                    const { profit, margin } = calculateProfit(product.costPrice || 0, product.sellPrice || product.price || 0);
                                    const soldQty = product.soldQuantity || 0;
                                    const availableStock = product.availableStock !== undefined ? product.availableStock : product.quantity;
                                    return (
                                        <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                            <ImageIcon size={20} className="text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-800">{product.name}</span>
                                                        <span className="text-xs text-gray-500 truncate max-w-[200px]">{product.description || 'No description'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                {product.category ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
                                                        <Tag size={12} />
                                                        {product.category}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-gray-600">${(product.costPrice || 0).toFixed(2)}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm font-medium text-green-600">${(product.sellPrice || product.price || 0).toFixed(2)}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        ${profit.toFixed(2)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{margin}% margin</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm font-medium text-gray-700">
                                                    {product.quantity}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-semibold ${availableStock > 10 ? 'text-green-600' : availableStock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                                                        {availableStock}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {soldQty > 0 ? `${soldQty} sold` : 'None sold'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(product)}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50"
                                                    >
                                                        <Pencil size={14} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {editingProduct ? 'Edit Product' : 'Add Product'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image *</label>
                                <div className="flex items-center gap-4">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                                            <ImageIcon size={32} className="text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                                        >
                                            <Upload size={16} />
                                            Upload from Gallery
                                        </label>
                                        <p className="text-xs text-gray-500 mt-2">Or paste an image URL below</p>
                                        <input
                                            type="text"
                                            value={formData.image}
                                            onChange={(e) => {
                                                setFormData({ ...formData, image: e.target.value });
                                                setImagePreview(e.target.value);
                                            }}
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => {
                                        setFormData({ ...formData, category: e.target.value });
                                        if (e.target.value !== 'Other') {
                                            setCustomCategory('');
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {PRODUCT_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                {formData.category === 'Other' && (
                                    <input
                                        type="text"
                                        value={customCategory}
                                        onChange={(e) => setCustomCategory(e.target.value)}
                                        placeholder="Enter custom category"
                                        className="w-full mt-2 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                                        required
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price *</label>
                                    <div className="relative">
                                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.costPrice}
                                            onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Your cost for this product</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sell Price *</label>
                                    <div className="relative">
                                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.sellPrice}
                                            onChange={(e) => setFormData({ ...formData, sellPrice: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Price shown to customers</p>
                                </div>
                            </div>

                            {formData.costPrice && formData.sellPrice && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700">Profit per unit:</span>
                                        <span className="font-semibold text-green-700">
                                            ${(parseFloat(formData.sellPrice) - parseFloat(formData.costPrice)).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm mt-1">
                                        <span className="text-gray-700">Profit margin:</span>
                                        <span className="font-semibold text-green-700">
                                            {parseFloat(formData.costPrice) > 0
                                                ? (((parseFloat(formData.sellPrice) - parseFloat(formData.costPrice)) / parseFloat(formData.costPrice)) * 100).toFixed(1)
                                                : '0'}%
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                >
                                    {editingProduct ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
