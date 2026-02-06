// Configuration du client API

const API_BASE_URL = typeof window !== 'undefined' 
  ? '/api/proxy'
  : process.env.API_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  status: number;
  body: any;

  constructor(status: number, body: any, message?: string) {
    super(message || (body && body.message) || `API Error: ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {};

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    // Build the full URL
    let fullUrl = `${this.baseUrl}${endpoint}`;
    
    // Add query parameters
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += `?${queryString}`;
      }
    }

    return fullUrl;
  }

  private async handleResponse(response: Response) {
    const text = await response.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = text;
    }

    if (!response.ok) {
      // If the token is invalid or expired, clear local tokens and redirect to login (client-side only)
      if (response.status === 401) {
        try {
          this.token = null;
        } catch (e) {
          // ignore
        }
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            // Redirect user to login to re-authenticate
            window.location.replace('/login');
          }
        } catch (e) {
          // ignore
        }
      }
      throw new ApiError(response.status, data, response.statusText);
    }

    return data;
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
      ...options,
    });

    return this.handleResponse(response);
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const headers = { ...this.getHeaders(), 'Content-Type': 'application/json' } as HeadersInit;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    return this.handleResponse(response);
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const headers = { ...this.getHeaders(), 'Content-Type': 'application/json' } as HeadersInit;
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    return this.handleResponse(response);
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const headers = { ...this.getHeaders(), 'Content-Type': 'application/json' } as HeadersInit;
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    return this.handleResponse(response);
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
      ...options,
    });

    return this.handleResponse(response);
  }

  // Upload de fichiers
  async upload<T>(endpoint: string, file: File, fieldName: string = 'file', fields?: Record<string, string | Blob>, method: 'POST' | 'PUT' | 'PATCH' = 'POST'): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    if (fields) {
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as any);
      });
    }
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    const url = this.buildUrl(endpoint);

    const response = await fetch(url, {
      method,
      headers,
      body: formData,
    });

    const text = await response.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = text;
    }

    if (!response.ok) {
      throw new ApiError(response.status, data, response.statusText);
    }

    return data;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
