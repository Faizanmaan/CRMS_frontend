import { useState, useEffect, useRef } from 'react';
import { api, type Document } from '../lib/api';

export interface CustomerDocumentFormData {
    name: string;
    type: string;
    fileUrl: string;
    status: 'Active' | 'Archive';
    version: number;
}

export interface UseCustomerDocumentsReturn {
    documents: Document[];
    isLoading: boolean;
    showModal: boolean;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    editingDocument: Document | null;
    formData: CustomerDocumentFormData;
    setFormData: React.Dispatch<React.SetStateAction<CustomerDocumentFormData>>;
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
    handleDownload: (doc: Document) => void;
    getFileAccept: (type: string) => string;
}

export const useCustomerDocuments = (): UseCustomerDocumentsReturn => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDocument, setEditingDocument] = useState<Document | null>(null);
    const [formData, setFormData] = useState<CustomerDocumentFormData>({
        name: '',
        type: 'PDF',
        fileUrl: '',
        status: 'Active',
        version: 1,
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const res = await api.getDocuments();
            setDocuments(res.documents);
        } catch (err) {
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const openCreateModal = () => {
        setEditingDocument(null);
        setFormData({ name: '', type: 'PDF', fileUrl: '', status: 'Active', version: 1 });
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
                });
            } else {
                await api.createDocument({
                    name: formData.name,
                    type: formData.type,
                    fileUrl: fileUrl || undefined,
                    status: formData.status,
                    version: formData.version,
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

    const downloadFile = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            window.open(url, '_blank');
        }
    };

    const handleDownload = (doc: Document) => {
        if (!doc.fileUrl) {
            alert('No file available for download');
            return;
        }
        downloadFile(doc.fileUrl, `${doc.name}.${doc.type.toLowerCase()}`);
    };

    return {
        documents,
        isLoading,
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
        handleDownload,
        getFileAccept,
    };
};
