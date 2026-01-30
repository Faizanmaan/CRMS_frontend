import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { Search, ChevronLeft, ChevronRight, FileText, Plus, Upload, X } from 'lucide-react';
import { api, type Document } from '../lib/api';

import pdfIcon from '../assets/icons/pdf.png';
import wordIcon from '../assets/icons/word.png';
import excelIcon from '../assets/icons/excel.png';

const Documents = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const tabs = ['All', 'Active', 'Archive'];

    const [showModal, setShowModal] = useState(false);
    const [editingDocument, setEditingDocument] = useState<Document | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'PDF',
        fileUrl: '',
        status: 'Active' as 'Active' | 'Archive',
        version: 1,
        visibility: 'ALL' as 'SUPER_ADMIN' | 'ADMIN' | 'ALL',
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
            visibility: doc.visibility,
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
                    fileUrl: fileUrl || undefined,
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

    const filteredDocuments = documents.filter(doc => {
        const matchesTab = activeTab === 'All' || doc.status === activeTab;
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredDocuments.map(doc => doc.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleDeleteBulk = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} documents?`)) return;

        try {
            await api.deleteMultipleDocuments(selectedIds);
            setSelectedIds([]);
            fetchDocuments();
        } catch (err) {
            alert('Failed to delete some documents');
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

    const handleDownloadBulk = async () => {
        if (selectedIds.length === 0) return;

        const selectedDocs = documents.filter(doc => selectedIds.includes(doc.id));
        const docsWithUrls = selectedDocs.filter(doc => doc.fileUrl);

        if (docsWithUrls.length === 0) {
            alert('None of the selected documents have file URLs');
            return;
        }

        for (const doc of docsWithUrls) {
            if (doc.fileUrl) {
                await downloadFile(doc.fileUrl, `${doc.name}.${doc.type.toLowerCase()}`);
            }
        }
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
            <Header title="Documents" hideSearch hideDate />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-gray-100">
                    <div className="flex items-center md:mx-0 mx-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    setSelectedIds([]);
                                }}
                                className={`text-sm font-bold px-5 pb-2 transition-colors ${activeTab === tab
                                    ? 'text-primary-600 border-b-4 border-primary-600'
                                    : 'text-gray-900 hover:text-gray-700 border-b-4'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex md:flex-row flex-col items-center justify-center md:mx-0 mx-auto gap-3">
                        <div className="flex items-center">
                            <input
                                type="text"
                                placeholder="Type here"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="md:w-48 w-30 pl-4 pr-4 py-2 text-sm border border-r-0 border-gray-200 rounded-l-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                            />
                            <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-r-sm hover:bg-primary-700 transition-colors flex items-center gap-2">
                                <Search size={16} />
                                Search
                            </button>
                        </div>
                        <div className="flex sm:flex-row flex-col items-center justify-center w-full gap-2">
                            <button
                                onClick={handleDownloadBulk}
                                disabled={selectedIds.length === 0}
                                className={`flex items-center justify-center gap-2 px-4 py-2 text-sm w-full font-medium border rounded-sm transition-colors ${selectedIds.length > 0
                                    ? 'text-primary-600 border-primary-600 hover:bg-primary-100'
                                    : 'text-primary-600 border-primary-600 cursor-not-allowed'
                                    }`}
                            >
                                Download {selectedIds.length > 0 && `(${selectedIds.length})`}
                            </button>

                            <button
                                onClick={handleDeleteBulk}
                                disabled={selectedIds.length === 0}
                                className={`flex items-center justify-center gap-2 px-4 py-2 text-sm w-full font-medium border rounded-sm transition-colors ${selectedIds.length > 0
                                    ? 'text-primary-600 border-primary-600 hover:bg-primary-100'
                                    : 'text-primary-600 border-primary-600 cursor-not-allowed'
                                    }`}
                            >
                                Delete {selectedIds.length > 0 && `(${selectedIds.length})`}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto w-full">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="py-12 text-center">
                            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No documents found.</p>
                        </div>
                    ) : (
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-primary-100 whitespace-nowrap">
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 rounded-l-xl">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            checked={selectedIds.length === filteredDocuments.length && filteredDocuments.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Document Name</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Type</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Author</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Version</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Status</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 rounded-r-xl">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredDocuments.map((doc) => (
                                    <tr key={doc.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(doc.id) ? 'bg-primary-50/30' : ''}`}>
                                        <td className="py-4 px-6">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                checked={selectedIds.includes(doc.id)}
                                                onChange={() => handleSelectOne(doc.id)}
                                            />
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(doc.type)}`}>
                                                    {getTypeIcon(doc.type)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Uploaded {new Date(doc.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600">{doc.type}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                {doc.user?.profilePicture ? (
                                                    <img
                                                        src={doc.user.profilePicture}
                                                        alt={doc.user.name || 'User'}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                                                        {(doc.user?.name || 'U').charAt(0)}
                                                    </div>
                                                )}
                                                <span className="text-sm text-gray-700">{doc.user?.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600">{doc.version}</td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${doc.status === 'Active'
                                                    ? 'bg-[#E1F4CB] text-[#62912C]'
                                                    : 'bg-red-100 text-red-600'
                                                    }`}
                                            >
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => doc.fileUrl && downloadFile(doc.fileUrl, `${doc.name}.${doc.type.toLowerCase()}`)}
                                                    className="px-3 py-1.5 text-sm font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
                                                >
                                                    Download
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(doc)}
                                                    className="px-3 py-1.5 text-sm font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-black font-medium">
                        Showing {filteredDocuments.length} of {documents.length} entries
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50">
                            <ChevronLeft size={16} />
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center text-sm font-medium">
                            1
                        </button>
                        <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus size={16} />
                    Create Document
                </button>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Upload size={16} />
                    Upload
                </button>
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Visibility *</label>
                                <select
                                    value={formData.visibility}
                                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value as 'SUPER_ADMIN' | 'ADMIN' | 'ALL' })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                                >
                                    <option value="SUPER_ADMIN">Super Admins only</option>
                                    <option value="ADMIN">Admins only</option>
                                    <option value="ALL">All</option>
                                </select>
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

export default Documents;
