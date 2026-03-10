
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(
        response.status,
        `API request failed: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network error: ${error}`);
  }
}

export const api = {
  messages: {
    getAll: () => fetchApi<any[]>('/messages'),
  },

  orders: {
    getAll: () => fetchApi<any[]>('/orders'),
    create: (data: any) =>
      fetchApi<any>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  products: {
    getAll: () => fetchApi<any[]>('/products'),
    create: (data: any) =>
      fetchApi<any>('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchApi<any>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi<void>(`/products/${id}`, {
        method: 'DELETE',
      }),
  },

  analytics: {
    getSummary: () => fetchApi<any>('/analytics/summary'),
  },
};
