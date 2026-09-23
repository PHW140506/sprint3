import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { Alert } from 'react-native';
import axios from 'axios';

import type { Product } from '../types/product';
import type {
  CartContextData,
  CartItem,
} from '../types/cart';

interface CartProviderProps {
  children: ReactNode;
}

const CartContext = createContext<CartContextData | undefined>(
  undefined
);

const CART_API = 'https://fakestoreapi.com/carts';
const USER_ID = 4;
const CART_ID = 1;

export function CartProvider({
  children,
}: CartProviderProps) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const totalItems = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }, [cart]);

  const cartTotal = useMemo(() => {
    const total = cart.reduce(
      (sum, item) =>
        sum + item.product.price * item.quantity,
      0
    );

    return Number(total.toFixed(2));
  }, [cart]);

  const addToCart = async (
    product: Product,
    quantity: number
  ): Promise<void> => {
    if (quantity <= 0) {
      return;
    }

    try {
      await axios.post(CART_API, {
        userId: USER_ID,
        date: new Date().toISOString().split('T')[0],
        products: [
          {
            productId: product.id,
            quantity,
          },
        ],
      });

      setCart((prevCart) => {
        const existingItem = prevCart.find(
          (item) => item.product.id === product.id
        );

        if (existingItem) {
          return prevCart.map((item) =>
            item.product.id === product.id
              ? {
                  ...item,
                  quantity:
                    item.quantity + quantity,
                }
              : item
          );
        }

        return [
          ...prevCart,
          {
            product,
            quantity,
          },
        ];
      });

      Alert.alert(
        'Éxito',
        `"${product.title.substring(
          0,
          20
        )}..." añadido al carrito.`
      );
    } catch (error) {
      console.error(
        'Error al agregar al carrito:',
        error
      );

      Alert.alert(
        'Error',
        'No se pudo agregar el producto al carrito.'
      );
    }
  };

  const removeFromCart = async (
    productId: number
  ): Promise<void> => {
    try {
      await axios.delete(
        `${CART_API}/${CART_ID}`
      );

      setCart((prevCart) =>
        prevCart.filter(
          (item) =>
            item.product.id !== productId
        )
      );
    } catch (error) {
      console.error(
        'Error al eliminar del carrito:',
        error
      );

      Alert.alert(
        'Error',
        'No se pudo eliminar el producto.'
      );
    }
  };

  const updateQuantity = async (
    productId: number,
    delta: number
  ): Promise<void> => {
    const currentItem = cart.find(
      (item) =>
        item.product.id === productId
    );

    if (!currentItem) {
      return;
    }

    const newQuantity =
      currentItem.quantity + delta;

    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      await axios.put(
        `${CART_API}/${CART_ID}`,
        {
          userId: USER_ID,
          date: new Date()
            .toISOString()
            .split('T')[0],
          products: [
            {
              productId,
              quantity: newQuantity,
            },
          ],
        }
      );

      setCart((prevCart) =>
        prevCart.map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: newQuantity,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        'Error al actualizar cantidad:',
        error
      );

      Alert.alert(
        'Error',
        'No se pudo actualizar la cantidad.'
      );
    }
  };

  const checkout = (): void => {
    if (cart.length === 0) {
      return;
    }

    const finalTotal = cartTotal;

    setCart([]);

    Alert.alert(
      '¡Compra completada!',
      `Se ha procesado tu pedido por un total de $${finalTotal.toFixed(
        2
      )}`
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItems,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart debe utilizarse dentro de un CartProvider.'
    );
  }

  return context;
}