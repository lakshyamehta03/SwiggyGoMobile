/**
 * Instamart Data Models / DTOs
 * Based on @.agent/docs/instamart/api-handoff.md
 */

export interface InstamartProduct {
  id: string;
  name: string;
  brand: string;
  variations: InstamartVariation[];
}

export interface InstamartVariation {
  spinId: string;
  quantity: string;
  price: number;
  mrp: number;
  isAvailable: boolean;
  imageUrl: string;
}

export interface InstamartCart {
  total: string;
  items: CartItem[];
  billBreakdown: BillLineItem[];
  toPay: string;
  address: DeliveryAddress | null;
  message?: string;
}

export interface CartItem {
  spinId: string;
  name: string;
  quantity: number;
  price: number;
  mrp: number;
  imageUrl?: string;
}

export interface BillLineItem {
  label: string;
  value: string;
}

export interface DeliveryAddress {
  id: string;
  line: string;
  tag: string;
  category: string;
  phone: string;
}

export interface AddressResponse {
  addresses: DeliveryAddress[];
}

export interface SearchResponse {
  products: InstamartProduct[];
  message: string;
}

export interface AddToCartRequest {
  spinId: string;
  quantity: number;
  addressId: string;
}
