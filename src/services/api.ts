import axios, { type AxiosInstance } from 'axios';
import { saveUser, clearUser } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class SportApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.token = typeof window !== 'undefined' ? (localStorage.getItem('obc_access_token') || localStorage.getItem('token')) : null;

    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request Interceptor: Attach Bearer Token
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, (error) => Promise.reject(error));

    // Response Interceptor: Unwrap envelope and handle 401
    this.client.interceptors.response.use(
      (response) => {
        // If wrapped in standard envelope { success: true, data: ... }
        if (response.data && response.data.success !== undefined && response.data.data !== undefined) {
          return response.data.data;
        }
        return response.data;
      },
      (error) => {
        if (error.response?.status === 401) {
          this.clearSession();
        }
        const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Terjadi kesalahan sistem.';
        return Promise.reject(new Error(message));
      }
    );
  }

  public getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('obc_access_token') || localStorage.getItem('token');
    }
    return this.token;
  }

  public setToken(token: string | null, refreshToken?: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('obc_access_token', token);
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('obc_access_token');
        localStorage.removeItem('token');
      }
      if (refreshToken) {
        localStorage.setItem('obc_refresh_token', refreshToken);
      } else if (token === null) {
        localStorage.removeItem('obc_refresh_token');
      }
    }
  }

  public clearSession() {
    this.setToken(null);
    clearUser();
  }

  // ===========================================================================
  // AUTH
  // ===========================================================================

  public async login(email: string, password: string): Promise<any> {
    const data: any = await this.client.post('/auth/customer/login', { email, password });
    if (data.accessToken) {
      this.setToken(data.accessToken, data.refreshToken);
    }
    if (data.customer) {
      saveUser({
        name: data.customer.name,
        email: data.customer.email,
      });
    }
    return data;
  }

  public async register(payload: { email: string; password: string; name: string; phone?: string }): Promise<any> {
    const data: any = await this.client.post('/auth/customer/register', payload);
    if (data.accessToken) {
      this.setToken(data.accessToken, data.refreshToken);
    }
    if (data.customer) {
      saveUser({
        name: data.customer.name,
        email: data.customer.email,
      });
    }
    return data;
  }

  public async loginWithGoogle(idToken: string): Promise<any> {
    const data: any = await this.client.post('/auth/customer/google', { idToken });
    if (data.accessToken) {
      this.setToken(data.accessToken, data.refreshToken);
    }
    if (data.customer) {
      saveUser({
        name: data.customer.name,
        email: data.customer.email,
      });
    }
    return data;
  }

  public async forgotPassword(email: string): Promise<any> {
    return this.client.post('/auth/customer/forgot-password', { email });
  }

  public async resetPassword(token: string, newPassword: string): Promise<any> {
    return this.client.post('/auth/customer/reset-password', { token, newPassword });
  }

  public logout(): void {
    this.clearSession();
  }

  // ===========================================================================
  // CUSTOMER PROFILE
  // ===========================================================================

  public async getProfile(): Promise<any> {
    return this.client.get('/customer/profile');
  }

  public async updateProfile(payload: { name?: string; username?: string | null; phone?: string | null; bio?: string | null }): Promise<any> {
    const updated: any = await this.client.put('/customer/profile', payload);
    if (updated.name || updated.email) {
      saveUser({
        name: updated.name,
        email: updated.email,
      });
    }
    return updated;
  }

  public async uploadAvatar(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.client.post('/customer/avatar', formData);
  }

  public async deleteAvatar(): Promise<any> {
    return this.client.delete('/customer/avatar');
  }

  public async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    return this.client.put('/customer/password', { currentPassword, newPassword });
  }

  // ===========================================================================
  // SPORTS RESOURCES & AVAILABILITY
  // ===========================================================================

  public async getResources(sportType?: string): Promise<any> {
    const params = sportType ? { sportType } : {};
    return this.client.get('/sports/resources', { params });
  }

  public async getAvailability(resourceId: string, date: string): Promise<any> {
    return this.client.get('/sports/availability', {
      params: { resourceId, date },
    });
  }

  public async calculatePricing(payload: {
    resourceId: string;
    bookingDate: string;
    startMinute: number;
    endMinute: number;
    sportType?: string;
  }): Promise<any> {
    return this.client.post('/sports/pricing/calculate', payload);
  }

  // ===========================================================================
  // BOOKINGS
  // ===========================================================================

  public async createBooking(payload: {
    resourceId: string;
    bookingDate: string;
    startMinute: number;
    endMinute: number;
    sportType: string;
    notes?: string;
  }): Promise<any> {
    return this.client.post('/sports/bookings', payload);
  }

  public async getBooking(id: string): Promise<any> {
    return this.client.get(`/sports/bookings/${id}`);
  }

  public async cancelBooking(id: string, reason?: string): Promise<any> {
    return this.client.post(`/sports/bookings/${id}/cancel`, { cancellationReason: reason });
  }

  // ===========================================================================
  // REVIEWS & RATINGS
  // ===========================================================================

  public async getResourceReviews(resourceId: string, params?: { page?: number; limit?: number; rating?: number; category?: string }): Promise<any> {
    return this.client.get(`/sports/resources/${resourceId}/reviews`, { params });
  }

  public async createReview(resourceId: string, payload: { rating: number; comment: string; category?: string; bookingId?: string; photos?: string[] }): Promise<any> {
    return this.client.post(`/sports/resources/${resourceId}/reviews`, payload);
  }

  // ===========================================================================
  // NOTIFICATIONS
  // ===========================================================================

  public async getNotifications(page: number = 1, limit: number = 15): Promise<any> {
    return this.client.get('/customer/notifications', { params: { page, limit } });
  }

  public async getUnreadNotificationCount(): Promise<{ unreadCount: number }> {
    return this.client.get('/customer/notifications/unread-count');
  }

  public async markNotificationAsRead(id: string): Promise<any> {
    return this.client.patch(`/customer/notifications/${id}/read`);
  }

  public async markAllNotificationsAsRead(): Promise<any> {
    return this.client.patch('/customer/notifications/read-all');
  }
}

export const sportApi = new SportApiClient();
export default sportApi;
