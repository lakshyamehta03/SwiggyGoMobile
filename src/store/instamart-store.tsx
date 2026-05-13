import React, { createContext, useReducer, useCallback, useMemo, useEffect, useContext } from 'react';
import { secureStorage } from '@/src/services/auth/implementations/SecureStorage';
import { instamartService } from '@/src/services/instamart';
import type { DeliveryAddress, InstamartCart } from '@/src/services/instamart';
import { useAuth } from './auth-store';

// ─── Constants ───────────────────────────────────────────────────────────────

const SELECTED_ADDRESS_ID_KEY = 'swiggygo_selected_address_id';

// ─── State ───────────────────────────────────────────────────────────────────

export interface InstamartState {
  addresses: DeliveryAddress[];
  selectedAddressId: string | null;
  cart: InstamartCart | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: InstamartState = {
  addresses: [],
  selectedAddressId: null,
  cart: null,
  isLoading: false,
  error: null,
};

// ─── Actions ─────────────────────────────────────────────────────────────────

type InstamartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ADDRESSES'; payload: DeliveryAddress[] }
  | { type: 'SET_SELECTED_ADDRESS'; payload: string }
  | { type: 'SET_CART'; payload: InstamartCart | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR' };

function instamartReducer(state: InstamartState, action: InstamartAction): InstamartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ADDRESSES':
      return { ...state, addresses: action.payload, isLoading: false };
    case 'SET_SELECTED_ADDRESS':
      return { ...state, selectedAddressId: action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload, isLoading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR':
      return initialState;
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface InstamartContextValue {
  state: InstamartState;
  refreshAddresses: () => Promise<void>;
  refreshCart: () => Promise<void>;
  setSelectedAddress: (addressId: string) => Promise<void>;
  addItemToCart: (spinId: string, quantity: number) => Promise<boolean>;
  updateItemQuantity: (spinId: string, quantity: number) => Promise<boolean>;
  removeItem: (spinId: string) => Promise<boolean>;
  clearError: () => void;
  selectedAddress: DeliveryAddress | null;
}

const InstamartContext = createContext<InstamartContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function InstamartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(instamartReducer, initialState);
  const { state: authState, invalidateSession } = useAuth();

  // ── Helper: Handle 401s ───────────────────────────────────────────
  const wrapApiCall = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    try {
      return await fn();
    } catch (err: any) {
      if (err.statusCode === 401) {
        await invalidateSession();
      } else {
        dispatch({ type: 'SET_ERROR', payload: err.message || 'An error occurred' });
      }
      return null;
    }
  }, [invalidateSession]);

  // ── Refresh Cart ─────────────────────────────────────────────────
  const refreshCart = useCallback(async (addressId?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    // Use provided addressId or fall back to state
    const targetAddressId = addressId || state.selectedAddressId;
    const cart = await wrapApiCall(() => instamartService.fetchCart(targetAddressId || undefined));
    if (cart !== undefined) {
      dispatch({ type: 'SET_CART', payload: cart });
    }
  }, [state.selectedAddressId, wrapApiCall]);

  // ── Refresh Addresses ────────────────────────────────────────────
  const refreshAddresses = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const addresses = await wrapApiCall(() => instamartService.fetchAddresses());
    if (addresses) {
      dispatch({ type: 'SET_ADDRESSES', payload: addresses });
      
      // If no address selected, pick the first one
      if (!state.selectedAddressId && addresses.length > 0) {
        const storedId = await secureStorage.getItem(SELECTED_ADDRESS_ID_KEY);
        const initialId = storedId && addresses.find(a => a.id === storedId) 
          ? storedId 
          : addresses[0].id;
        
        dispatch({ type: 'SET_SELECTED_ADDRESS', payload: initialId });
        await secureStorage.setItem(SELECTED_ADDRESS_ID_KEY, initialId);
        
        // After setting initial address, refresh the cart for that address
        await refreshCart(initialId);
      } else if (state.selectedAddressId) {
        // Even if we have a selected address, refresh it to be safe
        await refreshCart(state.selectedAddressId);
      }
    }
  }, [state.selectedAddressId, wrapApiCall, refreshCart]);

  // ── Set Selected Address ─────────────────────────────────────────
  const setSelectedAddress = useCallback(async (addressId: string) => {
    dispatch({ type: 'SET_SELECTED_ADDRESS', payload: addressId });
    await secureStorage.setItem(SELECTED_ADDRESS_ID_KEY, addressId);
    // Refresh cart because price/availability might change with address
    await refreshCart(addressId);
  }, [refreshCart]);

  // ── Add Item to Cart ─────────────────────────────────────────────
  const addItemToCart = useCallback(async (spinId: string, quantity: number) => {
    if (!state.selectedAddressId) {
      dispatch({ type: 'SET_ERROR', payload: 'Please select a delivery address' });
      return;
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    const updatedCart = await wrapApiCall(() => 
      instamartService.addItemToCart(spinId, quantity, state.selectedAddressId!)
    );
    if (updatedCart) {
      dispatch({ type: 'SET_CART', payload: updatedCart });
      return true;
    } else {
      // Refresh to get actual availability if add fails
      await refreshCart();
      return false;
    }
  }, [state.selectedAddressId, wrapApiCall, refreshCart]);

  // ── Update Item Quantity ─────────────────────────────────────────
  const updateItemQuantity = useCallback(async (spinId: string, quantity: number) => {
    if (!state.selectedAddressId || !state.cart) return false;

    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Construct new items list
    const newItems = state.cart.items.map(item => ({
      spinId: item.spinId,
      quantity: item.spinId === spinId ? quantity : item.quantity
    })).filter(item => item.quantity > 0);

    const updatedCart = await wrapApiCall(() => 
      instamartService.updateCart(newItems, state.selectedAddressId!)
    );
    
    if (updatedCart) {
      dispatch({ type: 'SET_CART', payload: updatedCart });
      return true;
    } else {
      // If update fails (e.g., partial availability), refresh to get actual stock status
      await refreshCart();
      return false;
    }
  }, [state.selectedAddressId, state.cart, wrapApiCall, refreshCart]);

  // ── Remove Item ──────────────────────────────────────────────────
  const removeItem = useCallback(async (spinId: string) => {
    return updateItemQuantity(spinId, 0);
  }, [updateItemQuantity]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // ── Initial Load: Only clear if not authenticated ──────────
  useEffect(() => {
    if (authState.phase !== 'authenticated') {
      dispatch({ type: 'CLEAR' });
    } else {
      // Start by loading addresses; it will cascade into cart refresh
      refreshAddresses();
    }
  }, [authState.phase, refreshAddresses]);

  // ── Computed: Selected Address Object ────────────────────────────
  const selectedAddress = useMemo(() => {
    return state.addresses.find(a => a.id === state.selectedAddressId) || null;
  }, [state.addresses, state.selectedAddressId]);

  const value = useMemo(() => ({
    state,
    refreshAddresses,
    refreshCart,
    setSelectedAddress,
    addItemToCart,
    updateItemQuantity,
    removeItem,
    clearError,
    selectedAddress,
  }), [state, refreshAddresses, refreshCart, setSelectedAddress, addItemToCart, updateItemQuantity, removeItem, clearError, selectedAddress]);

  return (
    <InstamartContext.Provider value={value}>
      {children}
    </InstamartContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useInstamart() {
  const context = useContext(InstamartContext);
  if (!context) {
    throw new Error('useInstamart must be used within an InstamartProvider');
  }
  return context;
}
