'use client';

import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { calculateTotals } from '@/lib/commerce';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  maxStock: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  shipping: number;
  total: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  hydrated: boolean;
}

const STORAGE_KEY = 'naturalvers-cart';

const CartContext = createContext<CartContextValue | null>(null);

function isStoredItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    typeof item.image === 'string' &&
    typeof item.quantity === 'number' &&
    typeof item.maxStock === 'number'
  );
}

function readStoredItems(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredItem).map((item) => ({
      ...item,
      quantity: Math.max(1, Math.min(item.quantity, item.maxStock)),
    }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredItems());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage unavailable or full: the cart stays in memory for this session.
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: Math.max(1, Math.min(i.quantity + quantity, i.maxStock)) }
            : i
        );
      }
      return [...prev, { ...item, quantity: Math.max(1, Math.min(quantity, item.maxStock)) }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const { totalItems, totalPrice, shipping, total } = useMemo(() => {
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const { subtotal, shipping, total } = calculateTotals(items);

    return { totalItems, totalPrice: subtotal, shipping, total };
  }, [items]);

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    shipping,
    total,
    isOpen,
    setIsOpen,
    hydrated,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}