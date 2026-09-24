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
