import { instamartClient, InstamartApiError } from './instamart-client';
import type {
  DeliveryAddress,
  InstamartProduct,
  InstamartCart,
  SearchResponse,
} from './types';

/**
 * Instamart Service
 *
 * High-level business logic for Instamart operations.
 * Bridges the gap between raw API calls and the UI/Store.
 */

export const instamartService = {
  /**
   * Get all addresses and normalize them if needed
   */
  async fetchAddresses(): Promise<DeliveryAddress[]> {
    try {
      const response = await instamartClient.getAddresses();
      return response.addresses;
    } catch (error) {
      this.handleError(error, 'Failed to fetch addresses');
      return [];
    }
  },

  /**
   * Search for products and return a flattened list
   */
  async search(query: string, addressId: string): Promise<InstamartProduct[]> {
    if (!query || !addressId) return [];
    
    try {
      const response = await instamartClient.searchProducts(query, addressId);
      return response.products;
    } catch (error) {
      this.handleError(error, `Failed to search for "${query}"`);
      return [];
    }
  },

  /**
   * Get current cart status
   */
  async fetchCart(addressId?: string): Promise<InstamartCart | null> {
    try {
      return await instamartClient.getCart(addressId);
    } catch (error) {
      this.handleError(error, 'Failed to fetch cart');
      return null;
    }
  },

  /**
   * Add item to cart and return updated cart
   */
  async addItemToCart(spinId: string, quantity: number, addressId: string): Promise<InstamartCart | null> {
    try {
      return await instamartClient.addToCart({ spinId, quantity, addressId });
    } catch (error) {
      this.handleError(error, 'Failed to add item to cart');
      return null;
    }
  },

  /**
   * Centralized error handling for the service
   */
  handleError(error: unknown, defaultMessage: string): void {
    if (error instanceof InstamartApiError) {
      console.error(`[InstamartService] ${error.message} (Status: ${error.statusCode})`);
      
      // If 401, we re-throw to let the caller (Store) handle navigation/invalidation
      if (error.statusCode === 401) {
        throw error;
      }
    } else {
      console.error(`[InstamartService] ${defaultMessage}:`, error);
    }
  },
};
