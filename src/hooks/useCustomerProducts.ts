import { useState, useEffect } from 'react';
import { api, type ProductSelection, type AvailableProduct } from '../lib/api';

export interface UseCustomerProductsReturn {
    selections: ProductSelection[];
    availableProducts: AvailableProduct[];
    isLoading: boolean;
    showSelectModal: boolean;
    setShowSelectModal: React.Dispatch<React.SetStateAction<boolean>>;
    showEditModal: boolean;
    setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>;
    showDeleteModal: boolean;
    setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
    selectedProduct: AvailableProduct | null;
    setSelectedProduct: React.Dispatch<React.SetStateAction<AvailableProduct | null>>;
    editingSelection: ProductSelection | null;
    setEditingSelection: React.Dispatch<React.SetStateAction<ProductSelection | null>>;
    deletingSelection: ProductSelection | null;
    setDeletingSelection: React.Dispatch<React.SetStateAction<ProductSelection | null>>;
    quantity: string;
    setQuantity: React.Dispatch<React.SetStateAction<string>>;
    editStatus: 'Pending' | 'Success';
    setEditStatus: React.Dispatch<React.SetStateAction<'Pending' | 'Success'>>;
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    error: string;
    setError: React.Dispatch<React.SetStateAction<string>>;
    totalAmount: number;
    totalQuantity: number;
    filteredAvailable: AvailableProduct[];
    fetchData: () => Promise<void>;
    handleSelectProduct: (product: AvailableProduct) => void;
    handleConfirmSelection: (e: React.FormEvent) => Promise<void>;
    handleUpdateProduct: (e: React.FormEvent) => Promise<void>;
    handleDelete: (item: ProductSelection) => void;
    confirmDelete: () => Promise<void>;
}

export const useCustomerProducts = (): UseCustomerProductsReturn => {
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
        } catch (err) {
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

    return {
        selections,
        availableProducts,
        isLoading,
        showSelectModal,
        setShowSelectModal,
        showEditModal,
        setShowEditModal,
        showDeleteModal,
        setShowDeleteModal,
        selectedProduct,
        setSelectedProduct,
        editingSelection,
        setEditingSelection,
        deletingSelection,
        setDeletingSelection,
        quantity,
        setQuantity,
        editStatus,
        setEditStatus,
        searchQuery,
        setSearchQuery,
        error,
        setError,
        totalAmount,
        totalQuantity,
        filteredAvailable,
        fetchData,
        handleSelectProduct,
        handleConfirmSelection,
        handleUpdateProduct,
        handleDelete,
        confirmDelete,
    };
};
