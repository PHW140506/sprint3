import type { Product } from './product';

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