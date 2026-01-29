import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { api, type ProductSelection, type AvailableProduct } from '../lib/api';
import { Plus, Pencil, Trash2, Package, X, Search, ShoppingBag } from 'lucide-react';

const CustomerProducts = () => {
    const [selections, setSelections] = useState<ProductSelection[]>([]);
    const [availableProducts, setAvailableProducts] = useState<AvailableProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showSelectModal, setShowSelectModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<AvailableProduct | null>(null);
    const [editingSelection, setEditingSelection] = useState<ProductSelection | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingSelection, setDeletingSelection] = useState<ProductSelection | null>(null);

    const [quantity, setQuantity] = useState('1');
    const [editStatus, setEditStatus] = useState<'Pending' | 'Success'>('Pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalQuantity, setTotalQuantity] = useState(0);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [selRes, availRes] = await Promise.all([
                api.getProducts(),
                api.getAvailableProducts()
            ]);
            setSelections(selRes.products as ProductSelection[]);
            setAvailableProducts(availRes.products);

            const totals = (selRes.products as ProductSelection[]).reduce((acc, curr) => ({
                amount: acc.amount + (curr.price * curr.quantity),
                quantity: acc.quantity + curr.quantity
            }), { amount: 0, quantity: 0 });

            setTotalAmount(totals.amount);
            setTotalQuantity(totals.quantity);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSelectProduct = (product: AvailableProduct) => {
        setSelectedProduct(product);
        setQuantity('1');
        setError('');
    };

    const handleConfirmSelection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
            setError('Please enter a valid quantity');
            return;
        }

        if (qty > selectedProduct.availableQuantity) {
            setError(`Only ${selectedProduct.availableQuantity} units available`);
            return;
        }

        try {
            await api.selectProduct(selectedProduct.id, qty);
            setShowSelectModal(false);
            setSelectedProduct(null);
            fetchData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to select product');
        }
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSelection) return;

        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
            setError('Please enter a valid quantity');
            return;
        }

        const avail = availableProducts.find(p => p.id === editingSelection.productId);
        if (avail) {
            const maxAvailable = avail.availableQuantity + editingSelection.quantity;
            if (qty > maxAvailable) {
                setError(`Only ${maxAvailable} units available total`);
                return;
            }
        }

        try {
            await api.updateCustomerProduct(editingSelection.id, {
                quantity: qty,
                status: editStatus
            });

            setShowEditModal(false);
            setEditingSelection(null);
            fetchData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update product');
        }
    };

    const handleDelete = (item: ProductSelection) => {
        setDeletingSelection(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deletingSelection) return;
        try {
            await api.removeCustomerProduct(deletingSelection.id);
            setShowDeleteModal(false);
            setDeletingSelection(null);
            fetchData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove product');
        }
    };



    const filteredAvailable = availableProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <Header title="My Products" hideSearch hideDate />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Package size={20} className="text-primary-600" />
                            <span className="text-sm text-gray-500">{selections.length} products selected</span>
                        </div>
                        <div className="h-4 w-px bg-gray-200"></div>
                        <div className="flex items-center gap-2">
                            <ShoppingBag size={20} className="text-green-600" />
                            <span className="text-sm font-semibold text-gray-900">Total: ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setShowSelectModal(true);
                            setSelectedProduct(null);
                            setSearchQuery('');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <Plus size={16} />
                        Select from Catalog
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : selections.length === 0 ? (
                        <div className="py-12 text-center">
                            <Package size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No products selected yet. Browse the catalog to add products!</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Product</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Price</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Your Quantity</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Subtotal</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Selected On</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selections.map((item) => (
                                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-800">{item.name}</span>
                                                <span className="text-xs text-gray-500 truncate max-w-xs">{item.description}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm font-medium text-green-600">${item.price.toFixed(2)}</span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{item.quantity}</td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.status === 'Success'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-[#FFE3E6] text-[#ED4D5C]'
                                                    }`}
                                            >
                                                {item.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-500">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingSelection(item);
                                                        setQuantity(item.quantity.toString());
                                                        setEditStatus(item.status || 'Pending');
                                                        setError('');
                                                        setShowEditModal(true);
                                                    }}
                                                    disabled={item.status === 'Success'}
                                                    className={`p-1.5 rounded-lg transition-colors ${item.status === 'Success'
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-primary-600 hover:bg-primary-50'
                                                        }`}
                                                    title={item.status === 'Success' ? "Cannot edit finalized product" : "Edit Product"}
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    disabled={item.status === 'Success'}
                                                    className={`p-1.5 rounded-lg transition-colors ${item.status === 'Success'
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-red-600 hover:bg-red-50'
                                                        }`}
                                                    title={item.status === 'Success' ? "Cannot remove finalized product" : "Remove Product"}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50/50 font-semibold">
                                <tr>
                                    <td className="py-4 px-4 text-sm text-gray-900">Total</td>
                                    <td className="py-4 px-4"></td>
                                    <td className="py-4 px-4 text-sm text-gray-900">{totalQuantity}</td>
                                    <td className="py-4 px-4 text-sm text-green-600">${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="py-4 px-4"></td>
                                    <td className="py-4 px-4"></td>
                                    <td className="py-4 px-4"></td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>
            </div>

            {showSelectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-800">Select Product from Catalog</h2>
                            <button onClick={() => setShowSelectModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto">
                            <div className="mb-6 relative">
                                <input
                                    type="text"
                                    placeholder="Search catalog..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                                />
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredAvailable.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => handleSelectProduct(product)}
                                        className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedProduct?.id === product.id
                                            ? 'border-primary-600 bg-primary-50/50 ring-1 ring-primary-600'
                                            : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-medium text-gray-800">{product.name}</h3>
                                            <span className="text-sm font-bold text-green-600">${product.price.toFixed(2)}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description || 'No description available'}</p>
                                        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold">
                                            <span></span>
                                            <span className={product.availableQuantity > 0 ? 'text-primary-600' : 'text-red-500'}>
                                                {product.availableQuantity} available
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedProduct && (
                            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                                <form onSubmit={handleConfirmSelection} className="flex items-end gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Quantity to Allocate (Max {selectedProduct.availableQuantity})
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="number"
                                                min="1"
                                                max={selectedProduct.availableQuantity}
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                                                required
                                            />
                                            <div className="flex flex-col items-end min-w-[120px]">
                                                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Total Price</span>
                                                <span className="text-lg font-bold text-green-600">
                                                    ${(selectedProduct.price * (parseInt(quantity) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                                    >
                                        <ShoppingBag size={18} />
                                        Confirm Selection
                                    </button>
                                </form>
                                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showEditModal && editingSelection && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Update Product</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Update details for <strong>{editingSelection.name}</strong></p>

                        <form onSubmit={handleUpdateProduct} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    disabled={editingSelection.status === 'Success'}
                                    className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 ${editingSelection.status === 'Success' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                    required
                                />
                                {editingSelection.status === 'Success' && (
                                    <p className="text-xs text-amber-600 mt-1">Change status to Pending to update quantity</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value as 'Pending' | 'Success')}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Success">Success</option>
                                </select>
                            </div>
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal && deletingSelection && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4 mx-auto">
                            <Trash2 size={24} className="text-red-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">Remove Product?</h2>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            Are you sure you want to remove <strong>{deletingSelection.name}</strong> from your list? This action cannot be undone.
                        </p>

                        {error && <p className="text-sm text-red-600 text-center mb-4">{error}</p>}

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletingSelection(null);
                                    setError('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerProducts;