import { API_CONFIG } from '@/src/config/api-config';
import { SecureStorage } from '@/src/services/auth';
import type {
  AddressResponse,
  SearchResponse,
  InstamartCart,
  AddToCartRequest,
} from './types';

/**
 * Instamart API Client
 *
 * Low-level fetch wrappers for Instamart endpoints.
 * Handles authentication headers and basic error parsing.
 */

const { baseUrl, endpoints } = API_CONFIG;

export class InstamartApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'InstamartApiError';
  }
}

/**
 * Helper to fetch with auth token
 */
async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await SecureStorage.getBackendToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // We handle the 401 redirect logic in the Service layer or Store
    // but the error should be descriptive
    throw new InstamartApiError('Authentication expired', 401, 'SWIGGY_AUTH_EXPIRED');
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new InstamartApiError(
      errorData.message || `API request failed with status ${res.status}`,
      res.status,
      errorData.code
    );
  }

  return res;
}

export const instamartClient = {
  /**
   * Fetch user's saved delivery addresses
   */
  async getAddresses(): Promise<AddressResponse> {
    const res = await authenticatedFetch(endpoints.instamartAddresses);
    return res.json();
  },

  /**
   * Search for products at a specific address
   */
  async searchProducts(query: string, addressId: string): Promise<SearchResponse> {
    const params = new URLSearchParams({ query, addressId });
    const res = await authenticatedFetch(`${endpoints.instamartSearch}?${params.toString()}`);
    return res.json();
  },

  /**
   * Fetch current cart and bill breakdown
   */
  async getCart(addressId?: string): Promise<InstamartCart> {
    const url = addressId 
      ? `${endpoints.instamartCart}?addressId=${addressId}`
      : endpoints.instamartCart;
    const res = await authenticatedFetch(url);
    return res.json();
  },

  /**
   * Add a product variation to the cart
   */
  async addToCart(data: AddToCartRequest): Promise<InstamartCart> {
    const res = await authenticatedFetch(endpoints.instamartAddToCart, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
