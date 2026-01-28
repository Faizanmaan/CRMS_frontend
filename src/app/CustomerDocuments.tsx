import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { api, type Document } from '../lib/api';
import { Plus, Pencil, Trash2, FileText, X, Download, Upload } from 'lucide-react';

import pdfIcon from '../assets/icons/pdf.png';
import wordIcon from '../assets/icons/word.png';
import excelIcon from '../assets/icons/excel.png';

const CustomerDocuments = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDocument, setEditingDocument] = useState<Document | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'PDF',
        fileUrl: '',
        status: 'Active' as 'Active' | 'Archive',
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
            case 'PDF':
                return '.pdf';
            case 'DOC':
                return '.doc,.docx';
            case 'XLSX':
                return '.xls,.xlsx';
            default:
                return '*/*';
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

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'PDF':
                return <img src={pdfIcon} alt="PDF" className="w-6 h-6 object-contain" />;
            case 'DOC':
            case 'DOCX':
                return <img src={wordIcon} alt="Word" className="w-6 h-6 object-contain" />;
            case 'XLSX':
            case 'CSV':
                return <img src={excelIcon} alt="Excel" className="w-6 h-6 object-contain" />;
            default:
                return <FileText size={20} className="text-gray-400" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'PDF':
                return 'bg-red-50';
            case 'DOC':
            case 'DOCX':
                return 'bg-blue-50';
            case 'XLSX':
            case 'CSV':
                return 'bg-green-50';
            default:
                return 'bg-gray-50';
        }
    };

    return (
        <div>
            <Header title="My Documents" hideSearch hideDate />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <FileText size={20} className="text-primary-600" />
                        <span className="text-sm text-gray-500">{documents.length} documents</span>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <Plus size={16} />
                        Add Document
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="py-12 text-center">
                            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No documents yet. Add your first document!</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Version</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Created</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((doc) => (
                                    <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(doc.type)}`}>
                                                    {getTypeIcon(doc.type)}
                                                </div>
                                                <span className="text-sm font-medium text-gray-800">{doc.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{doc.type}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{doc.version}</td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${doc.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-500">
                                            {new Date(doc.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDownload(doc)}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 border border-green-200 rounded-lg hover:bg-green-50"
                                                    title="Download"
                                                >
                                                    <Download size={14} />
                                                    Download
                                                </button>
                                                {(doc.user?.role !== 'ADMIN' && doc.user?.role !== 'SUPER_ADMIN') && (
                                                    <>
                                                        <button
                                                            onClick={() => openEditModal(doc)}
                                                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50"
                                                        >
                                                            <Pencil size={14} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(doc.id)}
                                                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                                                        >
                                                            <Trash2 size={14} />
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {editingDocument ? 'Edit Document' : 'Add Document'}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => {
                                        setFormData({ ...formData, type: e.target.value });
                                        setSelectedFile(null);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                                >
                                    <option value="PDF">PDF</option>
                                    <option value="DOC">DOC</option>
                                    <option value="XLSX">XLSX</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {editingDocument ? 'Update File' : 'Upload File *'}
                                </label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full px-4 py-6 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all"
                                >
                                    <Upload size={24} className="text-gray-400" />
                                    <span className="text-sm text-gray-500">
                                        {selectedFile ? selectedFile.name : `Click to select ${formData.type} file`}
                                    </span>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept={getFileAccept(formData.type)}
                                        className="hidden"
                                        required={!editingDocument}
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-400">
                                    Only {formData.type} files are allowed.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Document Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Version *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={formData.version}
                                        onChange={(e) => setFormData({ ...formData, version: parseInt(e.target.value) || 1 })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Archive' })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Archive">Archive</option>
                                    </select>
                                </div>
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
                                    disabled={isSubmitting}
                                    className={`flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            {editingDocument ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        editingDocument ? 'Update' : 'Create'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDocuments;
