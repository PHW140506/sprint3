import type { Product } from "./product";

// Tipos para el Carrito de Compras Local / Cliente (US09 y US10)
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartContextData {
  cart: CartItem[];
  totalItems: number;
  cartTotal: number;
  addToCart: (product: Product, quantity: number) => Promise<void>;
  updateQuantity: (productId: number, delta: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  checkout: () => void;
}

// Tipos para la Auditoría de Carritos Globales (US12)
export interface CartProduct {
  productId: number;
  quantity: number;
  title?: string;
}

export interface Cart {
  id: number;
  userId: number;
  date: string;
  products: CartProduct[];
}

export interface CartApiResponse {
  id?: number;
  userId?: number;
  date?: string;
  products?: Array<{
    productId?: number;
    quantity?: number;
  }>;
}

export interface ProductSummary {
  id: number;
  title: string;
}