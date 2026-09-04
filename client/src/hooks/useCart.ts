import { useState, useEffect, useCallback } from 'react';

import { logger } from '@lark-apaas/client-toolkit/logger';

const CART_STORAGE_KEY = 'beidi_cart';

export interface CartItem {
  productId: string;
  styleNo: string;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: string;
  image?: string;
}

function loadCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error: unknown) {
    logger.error(`[useCart] loadCartFromStorage failed: ${String(error)}`);
    return [];
  }
}

function saveCartToStorage(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error: unknown) {
    logger.error(`[useCart] saveCartToStorage failed: ${String(error)}`);
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());

  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const addItem = useCallback((newItem: CartItem) => {
    setItems((prevItems: CartItem[]) => {
      const existingIndex = prevItems.findIndex(
        (item: CartItem) =>
          item.productId === newItem.productId &&
          item.color === newItem.color &&
          item.size === newItem.size,
      );
      if (existingIndex >= 0) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + newItem.quantity,
        };
        return updated;
      }
      return [...prevItems, newItem];
    });
  }, []);

  const removeItem = useCallback(
    (productId: string, color: string, size: string) => {
      setItems((prevItems: CartItem[]) =>
        prevItems.filter(
          (item: CartItem) =>
            !(
              item.productId === productId &&
              item.color === color &&
              item.size === size
            ),
        ),
      );
    },
    [],
  );

  const updateQuantity = useCallback(
    (productId: string, color: string, size: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, color, size);
        return;
      }
      setItems((prevItems: CartItem[]) =>
        prevItems.map((item: CartItem) =>
          item.productId === productId &&
          item.color === color &&
          item.size === size
            ? { ...item, quantity }
            : item,
        ),
      );
    },
    [removeItem],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = items.reduce(
    (sum: number, item: CartItem) => sum + item.quantity,
    0,
  );

  const totalAmount = items
    .reduce((sum: number, item: CartItem) => {
      const price = parseFloat(item.unitPrice) || 0;
      return sum + price * item.quantity;
    }, 0)
    .toFixed(2);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalCount,
    totalAmount,
  };
}
