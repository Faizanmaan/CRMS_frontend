const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
import type { AuthResponse, ApiError, User } from '../types/auth';
import type { 
  AnalyticsStats 
} from '../types/analytics';
import type { BestSellingProduct } from '../types/dashboard';
export type { User };

export interface Product {
  id: string;
  name: string;
  description?: string;
  image?: string;
  category?: string;
  price: number;
  costPrice?: number;
  sellPrice: number;
  quantity: number;
  userId: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProduct extends Product {
  soldQuantity?: number;
  availableStock?: number;
}

export interface ProductSelection {
  id: string;
  productId: string;
  name: string;
  description: string;
  price: number;
  sellPrice?: number;
  quantity: number;
  adminTotalQuantity: number;
  status: 'Pending' | 'Success';
  createdAt: string;
  updatedAt: string;
}

export interface AvailableProduct {
  id: string;
  name: string;
  description: string;
  image?: string;
  category?: string;
  price: number;
  totalQuantity: number;
  availableQuantity: number;
  adminName: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  fileUrl?: string;
  status: 'Active' | 'Archive';
  version: number;
  visibility: 'SUPER_ADMIN' | 'ADMIN' | 'ALL';
  userId: string;
  user?: {
    name: string | null;
    email: string;
    role: string;
    profilePicture: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';
  actorAvatar?: string;
  action: string;
  entityType: string;
  entityName?: string;
  details?: string;
  createdAt: string;
}

export interface DashboardPagination {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface DashboardStats extends AnalyticsStats {}

export interface DashboardStatsResponse {
  bestSellingProducts: BestSellingProduct[];
  pagination: DashboardPagination;
  stats: DashboardStats;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error((data as ApiError).error || 'Something went wrong');
    }

    return data as T;
  }

  async signup(email: string, password: string, name?: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(response.token);
    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async googleLogin(idToken: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
    this.setToken(response.token);
    return response;
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  async getAllUsers(): Promise<{ users: User[] }> {
    return this.request('/users');
  }

  async getAllAdmins(): Promise<{ users: User[] }> {
    return this.request('/users/admins');
  }

  async getAllCustomers(): Promise<{ users: User[] }> {
    return this.request('/users/customers');
  }

  async createAdmin(email: string, password: string, name?: string): Promise<{ message: string; user: User }> {
    return this.request('/users/admin', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async createCustomer(email: string, password: string, name?: string): Promise<{ message: string; user: User }> {
    return this.request('/users/customer', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async deleteAdmin(id: string): Promise<{ message: string }> {
    return this.request(`/users/admin/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteCustomer(id: string): Promise<{ message: string }> {
    return this.request(`/users/customer/${id}`, {
      method: 'DELETE',
    });
  }

  async getProducts(): Promise<{ products: (Product | ProductSelection)[] }> {
    return this.request('/products');
  }

  async createProduct(data: { name: string; description?: string; image?: string; category?: string; costPrice?: number; sellPrice?: number; price?: number; quantity?: number }): Promise<{ message: string; product: Product }> {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: Partial<{ name: string; description: string; image: string; category: string; costPrice: number; sellPrice: number; price: number; quantity: number }>): Promise<{ message: string; product: Product }> {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllProductsAdmin(): Promise<{ products: AdminProduct[] }> {
    return this.request('/products/admin');
  }

  async getAvailableProducts(): Promise<{ products: AvailableProduct[] }> {
    return this.request('/products/available');
  }

  async selectProduct(productId: string, quantity: number): Promise<{ message: string; selection: ProductSelection }> {
    return this.request('/products/select', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async removeCustomerProduct(id: string): Promise<{ message: string }> {
    return this.request(`/products/select/${id}`, {
      method: 'DELETE',
    });
  }

  async updateCustomerProduct(id: string, data: { quantity?: number; status?: string }): Promise<{ message: string; selection: ProductSelection }> {
    return this.request(`/products/select/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateCustomerProductStatus(id: string, status: 'Pending' | 'Success'): Promise<{ message: string; selection: ProductSelection }> {
    return this.request(`/products/select/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getDashboardStats(page: number = 1, limit: number = 6, startDate?: string, endDate?: string, rangeType?: string, onlySales?: boolean): Promise<DashboardStatsResponse> {
    let url = `/stats/dashboard?page=${page}&limit=${limit}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    if (rangeType) url += `&rangeType=${rangeType}`;
    if (onlySales) url += `&onlySales=true`;
    return this.request(url);
  }

  async getDeviceStats(): Promise<{ type: string; count: number }[]> {
    return this.request('/stats/device-stats');
  }

  async getSettings(): Promise<{ monthlySellTarget: number }> {
    return this.request('/settings');
  }

  async updateSettings(data: { monthlySellTarget: number }): Promise<{ monthlySellTarget: number }> {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getDocuments(): Promise<{ documents: Document[] }> {
    return this.request('/documents');
  }

  async createDocument(data: { name: string; type: string; fileUrl?: string; status?: 'Active' | 'Archive'; version?: number; visibility?: 'SUPER_ADMIN' | 'ADMIN' | 'ALL' }): Promise<{ message: string; document: Document }> {
    return this.request('/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDocument(id: string, data: Partial<{ name: string; type: string; fileUrl: string; status: 'Active' | 'Archive'; version: number; visibility: 'SUPER_ADMIN' | 'ADMIN' | 'ALL' }>): Promise<{ message: string; document: Document }> {
    return this.request(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDocument(id: string): Promise<{ message: string }> {
    return this.request(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllDocumentsAdmin(): Promise<{ documents: Document[] }> {
    return this.request('/documents/admin');
  }

  async deleteMultipleDocuments(ids: string[]): Promise<{ message: string }> {
    return this.request('/documents/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
  }

  async uploadImage(formData: FormData): Promise<{ success: boolean; url: string; publicId: string }> {
    const headers: HeadersInit = {};
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload image');
    }

    return data;
  }

  async uploadDocument(formData: FormData): Promise<{ success: boolean; url: string; publicId: string; format: string; originalFilename: string }> {
    const headers: HeadersInit = {};
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload/document`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload document');
    }

    return data;
  }

  async getNotifications(page: number = 1, limit: number = 20): Promise<{ notifications: Notification[]; pagination: { total: number; pages: number; currentPage: number; limit: number } }> {
    return this.request(`/notifications?page=${page}&limit=${limit}`);
  }

  async updateProfile(data: { name: string; profilePicture?: string; phoneNumber: string; country: string; city: string }): Promise<{ message: string; user: User }> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
