import { useState, useEffect, useRef } from 'react';
import { api, type Document } from '../lib/api';

export interface DocumentFormData {
    name: string;
    type: string;
    fileUrl: string;
    status: 'Active' | 'Archive';
    version: number;
    visibility: 'SUPER_ADMIN' | 'ADMIN' | 'ALL';
}

export interface UseDocumentsReturn {
    documents: Document[];
    filteredDocuments: Document[];
    isLoading: boolean;
    activeTab: 'all' | 'active' | 'archive';
    setActiveTab: React.Dispatch<React.SetStateAction<'all' | 'active' | 'archive'>>;
    selectedIds: string[];
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
    showModal: boolean;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    editingDocument: Document | null;
    formData: DocumentFormData;
    setFormData: React.Dispatch<React.SetStateAction<DocumentFormData>>;
    selectedFile: File | null;
    setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
    isSubmitting: boolean;
    error: string;
    setError: React.Dispatch<React.SetStateAction<string>>;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    fetchDocuments: () => Promise<void>;
    openCreateModal: () => void;
    openEditModal: (doc: Document) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    handleDelete: (id: string) => Promise<void>;
    handleBulkDelete: () => Promise<void>;
    handleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectOne: (id: string) => void;
    getFileAccept: (type: string) => string;
}

export const useDocuments = (): UseDocumentsReturn => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'archive'>('all');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingDocument, setEditingDocument] = useState<Document | null>(null);
    const [formData, setFormData] = useState<DocumentFormData>({
        name: '',
        type: 'PDF',
        fileUrl: '',
        status: 'Active',
        version: 1,
        visibility: 'ALL',
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const res = await api.getAllDocumentsAdmin();
            setDocuments(res.documents);
        } catch (err) {
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const filteredDocuments = documents.filter(doc => {
        if (activeTab === 'all') return true;
        if (activeTab === 'active') return doc.status === 'Active';
        if (activeTab === 'archive') return doc.status === 'Archive';
        return true;
    });

    const openCreateModal = () => {
        setEditingDocument(null);
        setFormData({ name: '', type: 'PDF', fileUrl: '', status: 'Active', version: 1, visibility: 'ALL' });
        setSelectedFile(null);
        setError('');
        setShowModal(true);
    };

    const openEditModal = (doc: Document) => {
        setEditingDocument(doc);
        setFormData({
            name: doc.name,
            type: doc.type,
            fileUrl: doc.fileUrl || '',
            status: doc.status,
            version: doc.version,
            visibility: doc.visibility || 'ALL',
        });
        setSelectedFile(null);
        setError('');
        setShowModal(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (!formData.name) {
                setFormData({ ...formData, name: file.name.split('.')[0] });
            }
        }
    };

    const getFileAccept = (type: string) => {
        switch (type) {
            case 'PDF': return '.pdf';
            case 'DOC': return '.doc,.docx';
            case 'XLSX': return '.xls,.xlsx';
            default: return '*/*';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            let fileUrl = formData.fileUrl;
            if (selectedFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', selectedFile);
                try {
                    const uploadRes = await api.uploadDocument(uploadFormData);
                    fileUrl = uploadRes.url;
                } catch (uploadError) {
                    throw new Error('Failed to upload file: ' + (uploadError instanceof Error ? uploadError.message : 'Unknown error'));
                }
            }

            if (editingDocument) {
                await api.updateDocument(editingDocument.id, {
                    name: formData.name,
                    type: formData.type,
                    fileUrl: fileUrl,
                    status: formData.status,
                    version: formData.version,
                    visibility: formData.visibility,
                });
            } else {
                await api.createDocument({
                    name: formData.name,
                    type: formData.type,
                    fileUrl: fileUrl || undefined,
                    status: formData.status,
                    version: formData.version,
                    visibility: formData.visibility,
                });
            }
            setShowModal(false);
            fetchDocuments();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return;
        try {
            await api.deleteDocument(id);
            fetchDocuments();
        } catch (err) {
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} documents?`)) return;
        try {
            await api.deleteMultipleDocuments(selectedIds);
            setSelectedIds([]);
            fetchDocuments();
        } catch (err) {
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredDocuments.map(d => d.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return {
        documents,
        filteredDocuments,
        isLoading,
        activeTab,
        setActiveTab,
        selectedIds,
        setSelectedIds,
        showModal,
        setShowModal,
        editingDocument,
        formData,
        setFormData,
        selectedFile,
        setSelectedFile,
        isSubmitting,
        error,
        setError,
        fileInputRef,
        fetchDocuments,
        openCreateModal,
        openEditModal,
        handleFileChange,
        handleSubmit,
        handleDelete,
        handleBulkDelete,
        handleSelectAll,
        handleSelectOne,
        getFileAccept,
    };
};
