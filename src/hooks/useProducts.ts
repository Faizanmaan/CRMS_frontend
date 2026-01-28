import { useState, useEffect } from 'react';
import { api, type Product } from '../lib/api';

export interface ProductFormData {
    name: string;
    description: string;
    image: string;
    category: string;
    costPrice: string;
    sellPrice: string;
    quantity: string;
}

export interface UseProductsReturn {
    products: Product[];
    isLoading: boolean;
    fetchError: string;
    showModal: boolean;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    editingProduct: Product | null;
    formData: ProductFormData;
    setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
    error: string;
    setError: React.Dispatch<React.SetStateAction<string>>;
    imagePreview: string;
    setImagePreview: React.Dispatch<React.SetStateAction<string>>;
    customCategory: string;
    setCustomCategory: React.Dispatch<React.SetStateAction<string>>;
    monthlySellTarget: string;
    setMonthlySellTarget: React.Dispatch<React.SetStateAction<string>>;
    isSavingTarget: boolean;
    fetchProducts: () => Promise<void>;
    openCreateModal: () => void;
    openEditModal: (product: Product) => void;
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    handleDelete: (id: string) => Promise<void>;
    handleUpdateTarget: () => Promise<void>;
    calculateProfit: (costPrice: number, sellPrice: number) => { profit: number; margin: string };
}

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

export { PRODUCT_CATEGORIES };

export const useProducts = (): UseProductsReturn => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<ProductFormData>({
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
        setCustomCategory(isCustomCategory ? product.category! : '');
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

                const uploadFormData = new FormData();
                uploadFormData.append('image', file);
                const response = await api.uploadImage(uploadFormData);
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

    return {
        products,
        isLoading,
        fetchError,
        showModal,
        setShowModal,
        editingProduct,
        formData,
        setFormData,
        error,
        setError,
        imagePreview,
        setImagePreview,
        customCategory,
        setCustomCategory,
        monthlySellTarget,
        setMonthlySellTarget,
        isSavingTarget,
        fetchProducts,
        openCreateModal,
        openEditModal,
        handleImageChange,
        handleSubmit,
        handleDelete,
        handleUpdateTarget,
        calculateProfit,
    };
};
