export interface Document {
    id: string;
    name: string;
    type: string;
    fileUrl?: string;
    status: 'Active' | 'Archive';
    version: number;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Customer {
    name: string;
    email: string;
    phone: string;
    address: string;
    status: 'Online' | 'Offline';
    avatar: string;
}
